import Link from 'next/link';
import { FaArrowLeft, FaDoorOpen, FaTint, FaFire, FaCamera, FaPlus, FaKey } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import DeleteCondominioButton from '@/components/admin/DeleteCondominioButton';

type Params = Promise<{ id: string }>;

type CondominioDetail = {
    id: string;
    nome: string;
    tem_agua: boolean;
    tem_gas: boolean;
    envio_leitura_morador_habilitado: boolean;
};

type UnidadeRow = {
    id: string;
    bloco: string;
    apartamento: string;
    moradores: { id: string; nome: string | null }[] | null;
};

export default async function CondominioDetailPage({ params }: { params: Params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: cond } = await supabase
        .from('condominios')
        .select('id, nome, tem_agua, tem_gas, envio_leitura_morador_habilitado')
        .eq('id', id)
        .single<CondominioDetail>();

    const { data: unidadesRaw } = await supabase
        .from('unidades')
        .select(`
            id,
            bloco,
            apartamento,
            moradores (
                id,
                nome
            )
        `)
        .eq('condominio_id', id)
        .order('apartamento', { ascending: true });

    const unidades = (unidadesRaw || []) as UnidadeRow[];

    if (!cond) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Condomínio não encontrado.</p>
                    <Link href="/admin/condominios" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/condominios" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{cond.nome}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {cond.tem_agua && <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"><FaTint className="h-3 w-3" /> Água</span>}
                            {cond.tem_gas && <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"><FaFire className="h-3 w-3" /> Gás</span>}
                            {cond.envio_leitura_morador_habilitado && <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><FaCamera className="h-3 w-3" /> Envio</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/leituras?condominio_id=${cond.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                        <FaPlus className="h-3 w-3" /> Leitura
                    </Link>
                    <Link href={`/admin/unidades/nova?condominio_id=${cond.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                        <FaDoorOpen className="h-3 w-3" /> Unidade
                    </Link>
                    <DeleteCondominioButton condominioId={cond.id} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{unidades.length}</p>
                    <p className="text-xs text-slate-500">Unidades</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{unidades.filter((u) => (u.moradores?.length || 0) > 0).length}</p>
                    <p className="text-xs text-slate-500">Moradores</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{unidades.filter((u) => (u.moradores?.length || 0) === 0).length}</p>
                    <p className="text-xs text-slate-500">Sem Morador</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Unidades</h2>
                    <Link href={`/admin/unidades/nova?condominio_id=${cond.id}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-vscode-blue hover:bg-vscode-blue/5 font-medium transition-colors">
                        <FaPlus className="h-4 w-4" /> Adicionar Unidade
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Proprietário</th>
                                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unidades.map((u) => (
                                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FaDoorOpen className="h-4 w-4 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-900">{u.bloco} — {u.apartamento}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                        {u.moradores && u.moradores.length > 0 ? u.moradores[0].nome : <span className="text-slate-400 italic">Sem morador</span>}
                                    </td>
                                    <td className="text-center px-4 py-4">
                                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${u.moradores && u.moradores.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {u.moradores && u.moradores.length > 0 ? 'Ativo' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="text-right px-6 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/unidades/${u.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                                Editar
                                            </Link>
                                            <Link href={`/admin/moradores/${u.id}`} className="text-sm text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1">
                                                <FaKey className="h-3 w-3" /> Morador
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {unidades.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                        Nenhuma unidade cadastrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
