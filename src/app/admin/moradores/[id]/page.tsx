import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import AcessosList from '@/components/admin/AcessosList';
import AddAcessoDialog from '@/components/admin/AddAcessoDialog';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function UnidadeAcessosPage({ params, searchParams }: Props) {
    const { id: unidadeId } = await params;
    const { success, error } = await searchParams;
    const supabase = await createClient();

    const { data: unidade } = await supabase
        .from('unidades')
        .select('id, bloco, apartamento, condominio:condominios(id, nome)')
        .eq('id', unidadeId)
        .single();

    if (!unidade) notFound();

    const { data: acessos } = await supabase
        .from('unidade_acessos')
        .select('id, auth_user_id, tipo, ativo, created_at, pessoa:pessoas(id, nome)')
        .eq('unidade_id', unidadeId)
        .order('created_at', { ascending: true });

    const acessosFmt = (acessos ?? []).map((a) => {
        const pessoa = Array.isArray(a.pessoa) ? a.pessoa[0] : a.pessoa;
        return {
            id: a.id as string,
            authUserId: a.auth_user_id as string,
            nome: (pessoa?.nome as string | null) ?? null,
            tipo: a.tipo as 'proprietario' | 'locatario' | null,
            ativo: a.ativo as boolean,
            createdAt: a.created_at as string,
        };
    });

    const condominio = Array.isArray(unidade.condominio) ? unidade.condominio[0] : unidade.condominio;
    const successMsg = success ? decodeURIComponent(success) : null;
    const errorMsg = error ? decodeURIComponent(error) : null;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/moradores" className="inline-flex items-center gap-2 text-vscode-blue text-sm hover:underline">
                    <FaArrowLeft className="h-3 w-3" /> Voltar
                </Link>
                <h1 className="text-2xl font-bold mt-2 text-slate-900">
                    Usuários da unidade — {condominio?.nome}, Apt {unidade.bloco ? `${unidade.bloco}/` : ''}{unidade.apartamento}
                </h1>
                <p className="text-sm text-slate-600 mt-1">{acessosFmt.length} usuário(s) cadastrado(s)</p>
            </div>

            {successMsg && (
                <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{successMsg}</div>
            )}
            {errorMsg && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{errorMsg}</div>
            )}

            <div className="mb-6">
                <AddAcessoDialog unidadeId={unidadeId} />
            </div>

            <AcessosList acessos={acessosFmt} unidadeId={unidadeId} />
        </div>
    );
}
