'use client';

import { ReactNode } from 'react';

type ConfirmDeleteModalProps = {
    open: boolean;
    title?: string;
    description: string;
    warning?: string;
    children: ReactNode;
};

export default function ConfirmDeleteModal({
    open,
    title = 'Confirmar exclusão',
    description,
    warning = 'Esta ação não pode ser desfeita.',
    children,
}: ConfirmDeleteModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-700">{description}</p>
                <p className="mt-2 text-sm font-medium text-red-700">{warning}</p>
                <div className="mt-5">{children}</div>
            </div>
        </div>
    );
}
