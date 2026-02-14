import Link from 'next/link';
import { FaPlus, FaBuilding, FaSearch, FaTint, FaFire, FaCamera } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';

type SearchParams = Promise<{
    deleted?: string;
    error?: string;
}>;

export default async function CondominiosPage({ searchParams }: { searchParams: SearchParams }) {
    const query = await searchParams;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const { redirect } = await import('next/navigation');
        redirect('/login/admin');
    }

    const { data: condominios } = await supabase
        .from('condominios')
        .select(`
            id,
            nome,
            tem_agua,
            tem_gas,
            envio_leitura_morador_habilitado,
            unidades (count)
        `)
        .order('nome', { ascending: true });

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {query.deleted === '1' && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    Condomínio excluído com sucesso. As unidades e os moradores vinculados foram removidos em cascata.
                </div>
            )}
            {query.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {decodeURIComponent(query.error)}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Condomínios</h1>
                    <p className="text-slate-500 text-sm">
                        {condominios?.length || 0} condomínios cadastrados
                    </p>
                </div>
                <Link
                    href="/admin/condominios/novo"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                >
                    <FaPlus className="h-4 w-4" />
                    Novo Condomínio
                </Link>
            </div>

            {/* Search (Client component would be better for interactive search, keeping simple for now) */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar condomínio..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {(condominios || []).map(cond => (
                    <Link
                        key={cond.id}
                        href={`/admin/condominios/${cond.id}`}
                        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-vscode-blue/30 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-vscode-blue group-hover:text-white transition-colors">
                                    <FaBuilding className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{cond.nome}</p>
                                    <p className="text-xs text-slate-500">
                                        {/* @ts-ignore */}
                                        {cond.unidades?.[0]?.count || 0} unidades
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {cond.tem_agua && (
                                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        <FaTint className="h-3 w-3" /> Água
                                    </span>
                                )}
                                {cond.tem_gas && (
                                    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                        <FaFire className="h-3 w-3" /> Gás
                                    </span>
                                )}
                                {cond.envio_leitura_morador_habilitado && (
                                    <span className="hidden sm:flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                        <FaCamera className="h-3 w-3" /> Envio
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {(!condominios || condominios.length === 0) && (
                    <div className="text-center py-10 text-slate-500">
                        Nenhum condomínio encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
