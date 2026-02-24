import { FaEye, FaBuilding, FaDoorOpen, FaExternalLinkAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { startAdminMoradorPreview, stopAdminMoradorPreview } from '@/actions/adminPreviewActions';
import { getAdminMoradorPreviewPayload } from '@/lib/adminPreview';
import { firstOfRelation } from '@/lib/relations';

type SearchParams = Promise<{
    condominio?: string;
    unidade?: string;
    error?: string;
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
    moradores: { nome: string | null } | { nome: string | null }[] | null;
};

export default async function VisualizarComoPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const condominioId = params.condominio || '';
    const unidadeId = params.unidade || '';
    const errorMessage = params.error ? decodeURIComponent(params.error) : '';
    const supabase = await createClient();
    const previewPayload = await getAdminMoradorPreviewPayload();

    const { data: condominios } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    const { data: unidades } = condominioId
        ? await supabase
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
            .eq('condominio_id', condominioId)
            .order('apartamento', { ascending: true })
        : { data: [] as UnidadeRow[] };
    const unidadeSelecionada = ((unidades || []) as UnidadeRow[]).find((u) => u.id === unidadeId);
    const condominioSelecionado = ((condominios || []) as CondominioRow[]).find((c) => c.id === condominioId);

    const { data: previewUnidadeRaw } = previewPayload
        ? await supabase
            .from('unidades')
            .select('id, bloco, apartamento, condominio:condominios(nome)')
            .eq('id', previewPayload.unidadeId)
            .maybeSingle()
        : { data: null };

    const previewUnidade = previewUnidadeRaw as
        | ({
            id: string;
            bloco: string;
            apartamento: string;
            condominio: { nome: string } | { nome: string }[] | null;
        })
        | null;

    const previewCondominioNome = previewUnidade ? (firstOfRelation(previewUnidade.condominio)?.nome || 'Condomínio') : '';

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Visualizar como Morador</h1>
                <p className="text-slate-500 text-sm">Pré-visualização da unidade no portal</p>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {previewUnidade && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-green-900">Visualização ativa no portal do morador</p>
                    <p className="text-sm text-green-800">
                        {previewCondominioNome} - {previewUnidade.bloco} — {previewUnidade.apartamento}
                    </p>
                    <form action={stopAdminMoradorPreview}>
                        <input type="hidden" name="return_path" value="/admin/visualizar" />
                        <button
                            type="submit"
                            className="rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors"
                        >
                            Encerrar visualização
                        </button>
                    </form>
                </div>
            )}

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
                            <p><strong>Proprietário:</strong> {firstOfRelation(unidadeSelecionada.moradores)?.nome || 'Sem morador configurado'}</p>
                        </div>
                    </div>
                )}

                <form action={startAdminMoradorPreview}>
                    <input type="hidden" name="condominio_id" value={condominioId} />
                    <input type="hidden" name="unidade_id" value={unidadeId} />
                    <button
                        type="submit"
                        disabled={!unidadeId}
                        className={`w-full rounded-xl py-3.5 font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                            unidadeId
                                ? 'bg-yellow-500 text-slate-900 shadow-yellow-500/25 hover:bg-yellow-400 hover:scale-[1.02]'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <FaExternalLinkAlt className="h-4 w-4" />
                        Entrar como Morador
                    </button>
                </form>

                <p className="text-xs text-slate-400 text-center">
                    O acesso será aberto no portal do morador em modo de visualização controlado pelo admin.
                </p>
            </div>
        </div>
    );
}
