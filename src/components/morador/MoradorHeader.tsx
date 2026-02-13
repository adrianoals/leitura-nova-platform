'use client';

import { mockMorador } from '@/mocks/moradorData';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export default function MoradorHeader() {
    const { unidade } = mockMorador;

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
            {/* Unit info */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{unidade.condominio.nome}</p>
                    <p className="text-xs text-slate-500">{unidade.bloco} • {unidade.apartamento}</p>
                </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                    <FaUserCircle className="h-5 w-5 text-slate-400" />
                    <span>{mockMorador.nome}</span>
                </div>
                <button
                    onClick={() => alert('Logout simulado')}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
