import Link from 'next/link';
import { FaArrowLeft, FaSave, FaUserCheck, FaUserClock } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAcesso, updateAcesso } from '@/actions/acessoActions';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ created?: string; saved?: string; error?: string }>;

type UnidadeAccessDetail = {
    id: string;
    bloco: string;
    apartamento: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
    moradores: { id: string; nome: string | null; auth_user_id: string | null }[] | null;
};

function getCondominioNome(condominio: UnidadeAccessDetail['condominio']) {
    if (!condominio) return 'Condomínio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condomínio';
    return condominio.nome;
}

export default async function MoradorDetailPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params; // id da unidade
    const query = await searchParams;
    const supabase = await createClient();

    const { data: unidade } = await supabase
        .from('unidades')
        .select(`
            id,
            bloco,
            apartamento,
            condominio:condominios (
                id,
                nome
            ),
            moradores (
                id,
                nome,
                auth_user_id
            )
        `)
        .eq('id', id)
        .single<UnidadeAccessDetail>();

    if (!unidade) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Unidade não encontrada.</p>
                    <Link href="/admin/moradores" className="text-vscode-blue mt-2 inline-block">Voltar para acessos</Link>
                </div>
            </div>
        );
    }

    const acesso = unidade.moradores?.[0] || null;
    const condominioNome = getCondominioNome(unidade.condominio);
    const created = query.created === '1';
    const saved = query.saved === '1';
    const error = query.error;

    let email = '';
    let adminClientError = '';

    if (acesso?.auth_user_id) {
        try {
            const adminClient = createAdminClient();
            const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(acesso.auth_user_id);
            if (!authError) {
                email = authData.user?.email || '';
            } else {
                adminClientError = 'Não foi possível carregar o email de login deste acesso.';
            }
        } catch {
            adminClientError = 'SUPABASE_SERVICE_ROLE_KEY não configurada para gerenciar acessos.';
        }
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/moradores" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gerenciar Acesso</h1>
                    <p className="text-sm text-slate-500">{condominioNome} — {unidade.bloco} — {unidade.apartamento}</p>
                </div>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Acesso atualizado com sucesso.
                </div>
            )}

            {created && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                    Acesso criado com sucesso.
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {decodeURIComponent(error)}
                </div>
            )}

            {adminClientError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {adminClientError}
                </div>
            )}

            {!acesso ? (
                <form action={createAcesso} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-center gap-2">
                        <FaUserClock className="h-4 w-4" />
                        Unidade sem acesso. Configure o proprietário para habilitar login.
                    </div>

                    <input type="hidden" name="unidade_id" value={unidade.id} />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Nome do Proprietário (opcional)</label>
                        <input type="text" name="nome"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="Ex.: João Silva"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Email de Login</label>
                        <input type="email" name="email"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="proprietario@exemplo.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Senha Inicial</label>
                        <input type="password" name="senha"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                            required
                        />
                    </div>
                    <button type="submit"
                        className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <FaSave className="h-4 w-4" /> Criar Acesso
                    </button>
                </form>
            ) : (
                <form action={updateAcesso} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
                        <FaUserCheck className="h-4 w-4" />
                        Acesso ativo para esta unidade.
                    </div>

                    <input type="hidden" name="morador_id" value={acesso.id} />
                    <input type="hidden" name="unidade_id" value={unidade.id} />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Nome do Proprietário</label>
                        <input type="text" name="nome" defaultValue={acesso.nome || ''}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Email de Login</label>
                        <input type="email" name="email" defaultValue={email}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Nova Senha (opcional)</label>
                        <input type="password" name="senha"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="Preencha apenas para redefinir"
                            minLength={6}
                        />
                    </div>

                    <button type="submit"
                        className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <FaSave className="h-4 w-4" /> Salvar Acesso
                    </button>
                </form>
            )}
        </div>
    );
}
