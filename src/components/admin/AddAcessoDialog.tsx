'use client';

import { useState } from 'react';
import { FaPlus, FaTimes, FaUserPlus } from 'react-icons/fa';
import { createAcesso } from '@/actions/acessoActions';

interface Props {
    unidadeId: string;
}

export default function AddAcessoDialog({ unidadeId }: Props) {
    const [open, setOpen] = useState(false);
    const [modo, setModo] = useState<'novo_usuario' | 'usuario_existente'>('novo_usuario');

    const inputClass =
        'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all';

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
            >
                <FaPlus className="h-3 w-3" /> Adicionar usuário
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vscode-blue/10 text-vscode-blue">
                                    <FaUserPlus className="h-4 w-4" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">Adicionar usuário</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                aria-label="Fechar"
                            >
                                <FaTimes className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Tipo de cadastro</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModo('novo_usuario')}
                                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                        modo === 'novo_usuario'
                                            ? 'bg-vscode-blue text-white shadow-md shadow-vscode-blue/25'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Novo usuário
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModo('usuario_existente')}
                                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                        modo === 'usuario_existente'
                                            ? 'bg-vscode-blue text-white shadow-md shadow-vscode-blue/25'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Usuário existente
                                </button>
                            </div>
                        </div>

                        <form action={createAcesso} className="space-y-4">
                            <input type="hidden" name="unidade_id" value={unidadeId} />
                            <input type="hidden" name="modo" value={modo} />

                            {modo === 'novo_usuario' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Nome</label>
                                        <input
                                            name="nome"
                                            type="text"
                                            placeholder="Nome completo"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">E-mail</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="usuario@exemplo.com"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Senha</label>
                                        <input
                                            name="senha"
                                            type="text"
                                            required
                                            minLength={6}
                                            placeholder="Mínimo 6 caracteres"
                                            autoComplete="new-password"
                                            className={inputClass}
                                        />
                                    </div>
                                </>
                            )}

                            {modo === 'usuario_existente' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">E-mail do usuário</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="usuario@exemplo.com"
                                        className={inputClass}
                                    />
                                    <p className="text-xs text-slate-500">
                                        O usuário já precisa ter conta no sistema (vínculo em outra unidade).
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Tipo (opcional)</label>
                                <select name="tipo" className={inputClass}>
                                    <option value="">— sem rótulo —</option>
                                    <option value="proprietario">Proprietário</option>
                                    <option value="locatario">Locatário</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-vscode-blue py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
