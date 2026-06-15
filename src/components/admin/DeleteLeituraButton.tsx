'use client';

import { FaTrash } from 'react-icons/fa';
import { deleteLeitura } from '@/actions/leituraActions';

interface DeleteLeituraButtonProps {
    leituraId: string;
    label: string;
    returnCondominioId?: string;
    returnMes?: string;
}

export default function DeleteLeituraButton({
    leituraId,
    label,
    returnCondominioId,
    returnMes,
}: DeleteLeituraButtonProps) {
    return (
        <form
            action={deleteLeitura}
            onSubmit={(event) => {
                if (!window.confirm(`Excluir a leitura de ${label}? Esta ação não pode ser desfeita.`)) {
                    event.preventDefault();
                }
            }}
            className="inline"
        >
            <input type="hidden" name="id" value={leituraId} />
            <input type="hidden" name="return_condominio_id" value={returnCondominioId || ''} />
            <input type="hidden" name="return_mes" value={returnMes || ''} />
            <button
                type="submit"
                className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                title="Excluir leitura"
            >
                <FaTrash className="h-3 w-3" /> Excluir
            </button>
        </form>
    );
}
