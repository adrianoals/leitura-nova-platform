'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// =========================================
// Helpers
// =========================================

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

function safeReturn(path: string | null | undefined, fallback: string): string {
    if (!path) return fallback;
    return path.startsWith('/admin') ? path : fallback;
}

function appendQuery(path: string, key: string, value: string): string {
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}${key}=${value}`;
}

// =========================================
// CREATE ACESSO (2 modos)
// =========================================

const createAcessoSchema = z.object({
    unidade_id: z.string().uuid('Unidade inválida'),
    modo: z.enum(['novo_usuario', 'usuario_existente']),
    nome: z.string().trim().optional(),
    email: z.string().email('Email inválido'),
    senha: z.string().optional(),
    tipo: z.enum(['proprietario', 'locatario']).optional(),
});

export async function createAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const unidadeIdRaw = String(formData.get('unidade_id') || '');
    const errPath = `/admin/moradores/${unidadeIdRaw}`;

    const parsed = createAcessoSchema.safeParse({
        unidade_id: formData.get('unidade_id'),
        modo: formData.get('modo'),
        nome: formData.get('nome') || undefined,
        email: formData.get('email'),
        senha: formData.get('senha') || undefined,
        tipo: formData.get('tipo') || undefined,
    });

    if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
        redirect(`${errPath}?error=${encodeMessage(msg)}`);
    }

    const { unidade_id, modo, nome, email, senha, tipo } = parsed.data;

    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect(`${errPath}?error=${encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada')}`);
    }

    let authUserId: string;

    if (modo === 'novo_usuario') {
        if (!senha || senha.length < 6) {
            redirect(`${errPath}?error=${encodeMessage('Senha deve ter no mínimo 6 caracteres')}`);
        }

        const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
            user_metadata: { nome: nome ?? null },
        });

        if (createErr || !created?.user) {
            const msg = createErr?.message ?? 'Não foi possível criar usuário';
            redirect(`${errPath}?error=${encodeMessage(msg)}`);
        }

        authUserId = created.user.id;

        // Trigger handle_new_auth_user já populou pessoas; garante nome se trigger não pegou
        if (nome) {
            await supabase
                .from('pessoas')
                .upsert({ id: authUserId, nome }, { onConflict: 'id' });
        }
    } else {
        // modo === 'usuario_existente' — buscar auth user pelo email
        const { data: existingList, error: listErr } = await adminClient.auth.admin.listUsers();
        if (listErr) {
            redirect(`${errPath}?error=${encodeMessage('Erro ao buscar usuário: ' + listErr.message)}`);
        }

        const existing = existingList.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (!existing) {
            redirect(`${errPath}?error=${encodeMessage('Nenhum usuário encontrado com esse email')}`);
        }

        authUserId = existing.id;
    }

    // Insert vínculo (unique constraint impede duplicação)
    const { error: insertErr } = await supabase.from('unidade_acessos').insert({
        unidade_id,
        auth_user_id: authUserId,
        tipo: tipo ?? null,
        ativo: true,
    });

    if (insertErr) {
        // Se foi modo novo_usuario e o vínculo falhou, deleta auth user pra evitar órfão
        if (modo === 'novo_usuario') {
            await adminClient.auth.admin.deleteUser(authUserId);
        }
        const msg = insertErr.code === '23505'
            ? 'Esse usuário já tem vínculo com esta unidade'
            : 'Erro ao criar vínculo: ' + insertErr.message;
        redirect(`${errPath}?error=${encodeMessage(msg)}`);
    }

    revalidatePath('/admin/moradores');
    revalidatePath(errPath);
    redirect(`${errPath}?success=${encodeMessage('Acesso criado com sucesso')}`);
}

// =========================================
// UPDATE PESSOA (nome)
// =========================================

const updatePessoaSchema = z.object({
    auth_user_id: z.string().uuid(),
    nome: z.string().trim(),
    return_path: z.string().optional(),
});

export async function updatePessoa(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = updatePessoaSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        nome: formData.get('nome'),
        return_path: formData.get('return_path') || undefined,
    });

    const fallback = '/admin/moradores';
    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        fallback
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    const { error } = await supabase
        .from('pessoas')
        .update({ nome: parsed.data.nome })
        .eq('id', parsed.data.auth_user_id);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage('Nome atualizado')));
}

// =========================================
// UPDATE AUTH CREDENTIALS (email/senha)
// =========================================

const updateAuthCredentialsSchema = z.object({
    auth_user_id: z.string().uuid(),
    email: z.string().email().optional(),
    senha: z.string().min(6).optional(),
    return_path: z.string().optional(),
});

export async function updateAuthCredentials(formData: FormData) {
    await ensureAdmin();
    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect('/admin/moradores?error=' + encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada'));
    }

    const parsed = updateAuthCredentialsSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        email: formData.get('email') || undefined,
        senha: formData.get('senha') || undefined,
        return_path: formData.get('return_path') || undefined,
    });

    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        '/admin/moradores'
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    const { auth_user_id, email, senha } = parsed.data;
    const updates: { email?: string; password?: string } = {};
    if (email) updates.email = email;
    if (senha) updates.password = senha;

    if (Object.keys(updates).length === 0) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Nada para atualizar')));
    }

    const { error } = await adminClient.auth.admin.updateUserById(auth_user_id, updates);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage('Credenciais atualizadas')));
}

// =========================================
// UPDATE ACESSO (tipo)
// =========================================

const updateAcessoSchema = z.object({
    acesso_id: z.string().uuid(),
    tipo: z.string(),  // pode ser 'proprietario', 'locatario', ou '' (NULL)
    return_path: z.string().optional(),
});

export async function updateAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = updateAcessoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        tipo: formData.get('tipo'),
        return_path: formData.get('return_path') || undefined,
    });

    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        '/admin/moradores'
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    const tipoValue: 'proprietario' | 'locatario' | null =
        parsed.data.tipo === 'proprietario' || parsed.data.tipo === 'locatario'
            ? parsed.data.tipo
            : null;

    const { error } = await supabase
        .from('unidade_acessos')
        .update({ tipo: tipoValue })
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage('Tipo atualizado')));
}

// =========================================
// TOGGLE ACESSO ATIVO
// =========================================

const toggleAcessoSchema = z.object({
    acesso_id: z.string().uuid(),
    ativo: z.enum(['true', 'false']),
    return_path: z.string().optional(),
});

export async function toggleAcessoAtivo(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = toggleAcessoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        ativo: formData.get('ativo'),
        return_path: formData.get('return_path') || undefined,
    });

    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        '/admin/moradores'
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    const novoAtivo = parsed.data.ativo === 'true';

    const { error } = await supabase
        .from('unidade_acessos')
        .update({ ativo: novoAtivo })
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage(novoAtivo ? 'Acesso reativado' : 'Acesso desabilitado')));
}

// =========================================
// DELETE ACESSO (apenas a linha de vínculo, não toca no auth user)
// =========================================

const deleteAcessoSchema = z.object({
    acesso_id: z.string().uuid(),
    return_path: z.string().optional(),
});

export async function deleteAcesso(formData: FormData) {
    const supabase = await ensureAdmin();
    const parsed = deleteAcessoSchema.safeParse({
        acesso_id: formData.get('acesso_id'),
        return_path: formData.get('return_path') || undefined,
    });

    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        '/admin/moradores'
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    const { error } = await supabase
        .from('unidade_acessos')
        .delete()
        .eq('id', parsed.data.acesso_id);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage('Vínculo excluído')));
}

// =========================================
// DELETE USUARIO (auth.users + cascade)
// =========================================

const deleteUsuarioSchema = z.object({
    auth_user_id: z.string().uuid(),
    return_path: z.string().optional(),
});

export async function deleteUsuario(formData: FormData) {
    await ensureAdmin();
    let adminClient;
    try {
        adminClient = createAdminClient();
    } catch {
        redirect('/admin/moradores?error=' + encodeMessage('SUPABASE_SERVICE_ROLE_KEY não configurada'));
    }

    const parsed = deleteUsuarioSchema.safeParse({
        auth_user_id: formData.get('auth_user_id'),
        return_path: formData.get('return_path') || undefined,
    });

    const returnPath = safeReturn(
        typeof formData.get('return_path') === 'string' ? String(formData.get('return_path')) : undefined,
        '/admin/moradores'
    );

    if (!parsed.success) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Dados inválidos')));
    }

    // ON DELETE CASCADE limpa pessoas + todos os unidade_acessos
    const { error } = await adminClient.auth.admin.deleteUser(parsed.data.auth_user_id);

    if (error) {
        redirect(appendQuery(returnPath, 'error', encodeMessage('Erro: ' + error.message)));
    }

    revalidatePath(returnPath);
    redirect(appendQuery(returnPath, 'success', encodeMessage('Usuário e todos os vínculos excluídos')));
}
