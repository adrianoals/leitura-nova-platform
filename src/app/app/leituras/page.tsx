'use client';

import Link from 'next/link';
import { FaTint, FaFire, FaCalendarAlt, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import {
    mockMorador,
    getMesesUnicos,
    getLeiturasMes,
    formatarMes,
    formatarData,
    formatarValor,
} from '@/mocks/moradorData';

export default function LeiturasPage() {
    const meses = getMesesUnicos();
    const unidade = mockMorador.unidade;
    const condominio = unidade?.condominio;

    if (!unidade || !condominio) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Dados da unidade indisponíveis.</p>
                    <Link href="/app" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/app"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Histórico de Leituras</h1>
                    <p className="text-slate-500 text-sm">Últimos 12 meses</p>
                </div>
            </div>

            {/* Month list */}
            <div className="space-y-3">
                {meses.map(mes => {
                    const leituras = getLeiturasMes(mes);
                    const agua = leituras.find(l => l.tipo === 'agua');
                    const gas = leituras.find(l => l.tipo === 'gas');

                    return (
                        <Link
                            key={mes}
                            href={`/app/leituras/${mes}`}
                            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-vscode-blue/30 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-vscode-blue/10 transition-colors">
                                        <FaCalendarAlt className="h-5 w-5 text-slate-500 group-hover:text-vscode-blue transition-colors" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{formatarMes(mes)}</p>
                                        {agua && (
                                            <p className="text-xs text-slate-500">Leitura em {formatarData(agua.dataLeitura)}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Water */}
                                    {condominio.temAgua && agua && (
                                        <div className="hidden sm:flex items-center gap-2 text-sm">
                                            <FaTint className="h-4 w-4 text-blue-500" />
                                            <span className="text-slate-600">{agua.medicao} m³</span>
                                            <span className="font-semibold text-slate-900">{formatarValor(agua.valor)}</span>
                                        </div>
                                    )}

                                    {/* Gas */}
                                    {condominio.temGas && gas && (
                                        <div className="hidden sm:flex items-center gap-2 text-sm">
                                            <FaFire className="h-4 w-4 text-orange-500" />
                                            <span className="text-slate-600">{gas.medicao} m³</span>
                                            <span className="font-semibold text-slate-900">{formatarValor(gas.valor)}</span>
                                        </div>
                                    )}

                                    <FaChevronRight className="h-4 w-4 text-slate-400 group-hover:text-vscode-blue transition-colors" />
                                </div>
                            </div>

                            {/* Mobile values */}
                            <div className="flex gap-6 mt-3 sm:hidden">
                                {condominio.temAgua && agua && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaTint className="h-4 w-4 text-blue-500" />
                                        <span>{agua.medicao} m³ — {formatarValor(agua.valor)}</span>
                                    </div>
                                )}
                                {condominio.temGas && gas && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FaFire className="h-4 w-4 text-orange-500" />
                                        <span>{gas.medicao} m³ — {formatarValor(gas.valor)}</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
