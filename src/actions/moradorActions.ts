'use server';

import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { resolveUnidadeContextById } from '@/lib/adminPreview';
import {
    getDataHojeIso,
    getMesAtual,
    getTiposPermitidos,
    type TipoLeitura,
    type MoradorContext,
} from '@/lib/morador';

const enviarLeituraSchema = z.object({
    unidade_id: z.string().uuid('Unidade inválida'),
    tipo: z.enum(['agua', 'agua_fria', 'agua_quente', 'gas']),
    medicao: z.coerce.number().positive('Medição deve ser maior que zero'),
});

const MAX_FOTO_BYTES = 15 * 1024 * 1024;
const MIMES_ACEITOS = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
]);
const EXT_PARA_MIME: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
};

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

function getExtFromFileName(fileName: string) {
    if (!fileName || !fileName.includes('.')) return 'jpg';
    const ext = fileName.split('.').pop() || 'jpg';
    return ext.toLowerCase();
}

async function ensureMoradorOnUnidade(unidadeId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vinculo = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);

    if (!vinculo) {
        // Nenhum vínculo ativo com esta unidade — gateway decide o que fazer
        redirect('/app');
    }

    return { supabase, user, vinculo };
}

export async function enviarLeituraMorador(formData: FormData) {
    const unidadeIdRaw = String(formData.get('unidade_id') || '');

    const parsed = enviarLeituraSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        tipo: formData.get('tipo'),
        medicao: formData.get('medicao'),
    });

    if (!parsed.success) {
        const errPath = unidadeIdRaw
            ? `/app/u/${unidadeIdRaw}/enviar-leitura`
            : '/app';
        redirect(`${errPath}?error=${encodeMessage('Dados inválidos para envio')}`);
    }

    const { supabase, user, vinculo } = await ensureMoradorOnUnidade(parsed.data.unidade_id);
    const errPath = `/app/u/${parsed.data.unidade_id}/enviar-leitura`;

    if (!vinculo.condominio.envioLeituraMoradorHabilitado) {
        redirect(`${errPath}?error=${encodeMessage('Envio de leitura não está habilitado para sua unidade')}`);
    }

    const tipo = parsed.data.tipo as TipoLeitura;

    // getTiposPermitidos espera shape estrutural compatível com MoradorContext
    const tiposPermitidos = getTiposPermitidos({
        temAgua: vinculo.condominio.temAgua,
        temAguaQuente: vinculo.condominio.temAguaQuente,
        temGas: vinculo.condominio.temGas,
    } as Pick<MoradorContext, 'temAgua' | 'temAguaQuente' | 'temGas'> as MoradorContext);

    if (!tiposPermitidos.includes(tipo)) {
        redirect(`${errPath}?error=${encodeMessage('Tipo de leitura não permitido para sua unidade')}`);
    }

    const fotos = formData
        .getAll('fotos')
        .filter((value): value is File => value instanceof File && value.size > 0);

    if (fotos.length === 0) {
        redirect(`${errPath}?error=${encodeMessage('Envie ao menos uma foto do medidor')}`);
    }

    for (const foto of fotos) {
        if (foto.size > MAX_FOTO_BYTES) {
            redirect(`${errPath}?error=${encodeMessage(`A foto "${foto.name}" ultrapassa 15 MB. Reduza a resolução e tente novamente.`)}`);
        }

        const ext = getExtFromFileName(foto.name);
        const tipoArquivo = (foto.type || EXT_PARA_MIME[ext] || '').toLowerCase();

        if (!MIMES_ACEITOS.has(tipoArquivo)) {
            redirect(`${errPath}?error=${encodeMessage(`Formato não suportado em "${foto.name}". Envie em JPG, PNG, WebP ou HEIC.`)}`);
        }
    }

    const mesReferencia = getMesAtual();
    const dataLeitura = getDataHojeIso();

    const { data: fechamento } = await supabase
        .from('fechamentos_mensais')
        .select('fechado')
        .eq('condominio_id', vinculo.condominio.id)
        .eq('mes_referencia', mesReferencia)
        .maybeSingle();

    if (fechamento?.fechado) {
        redirect(`${errPath}?error=${encodeMessage('Mês já fechado. Não é possível enviar leitura')}`);
    }

    const { data: leitura, error: leituraError } = await supabase
        .from('leituras_mensais')
        .insert({
            unidade_id: vinculo.unidadeId,
            tipo,
            mes_referencia: mesReferencia,
            data_leitura: dataLeitura,
            medicao: parsed.data.medicao,
            valor: 0,
            criado_por_admin_auth_user_id: null,
            criado_por_morador: true,
        })
        .select('id')
        .single();

    if (leituraError || !leitura) {
        const isDuplicate = leituraError?.message?.toLowerCase().includes('duplicate')
            || leituraError?.code === '23505';
        if (isDuplicate) {
            redirect(`${errPath}?error=${encodeMessage('Leitura deste tipo para o mês atual já foi enviada')}`);
        }
        redirect(`${errPath}?error=${encodeMessage('Não foi possível salvar a leitura')}`);
    }

    for (const foto of fotos) {
        const ext = getExtFromFileName(foto.name);
        const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
        const storagePath = `${vinculo.condominio.id}/${vinculo.unidadeId}/${mesReferencia}/${tipo}/${fileName}`;

        const arrayBuffer = await foto.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const contentType = (foto.type || EXT_PARA_MIME[ext] || 'image/jpeg').toLowerCase();

        const { error: uploadError } = await supabase.storage
            .from('leitura-fotos')
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: false,
            });

        if (uploadError) {
            const msg = uploadError.message?.toLowerCase() || '';
            let userMsg = `Erro ao enviar "${foto.name}". Tente novamente.`;
            if (msg.includes('mime') || msg.includes('content type')) {
                userMsg = `Formato não suportado em "${foto.name}". Envie em JPG, PNG, WebP ou HEIC.`;
            } else if (msg.includes('exceeds') || msg.includes('too large') || msg.includes('size')) {
                userMsg = `A foto "${foto.name}" ultrapassa o limite de 15 MB.`;
            }
            redirect(`${errPath}?error=${encodeMessage(userMsg)}`);
        }

        const { error: fotoError } = await supabase
            .from('fotos_leitura')
            .insert({
                leitura_id: leitura.id,
                storage_path: storagePath,
            });

        if (fotoError) {
            redirect(`${errPath}?error=${encodeMessage('Leitura salva, mas houve erro ao vincular foto')}`);
        }
    }

    revalidatePath(`/app/u/${parsed.data.unidade_id}`);
    revalidatePath(`/app/u/${parsed.data.unidade_id}/leituras`);
    revalidatePath(`/app/u/${parsed.data.unidade_id}/leituras/${mesReferencia}`);
    revalidatePath(`/app/u/${parsed.data.unidade_id}/enviar-leitura`);
    revalidatePath('/admin/leituras');
    revalidatePath('/admin/leituras/nova');
    redirect(`${errPath}?success=1`);
}
