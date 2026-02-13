'use client';

import { FaUserShield } from 'react-icons/fa';

export default function AdminHeader() {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
            <div className="pl-12 lg:pl-0">
                <h2 className="text-sm font-semibold text-slate-900">Painel Administrativo</h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
                <FaUserShield className="h-5 w-5 text-yellow-500" />
                <span className="hidden sm:inline">Administrador</span>
            </div>
        </header>
    );
}
