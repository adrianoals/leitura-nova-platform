'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaSignOutAlt, FaUserCircle, FaSpinner } from 'react-icons/fa';
import { firstOfRelation } from '@/lib/relations';

export default function MoradorHeader() {
    const router = useRouter();

    const [morador, setMorador] = useState<{
        nome: string | null;
        unidade: {
            bloco: string | null;
            apartamento: string | null;
            condominio: { nome: string } | { nome: string }[] | null;
        } | {
            bloco: string | null;
            apartamento: string | null;
            condominio: { nome: string } | { nome: string }[] | null;
        }[] | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from('moradores')
                    .select('nome, unidade:unidades(bloco, apartamento, condominio:condominios(nome))')
                    .eq('auth_user_id', user.id)
                    .single();

                if (data) {
                    setMorador(data);
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []); // Removed deps to avoid loops as creation is stable

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return (
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
                <div className="flex h-full items-center pl-12 lg:pl-0">
                    <FaSpinner className="animate-spin text-slate-400" />
                </div>
            </header>
        );
    }

    // Fallback if data loading failed or no user
    if (!morador) return null;

    const unidade = firstOfRelation(morador.unidade);
    const condominio = firstOfRelation(unidade?.condominio);

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
            {/* Unit info */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
                <div>
                    <p className="text-sm font-semibold text-slate-900">{condominio?.nome}</p>
                    <p className="text-xs text-slate-500">{unidade?.bloco} • {unidade?.apartamento}</p>
                </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                    <FaUserCircle className="h-5 w-5 text-slate-400" />
                    <span>{morador.nome || 'Morador'}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
        </header>
    );
}
