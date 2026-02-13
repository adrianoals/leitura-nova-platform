import Link from 'next/link';
import { FaClipboardList, FaTint, FaFire, FaSearch, FaPlus, FaImage } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';

type SearchParams = Promise<{
    q?: string;
    created?: string;
}>;

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
    const created = params.created === '1';

    const supabase = await createClient();
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
        .order('data_leitura', { ascending: false })
        .limit(200);

    const leiturasBase = (leiturasRaw || []) as unknown as LeituraRow[];

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

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leituras Mensais</h1>
                    <p className="text-slate-500 text-sm">Gerenciar leituras de todas as unidades</p>
                </div>
                <Link href="/admin/leituras/nova"
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

            <form className="relative" method="GET">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    name="q"
                    defaultValue={params.q || ''}
                    placeholder="Buscar por condomínio, unidade, tipo ou período..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
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
                        {leituras.map(l => {
                            const unidade = getUnidade(l);
                            const condominioNome = getCondominioNome(unidade?.condominio || null);
                            const unidadeLabel = `${unidade?.bloco || ''} — ${unidade?.apartamento || ''}`;
                            const isAgua = l.tipo === 'agua' || l.tipo === 'agua_fria' || l.tipo === 'agua_quente';
                            const fotosCount = l.fotos_leitura?.[0]?.count || 0;
                            const consumo = consumoByLeituraId.get(l.id) ?? null;

                            return (
                            <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FaClipboardList className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{formatarMes(l.mes_referencia)}</p>
                                            <p className="text-xs text-slate-500">{condominioNome}</p>
                                        </div>
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
                                    {consumo === null ? (
                                        <span className="text-slate-400">—</span>
                                    ) : (
                                        `${consumo.toFixed(2)} m³`
                                    )}
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
                                    Nenhuma leitura encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
