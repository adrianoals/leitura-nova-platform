'use server';

import { Buffer } from 'node:buffer';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const leituraSchema = z.object({
    unidade_id: z.string().uuid('Unidade inválida'),
    tipo: z.enum(['agua', 'agua_fria', 'agua_quente', 'gas']),
    mes_referencia: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
    data_leitura: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    medicao: z.coerce.number().positive('Medição deve ser maior que zero'),
    valor: z.coerce.number().min(0, 'Valor inválido'),
});

async function ensureAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login/admin');
    }

    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

    if (!adminUser) {
        redirect('/app');
    }

    return { supabase, user };
}

function isUuid(value: string) {
    return z.string().uuid().safeParse(value).success;
}

function buildNovaLeituraRedirect(errorMessage: string, condominioId?: string, unidadeId?: string) {
    const query = new URLSearchParams({ error: errorMessage });

    if (condominioId && isUuid(condominioId)) {
        query.set('condominio_id', condominioId);
    }

    if (unidadeId && isUuid(unidadeId)) {
        query.set('unidade_id', unidadeId);
    }

    return `/admin/leituras/nova?${query.toString()}`;
}

export async function createLeitura(formData: FormData) {
    const { supabase, user } = await ensureAdmin();
    const returnCondominioId = String(formData.get('return_condominio_id') || '').trim();
    const returnUnidadeId = String(formData.get('return_unidade_id') || '').trim();

    const parsed = leituraSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        tipo: formData.get('tipo'),
        mes_referencia: formData.get('mes_referencia'),
        data_leitura: formData.get('data_leitura'),
        medicao: formData.get('medicao'),
        valor: formData.get('valor'),
    });

    if (!parsed.success) {
        redirect(buildNovaLeituraRedirect('Dados inválidos para leitura', returnCondominioId, returnUnidadeId));
    }

    const payload = {
        unidade_id: parsed.data.unidade_id,
        tipo: parsed.data.tipo,
        mes_referencia: parsed.data.mes_referencia,
        data_leitura: parsed.data.data_leitura,
        medicao: parsed.data.medicao,
        valor: parsed.data.valor,
        criado_por_admin_auth_user_id: user.id,
        criado_por_morador: false,
    };

    const { data: leitura, error: leituraError } = await supabase
        .from('leituras_mensais')
        .upsert(payload, { onConflict: 'unidade_id,tipo,mes_referencia' })
        .select('id, unidade_id, tipo, mes_referencia')
        .single();

    if (leituraError || !leitura) {
        redirect(buildNovaLeituraRedirect('Não foi possível salvar a leitura', returnCondominioId, returnUnidadeId));
    }

    const { data: unidadeData } = await supabase
        .from('unidades')
        .select('condominio_id')
        .eq('id', parsed.data.unidade_id)
        .maybeSingle();

    const condominioIdForReturn = unidadeData?.condominio_id || (isUuid(returnCondominioId) ? returnCondominioId : '');

    const arquivos = formData
        .getAll('fotos')
        .filter((value): value is File => value instanceof File && value.size > 0);

    if (arquivos.length > 0) {
        let adminClient;
        try {
            adminClient = createAdminClient();
        } catch {
            redirect(buildNovaLeituraRedirect('SUPABASE_SERVICE_ROLE_KEY não configurada para upload de fotos', condominioIdForReturn, parsed.data.unidade_id));
        }

        const condominioId = condominioIdForReturn || 'condominio';

        for (const arquivo of arquivos) {
            const ext = arquivo.name.includes('.') ? arquivo.name.split('.').pop() : 'jpg';
            const timestamp = Date.now();
            const fileName = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
            const storagePath = `${condominioId}/${parsed.data.unidade_id}/${parsed.data.mes_referencia}/${parsed.data.tipo}/${fileName}`;

            const arrayBuffer = await arquivo.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await adminClient.storage
                .from('leitura-fotos')
                .upload(storagePath, buffer, {
                    contentType: arquivo.type || 'image/jpeg',
                    upsert: false,
                });

            if (uploadError) {
                redirect(buildNovaLeituraRedirect('Erro no upload de uma das fotos', condominioIdForReturn, parsed.data.unidade_id));
            }

            const { error: fotoError } = await supabase
                .from('fotos_leitura')
                .insert({
                    leitura_id: leitura.id,
                    storage_path: storagePath,
                });

            if (fotoError) {
                redirect(buildNovaLeituraRedirect('Leitura salva, mas houve erro ao vincular foto', condominioIdForReturn, parsed.data.unidade_id));
            }
        }
    }

    revalidatePath('/admin/leituras');
    revalidatePath('/admin');

    const listQuery = new URLSearchParams({ created: '1' });
    if (isUuid(condominioIdForReturn)) {
        listQuery.set('condominio_id', condominioIdForReturn);
    }

    redirect(`/admin/leituras?${listQuery.toString()}`);
}
