import Link from 'next/link';
import { FaEye, FaBuilding, FaDoorOpen, FaExternalLinkAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';

type SearchParams = Promise<{
    condominio?: string;
    unidade?: string;
}>;

type CondominioRow = {
    id: string;
    nome: string;
};

type UnidadeRow = {
    id: string;
    bloco: string;
    apartamento: string;
    condominio_id: string;
    moradores: { nome: string | null }[] | null;
};

export default async function VisualizarComoPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const condominioId = params.condominio || '';
    const unidadeId = params.unidade || '';
    const supabase = await createClient();

    const { data: condominios } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    let unidadesQuery = supabase
        .from('unidades')
        .select(`
            id,
            bloco,
            apartamento,
            condominio_id,
            moradores (
                nome
            )
        `)
        .order('apartamento', { ascending: true });

    if (condominioId) {
        unidadesQuery = unidadesQuery.eq('condominio_id', condominioId);
    }

    const { data: unidades } = await unidadesQuery;
    const unidadeSelecionada = ((unidades || []) as UnidadeRow[]).find((u) => u.id === unidadeId);
    const condominioSelecionado = ((condominios || []) as CondominioRow[]).find((c) => c.id === condominioId);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Visualizar como Morador</h1>
                <p className="text-slate-500 text-sm">Pré-visualização da unidade no portal</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <form method="GET" className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            <FaBuilding className="inline h-4 w-4 mr-1.5 text-slate-400" />
                            Condomínio
                        </label>
                        <select
                            name="condominio"
                            defaultValue={condominioId}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        >
                            <option value="">Selecione o condomínio...</option>
                            {(condominios as CondominioRow[] || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            <FaDoorOpen className="inline h-4 w-4 mr-1.5 text-slate-400" />
                            Unidade
                        </label>
                        <select
                            name="unidade"
                            defaultValue={unidadeId}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                            disabled={!condominioId}
                        >
                            <option value="">Selecione a unidade...</option>
                            {(unidades as UnidadeRow[] || []).map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.bloco} — {u.apartamento}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        Atualizar seleção
                    </button>
                </form>

                {unidadeSelecionada && (
                    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                            <FaEye className="h-4 w-4" /> Pré-visualização
                        </div>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <p><strong>Condomínio:</strong> {condominioSelecionado?.nome}</p>
                            <p><strong>Unidade:</strong> {unidadeSelecionada.bloco} — {unidadeSelecionada.apartamento}</p>
                            <p><strong>Proprietário:</strong> {unidadeSelecionada.moradores?.[0]?.nome || 'Sem acesso configurado'}</p>
                        </div>
                    </div>
                )}

                <Link
                    href={unidadeId ? '/app' : '#'}
                    className={`w-full rounded-xl py-3.5 font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                        unidadeId
                            ? 'bg-yellow-500 text-slate-900 shadow-yellow-500/25 hover:bg-yellow-400 hover:scale-[1.02]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                >
                    <FaExternalLinkAlt className="h-4 w-4" />
                    Abrir como Morador
                </Link>

                <p className="text-xs text-slate-400 text-center">
                    Fluxo de impersonação real pode ser implementado depois. Aqui é uma pré-visualização guiada.
                </p>
            </div>
        </div>
    );
}
