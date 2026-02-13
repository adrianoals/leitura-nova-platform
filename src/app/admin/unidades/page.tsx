'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaDoorOpen, FaSearch, FaBuilding } from 'react-icons/fa';
import { mockUnidades } from '@/mocks/adminData';

export default function UnidadesPage() {
    const [filtro, setFiltro] = useState('');

    const unidadesFiltradas = mockUnidades.filter(u =>
        `${u.bloco} ${u.apartamento} ${u.condominio.nome}`.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Unidades</h1>
                <p className="text-slate-500 text-sm">{mockUnidades.length} unidades cadastradas</p>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Buscar unidade..." value={filtro} onChange={e => setFiltro(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Unidade</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Condomínio</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Morador</th>
                            <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unidadesFiltradas.map(u => (
                            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <FaDoorOpen className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-900">{u.bloco} — {u.apartamento}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                    <div className="flex items-center gap-2">
                                        <FaBuilding className="h-3 w-3 text-slate-400" />
                                        {u.condominio.nome}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                    {u.moradores.length > 0 ? u.moradores[0].nome : <span className="italic text-slate-400">—</span>}
                                </td>
                                <td className="text-center px-4 py-4">
                                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${u.moradores.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {u.moradores.length > 0 ? 'Ativo' : 'Vazio'}
                                    </span>
                                </td>
                                <td className="text-right px-6 py-4">
                                    <Link href={`/admin/unidades/${u.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                        Editar
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
