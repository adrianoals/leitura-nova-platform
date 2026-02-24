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
import { formatMes, formatValor } from '@/lib/morador';

interface ConsumoChartProps {
    leiturasAgua: LeituraMensal[];
    leiturasGas: LeituraMensal[];
    mostrarGas: boolean;
}

export default function ConsumoChart({ leiturasAgua, leiturasGas, mostrarGas }: ConsumoChartProps) {
    const meses = Array.from(
        new Set([...leiturasAgua.map((l) => l.mesReferencia), ...leiturasGas.map((l) => l.mesReferencia)])
    )
        .sort()
        .slice(-6);

    const chartData = meses.map(mes => {
        const aguaMes = leiturasAgua.filter((l) => l.mesReferencia === mes);
        const gasMes = leiturasGas.filter((l) => l.mesReferencia === mes);

        const agua = {
            medicao: aguaMes.reduce((sum, leitura) => sum + Number(leitura.medicao), 0),
            valor: aguaMes.reduce((sum, leitura) => sum + Number(leitura.valor), 0),
        };

        const gas = {
            medicao: gasMes.reduce((sum, leitura) => sum + Number(leitura.medicao), 0),
            valor: gasMes.reduce((sum, leitura) => sum + Number(leitura.valor), 0),
        };

        return {
            mes: formatMes(mes),
            agua: agua.medicao,
            gas: gas.medicao,
            valorAgua: agua.valor,
            valorGas: gas.valor,
        };
    });

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Consumo Mensal</h3>
                    <p className="text-sm text-slate-500">Últimos 6 meses (m³)</p>
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
                                const label = name === 'agua' ? 'Água' : 'Gás';
                                return [`${value} m3`, label];
                            }}
                        />
                        <Legend
                            formatter={(value: string) => (value === 'agua' ? 'Água' : 'Gás')}
                            iconType="circle"
                        />
                        <Bar dataKey="agua" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={mostrarGas ? 20 : 32} />
                        {mostrarGas && (
                            <Bar dataKey="gas" fill="#f97316" radius={[6, 6, 0, 0]} barSize={20} />
                        )}
                        <Line
                            dataKey="agua"
                            stroke="#1d4ed8"
                            strokeWidth={2}
                            dot={{ fill: '#1d4ed8', r: 4 }}
                            type="monotone"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Value summary */}
            <div className={`grid ${mostrarGas ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-4 pt-4 border-t border-slate-100`}>
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div>
                        <p className="text-xs text-slate-500">Total Água (6 meses)</p>
                        <p className="text-sm font-semibold text-slate-900">
                            {formatValor(chartData.reduce((sum, d) => sum + d.valorAgua, 0))}
                        </p>
                    </div>
                </div>
                {mostrarGas && (
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <div>
                            <p className="text-xs text-slate-500">Total Gás (6 meses)</p>
                            <p className="text-sm font-semibold text-slate-900">
                                {formatValor(chartData.reduce((sum, d) => sum + d.valorGas, 0))}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
