import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaClipboardList, FaDoorOpen, FaFire, FaSearch, FaTint, FaUsers } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { firstOfRelation } from '@/lib/relations';
import { formatData, formatMes, formatValor } from '@/lib/morador';
import FilterApplyButton from '@/components/admin/FilterApplyButton';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ mes?: string; q?: string }>;

type CondominioRow = {
    id: string;
    nome: string;
    tem_agua: boolean;
    tem_agua_quente: boolean;
    tem_gas: boolean;
};

type UnidadeRow = {
    id: string;
    bloco: string | null;
    apartamento: string | null;
    moradores: { id: string; nome: string | null }[] | null;
};

type LeituraRow = {
    id: string;
    unidade_id: string;
    tipo: 'agua' | 'agua_fria' | 'agua_quente' | 'gas';
    data_leitura: string;
    medicao: number;
    valor: number;
};

function getMesAtual() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isMes(value: string) {
    return /^\d{4}-\d{2}$/.test(value);
}

function formatTipo(tipo: LeituraRow['tipo']) {
    if (tipo === 'agua_fria') return 'Água Fria';
    if (tipo === 'agua_quente') return 'Água Quente';
    if (tipo === 'gas') return 'Gás';
    return 'Água';
}

function formatUnidade(bloco?: string | null, apartamento?: string | null) {
    const blocoLimpo = (bloco || '').trim();
    const aptoLimpo = (apartamento || '').trim();
    if (blocoLimpo && aptoLimpo) return `${blocoLimpo} - ${aptoLimpo}`;
    if (aptoLimpo) return `Apto ${aptoLimpo}`;
    if (blocoLimpo) return blocoLimpo;
    return 'Unidade';
}

export default async function SindicoCondominioPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id: condominioId } = await params;
    const query = await searchParams;
    const termoBusca = (query.q || '').trim().toLowerCase();
    const mesSelecionado = isMes(query.mes || '') ? String(query.mes) : getMesAtual();

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login/sindico');
    }

    const { data: vinculoRows } = await supabase
        .from('sindicos')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('condominio_id', condominioId)
        .limit(1);

    if (!vinculoRows || vinculoRows.length === 0) {
        redirect('/sindico');
    }

    const [{ data: condominio }, { data: unidadesRaw }] = await Promise.all([
        supabase
            .from('condominios')
            .select('id, nome, tem_agua, tem_agua_quente, tem_gas')
            .eq('id', condominioId)
            .maybeSingle<CondominioRow>(),
        supabase
            .from('unidades')
            .select(`
                id,
                bloco,
                apartamento,
                moradores(
                    id,
                    nome
                )
            `)
            .eq('condominio_id', condominioId)
            .order('apartamento', { ascending: true }),
    ]);

    if (!condominio) {
        redirect('/sindico');
    }

    const unidadesBase = (unidadesRaw || []) as UnidadeRow[];
    const unidades = unidadesBase.filter((u) => {
        if (!termoBusca) return true;
        const moradorNome = firstOfRelation(u.moradores)?.nome || '';
        const texto = `${formatUnidade(u.bloco, u.apartamento)} ${moradorNome}`.toLowerCase();
        return texto.includes(termoBusca);
    });
    const unidadeIds = unidades.map((u) => u.id);

    let leituras: LeituraRow[] = [];
    if (unidadeIds.length > 0) {
        const { data: leiturasRaw } = await supabase
            .from('leituras_mensais')
            .select('id, unidade_id, tipo, data_leitura, medicao, valor')
            .eq('mes_referencia', mesSelecionado)
            .in('unidade_id', unidadeIds)
            .order('data_leitura', { ascending: false });
        leituras = (leiturasRaw || []) as unknown as LeituraRow[];
    }

    const leituraCountPorUnidade = new Map<string, number>();
    for (const leitura of leituras) {
        leituraCountPorUnidade.set(
            leitura.unidade_id,
            (leituraCountPorUnidade.get(leitura.unidade_id) || 0) + 1
        );
    }

    const unitById = new Map(unidades.map((u) => [u.id, u]));

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/sindico"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{condominio.nome}</h1>
                    <p className="text-sm text-slate-500">Visão completa do condomínio</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {condominio.tem_agua && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <FaTint className="h-3 w-3" /> Água
                    </span>
                )}
                {condominio.tem_agua_quente && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700">
                        <FaTint className="h-3 w-3" /> Água Quente
                    </span>
                )}
                {condominio.tem_gas && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                        <FaFire className="h-3 w-3" /> Gás
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{unidades.length}</p>
                    <p className="text-xs text-slate-500">Unidades (filtro)</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{unidades.filter((u) => Boolean(firstOfRelation(u.moradores))).length}</p>
                    <p className="text-xs text-slate-500">Com morador</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{leituras.length}</p>
                    <p className="text-xs text-slate-500">Leituras ({formatMes(mesSelecionado)})</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{formatValor(leituras.reduce((sum, l) => sum + Number(l.valor), 0))}</p>
                    <p className="text-xs text-slate-500">Valor total do mês</p>
                </div>
            </div>

            <form method="GET" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto_auto] gap-3 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Buscar unidade/proprietário</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                name="q"
                                defaultValue={query.q || ''}
                                placeholder="Bloco, apto, proprietário..."
                                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Mês</label>
                        <input
                            type="month"
                            name="mes"
                            defaultValue={mesSelecionado}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        />
                    </div>
                    <FilterApplyButton />
                    <Link
                        href={`/sindico/condominios/${condominioId}`}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        Limpar
                    </Link>
                </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Unidades</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <FaBuilding className="h-3 w-3" /> {condominio.nome}
                    </span>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-white">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Proprietário</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Leituras mês</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unidades.map((u) => {
                            const morador = firstOfRelation(u.moradores);
                            const hasMorador = Boolean(morador);
                            return (
                                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        <span className="inline-flex items-center gap-2">
                                            <FaDoorOpen className="h-3.5 w-3.5 text-slate-400" />
                                            {formatUnidade(u.bloco, u.apartamento)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-700">{morador?.nome || 'Não configurado'}</td>
                                    <td className="text-center px-4 py-4">
                                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${hasMorador ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {hasMorador ? 'Ativo' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-700">
                                        {leituraCountPorUnidade.get(u.id) || 0}
                                    </td>
                                </tr>
                            );
                        })}
                        {unidades.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Nenhuma unidade encontrada para os filtros aplicados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">Leituras de {formatMes(mesSelecionado)}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <FaCalendarAlt className="h-3 w-3" /> {formatMes(mesSelecionado)}
                    </span>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-white">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Tipo</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Data</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Medição</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leituras.map((l) => {
                            const unidade = unitById.get(l.unidade_id);
                            return (
                                <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-sm text-slate-900">{formatUnidade(unidade?.bloco, unidade?.apartamento)}</td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-700">{formatTipo(l.tipo)}</td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-700">{formatData(l.data_leitura)}</td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-700">{Number(l.medicao)} m3</td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-900">{formatValor(Number(l.valor))}</td>
                                </tr>
                            );
                        })}
                        {leituras.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Nenhuma leitura para o mês selecionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <span className="inline-flex items-center gap-2">
                    <FaClipboardList className="h-3.5 w-3.5" />
                    Visualização em modo síndico (somente leitura).
                </span>
            </div>
        </div>
    );
}

