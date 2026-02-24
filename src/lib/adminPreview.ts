import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getMoradorContextByAuthUserId, getMoradorContextByUnidadeId, type MoradorContext } from '@/lib/morador';

export const ADMIN_PREVIEW_COOKIE = 'ln_admin_morador_preview';
const ADMIN_PREVIEW_TTL_SECONDS = 60 * 60;

type AdminPreviewPayload = {
    adminAuthUserId: string;
    unidadeId: string;
    exp: number;
};

export type ResolvedMoradorPortalContext = {
    mode: 'morador' | 'admin_preview';
    context: MoradorContext;
};

function getPreviewSecret() {
    return process.env.ADMIN_PREVIEW_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-admin-preview-secret';
}

function signPayload(encodedPayload: string) {
    return createHmac('sha256', getPreviewSecret()).update(encodedPayload).digest('hex');
}

function encodePayload(payload: AdminPreviewPayload) {
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
    const signature = signPayload(encodedPayload);
    return `${encodedPayload}.${signature}`;
}

function decodePayload(token: string): AdminPreviewPayload | null {
    const [encodedPayload, providedSignature] = token.split('.');
    if (!encodedPayload || !providedSignature) return null;

    const expectedSignature = signPayload(encodedPayload);
    const providedBuffer = Buffer.from(providedSignature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (providedBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null;

    try {
        const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as AdminPreviewPayload;
        if (!parsed?.adminAuthUserId || !parsed?.unidadeId || !parsed?.exp) return null;
        if (Date.now() >= parsed.exp) return null;
        return parsed;
    } catch {
        return null;
    }
}

async function isAdminAuthUser(
    supabase: {
        from: (table: string) => {
            select: (query: string) => {
                eq: (column: string, value: string) => {
                    maybeSingle: () => Promise<{ data: { id: string } | null }>;
                };
            };
        };
    },
    authUserId: string
) {
    const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

    return Boolean(data);
}

export async function setAdminMoradorPreviewSession(params: { adminAuthUserId: string; unidadeId: string }) {
    const payload: AdminPreviewPayload = {
        adminAuthUserId: params.adminAuthUserId,
        unidadeId: params.unidadeId,
        exp: Date.now() + ADMIN_PREVIEW_TTL_SECONDS * 1000,
    };

    const token = encodePayload(payload);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_PREVIEW_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ADMIN_PREVIEW_TTL_SECONDS,
    });
}

export async function clearAdminMoradorPreviewSession() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_PREVIEW_COOKIE);
}

export async function getAdminMoradorPreviewPayload() {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_PREVIEW_COOKIE)?.value;
    if (!token) return null;
    return decodePayload(token);
}

export async function resolveMoradorPortalContext(
    supabase: {
        from: (table: string) => unknown;
    },
    authUserId: string
): Promise<ResolvedMoradorPortalContext | null> {
    const previewPayload = await getAdminMoradorPreviewPayload();
    if (previewPayload && previewPayload.adminAuthUserId === authUserId) {
        const isAdmin = await isAdminAuthUser(supabase as never, authUserId);
        if (isAdmin) {
            const previewContext = await getMoradorContextByUnidadeId(supabase as never, previewPayload.unidadeId);
            if (previewContext) {
                return {
                    mode: 'admin_preview',
                    context: previewContext,
                };
            }
        }
    }

    const moradorContext = await getMoradorContextByAuthUserId(supabase as never, authUserId);
    if (!moradorContext) return null;

    return {
        mode: 'morador',
        context: moradorContext,
    };
}
