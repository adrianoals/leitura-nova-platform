import Link from 'next/link';
import { FaDoorOpen, FaSearch, FaBuilding } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';

type SearchParams = Promise<{
    q?: string;
    created?: string;
}>;

type UnidadeRow = {
    id: string;
    bloco: string;
    apartamento: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
    moradores: { id: string; nome: string | null }[] | null;
};

function getCondominioNome(condominio: UnidadeRow['condominio']) {
    if (!condominio) return 'Condomínio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condomínio';
    return condominio.nome;
}

export default async function UnidadesPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const termoBusca = (params.q || '').toLowerCase().trim();
    const created = params.created === '1';

    const supabase = await createClient();
    const { data: unidadesRaw } = await supabase
        .from('unidades')
        .select(`
            id,
            bloco,
            apartamento,
            condominio:condominios (
                id,
                nome
            ),
            moradores (
                id,
                nome
            )
        `)
        .order('apartamento', { ascending: true });

    const unidades = ((unidadesRaw || []) as UnidadeRow[]).filter((u) => {
        if (!termoBusca) return true;
        const condNome = getCondominioNome(u.condominio);
        const texto = `${u.bloco} ${u.apartamento} ${condNome}`.toLowerCase();
        return texto.includes(termoBusca);
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Unidades</h1>
                    <p className="text-slate-500 text-sm">{unidades.length} unidades encontradas</p>
                </div>
                <Link
                    href="/admin/unidades/nova"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                >
                    Nova Unidade
                </Link>
            </div>

            {created && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    Unidade criada com sucesso.
                </div>
            )}

            <form className="relative" method="GET">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    name="q"
                    defaultValue={params.q || ''}
                    placeholder="Buscar unidade..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Condomínio</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Morador</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unidades.map(u => {
                            const condominioNome = getCondominioNome(u.condominio);
                            const primeiroMorador = u.moradores?.[0];
                            const hasAccess = Boolean(primeiroMorador);

                            return (
                            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FaDoorOpen className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-900">{u.bloco} — {u.apartamento}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                        <FaBuilding className="h-3 w-3 text-slate-400" />
                                        {condominioNome}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                    {primeiroMorador?.nome || <span className="italic text-slate-400">—</span>}
                                </td>
                                <td className="text-center px-4 py-4">
                                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${hasAccess ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {hasAccess ? 'Com acesso' : 'Sem acesso'}
                                    </span>
                                </td>
                                <td className="text-right px-6 py-4">
                                    <Link href={`/admin/unidades/${u.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                            );
                        })}
                        {unidades.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Nenhuma unidade encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
