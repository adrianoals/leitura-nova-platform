'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaUsers, FaSearch, FaPlus, FaDoorOpen } from 'react-icons/fa';
import { mockMoradores, getUnidadeById } from '@/mocks/adminData';

export default function MoradoresPage() {
    const [filtro, setFiltro] = useState('');

    const moradoresFiltrados = mockMoradores.filter(m =>
        `${m.nome} ${m.identificadorLogin}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moradores</h1>
                    <p className="text-slate-500 text-sm">{mockMoradores.length} moradores cadastrados</p>
                </div>
                <Link href="/admin/moradores/novo"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                >
                    <FaPlus className="h-4 w-4" /> Novo Morador
                </Link>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Buscar morador..." value={filtro} onChange={e => setFiltro(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Morador</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Login</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Unidade</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moradoresFiltrados.map(m => {
                            const unidade = getUnidadeById(m.unidadeId);
                            return (
                                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                                <FaUsers className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">{m.nome}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">{m.identificadorLogin}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                        {unidade ? (
                                            <span className="flex items-center gap-1">
                                                <FaDoorOpen className="h-3 w-3 text-slate-400" />
                                                {unidade.bloco} — {unidade.apartamento}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="text-right px-6 py-4">
                                        <Link href={`/admin/moradores/${m.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                            Editar
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
