'use server';

import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
    getDataHojeIso,
    getMesAtual,
    getMoradorContextByAuthUserId,
    getTiposPermitidos,
    type TipoLeitura,
} from '@/lib/morador';

const enviarLeituraSchema = z.object({
    tipo: z.enum(['agua', 'agua_fria', 'agua_quente', 'gas']),
    medicao: z.coerce.number().positive('Medição deve ser maior que zero'),
});

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

function getExtFromFileName(fileName: string) {
    if (!fileName || !fileName.includes('.')) return 'jpg';
    const ext = fileName.split('.').pop() || 'jpg';
    return ext.toLowerCase();
}

async function ensureMorador() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const context = await getMoradorContextByAuthUserId(supabase as never, user.id);
    if (!context) {
        redirect('/app');
    }

    return { supabase, user, context };
}

export async function enviarLeituraMorador(formData: FormData) {
    const { supabase, user, context } = await ensureMorador();

    if (!context.envioLeituraMoradorHabilitado) {
        redirect('/app/enviar-leitura?error=' + encodeMessage('Envio de leitura não está habilitado para sua unidade'));
    }

    const parsed = enviarLeituraSchema.safeParse({
        tipo: formData.get('tipo'),
        medicao: formData.get('medicao'),
    });

    if (!parsed.success) {
        redirect('/app/enviar-leitura?error=' + encodeMessage('Dados inválidos para envio'));
    }

    const tipo = parsed.data.tipo as TipoLeitura;
    const tiposPermitidos = getTiposPermitidos(context);

    if (!tiposPermitidos.includes(tipo)) {
        redirect('/app/enviar-leitura?error=' + encodeMessage('Tipo de leitura não permitido para sua unidade'));
    }

    const fotos = formData
        .getAll('fotos')
        .filter((value): value is File => value instanceof File && value.size > 0);

    if (fotos.length === 0) {
        redirect('/app/enviar-leitura?error=' + encodeMessage('Envie ao menos uma foto do medidor'));
    }

    const mesReferencia = getMesAtual();
    const dataLeitura = getDataHojeIso();

    const { data: fechamento } = await supabase
        .from('fechamentos_mensais')
        .select('fechado')
        .eq('condominio_id', context.condominioId)
        .eq('mes_referencia', mesReferencia)
        .maybeSingle();

    if (fechamento?.fechado) {
        redirect('/app/enviar-leitura?error=' + encodeMessage('Mês já fechado. Não é possível enviar leitura'));
    }

    const { data: leitura, error: leituraError } = await supabase
        .from('leituras_mensais')
        .insert({
            unidade_id: context.unidadeId,
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
            redirect('/app/enviar-leitura?error=' + encodeMessage('Leitura deste tipo para o mês atual já foi enviada'));
        }
        redirect('/app/enviar-leitura?error=' + encodeMessage('Não foi possível salvar a leitura'));
    }

    for (const foto of fotos) {
        const ext = getExtFromFileName(foto.name);
        const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
        const storagePath = `${context.condominioId}/${context.unidadeId}/${mesReferencia}/${tipo}/${fileName}`;

        const arrayBuffer = await foto.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('leitura-fotos')
            .upload(storagePath, fileBuffer, {
                contentType: foto.type || 'image/jpeg',
                upsert: false,
            });

        if (uploadError) {
            redirect('/app/enviar-leitura?error=' + encodeMessage('Erro ao enviar uma das fotos'));
        }

        const { error: fotoError } = await supabase
            .from('fotos_leitura')
            .insert({
                leitura_id: leitura.id,
                storage_path: storagePath,
            });

        if (fotoError) {
            redirect('/app/enviar-leitura?error=' + encodeMessage('Leitura salva, mas houve erro ao vincular foto'));
        }
    }

    revalidatePath('/app');
    revalidatePath('/app/leituras');
    revalidatePath(`/app/leituras/${mesReferencia}`);
    revalidatePath('/app/enviar-leitura');
    revalidatePath('/admin/leituras');
    revalidatePath('/admin/leituras/nova');
    redirect('/app/enviar-leitura?success=1');
}
