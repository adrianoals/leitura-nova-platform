import Link from 'next/link';
import { FaCalendarAlt, FaEye, FaFire, FaImage, FaLock, FaLockOpen, FaPlus, FaSearch, FaTint } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import FilterApplyButton from '@/components/admin/FilterApplyButton';
import { fecharMesLeituras, reabrirMesLeituras } from '@/actions/leituraActions';

type SearchParams = Promise<{
    condominio_id?: string;
    mes?: string;
    q?: string;
    created?: string;
    closed?: string;
    reopened?: string;
    error?: string;
}>;

type CondominioOption = {
    id: string;
    nome: string;
};

type FechamentoRow = {
    fechado: boolean;
    fechado_em: string | null;
};

type UnidadeListRow = {
    id: string;
    bloco: string;
    apartamento: string;
};

type LeituraRow = {
    id: string;
    tipo: 'agua' | 'agua_fria' | 'agua_quente' | 'gas';
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    unidade: { id: string; bloco: string; apartamento: string }[] | null;
    fotos_leitura: { count: number }[] | null;
};

function getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isMes(value: string) {
    return /^\d{4}-\d{2}$/.test(value);
}

function formatMes(mesRef: string) {
    const [ano, mes] = mesRef.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes, 10) - 1] || mes}/${ano}`;
}

function formatData(data: string) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatTipo(tipo: LeituraRow['tipo']) {
    if (tipo === 'agua_fria') return 'Agua Fria';
    if (tipo === 'agua_quente') return 'Agua Quente';
    if (tipo === 'gas') return 'Gas';
    return 'Agua';
}

function formatValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getUnidadeLabel(leitura: LeituraRow) {
    const unidade = leitura.unidade?.[0];
    if (!unidade) return 'Unidade';
    return `${unidade.bloco} - ${unidade.apartamento}`;
}

function matchBusca(leitura: LeituraRow, termo: string) {
    if (!termo) return true;
    const texto = `${leitura.mes_referencia} ${formatTipo(leitura.tipo)} ${getUnidadeLabel(leitura)}`.toLowerCase();
    return texto.includes(termo);
}

function buildDetalheHref(leituraId: string, condominioId: string, mes: string) {
    const query = new URLSearchParams();
    if (condominioId) query.set('condominio_id', condominioId);
    if (isMes(mes)) query.set('mes', mes);
    const qs = query.toString();
    return qs ? `/admin/leituras/${leituraId}?${qs}` : `/admin/leituras/${leituraId}`;
}

export default async function LeiturasAdminPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const termoBusca = (params.q || '').trim().toLowerCase();
    const selectedCondominioId = params.condominio_id || '';
    const mesAtual = getMesAtual();
    const selectedMes = isMes(params.mes || '') ? String(params.mes) : mesAtual;
    const created = params.created === '1';
    const closed = params.closed === '1';
    const reopened = params.reopened === '1';
    const errorMessage = params.error ? decodeURIComponent(params.error) : '';

    const supabase = await createClient();

    const { data: condominiosRaw } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });
    const condominios = (condominiosRaw || []) as CondominioOption[];
    const condominioSelecionado = condominios.find((c) => c.id === selectedCondominioId) || null;
    const hasCondominioSelecionado = Boolean(condominioSelecionado);

    let leiturasBase: LeituraRow[] = [];
    let fechamento: FechamentoRow | null = null;
    let unidadesList: UnidadeListRow[] = [];

    if (hasCondominioSelecionado) {
        const { data: unidadesRaw } = await supabase
            .from('unidades')
            .select('id, bloco, apartamento')
            .eq('condominio_id', selectedCondominioId)
            .order('apartamento', { ascending: true });

        unidadesList = ((unidadesRaw || []) as UnidadeListRow[]).filter((u) => {
            if (!termoBusca) return true;
            const texto = `${u.bloco} ${u.apartamento}`.toLowerCase();
            return texto.includes(termoBusca);
        });

        const unidadeIds = unidadesList.map((u) => u.id);

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
                        apartamento
                    ),
                    fotos_leitura (count)
                `)
                .in('unidade_id', unidadeIds)
                .order('data_leitura', { ascending: false })
                .limit(400);
            leiturasBase = (leiturasRaw || []) as unknown as LeituraRow[];
        }

        const { data: fechamentoRaw } = await supabase
            .from('fechamentos_mensais')
            .select('fechado, fechado_em')
            .eq('condominio_id', selectedCondominioId)
            .eq('mes_referencia', selectedMes)
            .maybeSingle();
        fechamento = (fechamentoRaw || null) as FechamentoRow | null;
    }

    const filtradas = leiturasBase.filter((l) => matchBusca(l, termoBusca));
    const mesesDisponiveis = Array.from(new Set(filtradas.map((l) => l.mes_referencia))).sort((a, b) => b.localeCompare(a));

    const leiturasMesAtual = filtradas.filter((l) => l.mes_referencia === mesAtual);
    let mesRecente = mesAtual;
    let leiturasRecentes = leiturasMesAtual;
    let recentLabel = 'mes atual';

    if (leiturasRecentes.length === 0 && mesesDisponiveis.length > 0) {
        mesRecente = mesesDisponiveis[0];
        leiturasRecentes = filtradas.filter((l) => l.mes_referencia === mesRecente);
        recentLabel = 'ultimo mes com leitura';
    }

    const leiturasHistorico = filtradas.filter((l) => l.mes_referencia === selectedMes);
    const mesFechado = fechamento?.fechado === true;

    const filtroFormKey = `${selectedCondominioId}|${selectedMes}|${params.q || ''}`;
    const novaLeituraHref = hasCondominioSelecionado
        ? `/admin/leituras/nova?condominio_id=${selectedCondominioId}`
        : '/admin/leituras/nova';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leituras Mensais</h1>
                    <p className="text-sm text-slate-500">
                        {hasCondominioSelecionado ? `Condominio: ${condominioSelecionado?.nome}` : 'Selecione um condominio'}
                    </p>
                </div>
                <Link
                    href={novaLeituraHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                >
                    <FaPlus className="h-4 w-4" /> Nova Leitura
                </Link>
            </div>

            {created && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Leitura salva com sucesso.</div>}
            {closed && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Mes fechado e publicado.</div>}
            {reopened && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Mes reaberto.</div>}
            {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>}

            <form key={filtroFormKey} method="GET" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_180px_auto_auto] gap-3 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Condominio</label>
                        <select name="condominio_id" defaultValue={selectedCondominioId} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900">
                            <option value="">Selecione...</option>
                            {condominios.map((cond) => (
                                <option key={cond.id} value={cond.id}>{cond.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Buscar</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input name="q" defaultValue={params.q || ''} placeholder="Unidade, tipo, periodo..." className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Mes (Historico)</label>
                        <input type="month" name="mes" defaultValue={selectedMes} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900" />
                    </div>
                    <FilterApplyButton />
                    <Link href="/admin/leituras" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                        Limpar
                    </Link>
                </div>
            </form>

            {!hasCondominioSelecionado ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
                    Selecione um condominio para ver leituras.
                </div>
            ) : (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Unidades do Condominio</p>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Acao</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unidadesList.map((u) => (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.bloco} - {u.apartamento}</td>
                                        <td className="text-right px-6 py-4">
                                            <Link
                                                href={`/admin/leituras/nova?condominio_id=${selectedCondominioId}&unidade_id=${u.id}`}
                                                className="text-sm font-medium text-vscode-blue hover:text-vscode-blue-dark"
                                            >
                                                Adicionar leitura
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {unidadesList.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-500">
                                            Nenhuma unidade encontrada para este condominio.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Fechamento de Mes</p>
                                <p className="text-sm text-slate-600">Periodo selecionado: <span className="font-medium">{formatMes(selectedMes)}</span></p>
                                <p className={`mt-1 text-xs ${mesFechado ? 'text-green-700' : 'text-amber-700'}`}>
                                    {mesFechado
                                        ? `Publicado em ${fechamento?.fechado_em ? formatData(fechamento.fechado_em.slice(0, 10)) : 'data indisponivel'}`
                                        : 'Mes aberto (morador nao visualiza)'}
                                </p>
                            </div>
                            {mesFechado ? (
                                <form action={reabrirMesLeituras}>
                                    <input type="hidden" name="condominio_id" value={selectedCondominioId} />
                                    <input type="hidden" name="mes_referencia" value={selectedMes} />
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100">
                                        <FaLockOpen className="h-4 w-4" /> Reabrir mes
                                    </button>
                                </form>
                            ) : (
                                <form action={fecharMesLeituras}>
                                    <input type="hidden" name="condominio_id" value={selectedCondominioId} />
                                    <input type="hidden" name="mes_referencia" value={selectedMes} />
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-100">
                                        <FaLock className="h-4 w-4" /> Fechar e publicar mes
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Leituras Recentes</p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                <FaCalendarAlt className="h-3 w-3" /> {formatMes(mesRecente)} ({recentLabel})
                            </span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Periodo</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Unidade</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Tipo</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Medicao</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Valor</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Fotos</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leiturasRecentes.map((l) => {
                                    const fotosCount = l.fotos_leitura?.[0]?.count || 0;
                                    const isAgua = l.tipo === 'agua' || l.tipo === 'agua_fria' || l.tipo === 'agua_quente';
                                    return (
                                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatMes(l.mes_referencia)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{getUnidadeLabel(l)}</td>
                                            <td className="text-center px-4 py-4">
                                                {isAgua ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"><FaTint className="h-3 w-3" /> {formatTipo(l.tipo)}</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"><FaFire className="h-3 w-3" /> {formatTipo(l.tipo)}</span>
                                                )}
                                            </td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900">{Number(l.medicao)} m3</td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900">{formatValor(Number(l.valor))}</td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-700">{fotosCount > 0 ? <span className="inline-flex items-center gap-1 text-green-700"><FaImage className="h-3 w-3" /> {fotosCount}</span> : '-'}</td>
                                            <td className="text-right px-6 py-4">
                                                <Link href={buildDetalheHref(l.id, selectedCondominioId, mesRecente)} className="inline-flex items-center gap-1 text-sm font-medium text-vscode-blue hover:text-vscode-blue-dark">
                                                    <FaEye className="h-3 w-3" /> Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leiturasRecentes.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Nenhuma leitura recente encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Historico por Mes</p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                <FaCalendarAlt className="h-3 w-3" /> {formatMes(selectedMes)}
                            </span>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-white">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Periodo</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Unidade</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Tipo</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Medicao</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Valor</th>
                                    <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Fotos</th>
                                    <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leiturasHistorico.map((l) => {
                                    const fotosCount = l.fotos_leitura?.[0]?.count || 0;
                                    const isAgua = l.tipo === 'agua' || l.tipo === 'agua_fria' || l.tipo === 'agua_quente';
                                    return (
                                        <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatMes(l.mes_referencia)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600">{getUnidadeLabel(l)}</td>
                                            <td className="text-center px-4 py-4">
                                                {isAgua ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"><FaTint className="h-3 w-3" /> {formatTipo(l.tipo)}</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"><FaFire className="h-3 w-3" /> {formatTipo(l.tipo)}</span>
                                                )}
                                            </td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900">{Number(l.medicao)} m3</td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-900">{formatValor(Number(l.valor))}</td>
                                            <td className="text-center px-4 py-4 text-sm text-slate-700">{fotosCount > 0 ? <span className="inline-flex items-center gap-1 text-green-700"><FaImage className="h-3 w-3" /> {fotosCount}</span> : '-'}</td>
                                            <td className="text-right px-6 py-4">
                                                <Link href={buildDetalheHref(l.id, selectedCondominioId, selectedMes)} className="inline-flex items-center gap-1 text-sm font-medium text-vscode-blue hover:text-vscode-blue-dark">
                                                    <FaEye className="h-3 w-3" /> Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leiturasHistorico.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Nenhuma leitura para {formatMes(selectedMes)}.</td>
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
