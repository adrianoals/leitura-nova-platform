'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTint, FaFire, FaCloudUploadAlt, FaCheck, FaCamera, FaTrash } from 'react-icons/fa';
import { mockCondominios, mockUnidades } from '@/mocks/adminData';

export default function NovaLeituraPage() {
    const [condominioId, setCondominioId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');
    const [tipo, setTipo] = useState<'agua' | 'gas'>('agua');
    const [mesRef, setMesRef] = useState('2026-02');
    const [dataLeitura, setDataLeitura] = useState('');
    const [medicao, setMedicao] = useState('');
    const [valor, setValor] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const unidadesFiltradas = condominioId
        ? mockUnidades.filter(u => u.condominio.id === condominioId)
        : [];

    const condSelecionado = mockCondominios.find(c => c.id === condominioId);

    const handleFotoUpload = () => {
        setFotos(prev => [...prev, `foto_${prev.length + 1}.jpg`]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setSucesso(true);
    };

    if (sucesso) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <FaCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-900">Leitura inserida!</h2>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setSucesso(false); setMedicao(''); setValor(''); setFotos([]); }}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                        >
                            Inserir outra
                        </button>
                        <Link href="/admin/leituras" className="rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all">
                            Ver Leituras
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/leituras" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nova Leitura</h1>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                {/* Condomínio */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                    <select value={condominioId} onChange={e => { setCondominioId(e.target.value); setUnidadeId(''); }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        required
                    >
                        <option value="">Selecione...</option>
                        {mockCondominios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>

                {/* Unidade */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Unidade</label>
                    <select value={unidadeId} onChange={e => setUnidadeId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        required disabled={!condominioId}
                    >
                        <option value="">Selecione...</option>
                        {unidadesFiltradas.map(u => <option key={u.id} value={u.id}>{u.bloco} — {u.apartamento}</option>)}
                    </select>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Tipo</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(!condSelecionado || condSelecionado.temAgua) && (
                            <button type="button" onClick={() => setTipo('agua')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${tipo === 'agua' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                <FaTint className="h-4 w-4" /> Água
                            </button>
                        )}
                        {(!condSelecionado || condSelecionado.temGas) && (
                            <button type="button" onClick={() => setTipo('gas')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${tipo === 'gas' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                <FaFire className="h-4 w-4" /> Gás
                            </button>
                        )}
                    </div>
                </div>

                {/* Mês + Data */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Mês Referência</label>
                        <input type="month" value={mesRef} onChange={e => setMesRef(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Data Leitura</label>
                        <input type="date" value={dataLeitura} onChange={e => setDataLeitura(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Medição + Valor */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Medição (m³)</label>
                        <input type="number" step="0.01" value={medicao} onChange={e => setMedicao(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="0.00" required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Valor (R$)</label>
                        <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="0.00" required
                        />
                    </div>
                </div>

                {/* Fotos */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Fotos (opcional)</label>
                    <button type="button" onClick={handleFotoUpload}
                        className="w-full rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-vscode-blue hover:bg-vscode-blue/5 transition-all group"
                    >
                        <FaCloudUploadAlt className="h-8 w-8 text-slate-400 group-hover:text-vscode-blue mx-auto mb-2 transition-colors" />
                        <p className="text-sm text-slate-500 group-hover:text-vscode-blue transition-colors">Clique para adicionar fotos</p>
                    </button>
                    {fotos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {fotos.map((f, i) => (
                                <div key={i} className="relative flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                                    <FaCamera className="h-3 w-3" /> {f}
                                    <button type="button" onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                                        <FaTrash className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={loading}
                    className="w-full rounded-xl bg-vscode-blue py-3.5 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Salvando...' : 'Inserir Leitura'}
                </button>
            </form>
        </div>
    );
}
