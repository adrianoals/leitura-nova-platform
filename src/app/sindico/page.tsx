import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SindicoDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login/sindico');
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Painel do Síndico</h1>
            <p className="text-gray-600">Área em construção.</p>
            <p className="mt-4 text-sm text-gray-500">Logado como: {user.email}</p>
        </div>
    );
}
