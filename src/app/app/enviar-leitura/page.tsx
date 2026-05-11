import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';

export default async function EnviarLeituraRedirect() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);

    if (!ctx || ctx.vinculos.length === 0) {
        redirect('/app');
    }

    if (ctx.vinculos.length === 1) {
        redirect(`/app/u/${ctx.vinculos[0].unidadeId}/enviar-leitura`);
    }

    redirect('/app');
}
