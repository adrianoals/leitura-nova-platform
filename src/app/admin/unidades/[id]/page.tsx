'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaBuilding, FaUserPlus, FaTrash, FaSave } from 'react-icons/fa';
import { getUnidadeById } from '@/mocks/adminData';

export default function UnidadeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const unidade = getUnidadeById(id);
    const [bloco, setBloco] = useState(unidade?.bloco ?? '');
    const [apto, setApto] = useState(unidade?.apartamento ?? '');
    const [saved, setSaved] = useState(false);

    if (!unidade) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Unidade não encontrada.</p>
                    <Link href="/admin/unidades" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/unidades" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Unidade</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-1"><FaBuilding className="h-3 w-3" /> {unidade.condominio.nome}</p>
                </div>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    ✅ Salvo com sucesso!
                </div>
            )}

            <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Bloco</label>
                    <input type="text" value={bloco} onChange={e => setBloco(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Apartamento</label>
                    <input type="text" value={apto} onChange={e => setApto(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                    />
                </div>

                {/* Moradores */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">Moradores</p>
                        <button type="button" className="text-xs text-vscode-blue flex items-center gap-1 hover:text-vscode-blue-dark">
                            <FaUserPlus className="h-3 w-3" /> Vincular
                        </button>
                    </div>
                    {unidade.moradores.length === 0 && (
                        <p className="text-sm text-slate-400 italic">Nenhum morador vinculado</p>
                    )}
                    {unidade.moradores.map(m => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{m.nome}</p>
                                <p className="text-xs text-slate-500">{m.identificadorLogin}</p>
                            </div>
                            <button type="button" className="text-slate-400 hover:text-red-500 transition-colors">
                                <FaTrash className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <FaSave className="h-4 w-4" /> Salvar
                </button>
            </form>
        </div>
    );
}
