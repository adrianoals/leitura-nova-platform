import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaCamera, FaHistory } from 'react-icons/fa';
import DashboardCard from '@/components/morador/DashboardCard';
import ConsumoChart from '@/components/morador/ConsumoChart';
import { createClient } from '@/lib/supabase/server';
import {
    buildConsumoDeltaMap,
    formatMes,
    formatUnidade,
    getConsumoDeltaKey,
    getMesAtual,
    getMesLimite12Meses,
    getMoradorContextByAuthUserId,
    getTiposPermitidos,
    type TipoLeitura,
} from '@/lib/morador';
import { LeituraMensal } from '@/types';

type LeituraRaw = {
    id: string;
    tipo: TipoLeitura;
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    criado_por_morador: boolean;
};

function normalizeLeitura(leitura: LeituraRaw): LeituraMensal {
    return {
        id: leitura.id,
        tipo: leitura.tipo,
        mesReferencia: leitura.mes_referencia,
        dataLeitura: leitura.data_leitura,
        medicao: Number(leitura.medicao),
        valor: Number(leitura.valor),
        fotos: [],
        criadoPorMorador: leitura.criado_por_morador,
    };
}

function getLeituraMesAtual(leituras: LeituraMensal[], tipo: TipoLeitura, mesAtual: string) {
    return leituras.find((leitura) => leitura.tipo === tipo && leitura.mesReferencia === mesAtual);
}

export default async function AppDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const context = await getMoradorContextByAuthUserId(supabase as never, user.id);
    if (!context) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Conta criada</h1>
                <p className="text-slate-600 max-w-md">
                    Seu usuario ainda nao esta vinculado a nenhuma unidade.
                    Entre em contato com a administracao para liberar seu acesso.
                </p>
                <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                    Seu ID de usuario:
                    <code className="font-mono font-bold mt-1 block">{user.id}</code>
                </div>
            </div>
        );
    }

    const mesAtual = getMesAtual();
    const mesLimite = getMesLimite12Meses();
    const tiposPermitidos = getTiposPermitidos(context);

    const [{ data: leiturasRaw }, { data: fechamento }] = await Promise.all([
        supabase
            .from('leituras_mensais')
            .select('id, tipo, mes_referencia, data_leitura, medicao, valor, criado_por_morador')
            .eq('unidade_id', context.unidadeId)
            .gte('mes_referencia', mesLimite)
            .order('mes_referencia', { ascending: false })
            .order('data_leitura', { ascending: false })
            .limit(120),
        supabase
            .from('fechamentos_mensais')
            .select('fechado')
            .eq('condominio_id', context.condominioId)
            .eq('mes_referencia', mesAtual)
            .maybeSingle(),
    ]);

    const leituras = ((leiturasRaw || []) as unknown as LeituraRaw[]).map(normalizeLeitura);
    const consumoDeltaMap = buildConsumoDeltaMap(
        leituras.map((leitura) => ({
            tipo: leitura.tipo,
            mesReferencia: leitura.mesReferencia,
            medicao: Number(leitura.medicao),
        }))
    );
    const mesFechado = fechamento?.fechado === true;
    const podeEnviarLeitura = context.envioLeituraMoradorHabilitado && !mesFechado;

    const leituraAgua = getLeituraMesAtual(leituras, 'agua', mesAtual);
    const leituraAguaFria = getLeituraMesAtual(leituras, 'agua_fria', mesAtual);
    const leituraAguaQuente = getLeituraMesAtual(leituras, 'agua_quente', mesAtual);
    const leituraGas = getLeituraMesAtual(leituras, 'gas', mesAtual);

    const leiturasMesAtual = leituras.filter((l) => l.mesReferencia === mesAtual);
    const hasLeituraMesAtual = leiturasMesAtual.length > 0;

    const leiturasAguaChart = leituras.filter((l) => l.tipo === 'agua' || l.tipo === 'agua_fria' || l.tipo === 'agua_quente');
    const leiturasGasChart = leituras.filter((l) => l.tipo === 'gas');

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Resumo da sua unidade - {formatUnidade(context.bloco, context.apartamento)}
                </p>
                <div className="text-sm text-slate-400 mt-1">
                    Condominio {context.condominioNome}
                </div>
            </div>

            {!hasLeituraMesAtual && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Leituras de {formatMes(mesAtual)} ainda nao foram atualizadas.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiposPermitidos.includes('agua') && (
                    <DashboardCard
                        tipo="agua"
                        leitura={leituraAgua}
                        consumoDelta={leituraAgua ? consumoDeltaMap.get(getConsumoDeltaKey('agua', leituraAgua.mesReferencia)) : null}
                    />
                )}
                {tiposPermitidos.includes('agua_fria') && (
                    <DashboardCard
                        tipo="agua_fria"
                        leitura={leituraAguaFria}
                        consumoDelta={leituraAguaFria ? consumoDeltaMap.get(getConsumoDeltaKey('agua_fria', leituraAguaFria.mesReferencia)) : null}
                    />
                )}
                {tiposPermitidos.includes('agua_quente') && (
                    <DashboardCard
                        tipo="agua_quente"
                        leitura={leituraAguaQuente}
                        consumoDelta={leituraAguaQuente ? consumoDeltaMap.get(getConsumoDeltaKey('agua_quente', leituraAguaQuente.mesReferencia)) : null}
                    />
                )}
                {tiposPermitidos.includes('gas') && (
                    <DashboardCard
                        tipo="gas"
                        leitura={leituraGas}
                        consumoDelta={leituraGas ? consumoDeltaMap.get(getConsumoDeltaKey('gas', leituraGas.mesReferencia)) : null}
                    />
                )}
            </div>

            <div className="flex flex-wrap gap-4">
                <Link
                    href="/app/leituras"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                >
                    <FaHistory className="h-4 w-4" />
                    Ver historico
                </Link>

                {podeEnviarLeitura && (
                    <Link
                        href="/app/enviar-leitura"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-vscode-blue px-5 py-3 text-sm font-semibold text-vscode-blue hover:bg-vscode-blue/5 transition-all"
                    >
                        <FaCamera className="h-4 w-4" />
                        Enviar leitura
                    </Link>
                )}
            </div>

            <ConsumoChart
                leiturasAgua={leiturasAguaChart}
                leiturasGas={leiturasGasChart}
                mostrarGas={tiposPermitidos.includes('gas')}
            />
        </div>
    );
}
