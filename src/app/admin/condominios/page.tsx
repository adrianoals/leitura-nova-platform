'use client';

import Link from 'next/link';
import { FaPlus, FaBuilding, FaSearch, FaTint, FaFire, FaCamera } from 'react-icons/fa';
import { mockCondominios } from '@/mocks/adminData';

export default function CondominiosPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Condomínios</h1>
                    <p className="text-slate-500 text-sm">{mockCondominios.length} condomínios cadastrados</p>
                </div>
                <Link
                    href="/admin/condominios/novo"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                >
                    <FaPlus className="h-4 w-4" />
                    Novo Condomínio
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar condomínio..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {mockCondominios.map(cond => (
                    <Link
                        key={cond.id}
                        href={`/admin/condominios/${cond.id}`}
                        className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-vscode-blue/30 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-vscode-blue group-hover:text-white transition-colors">
                                    <FaBuilding className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{cond.nome}</p>
                                    <p className="text-xs text-slate-500">{cond.totalUnidades} unidades • {cond.totalMoradores} moradores</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {cond.temAgua && (
                                    <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        <FaTint className="h-3 w-3" /> Água
                                    </span>
                                )}
                                {cond.temGas && (
                                    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
                                        <FaFire className="h-3 w-3" /> Gás
                                    </span>
                                )}
                                {cond.envioLeituraMoradorHabilitado && (
                                    <span className="hidden sm:flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                        <FaCamera className="h-3 w-3" /> Envio
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
