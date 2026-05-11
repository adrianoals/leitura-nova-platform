import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaUser, FaKey, FaEnvelope } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
    updatePessoa,
    updateAuthCredentials,
    updateAcesso,
    toggleAcessoAtivo,
    deleteAcesso,
} from '@/actions/acessoActions';

interface Props {
    params: Promise<{ id: string; acessoId: string }>;
    searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function AcessoEditPage({ params, searchParams }: Props) {
    const { id: unidadeId, acessoId } = await params;
    const { success, error } = await searchParams;
    const supabase = await createClient();

    const { data: acesso } = await supabase
        .from('unidade_acessos')
        .select(`
            id,
            auth_user_id,
            tipo,
            ativo,
            created_at,
            pessoa:pessoas (
                id,
                nome
            ),
            unidade:unidades (
                id,
                bloco,
                apartamento,
                condominio:condominios (
                    id,
                    nome
                )
            )
        `)
        .eq('id', acessoId)
        .eq('unidade_id', unidadeId)
        .single();

    if (!acesso) notFound();

    const pessoa = Array.isArray(acesso.pessoa) ? acesso.pessoa[0] : acesso.pessoa;
    const unidade = Array.isArray(acesso.unidade) ? acesso.unidade[0] : acesso.unidade;
    const condominio = unidade && (Array.isArray(unidade.condominio) ? unidade.condominio[0] : unidade.condominio);

    const adminClient = createAdminClient();
    const { data: authUser } = await adminClient.auth.admin.getUserById(acesso.auth_user_id as string);
    const email = authUser?.user?.email ?? '';

    const returnPath = `/admin/moradores/${unidadeId}/${acessoId}`;
    const successMsg = success ? decodeURIComponent(success) : null;
    const errorMsg = error ? decodeURIComponent(error) : null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/moradores/${unidadeId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Usuário</h1>
                    <p className="text-sm text-slate-500">
                        {condominio?.nome} — Apt {unidade?.bloco ? `${unidade.bloco}/` : ''}{unidade?.apartamento}
                    </p>
                </div>
            </div>

            {successMsg && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">{successMsg}</div>
            )}
            {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{errorMsg}</div>
            )}

            {/* Nome */}
            <form action={updatePessoa} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <FaUser className="h-4 w-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700">Dados da pessoa</h2>
                </div>
                <input type="hidden" name="auth_user_id" value={acesso.auth_user_id as string} />
                <input type="hidden" name="return_path" value={returnPath} />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        defaultValue={pessoa?.nome ?? ''}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all"
                >
                    <FaSave className="h-3.5 w-3.5" /> Salvar nome
                </button>
            </form>

            {/* Tipo do vínculo */}
            <form action={updateAcesso} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-slate-700">Vínculo com a unidade</h2>
                <input type="hidden" name="acesso_id" value={acesso.id as string} />
                <input type="hidden" name="return_path" value={returnPath} />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Tipo</label>
                    <select
                        name="tipo"
                        defaultValue={acesso.tipo ?? ''}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue"
                    >
                        <option value="">— sem rótulo —</option>
                        <option value="proprietario">Proprietário</option>
                        <option value="locatario">Locatário</option>
                    </select>
                    <p className="text-xs text-slate-500">Apenas informativo. Não afeta permissões.</p>
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all"
                >
                    <FaSave className="h-3.5 w-3.5" /> Salvar tipo
                </button>
            </form>

            {/* Credenciais (email/senha) */}
            <form action={updateAuthCredentials} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700">Credenciais de acesso</h2>
                </div>
                <input type="hidden" name="auth_user_id" value={acesso.auth_user_id as string} />
                <input type="hidden" name="return_path" value={returnPath} />
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        <FaEnvelope className="inline h-3 w-3 mr-1" /> E-mail
                    </label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={email}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nova senha (opcional)</label>
                    <input
                        type="text"
                        name="senha"
                        placeholder="Deixe em branco para não alterar"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue"
                    />
                    <p className="text-xs text-slate-500">Mínimo 6 caracteres. Em branco mantém a senha atual.</p>
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all"
                >
                    <FaSave className="h-3.5 w-3.5" /> Salvar credenciais
                </button>
            </form>

            {/* Ativar/Desativar + Excluir */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-slate-700">Status do vínculo</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-700">
                            Atualmente: <span className={`font-semibold ${acesso.ativo ? 'text-green-700' : 'text-slate-500'}`}>
                                {acesso.ativo ? 'Ativo' : 'Desabilitado'}
                            </span>
                        </p>
                        <p className="text-xs text-slate-500">Desabilitar bloqueia o acesso sem perder o histórico.</p>
                    </div>
                    <form action={toggleAcessoAtivo}>
                        <input type="hidden" name="acesso_id" value={acesso.id as string} />
                        <input type="hidden" name="ativo" value={acesso.ativo ? 'false' : 'true'} />
                        <input type="hidden" name="return_path" value={returnPath} />
                        <button
                            type="submit"
                            className={
                                acesso.ativo
                                    ? 'rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                                    : 'rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'
                            }
                        >
                            {acesso.ativo ? 'Desabilitar' : 'Reativar'}
                        </button>
                    </form>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500 mb-2">Excluir vínculo remove apenas o acesso desta unidade. A pessoa continua existindo.</p>
                    <form action={deleteAcesso}>
                        <input type="hidden" name="acesso_id" value={acesso.id as string} />
                        <input type="hidden" name="return_path" value={`/admin/moradores/${unidadeId}`} />
                        <button
                            type="submit"
                            className="text-sm text-red-600 hover:underline"
                        >
                            Excluir vínculo desta unidade
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
