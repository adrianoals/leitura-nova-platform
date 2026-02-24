import Link from 'next/link';
import { FaArrowLeft, FaSave, FaUserShield } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Input from '@/components/auth/Input';
import ActionToast from '@/components/admin/ActionToast';
import DeleteSindicoButton from '@/components/admin/DeleteSindicoButton';
import { firstOfRelation } from '@/lib/relations';
import { updateSindico } from '@/actions/sindicoActions';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ saved?: string; deleted?: string; error?: string }>;

type SindicoDetail = {
    id: string;
    nome: string | null;
    auth_user_id: string;
    condominio_id: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
};

type CondominioOption = {
    id: string;
    nome: string;
};

async function getAuthEmail(authUserId: string) {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient.auth.admin.getUserById(authUserId);
        if (!error && data?.user?.email) {
            return data.user.email;
        }
    } catch {
        // Ignora ausência de service key no ambiente.
    }

    return '';
}

export default async function SindicoDetailPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const query = await searchParams;
    const supabase = await createClient();

    const [{ data: sindico }, { data: condominiosRaw }] = await Promise.all([
        supabase
            .from('sindicos')
            .select(`
                id,
                nome,
                auth_user_id,
                condominio_id,
                condominio:condominios(
                    id,
                    nome
                )
            `)
            .eq('id', id)
            .maybeSingle<SindicoDetail>(),
        supabase
            .from('condominios')
            .select('id, nome')
            .order('nome', { ascending: true }),
    ]);

    if (!sindico) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Síndico não encontrado.</p>
                    <Link href="/admin/sindicos" className="text-vscode-blue mt-2 inline-block">Voltar para síndicos</Link>
                </div>
            </div>
        );
    }

    const condominios = (condominiosRaw || []) as CondominioOption[];
    const condominioNome = firstOfRelation(sindico.condominio)?.nome || 'Condomínio';
    const email = await getAuthEmail(sindico.auth_user_id);
    const saved = query.saved === '1';
    const deleted = query.deleted === '1';
    const error = query.error ? decodeURIComponent(query.error) : '';

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/sindicos" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gerenciar Síndico</h1>
                    <p className="text-sm text-slate-500">{condominioNome}</p>
                </div>
            </div>

            {saved && <ActionToast message="Síndico atualizado com sucesso." />}
            {deleted && <ActionToast message="Síndico excluído com sucesso." />}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form action={updateSindico} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex items-center gap-2">
                    <FaUserShield className="h-4 w-4" />
                    Ajuste condomínio, dados de login e senha do síndico.
                </div>

                <input type="hidden" name="sindico_id" value={sindico.id} />

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                    <select
                        name="condominio_id"
                        defaultValue={sindico.condominio_id}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    >
                        {condominios.map((cond) => (
                            <option key={cond.id} value={cond.id}>
                                {cond.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nome do Síndico</label>
                    <input
                        type="text"
                        name="nome"
                        defaultValue={sindico.nome || ''}
                        placeholder="Ex.: João Síndico"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email de Login</label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={email}
                        placeholder="sindico@condominio.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Input
                        id="nova-senha-sindico"
                        type="password"
                        name="senha"
                        label="Nova Senha (opcional)"
                        placeholder="Preencha apenas para redefinir"
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <FaSave className="h-4 w-4" /> Salvar Síndico
                </button>

                <DeleteSindicoButton
                    sindicoId={sindico.id}
                    returnPath={`/admin/sindicos/${sindico.id}`}
                />
            </form>
        </div>
    );
}

