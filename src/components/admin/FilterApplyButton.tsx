'use client';

import { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

type FilterApplyButtonProps = {
    label?: string;
    loadingLabel?: string;
};

export default function FilterApplyButton({
    label = 'Aplicar filtro',
    loadingLabel = 'Aplicando...',
}: FilterApplyButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClick = () => {
        setIsSubmitting(true);

        // Fallback para não deixar o botão preso em loading
        // caso a navegação não aconteça (mesmos parâmetros/filtro).
        setTimeout(() => {
            setIsSubmitting(false);
        }, 1800);
    };

    return (
        <button
            type="submit"
            onClick={handleClick}
            aria-busy={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-vscode-blue px-4 py-3 text-sm font-semibold text-white shadow-md shadow-vscode-blue/25 transition-all hover:bg-vscode-blue-dark hover:shadow-lg active:scale-[0.98] active:bg-vscode-blue-dark/90"
        >
            {isSubmitting ? (
                <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    {loadingLabel}
                </>
            ) : (
                <>
                    <FaSearch className="h-4 w-4" />
                    {label}
                </>
            )}
        </button>
    );
}
