import Link from 'next/link';
import { FaArrowLeft, FaBuilding, FaSave } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { updateUnidade } from '@/actions/unidadeActions';
import DeleteUnidadeButton from '@/components/admin/DeleteUnidadeButton';
import { firstOfRelation } from '@/lib/relations';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string; error?: string }>;

type UnidadeDetail = {
    id: string;
    bloco: string;
    apartamento: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
    moradores: { id: string; nome: string | null } | { id: string; nome: string | null }[] | null;
};

function getCondominioNome(condominio: UnidadeDetail['condominio']) {
    if (!condominio) return 'Condomínio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condomínio';
    return condominio.nome;
}

function getCondominioId(condominio: UnidadeDetail['condominio']) {
    if (!condominio) return '';
    if (Array.isArray(condominio)) return condominio[0]?.id || '';
    return condominio.id;
}

export default async function UnidadeDetailPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const query = await searchParams;
    const supabase = await createClient();

    const { data: unidade } = await supabase
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
        .eq('id', id)
        .single<UnidadeDetail>();

    if (!unidade) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Unidade não encontrada.</p>
                    <Link href="/admin/unidades" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const condominioNome = getCondominioNome(unidade.condominio);
    const saved = query.saved === '1';
    const error = query.error;
    const morador = firstOfRelation(unidade.moradores);
    const condominioId = getCondominioId(unidade.condominio);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/unidades" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Unidade</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-1"><FaBuilding className="h-3 w-3" /> {condominioNome}</p>
                </div>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Unidade atualizada com sucesso.
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {decodeURIComponent(error)}
                </div>
            )}

            <form action={updateUnidade} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <input type="hidden" name="id" value={unidade.id} />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Bloco</label>
                    <input type="text" name="bloco" defaultValue={unidade.bloco}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Apartamento</label>
                    <input type="text" name="apartamento" defaultValue={unidade.apartamento}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        required
                    />
                </div>

                {/* Morador vinculado à unidade */}
                <div className="space-y-3 pt-2">
                    <p className="text-sm font-medium text-slate-700">Morador</p>
                    {morador ? (
                        <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                            <p className="text-sm text-slate-800">
                                {morador.nome || 'Proprietário sem nome'}
                            </p>
                            <p className="text-xs text-slate-500">
                                Esta unidade já possui morador cadastrado.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-amber-200 p-3 bg-amber-50">
                            <p className="text-sm text-amber-800">Unidade sem morador cadastrado.</p>
                            <Link href={`/admin/moradores/${unidade.id}`} className="text-xs text-amber-700 underline">
                                Criar morador para esta unidade
                            </Link>
                        </div>
                    )}
                </div>

                <button type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <FaSave className="h-4 w-4" /> Salvar
                </button>

                <DeleteUnidadeButton
                    unidadeId={unidade.id}
                    returnPath={condominioId ? `/admin/unidades?condominio_id=${condominioId}` : '/admin/unidades'}
                />
            </form>
        </div>
    );
}
