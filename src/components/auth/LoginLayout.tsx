'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LoginLayoutProps {
    children: ReactNode;
    variant?: 'user' | 'admin';
}

export default function LoginLayout({ children, variant = 'user' }: LoginLayoutProps) {
    const isAdmin = variant === 'admin';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient */}
            <div
                className={`absolute inset-0 ${isAdmin
                        ? 'bg-gradient-to-br from-slate-900 via-vscode-blue-dark to-slate-800'
                        : 'bg-gradient-to-br from-vscode-blue-dark via-vscode-blue to-vscode-blue-light'
                    }`}
            />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Content container */}
            <div className="relative w-full max-w-md z-10">
                {/* Logo */}
                <Link href="/" className="flex justify-center mb-8 focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
                    <Image
                        src="/images/logoleituranova-hero.jpg"
                        alt="Leitura Nova"
                        width={160}
                        height={80}
                        className="h-12 w-auto brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
                        priority
                    />
                </Link>

                {/* Card with glassmorphism */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    {children}
                </div>

                {/* Footer link */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4"
                    >
                        ← Voltar ao site
                    </Link>
                </div>
            </div>
        </div>
    );
}
