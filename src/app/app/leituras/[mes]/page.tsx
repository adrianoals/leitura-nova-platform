'use client';

import { use } from 'react';
import Link from 'next/link';
import { FaTint, FaFire, FaCalendarAlt, FaTachometerAlt, FaArrowLeft, FaImage } from 'react-icons/fa';
import {
    mockMorador,
    getLeiturasMes,
    formatarMes,
    formatarData,
    formatarValor,
} from '@/mocks/moradorData';

export default function LeituraMesPage({ params }: { params: Promise<{ mes: string }> }) {
    const { mes } = use(params);
    const leituras = getLeiturasMes(mes);
    const unidade = mockMorador.unidade;

    if (!unidade) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Dados da unidade indisponíveis.</p>
                    <Link href="/app" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    if (leituras.length === 0) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/app/leituras"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{formatarMes(mes)}</h1>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Nenhuma leitura encontrada para este mês.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/app/leituras"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{formatarMes(mes)}</h1>
                    <p className="text-slate-500 text-sm">{unidade.bloco} • {unidade.apartamento}</p>
                </div>
            </div>

            {/* Reading cards */}
            {leituras.map(leitura => {
                const isAgua = leitura.tipo === 'agua';
                const Icon = isAgua ? FaTint : FaFire;
                const label = isAgua ? 'Água' : 'Gás';
                const iconBg = isAgua ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600';
                const accent = isAgua ? 'border-blue-200' : 'border-orange-200';

                return (
                    <div key={leitura.id} className={`rounded-2xl border-2 ${accent} bg-white p-6 shadow-sm`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{label}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <FaCalendarAlt className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500">Data da Leitura</p>
                                    <p className="text-base font-semibold text-slate-900">{formatarData(leitura.dataLeitura)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FaTachometerAlt className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-500">Medição</p>
                                    <p className="text-base font-semibold text-slate-900">{leitura.medicao} m³</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Valor</p>
                                <p className="text-2xl font-bold text-slate-900">{formatarValor(leitura.valor)}</p>
                            </div>
                        </div>

                        {/* Photos */}
                        {leitura.fotos.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaImage className="h-4 w-4 text-slate-400" />
                                    <p className="text-sm font-medium text-slate-700">Fotos da Leitura</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {leitura.fotos.map((foto, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"
                                        >
                                            <FaImage className="h-8 w-8" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Back button */}
            <Link
                href="/app/leituras"
                className="inline-flex items-center gap-2 text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium transition-colors"
            >
                <FaArrowLeft className="h-3 w-3" />
                Voltar ao histórico
            </Link>
        </div>
    );
}
