'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { clearAdminMoradorPreviewSession, setAdminMoradorPreviewSession } from '@/lib/adminPreview';

const startPreviewSchema = z.object({
    condominio_id: z.string().uuid('Condomínio inválido').optional().or(z.literal('')),
    unidade_id: z.string().uuid('Unidade inválida'),
});

function encodeMessage(message: string) {
    return encodeURIComponent(message);
}

function normalizeReturnPath(path: string | null | undefined) {
    if (!path) return '/admin/visualizar';
    if (!path.startsWith('/')) return '/admin/visualizar';
    return path;
}

async function ensureAdminUser() {
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
        .maybeSingle();

    if (!adminUser) {
        redirect('/app');
    }

    return { supabase, user };
}

export async function startAdminMoradorPreview(formData: FormData) {
    const parsed = startPreviewSchema.safeParse({
        condominio_id: formData.get('condominio_id') || '',
        unidade_id: formData.get('unidade_id'),
    });

    if (!parsed.success) {
        redirect('/admin/visualizar?error=' + encodeMessage('Selecione condomínio e unidade válidos'));
    }

    const { supabase, user } = await ensureAdminUser();

    const { data: unidade } = await supabase
        .from('unidades')
        .select('id, condominio_id')
        .eq('id', parsed.data.unidade_id)
        .maybeSingle();

    if (!unidade) {
        redirect('/admin/visualizar?error=' + encodeMessage('Unidade não encontrada'));
    }

    const selectedCondominioId = parsed.data.condominio_id || '';
    if (selectedCondominioId && unidade.condominio_id !== selectedCondominioId) {
        redirect('/admin/visualizar?error=' + encodeMessage('A unidade selecionada não pertence ao condomínio informado'));
    }

    await setAdminMoradorPreviewSession({
        adminAuthUserId: user.id,
        unidadeId: unidade.id,
    });

    redirect('/app');
}

export async function stopAdminMoradorPreview(formData: FormData) {
    const returnPath = normalizeReturnPath(String(formData.get('return_path') || ''));
    await clearAdminMoradorPreviewSession();
    redirect(returnPath);
}

