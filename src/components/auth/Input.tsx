'use client';

import { useState, InputHTMLAttributes } from 'react';
import { IconType } from 'react-icons';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    label: string;
    icon?: IconType;
    error?: string;
}

export default function Input({ label, icon: Icon, error, type = 'text', ...props }: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="space-y-2">
            <label htmlFor={props.id} className="block text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    {...props}
                    type={inputType}
                    className={`w-full rounded-xl border ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-vscode-blue focus:ring-vscode-blue/20'
                        } ${Icon ? 'pl-12' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'
                        } py-3.5 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-4 bg-white/80 backdrop-blur-sm`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-vscode-blue"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                        {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-600 flex items-center gap-1.5">{error}</p>}
        </div>
    );
}
