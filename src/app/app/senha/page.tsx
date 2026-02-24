'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

export default function SenhaPage() {
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [showAtual, setShowAtual] = useState(false);
    const [showNova, setShowNova] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sucesso, setSucesso] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!senhaAtual) errs.senhaAtual = 'Informe a senha atual';
        if (!novaSenha) errs.novaSenha = 'Informe a nova senha';
        else if (novaSenha.length < 6) errs.novaSenha = 'Mínimo de 6 caracteres';
        if (novaSenha !== confirmar) errs.confirmar = 'As senhas não conferem';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!validate()) return;

        setLoading(true);

        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user?.email) {
                setFormError('Sessao invalida. Faca login novamente.');
                setLoading(false);
                return;
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: senhaAtual,
            });

            if (authError) {
                setFormError('Senha atual incorreta.');
                setLoading(false);
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: novaSenha,
            });

            if (updateError) {
                setFormError('Nao foi possivel alterar a senha.');
                setLoading(false);
                return;
            }

            setSucesso(true);
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmar('');
            setTimeout(() => setSucesso(false), 3000);
        } catch {
            setFormError('Erro inesperado ao alterar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/app"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trocar Senha</h1>
                    <p className="text-slate-500 text-sm">Altere sua senha de acesso</p>
                </div>
            </div>

            {/* Success */}
            {sucesso && (
                <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800">
                    <FaCheck className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium">Senha alterada com sucesso!</p>
                </div>
            )}

            {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {formError}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                {/* Current password */}
                <div className="space-y-2">
                    <label htmlFor="senhaAtual" className="block text-sm font-medium text-slate-700">
                        Senha Atual
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaLock className="h-4 w-4" />
                        </div>
                        <input
                            id="senhaAtual"
                            type={showAtual ? 'text' : 'password'}
                            value={senhaAtual}
                            onChange={e => setSenhaAtual(e.target.value)}
                            className={`w-full rounded-xl border ${errors.senhaAtual ? 'border-red-300' : 'border-slate-200'} pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowAtual(!showAtual)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showAtual ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.senhaAtual && <p className="text-sm text-red-600">{errors.senhaAtual}</p>}
                </div>

                {/* New password */}
                <div className="space-y-2">
                    <label htmlFor="novaSenha" className="block text-sm font-medium text-slate-700">
                        Nova Senha
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaLock className="h-4 w-4" />
                        </div>
                        <input
                            id="novaSenha"
                            type={showNova ? 'text' : 'password'}
                            value={novaSenha}
                            onChange={e => setNovaSenha(e.target.value)}
                            className={`w-full rounded-xl border ${errors.novaSenha ? 'border-red-300' : 'border-slate-200'} pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all`}
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNova(!showNova)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showNova ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.novaSenha && <p className="text-sm text-red-600">{errors.novaSenha}</p>}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                    <label htmlFor="confirmar" className="block text-sm font-medium text-slate-700">
                        Confirmar Nova Senha
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaLock className="h-4 w-4" />
                        </div>
                        <input
                            id="confirmar"
                            type={showConfirmar ? 'text' : 'password'}
                            value={confirmar}
                            onChange={e => setConfirmar(e.target.value)}
                            className={`w-full rounded-xl border ${errors.confirmar ? 'border-red-300' : 'border-slate-200'} pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all`}
                            placeholder="Repita a nova senha"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmar(!showConfirmar)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                            {showConfirmar ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmar && <p className="text-sm text-red-600">{errors.confirmar}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-vscode-blue py-3.5 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
            </form>
        </div>
    );
}
