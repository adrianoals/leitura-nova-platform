'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaClipboardList, FaTint, FaFire, FaSearch, FaPlus, FaImage } from 'react-icons/fa';
import { mockLeiturasAdmin, mockUnidades } from '@/mocks/adminData';
import { formatarData, formatarValor, formatarMes } from '@/mocks/moradorData';

export default function LeiturasAdminPage() {
    const [filtro, setFiltro] = useState('');

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

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Buscar por período..." value={filtro} onChange={e => setFiltro(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Período</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Tipo</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Medição</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Valor</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Fotos</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockLeiturasAdmin.map(l => (
                            <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FaClipboardList className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-900">{formatarMes(l.mesReferencia)}</p>
                                    </div>
                                </td>
                                <td className="text-center px-4 py-4">
                                    {l.tipo === 'agua' ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            <FaTint className="h-3 w-3" /> Água
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                            <FaFire className="h-3 w-3" /> Gás
                                        </span>
                                    )}
                                </td>
                                <td className="text-center px-4 py-4 text-sm text-slate-900 font-medium hidden sm:table-cell">{l.medicao} m³</td>
                                <td className="text-center px-4 py-4 text-sm text-slate-900 hidden md:table-cell">{formatarValor(l.valor)}</td>
                                <td className="text-center px-4 py-4 hidden md:table-cell">
                                    {l.fotos.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                            <FaImage className="h-3 w-3" /> {l.fotos.length}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </td>
                                <td className="text-center px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">{formatarData(l.dataLeitura)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
