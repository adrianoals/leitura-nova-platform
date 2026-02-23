'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    FaChartPie,
    FaBuilding,
    FaDoorOpen,
    FaKey,
    FaClipboardList,
    FaEye,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaCog,
} from 'react-icons/fa';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: FaChartPie },
    { label: 'Condomínios', href: '/admin/condominios', icon: FaBuilding },
    { label: 'Unidades', href: '/admin/unidades', icon: FaDoorOpen },
    { label: 'Moradores', href: '/admin/moradores', icon: FaKey },
    { label: 'Leituras', href: '/admin/leituras', icon: FaClipboardList },
    { label: 'Visualizar como', href: '/admin/visualizar', icon: FaEye },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    useEffect(() => {
        navItems.forEach((item) => {
            router.prefetch(item.href);
        });
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500 text-white">
                    <FaCog className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">Leitura Nova</p>
                    <p className="text-xs text-yellow-400">Painel Admin</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            onMouseEnter={() => router.prefetch(item.href)}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/25'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
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
                className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg lg:hidden"
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
                className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
