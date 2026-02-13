import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CondominioForm from '@/components/admin/CondominioForm';
import { FaBuilding } from 'react-icons/fa';

export default async function NovoCondominioPage() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login/admin');

    // Check admin role
    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

    if (!adminUser) redirect('/app');

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FaBuilding className="text-blue-600 h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Novo Condomínio</h1>
                </div>
                <p className="text-slate-500">
                    Cadastre um novo condomínio e defina as regras de medição.
                </p>
            </div>

            <CondominioForm />
        </div>
    );
}
