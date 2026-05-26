'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type Vinculo = {
    unidadeId: string;
    label: string;
    href: string;
};

interface UnitDropdownProps {
    atual: Vinculo;
    outros: Vinculo[];
}

export default function UnitDropdown({ atual, outros }: UnitDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    if (outros.length === 0) {
        return (
            <span className="text-sm font-medium text-slate-700 truncate text-right" title={atual.label}>
                {atual.label}
            </span>
        );
    }

    return (
        <div ref={ref} className="relative min-w-0 flex-1 sm:flex-initial">
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-vscode-blue max-w-full"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="truncate" title={atual.label}>{atual.label}</span>
                <FaChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white rounded-md shadow-lg border border-slate-200 z-50 py-1">
                    {outros.map((v) => (
                        <Link
                            key={v.unidadeId}
                            href={v.href}
                            role="menuitem"
                            className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 break-words"
                            onClick={() => setOpen(false)}
                        >
                            {v.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
