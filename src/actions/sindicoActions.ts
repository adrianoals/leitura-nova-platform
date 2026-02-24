'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deleteAuthUsersByIds } from '@/lib/supabase/authCleanup';

const createSindicoSchema = z.object({
    condominio_id: z.string().uuid('Condomínio inválido'),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const updateSindicoSchema = z.object({
    sindico_id: z.string().uuid('Síndico inválido'),
    condominio_id: z.string().uuid('Condomínio inválido'),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().optional(),
});

const deleteSindicoSchema = z.object({
    sindico_id: z.string().uuid('Síndico inválido'),
    return_path: z.string().optional(),
});

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

function normalizeAdminPath(path: string | null | undefined, fallback: string) {
    if (!path) return fallback;
    return path.startsWith('/admin') ? path : fallback;
}

function isAuthDuplicateEmailError(message: string) {
    const normalized = (message || '').toLowerCase();
    return (
        normalized.includes('already') ||
        normalized.includes('exists') ||
        normalized.includes('duplicate') ||
        normalized.includes('registered')
    );
}

async function findAuthUserIdByEmail(
    adminClient: ReturnType<typeof createAdminClient>,
    email: string
) {
    const normalizedEmail = email.trim().toLowerCase();
    const perPage = 200;

    for (let page = 1; page <= 20; page += 1) {
        const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
        if (error) break;

        const users = data?.users || [];
        const match = users.find((user) => (user.email || '').toLowerCase() === normalizedEmail);
        if (match?.id) return match.id;

        if (users.length < perPage) break;
    }

    return null;
}

async function ensureAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

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

export async function createSindico(formData: FormData) {
    const supabase = await ensureAdmin();

    const parsed = createSindicoSchema.safeParse({
        condominio_id: formData.get('condominio_id'),
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
    });

    if (!parsed.success) {
        redirect('/admin/sindicos/novo?error=' + encodeMessage('Dados inválidos'));
    }

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect('/admin/sindicos/novo?error=' + encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada'));
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    let authUserId: string | null = null;
    let createdAuthInThisRequest = false;

    const { data: createdAuth, error: authError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: parsed.data.senha,
        email_confirm: true,
        user_metadata: { role: 'sindico' },
    });

    if (!authError && createdAuth.user?.id) {
        authUserId = createdAuth.user.id;
        createdAuthInThisRequest = true;
    } else if (authError && isAuthDuplicateEmailError(authError.message)) {
        const existingAuthUserId = await findAuthUserIdByEmail(adminClient, normalizedEmail);
        if (!existingAuthUserId) {
            redirect('/admin/sindicos/novo?error=' + encodeMessage('Email já existe no Auth, mas não foi possível localizar o usuário'));
        }
        authUserId = existingAuthUserId;
    } else {
        redirect('/admin/sindicos/novo?error=' + encodeMessage(authError?.message || 'Não foi possível criar login'));
    }

    if (!authUserId) {
        redirect('/admin/sindicos/novo?error=' + encodeMessage('Não foi possível identificar o usuário de login do síndico'));
    }

    const { error: insertError } = await supabase
        .from('sindicos')
        .insert({
            auth_user_id: authUserId,
            condominio_id: parsed.data.condominio_id,
            nome: parsed.data.nome || null,
        });

    if (insertError) {
        if (createdAuthInThisRequest && authUserId) {
            await adminClient.auth.admin.deleteUser(authUserId);
        }
        const isDuplicate = insertError.code === '23505' || insertError.message.toLowerCase().includes('duplicate');
        const message = isDuplicate
            ? 'Este síndico já está vinculado a este condomínio'
            : 'Não foi possível vincular o síndico';
        redirect('/admin/sindicos/novo?error=' + encodeMessage(message));
    }

    revalidatePath('/admin');
    revalidatePath('/admin/sindicos');
    revalidatePath('/sindico');
    redirect('/admin/sindicos?created=1');
}

export async function updateSindico(formData: FormData) {
    const supabase = await ensureAdmin();

    const parsed = updateSindicoSchema.safeParse({
        sindico_id: formData.get('sindico_id'),
        condominio_id: formData.get('condominio_id'),
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha'),
    });

    if (!parsed.success) {
        const sindicoId = String(formData.get('sindico_id') || '');
        redirect(`/admin/sindicos/${sindicoId}?error=${encodeMessage('Dados inválidos')}`);
    }

    const { data: sindico } = await supabase
        .from('sindicos')
        .select('id, auth_user_id, condominio_id')
        .eq('id', parsed.data.sindico_id)
        .maybeSingle();

    if (!sindico) {
        redirect('/admin/sindicos?error=' + encodeMessage('Síndico não encontrado'));
    }

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect(`/admin/sindicos/${parsed.data.sindico_id}?error=${encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada')}`);
    }

    const senha = (parsed.data.senha || '').trim();
    const authPayload: { email: string; password?: string } = { email: parsed.data.email.trim().toLowerCase() };

    if (senha) {
        if (senha.length < 6) {
            redirect(`/admin/sindicos/${parsed.data.sindico_id}?error=${encodeMessage('Senha deve ter no mínimo 6 caracteres')}`);
        }
        authPayload.password = senha;
    }

    const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
        sindico.auth_user_id,
        authPayload
    );

    if (updateAuthError) {
        redirect(`/admin/sindicos/${parsed.data.sindico_id}?error=${encodeMessage(updateAuthError.message)}`);
    }

    const { error: updateError } = await supabase
        .from('sindicos')
        .update({
            condominio_id: parsed.data.condominio_id,
            nome: parsed.data.nome || null,
        })
        .eq('id', parsed.data.sindico_id);

    if (updateError) {
        const isDuplicate = updateError.code === '23505' || updateError.message.toLowerCase().includes('duplicate');
        const message = isDuplicate
            ? 'Este síndico já está vinculado ao condomínio informado'
            : 'Não foi possível salvar as alterações';
        redirect(`/admin/sindicos/${parsed.data.sindico_id}?error=${encodeMessage(message)}`);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/sindicos');
    revalidatePath(`/admin/sindicos/${parsed.data.sindico_id}`);
    revalidatePath('/sindico');
    redirect(`/admin/sindicos/${parsed.data.sindico_id}?saved=1`);
}

export async function deleteSindico(formData: FormData) {
    const supabase = await ensureAdmin();

    const parsed = deleteSindicoSchema.safeParse({
        sindico_id: formData.get('sindico_id'),
        return_path: formData.get('return_path'),
    });

    if (!parsed.success) {
        redirect('/admin/sindicos?error=' + encodeMessage('Dados inválidos para exclusão'));
    }

    const { data: sindico } = await supabase
        .from('sindicos')
        .select('id, auth_user_id, condominio_id')
        .eq('id', parsed.data.sindico_id)
        .maybeSingle();

    if (!sindico) {
        redirect('/admin/sindicos?error=' + encodeMessage('Síndico não encontrado'));
    }

    const { error: deleteError } = await supabase
        .from('sindicos')
        .delete()
        .eq('id', sindico.id);

    if (deleteError) {
        redirect('/admin/sindicos?error=' + encodeMessage('Não foi possível excluir o vínculo do síndico'));
    }

    const { count: remainingLinks } = await supabase
        .from('sindicos')
        .select('id', { count: 'exact', head: true })
        .eq('auth_user_id', sindico.auth_user_id);

    let warningMessage = '';

    if ((remainingLinks || 0) === 0) {
        try {
            const { failedIds } = await deleteAuthUsersByIds([sindico.auth_user_id]);
            if (failedIds.length > 0) {
                warningMessage = 'Síndico removido, mas o login não pôde ser excluído automaticamente';
            }
        } catch {
            warningMessage = 'Síndico removido, mas o login não pôde ser excluído automaticamente';
        }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/sindicos');
    revalidatePath('/sindico');

    const baseReturn = normalizeAdminPath(parsed.data.return_path, '/admin/sindicos');
    const redirectUrl = new URL(baseReturn, 'http://localhost');
    redirectUrl.searchParams.set('deleted', '1');

    if (warningMessage) {
        redirectUrl.searchParams.set('warning', warningMessage);
    }

    redirect(`${redirectUrl.pathname}?${redirectUrl.searchParams.toString()}`);
}
