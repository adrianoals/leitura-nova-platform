'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[morador] erro inesperado:', error);
    }, [error]);

    return (
        <div className="max-w-md mx-auto mt-12 space-y-5">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <FaExclamationTriangle className="h-7 w-7" />
                    </div>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900">Algo deu errado</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Não foi possível concluir a ação. Verifique sua conexão e tente novamente.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-xl bg-vscode-blue py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                    >
                        Tentar novamente
                    </button>
                    <Link
                        href="/app"
                        className="rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Voltar ao início
                    </Link>
                </div>
            </div>
        </div>
    );
}
