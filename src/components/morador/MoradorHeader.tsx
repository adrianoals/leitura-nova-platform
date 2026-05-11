'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSignOutAlt, FaUserCircle, FaSpinner } from 'react-icons/fa';

export default function MoradorHeader() {
    const router = useRouter();
    const [nome, setNome] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from('pessoas')
                    .select('nome')
                    .eq('id', user.id)
                    .single();

                if (data) setNome(data.nome ?? null);
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return (
            <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
                <FaSpinner className="animate-spin text-slate-400" />
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <FaUserCircle className="h-5 w-5 text-slate-400" />
                <span>{nome || 'Morador'}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
            >
                <FaSignOutAlt className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
            </button>
        </header>
    );
}
