'use client';

import { useState, FormEvent } from 'react';
import { FaEnvelope, FaLock, FaSpinner, FaUser, FaShieldAlt } from 'react-icons/fa';
import Input from './Input';

interface LoginFormProps {
    title: string;
    subtitle?: string;
    variant?: 'user' | 'admin';
    onSubmit?: (email: string, password: string) => void;
}

export default function LoginForm({
    title,
    subtitle,
    variant = 'user',
    onSubmit,
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const isAdmin = variant === 'admin';

    // Determine icon based on variant
    const Icon = isAdmin ? FaShieldAlt : FaUser;

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

        if (!validateForm()) return;

        setIsLoading(true);

        // Simulate API call (front-end only)
        setTimeout(() => {
            setIsLoading(false);
            if (onSubmit) {
                onSubmit(email, password);
            } else {
                alert(`Login simulado!\nEmail: ${email}\nSenha: ${'•'.repeat(password.length)}`);
            }
        }, 1500);
    };

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-8">
                {Icon && (
                    <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${isAdmin
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                            : 'bg-gradient-to-br from-vscode-blue to-vscode-blue-light'
                            } text-white shadow-lg mb-4`}
                    >
                        <Icon className="h-8 w-8" />
                    </div>
                )}
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
                {subtitle && <p className="text-slate-600">{subtitle}</p>}
                {isAdmin && (
                    <div className="inline-flex mt-3 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                        🔒 Acesso Restrito
                    </div>
                )}
            </div>

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
                    className={`w-full rounded-xl ${isAdmin
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700'
                        : 'bg-gradient-to-r from-vscode-blue to-vscode-blue-light hover:from-vscode-blue-dark hover:to-vscode-blue'
                        } py-3.5 px-6 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-vscode-blue/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
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

            {/* Alternative login link (only show on user page) */}
            {!isAdmin && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-600">
                        Acesso administrativo?{' '}
                        <a
                            href="/login/admin"
                            className="text-vscode-blue hover:text-vscode-blue-dark font-semibold transition-colors focus:outline-none focus:underline"
                        >
                            Clique aqui
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}
