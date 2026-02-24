import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import SenhaPageClient from '@/components/morador/SenhaPageClient';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContext } from '@/lib/adminPreview';

export default async function SenhaPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const resolvedContext = await resolveMoradorPortalContext(supabase as never, user.id);
    if (!resolvedContext?.context) {
        redirect('/app');
    }

    if (resolvedContext.mode === 'admin_preview') {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/app"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Trocar Senha</h1>
                        <p className="text-slate-500 text-sm">Modo visualização do admin</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    No modo visualização, a troca de senha fica bloqueada.
                </div>
            </div>
        );
    }

    return <SenhaPageClient />;
}

