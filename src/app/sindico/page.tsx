import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowRight, FaBuilding, FaClipboardList, FaDoorOpen, FaUsers } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { firstOfRelation } from '@/lib/relations';
import { formatMes } from '@/lib/morador';

type SindicoRow = {
    id: string;
    nome: string | null;
    condominio_id: string;
    condominio:
        | {
              id: string;
              nome: string;
              tem_agua: boolean;
              tem_agua_quente: boolean;
              tem_gas: boolean;
          }
        | {
              id: string;
              nome: string;
              tem_agua: boolean;
              tem_agua_quente: boolean;
              tem_gas: boolean;
          }[]
        | null;
};

type UnidadeRow = {
    id: string;
    condominio_id: string;
    unidade_acessos: { id: string; ativo: boolean }[] | null;
};

type LeituraRow = {
    id: string;
    unidade_id: string;
};

function getMesAtual() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default async function SindicoDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login/sindico');
    }

    const mesAtual = getMesAtual();

    const { data: sindicosRaw } = await supabase
        .from('sindicos')
        .select(`
            id,
            nome,
            condominio_id,
            condominio:condominios(
                id,
                nome,
                tem_agua,
                tem_agua_quente,
                tem_gas
            )
        `)
        .eq('auth_user_id', user.id)
        .order('created_at', { ascending: false });

    const vinculos = (sindicosRaw || []) as SindicoRow[];
    const condominioIds = Array.from(new Set(vinculos.map((v) => v.condominio_id)));

    if (condominioIds.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <h1 className="text-xl font-semibold text-slate-900">Acesso não vinculado</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Seu usuário ainda não está vinculado a nenhum condomínio como síndico.
                    </p>
                </div>
            </div>
        );
    }

    const { data: unidadesRaw } = await supabase
        .from('unidades')
        .select(`
            id,
            condominio_id,
            unidade_acessos(id, ativo)
        `)
        .in('condominio_id', condominioIds);

    const unidades = (unidadesRaw || []) as UnidadeRow[];
    const unidadeIds = unidades.map((u) => u.id);

    let leiturasMes: LeituraRow[] = [];
    if (unidadeIds.length > 0) {
        const { data: leiturasRaw } = await supabase
            .from('leituras_mensais')
            .select('id, unidade_id')
            .eq('mes_referencia', mesAtual)
            .in('unidade_id', unidadeIds);
        leiturasMes = (leiturasRaw || []) as LeituraRow[];
    }

    const statsByCondominio = new Map<string, { unidades: number; acessos: number; leiturasMes: number }>();

    for (const condominioId of condominioIds) {
        const unidadesCondo = unidades.filter((u) => u.condominio_id === condominioId);
        const unidadeIdsCondo = new Set(unidadesCondo.map((u) => u.id));
        const acessosCondo = unidadesCondo.reduce(
            (sum, unidade) => sum + (unidade.unidade_acessos?.filter((a) => a.ativo).length || 0),
            0,
        );
        const leiturasCondo = leiturasMes.filter((l) => unidadeIdsCondo.has(l.unidade_id)).length;

        statsByCondominio.set(condominioId, {
            unidades: unidadesCondo.length,
            acessos: acessosCondo,
            leiturasMes: leiturasCondo,
        });
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Painel do Síndico</h1>
                <p className="text-sm text-slate-500">
                    Visão geral dos seus condomínios - referência {formatMes(mesAtual)}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vinculos.map((vinculo) => {
                    const condominio = firstOfRelation(vinculo.condominio);
                    if (!condominio) return null;

                    const stats = statsByCondominio.get(condominio.id) || {
                        unidades: 0,
                        acessos: 0,
                        leiturasMes: 0,
                    };

                    return (
                        <div key={vinculo.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Condomínio</p>
                                    <h2 className="text-lg font-semibold text-slate-900">{condominio.nome}</h2>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
                                    <FaBuilding className="h-3 w-3" /> Síndico
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                    <p className="text-lg font-bold text-slate-900">{stats.unidades}</p>
                                    <p className="text-xs text-slate-500">Unidades</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                    <p className="text-lg font-bold text-slate-900">{stats.acessos}</p>
                                    <p className="text-xs text-slate-500">Acessos</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                    <p className="text-lg font-bold text-slate-900">{stats.leiturasMes}</p>
                                    <p className="text-xs text-slate-500">Leituras mês</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1"><FaDoorOpen className="h-3 w-3" /> Gestão de unidades</span>
                                <span className="inline-flex items-center gap-1"><FaUsers className="h-3 w-3" /> Moradores</span>
                                <span className="inline-flex items-center gap-1"><FaClipboardList className="h-3 w-3" /> Leituras</span>
                            </div>

                            <div className="mt-4">
                                <Link
                                    href={`/sindico/condominios/${condominio.id}`}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-vscode-blue hover:text-vscode-blue-dark"
                                >
                                    Ver detalhes <FaArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

