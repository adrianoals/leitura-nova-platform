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

    return (
        <button
            type="submit"
            onClick={() => setIsSubmitting(true)}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-vscode-blue px-4 py-3 text-sm font-semibold text-white shadow-md shadow-vscode-blue/25 transition-all hover:bg-vscode-blue-dark hover:shadow-lg active:scale-[0.98] active:bg-vscode-blue-dark/90 disabled:cursor-wait disabled:opacity-80"
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
