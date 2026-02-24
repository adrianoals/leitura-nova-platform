'use client';

import {
    ResponsiveContainer,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Line,
    ComposedChart,
} from 'recharts';
import { LeituraMensal } from '@/types';
import { formatMes, formatTipo, formatValor, type TipoLeitura } from '@/lib/morador';

const TIPO_CONFIG: Record<TipoLeitura, { cor: string; corLinha: string }> = {
    agua: { cor: '#3b82f6', corLinha: '#1d4ed8' },
    agua_fria: { cor: '#06b6d4', corLinha: '#0891b2' },
    agua_quente: { cor: '#f43f5e', corLinha: '#be123c' },
    gas: { cor: '#f97316', corLinha: '#c2410c' },
};

interface ConsumoChartProps {
    leituras: LeituraMensal[];
    tiposPermitidos: TipoLeitura[];
}

export default function ConsumoChart({ leituras, tiposPermitidos }: ConsumoChartProps) {
    const meses = Array.from(
        new Set(leituras.map((l) => l.mesReferencia))
    )
        .sort()
        .slice(-6);

    // Track previous medicao per tipo for delta calculation
    const prevMedicao: Record<string, number | null> = {};
    for (const tipo of tiposPermitidos) {
        prevMedicao[tipo] = null;
    }

    const chartData = meses.map((mes) => {
        const row: Record<string, string | number | null> = { mes: formatMes(mes) };

        for (const tipo of tiposPermitidos) {
            const leiturasMes = leituras.filter((l) => l.mesReferencia === mes && l.tipo === tipo);
            const medicao = leiturasMes.reduce((sum, l) => sum + Number(l.medicao), 0);
            const valor = leiturasMes.reduce((sum, l) => sum + Number(l.valor), 0);
            const consumo = prevMedicao[tipo] === null ? null : medicao - prevMedicao[tipo]!;

            row[`medicao_${tipo}`] = medicao;
            row[`consumo_${tipo}`] = consumo;
            row[`valor_${tipo}`] = valor;

            prevMedicao[tipo] = medicao;
        }

        return row;
    });

    const barSize = tiposPermitidos.length === 1 ? 32 : tiposPermitidos.length === 2 ? 24 : 16;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Medicao e Consumo</h3>
                    <p className="text-sm text-slate-500">Barras: medicao | Linhas: consumo (delta)</p>
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any, name: any) => {
                                const [metrica, ...tipoParts] = name.split('_');
                                const tipo = tipoParts.join('_') as TipoLeitura;
                                const tipoLabel = formatTipo(tipo);
                                const metricaLabel = metrica === 'medicao' ? 'Medicao' : 'Consumo';
                                const display = value === null || value === undefined ? '-' : `${value} m3`;
                                return [display, `${metricaLabel} ${tipoLabel}`];
                            }}
                        />
                        <Legend
                            formatter={(value: string) => {
                                const [metrica, ...tipoParts] = value.split('_');
                                const tipo = tipoParts.join('_') as TipoLeitura;
                                const tipoLabel = formatTipo(tipo);
                                const metricaLabel = metrica === 'medicao' ? 'Medicao' : 'Consumo';
                                return `${metricaLabel} ${tipoLabel}`;
                            }}
                            iconType="circle"
                        />
                        {tiposPermitidos.map((tipo) => (
                            <Bar
                                key={`medicao_${tipo}`}
                                dataKey={`medicao_${tipo}`}
                                fill={TIPO_CONFIG[tipo].cor}
                                radius={[6, 6, 0, 0]}
                                barSize={barSize}
                            />
                        ))}
                        {tiposPermitidos.map((tipo) => (
                            <Line
                                key={`consumo_${tipo}`}
                                dataKey={`consumo_${tipo}`}
                                stroke={TIPO_CONFIG[tipo].corLinha}
                                strokeWidth={2}
                                dot={{ fill: TIPO_CONFIG[tipo].corLinha, r: 4 }}
                                type="monotone"
                            />
                        ))}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Value summary */}
            <div className={`grid grid-cols-${tiposPermitidos.length} gap-4 mt-4 pt-4 border-t border-slate-100`}>
                {tiposPermitidos.map((tipo) => (
                    <div key={tipo} className="flex items-center gap-3">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: TIPO_CONFIG[tipo].cor }}
                        />
                        <div>
                            <p className="text-xs text-slate-500">Total {formatTipo(tipo)} (6 meses)</p>
                            <p className="text-sm font-semibold text-slate-900">
                                {formatValor(
                                    chartData.reduce((sum, d) => sum + Number(d[`valor_${tipo}`] || 0), 0)
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
