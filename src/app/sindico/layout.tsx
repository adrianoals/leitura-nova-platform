import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SindicoTopbar from '@/components/sindico/SindicoTopbar';

export const metadata = {
    title: 'Síndico | Leitura Nova',
    robots: { index: false, follow: false },
};

export const preferredRegion = 'gru1';

export default async function SindicoLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login/sindico');
    }

    const { data: sindicoRows } = await supabase
        .from('sindicos')
        .select('id')
        .eq('auth_user_id', user.id)
        .limit(1);

    if (!sindicoRows || sindicoRows.length === 0) {
        redirect('/app');
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <SindicoTopbar />
            <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}

