import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createUnidade } from '@/actions/unidadeActions';

type SearchParams = Promise<{ error?: string }>;

type CondominioOption = {
    id: string;
    nome: string;
};

export default async function NovaUnidadePage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const error = params.error;
    const supabase = await createClient();

    const { data: condominios } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/unidades" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nova Unidade</h1>
                    <p className="text-sm text-slate-500">Cadastre uma unidade vinculada a um condomínio</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {decodeURIComponent(error)}
                </div>
            )}

            <form action={createUnidade} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                    <select
                        name="condominio_id"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        required
                    >
                        <option value="">Selecione...</option>
                        {(condominios as CondominioOption[] || []).map((cond) => (
                            <option key={cond.id} value={cond.id}>{cond.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Bloco</label>
                    <input
                        type="text"
                        name="bloco"
                        placeholder="Ex.: Torre A (opcional)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Apartamento</label>
                    <input
                        type="text"
                        name="apartamento"
                        placeholder="Ex.: Apto 101"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        required
                    />
                </div>

                <button type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <FaSave className="h-4 w-4" /> Salvar Unidade
                </button>
            </form>
        </div>
    );
}
