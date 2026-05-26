'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Props {
    unidadeId: string;
}

export default function LeituraSubmitModal({ unidadeId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === '1';
    const error = searchParams.get('error');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (success || error) setOpen(true);
    }, [success, error]);

    if (!open) return null;

    const isSuccess = success;
    const message = isSuccess
        ? 'Sua leitura foi registrada e já está disponível na sua lista.'
        : decodeURIComponent(error || 'Erro ao enviar leitura.');

    const handleClose = () => {
        setOpen(false);
        if (isSuccess) {
            router.replace(`/app/u/${unidadeId}/leituras`);
        } else {
            router.replace(pathname);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center">
                    {isSuccess ? (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <FaCheckCircle className="h-8 w-8" />
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <FaTimesCircle className="h-8 w-8" />
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {isSuccess ? 'Leitura enviada!' : 'Não foi possível enviar'}
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">{message}</p>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] ${
                        isSuccess
                            ? 'bg-vscode-blue shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark'
                            : 'bg-slate-700 hover:bg-slate-800'
                    }`}
                >
                    {isSuccess ? 'Ver leituras' : 'Tentar novamente'}
                </button>
            </div>
        </div>
    );
}
