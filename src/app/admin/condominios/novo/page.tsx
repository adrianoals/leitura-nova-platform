'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function NovoCondominioPage() {
    const [nome, setNome] = useState('');
    const [temAgua, setTemAgua] = useState(true);
    const [temGas, setTemGas] = useState(false);
    const [envioMorador, setEnvioMorador] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
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
                    <h2 className="text-xl font-bold text-green-900">Condomínio criado!</h2>
                    <Link href="/admin/condominios" className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all">
                        Ver Condomínios
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/condominios" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Novo Condomínio</h1>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome do Condomínio</label>
                    <input id="nome" type="text" value={nome} onChange={e => setNome(e.target.value)} required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        placeholder="Ex: Residencial Jardim das Flores"
                    />
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Configurações</p>
                    {[
                        { label: 'Tem Água', checked: temAgua, onChange: setTemAgua, desc: 'Unidades possuem medição de água' },
                        { label: 'Tem Gás', checked: temGas, onChange: setTemGas, desc: 'Unidades possuem medição de gás' },
                        { label: 'Envio de leitura pelo morador', checked: envioMorador, onChange: setEnvioMorador, desc: 'Morador pode enviar foto + medição' },
                    ].map(item => (
                        <label key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={item.checked} onChange={e => item.onChange(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-vscode-blue focus:ring-vscode-blue/30"
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <button type="submit" disabled={loading}
                    className="w-full rounded-xl bg-vscode-blue py-3.5 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Criando...' : 'Criar Condomínio'}
                </button>
            </form>
        </div>
    );
}
