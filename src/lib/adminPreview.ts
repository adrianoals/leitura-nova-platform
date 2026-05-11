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

/**
 * @deprecated Usar resolveMoradorPortalContextPlural ou resolveUnidadeContextById
 * para suporte a multi-vínculo. Esta função retorna apenas o primeiro vínculo,
 * mantida para backward-compat com páginas legadas /app/* (redirects).
 */
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

export type MoradorPortalContextPlural = {
    mode: 'morador' | 'admin_preview';
    vinculos: Array<{
        unidadeId: string;
        unidade: { id: string; bloco: string; apartamento: string };
        condominio: {
            id: string;
            nome: string;
            temAgua: boolean;
            temAguaQuente: boolean;
            temGas: boolean;
            envioLeituraMoradorHabilitado: boolean;
        };
        tipo: 'proprietario' | 'locatario' | null;
    }>;
};

export async function resolveMoradorPortalContextPlural(
    supabase: { from: (table: string) => unknown },
    authUserId: string,
): Promise<MoradorPortalContextPlural | null> {
    // Caso admin_preview: redireciona para o caso single-context (compat)
    const previewPayload = await getAdminMoradorPreviewPayload();
    if (previewPayload && previewPayload.adminAuthUserId === authUserId) {
        const isAdmin = await isAdminAuthUser(supabase as never, authUserId);
        if (isAdmin) {
            const previewContext = await getMoradorContextByUnidadeId(supabase as never, previewPayload.unidadeId);
            if (previewContext) {
                return {
                    mode: 'admin_preview',
                    vinculos: [{
                        unidadeId: previewContext.unidadeId,
                        unidade: {
                            id: previewContext.unidadeId,
                            bloco: previewContext.bloco ?? '',
                            apartamento: previewContext.apartamento ?? '',
                        },
                        condominio: {
                            id: previewContext.condominioId,
                            nome: previewContext.condominioNome,
                            temAgua: previewContext.temAgua,
                            temAguaQuente: previewContext.temAguaQuente,
                            temGas: previewContext.temGas,
                            envioLeituraMoradorHabilitado: previewContext.envioLeituraMoradorHabilitado,
                        },
                        tipo: null,
                    }],
                };
            }
        }
    }

    // Caso normal: buscar todos os vínculos ativos do user
    const acessosResult = await (supabase
        .from('unidade_acessos') as {
            select: (q: string) => {
                eq: (col: string, val: unknown) => {
                    eq: (col: string, val: unknown) => Promise<{ data: unknown[] | null; error: unknown }>
                }
            }
        })
        .select(`
            id,
            unidade_id,
            tipo,
            unidade:unidades (
                id,
                bloco,
                apartamento,
                condominio:condominios (
                    id,
                    nome,
                    tem_agua,
                    tem_agua_quente,
                    tem_gas,
                    envio_leitura_morador_habilitado
                )
            )
        `)
        .eq('auth_user_id', authUserId)
        .eq('ativo', true);

    const { data: acessos, error } = acessosResult;
    if (error || !acessos || acessos.length === 0) return null;

    type AcessoRow = {
        unidade_id: string;
        tipo: 'proprietario' | 'locatario' | null;
        unidade: {
            id: string;
            bloco: string;
            apartamento: string;
            condominio: {
                id: string;
                nome: string;
                tem_agua: boolean;
                tem_agua_quente: boolean;
                tem_gas: boolean;
                envio_leitura_morador_habilitado: boolean;
            } | {
                id: string;
                nome: string;
                tem_agua: boolean;
                tem_agua_quente: boolean;
                tem_gas: boolean;
                envio_leitura_morador_habilitado: boolean;
            }[];
        } | {
            id: string;
            bloco: string;
            apartamento: string;
            condominio: {
                id: string;
                nome: string;
                tem_agua: boolean;
                tem_agua_quente: boolean;
                tem_gas: boolean;
                envio_leitura_morador_habilitado: boolean;
            } | {
                id: string;
                nome: string;
                tem_agua: boolean;
                tem_agua_quente: boolean;
                tem_gas: boolean;
                envio_leitura_morador_habilitado: boolean;
            }[];
        }[];
    };

    const flat = (a: AcessoRow) => {
        const u = Array.isArray(a.unidade) ? a.unidade[0] : a.unidade;
        if (!u) return null;
        const c = Array.isArray(u.condominio) ? u.condominio[0] : u.condominio;
        if (!c) return null;
        return {
            unidadeId: a.unidade_id,
            unidade: { id: u.id, bloco: u.bloco, apartamento: u.apartamento },
            condominio: {
                id: c.id,
                nome: c.nome,
                temAgua: c.tem_agua,
                temAguaQuente: c.tem_agua_quente,
                temGas: c.tem_gas,
                envioLeituraMoradorHabilitado: c.envio_leitura_morador_habilitado,
            },
            tipo: a.tipo,
        };
    };

    const vinculos = (acessos as AcessoRow[])
        .map(flat)
        .filter((v): v is NonNullable<ReturnType<typeof flat>> => v !== null);

    if (vinculos.length === 0) return null;

    return { mode: 'morador', vinculos };
}

/**
 * Resolve o contexto de UMA unidade específica para o user logado.
 * Usado nas páginas /app/u/[unidadeId]/* — verifica que o user tem
 * vínculo ativo com essa unidade. Retorna null se não tiver acesso
 * (a página deve chamar notFound()).
 */
export async function resolveUnidadeContextById(
    supabase: { from: (table: string) => unknown },
    authUserId: string,
    unidadeId: string,
): Promise<MoradorPortalContextPlural['vinculos'][number] | null> {
    const ctx = await resolveMoradorPortalContextPlural(supabase, authUserId);
    if (!ctx) return null;
    return ctx.vinculos.find((v) => v.unidadeId === unidadeId) ?? null;
}
