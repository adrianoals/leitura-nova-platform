import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveMoradorPortalContextPlural } from '@/lib/adminPreview';
import UnitSelectorPage from '@/components/morador/UnitSelectorPage';

export default async function AppGateway() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const ctx = await resolveMoradorPortalContextPlural(supabase as never, user.id);

    if (!ctx || ctx.vinculos.length === 0) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 text-center">
                <h1 className="text-xl font-bold text-slate-900 mb-2">Sem acesso ativo</h1>
                <p className="text-slate-600">
                    Você não tem nenhum vínculo ativo com unidades. Entre em contato com o administrador do seu condomínio.
                </p>
                <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                    Seu ID de usuário:
                    <code className="font-mono font-bold mt-1 block">{user.id}</code>
                </div>
            </div>
        );
    }

    if (ctx.vinculos.length === 1) {
        redirect(`/app/u/${ctx.vinculos[0].unidadeId}`);
    }

    return (
        <UnitSelectorPage
            vinculos={ctx.vinculos.map((v) => ({
                unidadeId: v.unidadeId,
                condominioNome: v.condominio.nome,
                bloco: v.unidade.bloco,
                apartamento: v.unidade.apartamento,
                tipo: v.tipo,
            }))}
        />
    );
}
