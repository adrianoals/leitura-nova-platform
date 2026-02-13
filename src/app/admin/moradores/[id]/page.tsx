'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';
import { getMoradorById, getUnidadeById } from '@/mocks/adminData';

export default function MoradorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const morador = getMoradorById(id);
    const unidade = morador ? getUnidadeById(morador.unidadeId) : null;
    const [nome, setNome] = useState(morador?.nome ?? '');
    const [login, setLogin] = useState(morador?.identificadorLogin ?? '');
    const [saved, setSaved] = useState(false);

    if (!morador) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Morador não encontrado.</p>
                    <Link href="/admin/moradores" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/moradores" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Morador</h1>
                    {unidade && <p className="text-sm text-slate-500">{unidade.condominio.nome} — {unidade.bloco} — {unidade.apartamento}</p>}
                </div>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    ✅ Salvo com sucesso!
                </div>
            )}

            <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nome</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        placeholder="Nome do morador"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Login (email)</label>
                    <input type="email" value={login} onChange={e => setLogin(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        placeholder="email@exemplo.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Unidade Vinculada</label>
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 text-sm text-slate-600">
                        {unidade ? `${unidade.condominio.nome} — ${unidade.bloco} — ${unidade.apartamento}` : 'Sem unidade'}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit"
                        className="flex-1 rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <FaSave className="h-4 w-4" /> Salvar
                    </button>
                    <button type="button"
                        className="rounded-xl border-2 border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                        onClick={() => alert('Excluir simulado')}
                    >
                        <FaTrash className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
