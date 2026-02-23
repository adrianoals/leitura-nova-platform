'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { FaTrash } from 'react-icons/fa';
import { deleteCondominio } from '@/actions/condominioActions';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

type DeleteCondominioButtonProps = {
    condominioId: string;
    compact?: boolean;
};

function SubmitButton({ compact, onClick }: { compact?: boolean; onClick: () => void }) {
    const { pending } = useFormStatus();

    if (compact) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={pending}
                className="text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-60"
            >
                {pending ? 'Excluindo...' : 'Excluir'}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <FaTrash className="h-3 w-3" />
            {pending ? 'Excluindo...' : 'Excluir Condomínio'}
        </button>
    );
}

function ConfirmSubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending || disabled}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? 'Excluindo...' : 'Excluir'}
        </button>
    );
}

export default function DeleteCondominioButton({ condominioId, compact }: DeleteCondominioButtonProps) {
    const deleteAction = deleteCondominio.bind(null, condominioId);
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const canDelete = confirmText.trim().toUpperCase() === 'EXCLUIR';

    return (
        <form action={deleteAction}>
            <SubmitButton compact={compact} onClick={() => setOpen(true)} />

            <ConfirmDeleteModal
                open={open}
                description="Tem certeza que deseja excluir este condomínio?"
            >
                <div className="w-full space-y-3">
                    <p className="text-xs text-slate-600">
                        Para confirmar esta exclusão crítica, digite <span className="font-semibold">EXCLUIR</span>.
                    </p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Digite EXCLUIR"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setConfirmText('');
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <ConfirmSubmitButton disabled={!canDelete} />
                    </div>
                </div>
            </ConfirmDeleteModal>
        </form>
    );
}
