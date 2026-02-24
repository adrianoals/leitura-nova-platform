'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBuilding, FaSignOutAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

const navItems = [
    { label: 'Dashboard', href: '/sindico' },
];

export default function SindicoTopbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login/sindico');
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === '/sindico') return pathname === '/sindico';
        return pathname.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link href="/sindico" className="inline-flex items-center gap-2 text-slate-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <FaBuilding className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold">Área do Síndico</span>
                    </Link>

                    <nav className="hidden items-center gap-1 sm:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <FaSignOutAlt className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </header>
    );
}

