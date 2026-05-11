import Link from 'next/link';
import { FaBuilding, FaArrowRight } from 'react-icons/fa';

interface VinculoCard {
    unidadeId: string;
    condominioNome: string;
    bloco: string;
    apartamento: string;
    tipo: 'proprietario' | 'locatario' | null;
}

interface Props {
    vinculos: VinculoCard[];
}

export default function UnitSelectorPage({ vinculos }: Props) {
    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Selecione uma unidade</h1>
            <p className="text-slate-600 mb-8">Você tem acesso a {vinculos.length} unidades. Escolha qual quer acessar agora.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vinculos.map((v) => (
                    <Link
                        key={v.unidadeId}
                        href={`/app/u/${v.unidadeId}`}
                        className="group p-5 rounded-lg border border-slate-200 bg-white hover:border-vscode-blue hover:shadow-sm transition"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-vscode-blue">
                                <FaBuilding />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-900">{v.condominioNome}</div>
                                <div className="text-sm text-slate-600">Apt {v.bloco ? `${v.bloco}/` : ''}{v.apartamento}</div>
                                {v.tipo && (
                                    <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                                        {v.tipo}
                                    </div>
                                )}
                            </div>
                            <FaArrowRight className="text-slate-400 group-hover:text-vscode-blue transition" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
