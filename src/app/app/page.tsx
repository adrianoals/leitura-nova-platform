'use client';

import Link from 'next/link';
import { FaHistory, FaCamera } from 'react-icons/fa';
import DashboardCard from '@/components/morador/DashboardCard';
import ConsumoChart from '@/components/morador/ConsumoChart';
import {
    mockMorador,
    getMesAtual,
    getLeiturasMes,
    getLeiturasAgua,
    getLeiturasGas,
} from '@/mocks/moradorData';

export default function AppDashboard() {
    const mesAtual = getMesAtual();
    const leiturasMes = getLeiturasMes(mesAtual);
    const leituraAgua = leiturasMes.find(l => l.tipo === 'agua');
    const leituraGas = leiturasMes.find(l => l.tipo === 'gas');
    const { unidade } = mockMorador;
    const { condominio } = unidade;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Resumo da sua unidade — {unidade.bloco} • {unidade.apartamento}
                </p>
            </div>

            {/* Reading cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {condominio.temAgua && (
                    <DashboardCard tipo="agua" leitura={leituraAgua} />
                )}
                {condominio.temGas && (
                    <DashboardCard tipo="gas" leitura={leituraGas} />
                )}
            </div>

            {/* Consumption chart */}
            <ConsumoChart
                leiturasAgua={getLeiturasAgua()}
                leiturasGas={getLeiturasGas()}
                mostrarGas={condominio.temGas}
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
                <Link
                    href="/app/leituras"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                    <FaHistory className="h-4 w-4" />
                    Ver últimos 12 meses
                </Link>

                {condominio.envioLeituraMoradorHabilitado && (
                    <Link
                        href="/app/enviar-leitura"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-vscode-blue px-5 py-3 text-sm font-semibold text-vscode-blue hover:bg-vscode-blue/5 transition-all duration-200"
                    >
                        <FaCamera className="h-4 w-4" />
                        Enviar leitura
                    </Link>
                )}
            </div>
        </div>
    );
}
