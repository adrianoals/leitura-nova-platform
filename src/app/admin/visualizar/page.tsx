'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaBuilding, FaDoorOpen, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { mockCondominios, mockUnidades } from '@/mocks/adminData';

export default function VisualizarComoPage() {
    const [condominioId, setCondominioId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');

    const unidadesFiltradas = condominioId
        ? mockUnidades.filter(u => u.condominio.id === condominioId)
        : [];

    const unidadeSelecionada = mockUnidades.find(u => u.id === unidadeId);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Visualizar como Morador</h1>
                <p className="text-slate-500 text-sm">Veja o portal como um morador específico veria</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                {/* Condomínio */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        <FaBuilding className="inline h-4 w-4 mr-1.5 text-slate-400" />
                        Condomínio
                    </label>
                    <select value={condominioId} onChange={e => { setCondominioId(e.target.value); setUnidadeId(''); }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                    >
                        <option value="">Selecione o condomínio...</option>
                        {mockCondominios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>

                {/* Unidade */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        <FaDoorOpen className="inline h-4 w-4 mr-1.5 text-slate-400" />
                        Unidade
                    </label>
                    <select value={unidadeId} onChange={e => setUnidadeId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        disabled={!condominioId}
                    >
                        <option value="">Selecione a unidade...</option>
                        {unidadesFiltradas.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.bloco} — {u.apartamento}{u.moradores.length > 0 ? ` (${u.moradores[0].nome})` : ' (vazio)'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Preview info */}
                {unidadeSelecionada && (
                    <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                            <FaEye className="h-4 w-4" /> Pré-visualização
                        </div>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <p><strong>Condomínio:</strong> {unidadeSelecionada.condominio.nome}</p>
                            <p><strong>Unidade:</strong> {unidadeSelecionada.bloco} — {unidadeSelecionada.apartamento}</p>
                            <p><strong>Morador:</strong> {unidadeSelecionada.moradores.length > 0 ? unidadeSelecionada.moradores[0].nome : 'Sem morador'}</p>
                        </div>
                    </div>
                )}

                {/* Action */}
                <Link
                    href={unidadeId ? '/app' : '#'}
                    className={`w-full rounded-xl py-3.5 font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${unidadeId
                            ? 'bg-yellow-500 text-slate-900 shadow-yellow-500/25 hover:bg-yellow-400 hover:scale-[1.02]'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    onClick={e => { if (!unidadeId) e.preventDefault(); }}
                >
                    <FaExternalLinkAlt className="h-4 w-4" />
                    Abrir como Morador
                </Link>

                <p className="text-xs text-slate-400 text-center">
                    Ao clicar, você será redirecionado ao portal do morador com os dados da unidade selecionada. (Simulado - na integração real usará impersonation do Supabase)
                </p>
            </div>
        </div>
    );
}
