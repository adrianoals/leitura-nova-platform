import Link from 'next/link';
import { FaArrowLeft, FaSave, FaUserShield } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import Input from '@/components/auth/Input';
import { createSindico } from '@/actions/sindicoActions';

type SearchParams = Promise<{
    condominio_id?: string;
    error?: string;
}>;

type CondominioOption = {
    id: string;
    nome: string;
};

export default async function NovoSindicoPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const condominioId = params.condominio_id || '';
    const errorMessage = params.error ? decodeURIComponent(params.error) : '';

    const supabase = await createClient();

    const { data: condominiosRaw } = await supabase
        .from('condominios')
        .select('id, nome')
        .order('nome', { ascending: true });

    const condominios = (condominiosRaw || []) as CondominioOption[];

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/sindicos" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Novo Síndico</h1>
                    <p className="text-slate-500 text-sm">Crie o acesso do síndico e vincule a um condomínio</p>
                </div>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <form action={createSindico} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 flex items-center gap-2">
                    <FaUserShield className="h-4 w-4" />
                    O síndico terá acesso à área /sindico para visualizar os condomínios vinculados.
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                    <select
                        name="condominio_id"
                        defaultValue={condominioId}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    >
                        <option value="">Selecione um condomínio...</option>
                        {condominios.map((cond) => (
                            <option key={cond.id} value={cond.id}>
                                {cond.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Nome do Síndico (opcional)</label>
                    <input
                        type="text"
                        name="nome"
                        placeholder="Ex.: João Síndico"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email de Login</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="sindico@condominio.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Input
                        id="senha-sindico"
                        type="password"
                        name="senha"
                        label="Senha Inicial"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <FaSave className="h-4 w-4" /> Criar Síndico
                </button>
            </form>
        </div>
    );
}

