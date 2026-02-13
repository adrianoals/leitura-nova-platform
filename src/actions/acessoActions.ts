'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createAcessoSchema = z.object({
    unidade_id: z.string().uuid('Unidade inválida'),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const updateAcessoSchema = z.object({
    morador_id: z.string().uuid('Morador inválido'),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().optional(),
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

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

export async function createAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = createAcessoSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
    });

    const unidadeId = String(formData.get('unidade_id') || '');

    if (!parsed.success) {
        redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Dados inválidos')}`);
    }

    const { data: acessoExistente } = await supabase
        .from('moradores')
        .select('id')
        .eq('unidade_id', parsed.data.unidade_id)
        .maybeSingle();

    if (acessoExistente) {
        redirect(`/admin/moradores/${parsed.data.unidade_id}?error=${encodeMessage('Esta unidade já possui acesso')}`);
    }

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect(`/admin/moradores/${parsed.data.unidade_id}?error=${encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada')}`);
    }

    const { data: createdAuth, error: authError } = await adminClient.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.senha,
        email_confirm: true,
        user_metadata: { role: 'morador' },
    });

    if (authError || !createdAuth.user) {
        redirect(`/admin/moradores/${parsed.data.unidade_id}?error=${encodeMessage(authError?.message || 'Não foi possível criar login')}`);
    }

    const { error: insertError } = await supabase
        .from('moradores')
        .insert({
            unidade_id: parsed.data.unidade_id,
            auth_user_id: createdAuth.user.id,
            nome: parsed.data.nome || null,
        });

    if (insertError) {
        await adminClient.auth.admin.deleteUser(createdAuth.user.id);
        redirect(`/admin/moradores/${parsed.data.unidade_id}?error=${encodeMessage('Não foi possível vincular o acesso à unidade')}`);
    }

    revalidatePath('/admin/moradores');
    revalidatePath(`/admin/moradores/${parsed.data.unidade_id}`);
    revalidatePath('/admin/unidades');
    revalidatePath(`/admin/unidades/${parsed.data.unidade_id}`);
    redirect(`/admin/moradores/${parsed.data.unidade_id}?created=1`);
}

export async function updateAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = updateAcessoSchema.safeParse({
        morador_id: formData.get('morador_id'),
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
    });

    const unidadeId = String(formData.get('unidade_id') || '');

    if (!parsed.success) {
        redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Dados inválidos')}`);
    }

    const { data: morador } = await supabase
        .from('moradores')
        .select('id, unidade_id, auth_user_id')
        .eq('id', parsed.data.morador_id)
        .single();

    if (!morador) {
        redirect(`/admin/moradores/${unidadeId}?error=${encodeMessage('Acesso não encontrado')}`);
    }

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada')}`);
    }

    const senha = (parsed.data.senha || '').trim();

    if (morador.auth_user_id) {
        const updatePayload: { email: string; password?: string } = {
            email: parsed.data.email,
        };

        if (senha) {
            if (senha.length < 6) {
                redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage('Senha deve ter no mínimo 6 caracteres')}`);
            }
            updatePayload.password = senha;
        }

        const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
            morador.auth_user_id,
            updatePayload
        );

        if (updateAuthError) {
            redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage(updateAuthError.message)}`);
        }
    } else {
        if (!senha || senha.length < 6) {
            redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage('Informe uma nova senha para recriar o login')}`);
        }

        const { data: recreatedAuth, error: recreatedAuthError } = await adminClient.auth.admin.createUser({
            email: parsed.data.email,
            password: senha,
            email_confirm: true,
            user_metadata: { role: 'morador' },
        });

        if (recreatedAuthError || !recreatedAuth.user) {
            redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage(recreatedAuthError?.message || 'Não foi possível recriar login')}`);
        }

        await supabase
            .from('moradores')
            .update({ auth_user_id: recreatedAuth.user.id })
            .eq('id', morador.id);
    }

    const { error: updateMoradorError } = await supabase
        .from('moradores')
        .update({
            nome: parsed.data.nome || null,
        })
        .eq('id', morador.id);

    if (updateMoradorError) {
        redirect(`/admin/moradores/${morador.unidade_id}?error=${encodeMessage('Não foi possível atualizar o acesso')}`);
    }

    revalidatePath('/admin/moradores');
    revalidatePath(`/admin/moradores/${morador.unidade_id}`);
    revalidatePath('/admin/unidades');
    revalidatePath(`/admin/unidades/${morador.unidade_id}`);
    redirect(`/admin/moradores/${morador.unidade_id}?saved=1`);
}
