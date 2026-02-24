import Link from 'next/link';
import { FaBuilding, FaSearch, FaUserShield } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import FilterApplyButton from '@/components/admin/FilterApplyButton';
import ActionToast from '@/components/admin/ActionToast';
import DeleteSindicoButton from '@/components/admin/DeleteSindicoButton';
import { firstOfRelation } from '@/lib/relations';

type SearchParams = Promise<{
    condominio_id?: string;
    q?: string;
    created?: string;
    deleted?: string;
    error?: string;
}>;

type CondominioOption = {
    id: string;
    nome: string;
};

type SindicoRow = {
    id: string;
    nome: string | null;
    auth_user_id: string;
    condominio_id: string;
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
};

async function getAuthEmailMap(authUserIds: string[]) {
    const map = new Map<string, string>();
    if (authUserIds.length === 0) return map;

    try {
        const adminClient = createAdminClient();
        const uniqueIds = Array.from(new Set(authUserIds));

        await Promise.all(
            uniqueIds.map(async (id) => {
                const { data, error } = await adminClient.auth.admin.getUserById(id);
                if (!error && data?.user?.email) {
                    map.set(id, data.user.email);
                }
            })
        );
    } catch {
        // Se não houver service key no ambiente, mantemos sem email.
    }

    return map;
}

export default async function SindicosPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const condominioId = params.condominio_id || '';
    const termoBusca = (params.q || '').trim().toLowerCase();
    const created = params.created === '1';
    const deleted = params.deleted === '1';
    const errorMessage = params.error ? decodeURIComponent(params.error) : '';

    const supabase = await createClient();

    const [{ data: condominiosRaw }, { data: sindicosRaw }] = await Promise.all([
        supabase
            .from('condominios')
            .select('id, nome')
            .order('nome', { ascending: true }),
        condominioId
            ? supabase
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
                .eq('condominio_id', condominioId)
                .order('created_at', { ascending: false })
            : supabase
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
                .order('created_at', { ascending: false }),
    ]);

    const condominios = (condominiosRaw || []) as CondominioOption[];
    const condominioSelecionado = condominios.find((c) => c.id === condominioId) || null;
    const rows = (sindicosRaw || []) as SindicoRow[];
    const emailMap = await getAuthEmailMap(rows.map((r) => r.auth_user_id));

    const sindicos = rows.filter((row) => {
        if (!termoBusca) return true;
        const condominioNome = firstOfRelation(row.condominio)?.nome || '';
        const email = emailMap.get(row.auth_user_id) || '';
        const texto = `${row.nome || ''} ${email} ${condominioNome}`.toLowerCase();
        return texto.includes(termoBusca);
    });

    const filtroFormKey = `${condominioId}|${params.q || ''}`;
    const novoHref = condominioId ? `/admin/sindicos/novo?condominio_id=${condominioId}` : '/admin/sindicos/novo';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Síndicos</h1>
                    <p className="text-slate-500 text-sm">
                        {condominioSelecionado
                            ? `${sindicos.length} síndico(s) em ${condominioSelecionado.nome}`
                            : `${sindicos.length} síndico(s) cadastrados`}
                    </p>
                </div>
                <Link
                    href={novoHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                >
                    Novo Síndico
                </Link>
            </div>

            {created && <ActionToast message="Síndico criado com sucesso." />}
            {deleted && <ActionToast message="Síndico excluído com sucesso." />}
            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <form key={filtroFormKey} method="GET" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                        <select
                            name="condominio_id"
                            defaultValue={condominioId}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        >
                            <option value="">Todos os condomínios</option>
                            {condominios.map((cond) => (
                                <option key={cond.id} value={cond.id}>
                                    {cond.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Buscar síndico</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={params.q || ''}
                                placeholder="Nome, email, condomínio..."
                                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900"
                            />
                        </div>
                    </div>

                    <FilterApplyButton />

                    <Link
                        href="/admin/sindicos"
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        Limpar
                    </Link>
                </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-3">Síndico</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Condomínio</th>
                            <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Login</th>
                            <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sindicos.map((row) => {
                            const condominioNome = firstOfRelation(row.condominio)?.nome || 'Condomínio';
                            const email = emailMap.get(row.auth_user_id) || 'Email indisponível';

                            return (
                                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FaUserShield className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{row.nome || 'Síndico'}</p>
                                                <p className="text-xs text-slate-500 md:hidden">{condominioNome}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-600 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <FaBuilding className="h-3 w-3 text-slate-400" />
                                            {condominioNome}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">{email}</td>
                                    <td className="text-right px-6 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/sindicos/${row.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                                Gerenciar
                                            </Link>
                                            <DeleteSindicoButton
                                                sindicoId={row.id}
                                                returnPath={condominioId ? `/admin/sindicos?condominio_id=${condominioId}` : '/admin/sindicos'}
                                                compact
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {sindicos.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                                    Nenhum síndico encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

