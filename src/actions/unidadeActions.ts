'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createUnidadeSchema = z.object({
    condominio_id: z.string().uuid('Condomínio inválido'),
    bloco: z.string().trim().optional(),
    apartamento: z.string().trim().min(1, 'Apartamento é obrigatório'),
});

const updateUnidadeSchema = z.object({
    id: z.string().uuid('Unidade inválida'),
    bloco: z.string().trim().optional(),
    apartamento: z.string().trim().min(1, 'Apartamento é obrigatório'),
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

export async function createUnidade(formData: FormData) {
    const supabase = await ensureAdmin();

    const parsed = createUnidadeSchema.safeParse({
        condominio_id: formData.get('condominio_id'),
        bloco: formData.get('bloco'),
        apartamento: formData.get('apartamento'),
    });

    if (!parsed.success) {
        redirect('/admin/unidades/nova?error=Dados%20inv%C3%A1lidos');
    }

    const payload = {
        condominio_id: parsed.data.condominio_id,
        bloco: parsed.data.bloco || '',
        apartamento: parsed.data.apartamento,
    };

    const { error } = await supabase
        .from('unidades')
        .insert(payload);

    if (error) {
        const isDuplicate = error.message.toLowerCase().includes('duplicate');
        const message = isDuplicate
            ? 'Unidade%20j%C3%A1%20cadastrada%20neste%20condom%C3%ADnio'
            : 'N%C3%A3o%20foi%20poss%C3%ADvel%20salvar%20a%20unidade';
        redirect(`/admin/unidades/nova?error=${message}`);
    }

    revalidatePath('/admin/unidades');
    revalidatePath('/admin/condominios');
    redirect('/admin/unidades?created=1');
}

export async function updateUnidade(formData: FormData) {
    const supabase = await ensureAdmin();

    const parsed = updateUnidadeSchema.safeParse({
        id: formData.get('id'),
        bloco: formData.get('bloco'),
        apartamento: formData.get('apartamento'),
    });

    if (!parsed.success) {
        const unidadeId = String(formData.get('id') || '');
        redirect(`/admin/unidades/${unidadeId}?error=Dados%20inv%C3%A1lidos`);
    }

    const payload = {
        bloco: parsed.data.bloco || '',
        apartamento: parsed.data.apartamento,
    };

    const { error } = await supabase
        .from('unidades')
        .update(payload)
        .eq('id', parsed.data.id);

    if (error) {
        const isDuplicate = error.message.toLowerCase().includes('duplicate');
        const message = isDuplicate
            ? 'Unidade%20j%C3%A1%20existe%20neste%20condom%C3%ADnio'
            : 'N%C3%A3o%20foi%20poss%C3%ADvel%20salvar%20as%20altera%C3%A7%C3%B5es';
        redirect(`/admin/unidades/${parsed.data.id}?error=${message}`);
    }

    revalidatePath('/admin/unidades');
    revalidatePath(`/admin/unidades/${parsed.data.id}`);
    revalidatePath('/admin/condominios');
    redirect(`/admin/unidades/${parsed.data.id}?saved=1`);
}
