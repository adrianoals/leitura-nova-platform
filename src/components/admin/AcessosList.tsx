import Link from 'next/link';

interface Acesso {
    id: string;
    authUserId: string;
    nome: string | null;
    tipo: 'proprietario' | 'locatario' | null;
    ativo: boolean;
    createdAt: string;
}

interface Props {
    acessos: Acesso[];
    unidadeId: string;
}

const tipoLabel = {
    proprietario: 'Proprietário',
    locatario: 'Locatário',
} as const;

export default function AcessosList({ acessos, unidadeId }: Props) {
    if (acessos.length === 0) {
        return <p className="text-sm text-slate-500 italic">Nenhum usuário cadastrado nesta unidade.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-left">Nome</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-left">Criado em</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {acessos.map((a) => (
                        <tr key={a.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 text-slate-900">
                                {a.nome ?? <span className="text-slate-400 italic">(sem nome)</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                                {a.tipo ? tipoLabel[a.tipo] : <span className="text-slate-400 italic">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${a.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {a.ativo ? 'Ativo' : 'Desabilitado'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 text-right">
                                <Link
                                    href={`/admin/moradores/${unidadeId}/${a.id}`}
                                    className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium"
                                >
                                    Editar
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
