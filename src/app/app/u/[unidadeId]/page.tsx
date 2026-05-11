import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaCamera, FaHistory } from 'react-icons/fa';
import DashboardCard from '@/components/morador/DashboardCard';
import ConsumoChart from '@/components/morador/ConsumoChart';
import { createClient } from '@/lib/supabase/server';
import { resolveUnidadeContextById } from '@/lib/adminPreview';
import {
    formatMes,
    formatUnidade,
    getMesAtual,
    getMesLimite12Meses,
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
    consumo: number | null;
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
        consumo: leitura.consumo === null || leitura.consumo === undefined ? null : Number(leitura.consumo),
        valor: Number(leitura.valor),
        fotos: [],
        criadoPorMorador: leitura.criado_por_morador,
    };
}

function getLeituraMesAtual(leituras: LeituraMensal[], tipo: TipoLeitura, mesAtual: string) {
    return leituras.find((leitura) => leitura.tipo === tipo && leitura.mesReferencia === mesAtual);
}

interface PageProps {
    params: Promise<{ unidadeId: string }>;
}

export default async function AppDashboard({ params }: PageProps) {
    const { unidadeId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vinculo = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);
    if (!vinculo) return null;

    const mesAtual = getMesAtual();
    const mesLimite = getMesLimite12Meses();
    const tiposPermitidos = getTiposPermitidos({
        temAgua: vinculo.condominio.temAgua,
        temAguaQuente: vinculo.condominio.temAguaQuente,
        temGas: vinculo.condominio.temGas,
    } as never);

    const [{ data: leiturasRaw }, { data: fechamento }] = await Promise.all([
        supabase
            .from('leituras_mensais')
            .select('id, tipo, mes_referencia, data_leitura, medicao, consumo, valor, criado_por_morador')
            .eq('unidade_id', vinculo.unidadeId)
            .gte('mes_referencia', mesLimite)
            .order('mes_referencia', { ascending: false })
            .order('data_leitura', { ascending: false })
            .limit(120),
        supabase
            .from('fechamentos_mensais')
            .select('fechado')
            .eq('condominio_id', vinculo.condominio.id)
            .eq('mes_referencia', mesAtual)
            .maybeSingle(),
    ]);

    const leituras = ((leiturasRaw || []) as unknown as LeituraRaw[]).map(normalizeLeitura);
    const mesFechado = fechamento?.fechado === true;
    const podeEnviarLeitura = vinculo.condominio.envioLeituraMoradorHabilitado && !mesFechado;

    const leituraAgua = getLeituraMesAtual(leituras, 'agua', mesAtual);
    const leituraAguaFria = getLeituraMesAtual(leituras, 'agua_fria', mesAtual);
    const leituraAguaQuente = getLeituraMesAtual(leituras, 'agua_quente', mesAtual);
    const leituraGas = getLeituraMesAtual(leituras, 'gas', mesAtual);

    const leiturasMesAtual = leituras.filter((l) => l.mesReferencia === mesAtual);
    const hasLeituraMesAtual = leiturasMesAtual.length > 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Resumo da sua unidade - {formatUnidade(vinculo.unidade.bloco, vinculo.unidade.apartamento)}
                </p>
                <div className="text-sm text-slate-400 mt-1">
                    Condominio {vinculo.condominio.nome}
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
                        consumoDelta={leituraAgua?.consumo}
                    />
                )}
                {tiposPermitidos.includes('agua_fria') && (
                    <DashboardCard
                        tipo="agua_fria"
                        leitura={leituraAguaFria}
                        consumoDelta={leituraAguaFria?.consumo}
                    />
                )}
                {tiposPermitidos.includes('agua_quente') && (
                    <DashboardCard
                        tipo="agua_quente"
                        leitura={leituraAguaQuente}
                        consumoDelta={leituraAguaQuente?.consumo}
                    />
                )}
                {tiposPermitidos.includes('gas') && (
                    <DashboardCard
                        tipo="gas"
                        leitura={leituraGas}
                        consumoDelta={leituraGas?.consumo}
                    />
                )}
            </div>

            <div className="flex flex-wrap gap-4">
                <Link
                    href={`/app/u/${vinculo.unidadeId}/leituras`}
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                >
                    <FaHistory className="h-4 w-4" />
                    Ver historico
                </Link>

                {podeEnviarLeitura && (
                    <Link
                        href={`/app/u/${vinculo.unidadeId}/enviar-leitura`}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-vscode-blue px-5 py-3 text-sm font-semibold text-vscode-blue hover:bg-vscode-blue/5 transition-all"
                    >
                        <FaCamera className="h-4 w-4" />
                        Enviar leitura
                    </Link>
                )}
            </div>

            <ConsumoChart
                leituras={leituras}
                tiposPermitidos={tiposPermitidos}
            />
        </div>
    );
}
