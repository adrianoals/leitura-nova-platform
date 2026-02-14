import Link from 'next/link';
import { FaClipboardList, FaTint, FaFire, FaSearch, FaPlus, FaImage, FaDoorOpen } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import FilterApplyButton from '@/components/admin/FilterApplyButton';

type SearchParams = Promise<{
    condominio_id?: string;
    q?: string;
    created?: string;
}>;

type CondominioOption = {
    id: string;
    nome: string;
};

type UnidadeRow = {
    id: string;
    bloco: string;
    apartamento: string;
    moradores: { id: string; nome: string | null }[] | null;
};

type LeituraRow = {
    id: string;
    tipo: 'agua' | 'agua_fria' | 'agua_quente' | 'gas';
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    unidade: {
        id: string;
        bloco: string;
        apartamento: string;
        condominio: { nome: string } | { nome: string }[] | null;
    }[] | null;
    fotos_leitura: { count: number }[] | null;
};

function formatarMes(mesRef: string) {
    const [ano, mes] = mesRef.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes, 10) - 1] || mes}/${ano}`;
}

function formatarData(data: string) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTipo(tipo: LeituraRow['tipo']) {
    if (tipo === 'agua_fria') return 'Água Fria';
    if (tipo === 'agua_quente') return 'Água Quente';
    if (tipo === 'gas') return 'Gás';
    return 'Água';
}

function getCondominioNome(condominio: { nome: string } | { nome: string }[] | null) {
    if (!condominio) return 'Condomínio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condomínio';
    return condominio.nome;
}

function getUnidade(row: LeituraRow) {
    return row.unidade?.[0] || null;
}

export default async function LeiturasAdminPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const termoBusca = (params.q || '').trim().toLowerCase();
    const selectedCondominioId = params.condominio_id || '';
    const created = params.created === '1';

    const supabase = await createClient();

    const { data: condominiosRaw } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    const condominios = (condominiosRaw || []) as CondominioOption[];
    const condominioSelecionado = condominios.find((c) => c.id === selectedCondominioId) || null;
    const hasCondominioSelecionado = Boolean(condominioSelecionado);

    let unidades: UnidadeRow[] = [];
    let leiturasBase: LeituraRow[] = [];

    if (hasCondominioSelecionado) {
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
            .eq('condominio_id', selectedCondominioId)
            .order('apartamento', { ascending: true });

        unidades = ((unidadesRaw || []) as UnidadeRow[]).filter((u) => {
            if (!termoBusca) return true;
            const texto = `${u.bloco} ${u.apartamento} ${u.moradores?.[0]?.nome || ''}`.toLowerCase();
            return texto.includes(termoBusca);
        });

        const unidadeIds = unidades.map((u) => u.id);

        if (unidadeIds.length > 0) {
            const { data: leiturasRaw } = await supabase
                .from('leituras_mensais')
                .select(`
                    id,
                    tipo,
                    mes_referencia,
                    data_leitura,
                    medicao,
                    valor,
                    unidade:unidades (
                        id,
                        bloco,
                        apartamento,
                        condominio:condominios (
                            nome
                        )
                    ),
                    fotos_leitura (count)
                `)
                .in('unidade_id', unidadeIds)
                .order('data_leitura', { ascending: false })
                .limit(200);

            leiturasBase = (leiturasRaw || []) as unknown as LeituraRow[];
        }
    }

    const leiturasPorUnidadeTipo = new Map<string, LeituraRow[]>();
    for (const leitura of leiturasBase) {
        const unidade = getUnidade(leitura);
        const groupKey = `${unidade?.id || 'sem-unidade'}|${leitura.tipo}`;
        const group = leiturasPorUnidadeTipo.get(groupKey) || [];
        group.push(leitura);
        leiturasPorUnidadeTipo.set(groupKey, group);
    }

    const consumoByLeituraId = new Map<string, number | null>();
    for (const [, group] of leiturasPorUnidadeTipo) {
        group.sort((a, b) => b.data_leitura.localeCompare(a.data_leitura));
        for (let i = 0; i < group.length; i += 1) {
            const atual = group[i];
            const anterior = group[i + 1];
            if (!anterior) {
                consumoByLeituraId.set(atual.id, null);
                continue;
            }
            consumoByLeituraId.set(atual.id, Number(atual.medicao) - Number(anterior.medicao));
        }
    }

    const leituras = leiturasBase.filter((l) => {
        if (!termoBusca) return true;
        const unidade = getUnidade(l);
        const condominioNome = getCondominioNome(unidade?.condominio || null);
        const unidadeLabel = `${unidade?.bloco || ''} ${unidade?.apartamento || ''}`;
        const texto = `${l.mes_referencia} ${formatarTipo(l.tipo)} ${condominioNome} ${unidadeLabel}`.toLowerCase();
        return texto.includes(termoBusca);
    });

    const novaLeituraHref = hasCondominioSelecionado
        ? `/admin/leituras/nova?condominio_id=${selectedCondominioId}`
        : '/admin/leituras/nova';
    const filtroFormKey = `${selectedCondominioId}|${params.q || ''}`;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leituras Mensais</h1>
                    <p className="text-slate-500 text-sm">
                        {hasCondominioSelecionado
                            ? `Condomínio selecionado: ${condominioSelecionado?.nome}`
                            : 'Selecione um condomínio para visualizar as unidades'}
                    </p>
                </div>
                <Link href={novaLeituraHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                >
                    <FaPlus className="h-4 w-4" /> Nova Leitura
                </Link>
            </div>

            {created && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    Leitura salva com sucesso.
                </div>
            )}

            <form key={filtroFormKey} method="GET" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                        <select
                            name="condominio_id"
                            defaultValue={selectedCondominioId}
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
                        <label className="block text-sm font-medium text-slate-700">Buscar unidade/período</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={params.q || ''}
                                placeholder="Bloco, apto, período..."
                                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            />
                        </div>
                    </div>

                    <FilterApplyButton />

                    <Link
                        href="/admin/leituras"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
                    >
                        Limpar
                    </Link>
                </div>
            </form>

            {!hasCondominioSelecionado ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    Selecione um condomínio para visualizar as unidades e adicionar leitura.
                </div>
            ) : (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Unidades do Condomínio</p>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Morador</th>
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
                                        <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                            {u.moradores?.[0]?.nome || <span className="italic text-slate-400">Sem morador</span>}
                                        </td>
                                        <td className="text-right px-6 py-4">
                                            <Link
                                                href={`/admin/leituras/nova?condominio_id=${selectedCondominioId}&unidade_id=${u.id}`}
                                                className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium"
                                            >
                                                Adicionar leitura
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {unidades.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                                            Nenhuma unidade encontrada para este condomínio.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Leituras Recentes</p>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Período</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden lg:table-cell">Unidade</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Tipo</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Medição</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Consumo</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Valor</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Fotos</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leituras.map((l) => {
                                    const unidade = getUnidade(l);
                                    const unidadeLabel = `${unidade?.bloco || ''} — ${unidade?.apartamento || ''}`;
                                    const isAgua = l.tipo === 'agua' || l.tipo === 'agua_fria' || l.tipo === 'agua_quente';
                                    const fotosCount = l.fotos_leitura?.[0]?.count || 0;
                                    const consumo = consumoByLeituraId.get(l.id) ?? null;

                                    return (
                                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <FaClipboardList className="h-4 w-4 text-slate-400" />
                                                    <p className="text-sm font-medium text-slate-900">{formatarMes(l.mes_referencia)}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600 hidden lg:table-cell">
                                                {unidadeLabel}
                                            </td>
                                            <td className="text-center px-4 py-4">
                                                {isAgua ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                        <FaTint className="h-3 w-3" /> {formatarTipo(l.tipo)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                                        <FaFire className="h-3 w-3" /> {formatarTipo(l.tipo)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900 font-medium hidden sm:table-cell">{Number(l.medicao)} m³</td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-700 hidden md:table-cell">
                                                {consumo === null ? <span className="text-slate-400">—</span> : `${consumo.toFixed(2)} m³`}
                                            </td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900 hidden md:table-cell">{formatarValor(Number(l.valor))}</td>
                                            <td className="text-center px-4 py-4 hidden md:table-cell">
                                                {fotosCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                                        <FaImage className="h-3 w-3" /> {fotosCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">{formatarData(l.data_leitura)}</td>
                                        </tr>
                                    );
                                })}
                                {leituras.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">
                                            Nenhuma leitura encontrada para este condomínio.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
