import Link from 'next/link';
import { FaSearch, FaDoorOpen, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import FilterApplyButton from '@/components/admin/FilterApplyButton';

type SearchParams = Promise<{
    condominio_id?: string;
    condominio?: string;
    q?: string;
}>;

type UnidadeAccessRow = {
    id: string;
    bloco: string;
    apartamento: string;
    condominio_id: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
    moradores: { id: string; nome: string | null }[] | null;
};

type CondominioOption = {
    id: string;
    nome: string;
};

function getCondominioNome(condominio: UnidadeAccessRow['condominio']) {
    if (!condominio) return 'Condomínio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condomínio';
    return condominio.nome;
}

export default async function MoradoresPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const condominioId = params.condominio_id || params.condominio || '';
    const termoBusca = (params.q || '').trim().toLowerCase();

    const supabase = await createClient();

    const { data: condominiosRaw } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    const condominios = (condominiosRaw || []) as CondominioOption[];
    const condominioSelecionado = condominios.find((c) => c.id === condominioId) || null;
    const hasCondominioSelecionado = Boolean(condominioSelecionado);

    let unidades: UnidadeAccessRow[] = [];

    if (hasCondominioSelecionado) {
        const { data: unidadesRaw } = await supabase
            .from('unidades')
            .select(`
                id,
                bloco,
                apartamento,
                condominio_id,
                condominio:condominios (
                    id,
                    nome
                ),
                moradores (
                    id,
                    nome
                )
            `)
            .eq('condominio_id', condominioId)
            .order('apartamento', { ascending: true });

        unidades = ((unidadesRaw || []) as UnidadeAccessRow[]).filter((u) => {
            if (!termoBusca) return true;
            const texto = `${u.bloco} ${u.apartamento} ${u.moradores?.[0]?.nome || ''}`.toLowerCase();
            return texto.includes(termoBusca);
        });
    }

    const totalUnidades = unidades.length;
    const totalComMorador = unidades.filter((u) => (u.moradores?.length || 0) > 0).length;
    const filtroFormKey = `${condominioId}|${params.q || ''}`;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moradores por Unidade</h1>
                    <p className="text-slate-500 text-sm">
                        {hasCondominioSelecionado
                            ? `${totalComMorador} de ${totalUnidades} unidades com morador configurado em ${condominioSelecionado?.nome}`
                            : 'Selecione um condomínio para visualizar os moradores'}
                    </p>
                </div>
            </div>

            <form key={filtroFormKey} method="GET" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                        <select
                            name="condominio_id"
                            defaultValue={condominioId}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        >
                            <option value="">Selecione um condomínio...</option>
                            {condominios.map((cond) => (
                                <option key={cond.id} value={cond.id}>
                                    {cond.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Buscar unidade/proprietário</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={params.q || ''}
                                placeholder="Bloco, apto, proprietário..."
                                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            />
                        </div>
                    </div>

                    <FilterApplyButton />

                    <Link
                        href="/admin/moradores"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
                    >
                        Limpar
                    </Link>
                </div>
            </form>

            {!hasCondominioSelecionado ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    Selecione um condomínio para visualizar os moradores.
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Condomínio</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Proprietário</th>
                                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unidades.map((u) => {
                                const condNome = getCondominioNome(u.condominio);
                                const proprietario = u.moradores?.[0];
                                const hasAccess = Boolean(proprietario);

                                return (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FaDoorOpen className="h-4 w-4 text-slate-400" />
                                                <p className="text-sm font-medium text-slate-900">{u.bloco} — {u.apartamento}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {condNome}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {proprietario?.nome || <span className="italic text-slate-400">Não configurado</span>}
                                        </td>
                                        <td className="text-center px-4 py-4">
                                            {hasAccess ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                    <FaCheckCircle className="h-3 w-3" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                    <FaExclamationCircle className="h-3 w-3" /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-right px-6 py-4">
                                            <Link href={`/admin/moradores/${u.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                                Gerenciar
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {unidades.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                        Nenhuma unidade encontrada para este condomínio.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
