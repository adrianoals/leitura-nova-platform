'use server';

import { createClient } from '@/lib/supabase/server';
import { deleteAuthUsersByIds } from '@/lib/supabase/authCleanup';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CondominioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    tem_agua: z.boolean(),
    tem_agua_quente: z.boolean(),
    tem_gas: z.boolean(),
    envio_leitura_morador_habilitado: z.boolean(),
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

    return supabase;
}

export async function createCondominio(prevState: any, formData: FormData) {
    const supabase = await ensureAdmin();

    // Parse data
    const rawData = {
        nome: formData.get('nome'),
        tem_agua: formData.get('tem_agua') === 'on',
        tem_agua_quente: formData.get('tem_agua_quente') === 'on',
        tem_gas: formData.get('tem_gas') === 'on',
        envio_leitura_morador_habilitado: formData.get('envio_leitura_morador_habilitado') === 'on',
    };

    // Validate
    const validatedFields = CondominioSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Erro na validação dos campos.',
        };
    }

    // Insert
    const { error } = await supabase
        .from('condominios')
        .insert(validatedFields.data);

    if (error) {
        console.error('Erro ao criar condomínio:', error);
        return { message: 'Erro ao salvar no banco de dados.' };
    }

    revalidatePath('/admin/condominios');
    redirect('/admin/condominios');
}

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

async function getAllUnidadeIdsByCondominio(supabase: Awaited<ReturnType<typeof createClient>>, condominioId: string) {
    const pageSize = 1000;
    let from = 0;
    const ids: string[] = [];

    while (true) {
        const { data, error } = await supabase
            .from('unidades')
            .select('id')
            .eq('condominio_id', condominioId)
            .range(from, from + pageSize - 1);

        if (error || !data || data.length === 0) {
            break;
        }

        ids.push(...data.map((u) => u.id));

        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return ids;
}

export async function deleteCondominio(condominioId: string) {
    const supabase = await ensureAdmin();

    if (!condominioId) {
        redirect('/admin/condominios?error=' + encodeMessage('Condomínio inválido para exclusão'));
    }

    const unidadeIds = await getAllUnidadeIdsByCondominio(supabase, condominioId);

    const moradoresAuthIds: string[] = [];
    if (unidadeIds.length > 0) {
        const chunkSize = 500;

        for (let i = 0; i < unidadeIds.length; i += chunkSize) {
            const chunk = unidadeIds.slice(i, i + chunkSize);
            const { data: moradoresRaw } = await supabase
                .from('moradores')
                .select('auth_user_id')
                .in('unidade_id', chunk);

            moradoresAuthIds.push(
                ...(moradoresRaw || [])
                    .map((m) => m.auth_user_id)
                    .filter((id): id is string => Boolean(id))
            );
        }
    }

    const { data: sindicosRaw } = await supabase
        .from('sindicos')
        .select('auth_user_id')
        .eq('condominio_id', condominioId);

    const removableSindicoAuthIds: string[] = [];
    const sindicoAuthIds = Array.from(
        new Set(
            (sindicosRaw || [])
                .map((s) => s.auth_user_id)
                .filter((id): id is string => Boolean(id))
        )
    );

    for (const authUserId of sindicoAuthIds) {
        const { count } = await supabase
            .from('sindicos')
            .select('id', { count: 'exact', head: true })
            .eq('auth_user_id', authUserId)
            .neq('condominio_id', condominioId);

        if ((count || 0) === 0) {
            removableSindicoAuthIds.push(authUserId);
        }
    }

    const authIdsToDelete = [...moradoresAuthIds, ...removableSindicoAuthIds];
    if (authIdsToDelete.length > 0) {
        try {
            const { failedIds } = await deleteAuthUsersByIds(authIdsToDelete);
            if (failedIds.length > 0) {
                redirect('/admin/condominios?error=' + encodeMessage('Não foi possível remover todos os usuários de login vinculados'));
            }
        } catch {
            redirect('/admin/condominios?error=' + encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada para exclusão de logins'));
        }
    }

    const { error } = await supabase
        .from('condominios')
        .delete()
        .eq('id', condominioId);

    if (error) {
        redirect('/admin/condominios?error=' + encodeMessage('Não foi possível excluir o condomínio'));
    }

    revalidatePath('/admin');
    revalidatePath('/admin/condominios');
    revalidatePath('/admin/unidades');
    revalidatePath('/admin/moradores');
    revalidatePath('/admin/sindicos');
    revalidatePath('/admin/leituras');
    revalidatePath('/sindico');
    redirect('/admin/condominios?deleted=1');
}
