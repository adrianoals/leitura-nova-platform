'use server';

import { createClient } from '@/lib/supabase/server';
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

export async function deleteCondominio(condominioId: string) {
    const supabase = await ensureAdmin();

    if (!condominioId) {
        redirect('/admin/condominios?error=' + encodeMessage('Condomínio inválido para exclusão'));
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
    revalidatePath('/admin/leituras');
    redirect('/admin/condominios?deleted=1');
}
