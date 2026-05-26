import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural, resolveUnidadeContextById } from '@/lib/adminPreview';
import UnitDropdown from '@/components/morador/UnitDropdown';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ unidadeId: string }>;
}

export default async function UnidadeLayout({ children, params }: LayoutProps) {
    const { unidadeId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const vinculoAtual = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);
    if (!vinculoAtual) notFound();

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);
    const outros = (ctx?.vinculos ?? [])
        .filter((v) => v.unidadeId !== unidadeId)
        .map((v) => ({
            unidadeId: v.unidadeId,
            label: `${v.condominio.nome} — Apt ${v.unidade.bloco ? `${v.unidade.bloco}/` : ''}${v.unidade.apartamento}`,
            href: `/app/u/${v.unidadeId}`,
        }));

    const atual = {
        unidadeId,
        label: `${vinculoAtual.condominio.nome} — Apt ${vinculoAtual.unidade.bloco ? `${vinculoAtual.unidade.bloco}/` : ''}${vinculoAtual.unidade.apartamento}`,
        href: `/app/u/${unidadeId}`,
    };

    return (
        <>
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 shrink-0">Você está em:</div>
                    <UnitDropdown atual={atual} outros={outros} />
                </div>
            </div>
            {children}
        </>
    );
}
