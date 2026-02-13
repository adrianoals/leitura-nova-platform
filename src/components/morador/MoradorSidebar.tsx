'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaChartLine, FaHistory, FaKey, FaSignOutAlt, FaBars, FaTimes, FaTint, FaCamera, FaSpinner } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { isLeituraOpen } from '@/utils/dateUtils';
import { Condominio } from '@/types';

const baseNavItems = [
    { label: 'Dashboard', href: '/app', icon: FaChartLine },
    { label: 'Leituras', href: '/app/leituras', icon: FaHistory },
];

const enviarLeituraItem = { label: 'Enviar Leitura', href: '/app/enviar-leitura', icon: FaCamera };
const senhaItem = { label: 'Trocar Senha', href: '/app/senha', icon: FaKey };

export default function MoradorSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showEnviarLeitura, setShowEnviarLeitura] = useState(false);

    useEffect(() => {
        async function checkPermissions() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: morador } = await supabase
                    .from('moradores')
                    .select('unidade:unidades(condominio:condominios(*))')
                    .eq('auth_user_id', user.id)
                    .single();

                if (morador?.unidade?.condominio) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const rawCondominio: any = morador.unidade.condominio;

                    const condominioMapped: Condominio = {
                        id: rawCondominio.id,
                        nome: rawCondominio.nome,
                        temAgua: rawCondominio.tem_agua,
                        temAguaQuente: rawCondominio.tem_agua_quente,
                        temGas: rawCondominio.tem_gas,
                        envioLeituraMoradorHabilitado: rawCondominio.envio_leitura_morador_habilitado,
                        leituraDiaInicio: rawCondominio.leitura_dia_inicio,
                        leituraDiaFim: rawCondominio.leitura_dia_fim,
                    };

                    setShowEnviarLeitura(isLeituraOpen(condominioMapped));
                }
            } catch (error) {
                console.error('Erro ao verificar permissões:', error);
            } finally {
                setLoading(false);
            }
        }

        checkPermissions();
    }, []); // Removed supabase from default dep array to avoid infinite loops if client recreates

    const getNavItems = () => {
        const items = [...baseNavItems];
        if (showEnviarLeitura) {
            items.push(enviarLeituraItem);
        }
        items.push(senhaItem);
        return items;
    };

    const navItems = getNavItems();

    const isActive = (href: string) => {
        if (href === '/app') return pathname === '/app';
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vscode-blue text-white">
                    <FaTint className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Leitura Nova</p>
                    <p className="text-xs text-slate-400">Portal do Morador</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {loading ? (
                    <div className="px-4 py-3 text-slate-500 text-sm flex items-center gap-2">
                        <FaSpinner className="animate-spin" /> Carregando menu...
                    </div>
                ) : (
                    navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                    ? 'bg-vscode-blue text-white shadow-lg shadow-vscode-blue/25'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })
                )}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <FaSignOutAlt className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white shadow-lg lg:hidden"
                aria-label="Menu"
            >
                {mobileOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
