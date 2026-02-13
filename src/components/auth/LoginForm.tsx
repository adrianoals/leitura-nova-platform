'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaSpinner, FaUser, FaShieldAlt, FaBuilding } from 'react-icons/fa';
import Input from './Input';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface LoginFormProps {
    title: string;
    subtitle?: string;
    variant?: 'user' | 'admin' | 'sindico';
    onSubmit?: (email: string, password: string) => void;
}

export default function LoginForm({
    title,
    subtitle,
    variant = 'user',
    onSubmit,
}: LoginFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const isAdmin = variant === 'admin';
    const isSindico = variant === 'sindico';

    // Determine icon based on variant
    let Icon = FaUser;
    if (isAdmin) Icon = FaShieldAlt;
    if (isSindico) Icon = FaBuilding;

    // Determine colors based on variant
    let iconBgColor = 'bg-gradient-to-br from-vscode-blue to-vscode-blue-light'; // User
    let buttonBgColor = 'bg-gradient-to-r from-vscode-blue to-vscode-blue-light hover:from-vscode-blue-dark hover:to-vscode-blue'; // User

    if (isAdmin) {
        iconBgColor = 'bg-gradient-to-br from-yellow-400 to-yellow-600'; // Admin
        buttonBgColor = 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700'; // Admin
    } else if (isSindico) {
        iconBgColor = 'bg-gradient-to-br from-indigo-600 to-violet-600'; // Sindico
        buttonBgColor = 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'; // Sindico
    }


    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        // Email validation
        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Email inválido';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Traduzindo erros comuns do Supabase
                let errorMessage = error.message;
                if (errorMessage === 'Invalid login credentials') {
                    errorMessage = 'Email ou senha incorretos.';
                } else if (errorMessage === 'Email not confirmed') {
                    errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
                }

                setErrors({ form: errorMessage });
                setIsLoading(false);
                return;
            }

            // Login bem-sucedido
            if (onSubmit) {
                onSubmit(email, password);
            } else {
                // Redirecionamento padrão baseado no tipo
                if (isAdmin) {
                    router.push('/admin');
                } else if (isSindico) {
                    router.push('/sindico');
                } else {
                    router.push('/app');
                }
                router.refresh(); // Atualiza server components com a nova sessão
            }
        } catch (err) {
            setErrors({ form: 'Ocorreu um erro inesperado. Tente novamente.' });
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-8">
                {Icon && (
                    <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${iconBgColor} text-white shadow-lg mb-4`}
                    >
                        <Icon className="h-8 w-8" />
                    </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
                {subtitle && <p className="text-slate-600">{subtitle}</p>}
                {(isAdmin || isSindico) && (
                    <div className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {isAdmin ? '🔒 Acesso Restrito' : '🏢 Área do Síndico'}
                    </div>
                )}
            </div>

            {/* Error Actions */}
            {errors.form && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {errors.form}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    icon={FaEnvelope}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                    required
                />

                <Input
                    id="password"
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    icon={FaLock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="current-password"
                    required
                />

                {/* Forgot password link */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="text-sm text-vscode-blue hover:text-vscode-blue-dark transition-colors focus:outline-none focus:underline"
                    >
                        Esqueceu sua senha?
                    </button>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full rounded-xl ${buttonBgColor} py-3.5 px-6 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-vscode-blue/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
                >
                    {isLoading ? (
                        <>
                            <FaSpinner className="h-5 w-5 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            {/* Alternative login links */}
            {!isAdmin && !isSindico && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <Link
                        href="/login/sindico"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-sm"
                    >
                        <FaBuilding className="h-4 w-4" />
                        Área do Síndico
                    </Link>
                </div>
            )}

            {(isAdmin || isSindico) && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-600">
                        É morador?{' '}
                        <Link
                            href="/login"
                            className="text-vscode-blue hover:text-vscode-blue-dark font-semibold transition-colors focus:outline-none focus:underline"
                        >
                            Voltar para login
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
