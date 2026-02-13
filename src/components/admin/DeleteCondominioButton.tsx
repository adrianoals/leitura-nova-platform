'use client';

import { useFormStatus } from 'react-dom';
import { FaTrash } from 'react-icons/fa';
import { deleteCondominio } from '@/actions/condominioActions';

type DeleteCondominioButtonProps = {
    condominioId: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <FaTrash className="h-3 w-3" />
            {pending ? 'Excluindo...' : 'Excluir Condomínio'}
        </button>
    );
}

export default function DeleteCondominioButton({ condominioId }: DeleteCondominioButtonProps) {
    const deleteAction = deleteCondominio.bind(null, condominioId);

    return (
        <form
            action={deleteAction}
            onSubmit={(event) => {
                const confirmed = window.confirm(
                    'Tem certeza? Esta ação excluirá o condomínio, as unidades e os acessos vinculados.'
                );

                if (!confirmed) {
                    event.preventDefault();
                }
            }}
        >
            <SubmitButton />
        </form>
    );
}
