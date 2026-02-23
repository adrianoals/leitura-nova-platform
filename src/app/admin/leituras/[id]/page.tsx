import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaDoorOpen, FaFire, FaImage, FaTint } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ condominio_id?: string; mes?: string }>;

type LeituraDetail = {
    id: string;
    tipo: 'agua' | 'agua_fria' | 'agua_quente' | 'gas';
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    unidade:
        | {
              id: string;
              bloco: string;
              apartamento: string;
              condominio: { id: string; nome: string } | { id: string; nome: string }[] | null;
          }[]
        | null;
    fotos_leitura: { id: string; storage_path: string; created_at: string }[] | null;
};

function formatMes(mesRef: string) {
    const [ano, mes] = mesRef.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes, 10) - 1] || mes}/${ano}`;
}

function formatData(data: string) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatTipo(tipo: LeituraDetail['tipo']) {
    if (tipo === 'agua_fria') return 'Agua Fria';
    if (tipo === 'agua_quente') return 'Agua Quente';
    if (tipo === 'gas') return 'Gas';
    return 'Agua';
}

function getTipoBadge(tipo: LeituraDetail['tipo']) {
    if (tipo === 'agua_fria') {
        return {
            className: 'bg-cyan-100 text-cyan-700',
            icon: <FaTint className="h-3 w-3" />,
        };
    }

    if (tipo === 'agua_quente') {
        return {
            className: 'bg-rose-100 text-rose-700',
            icon: <FaTint className="h-3 w-3" />,
        };
    }

    if (tipo === 'gas') {
        return {
            className: 'bg-amber-100 text-amber-700',
            icon: <FaFire className="h-3 w-3" />,
        };
    }

    return {
        className: 'bg-blue-100 text-blue-700',
        icon: <FaTint className="h-3 w-3" />,
    };
}

function getCondominioNome(
    condominio: { id: string; nome: string } | { id: string; nome: string }[] | null | undefined
) {
    if (!condominio) return 'Condominio';
    if (Array.isArray(condominio)) return condominio[0]?.nome || 'Condominio';
    return condominio.nome;
}

function buildBackHref(condominioId?: string, mes?: string) {
    const query = new URLSearchParams();
    if (condominioId) query.set('condominio_id', condominioId);
    if (mes && /^\d{4}-\d{2}$/.test(mes)) query.set('mes', mes);
    const qs = query.toString();
    return qs ? `/admin/leituras?${qs}` : '/admin/leituras';
}

export default async function LeituraDetailPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const query = await searchParams;
    const backHref = buildBackHref(query.condominio_id, query.mes);
    const supabase = await createClient();

    const { data: leituraRaw } = await supabase
        .from('leituras_mensais')
        .select(`
            id,
            tipo,
            mes_referencia,
            data_leitura,
            medicao,
            valor,
            unidade:unidades (
                id,
                bloco,
                apartamento,
                condominio:condominios (
                    id,
                    nome
                )
            ),
            fotos_leitura (
                id,
                storage_path,
                created_at
            )
        `)
        .eq('id', id)
        .maybeSingle();

    const leitura = (leituraRaw || null) as LeituraDetail | null;

    if (!leitura) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href={backHref}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Detalhe da Leitura</h1>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    Leitura nao encontrada.
                </div>
            </div>
        );
    }

    const unidade = leitura.unidade?.[0];
    const condominioNome = getCondominioNome(unidade?.condominio);
    const badge = getTipoBadge(leitura.tipo);
    const fotos = leitura.fotos_leitura || [];

    let signedUrls = new Map<string, string>();
    if (fotos.length > 0) {
        try {
            const adminClient = createAdminClient();
            const paths = fotos.map((f) => f.storage_path);
            const { data } = await adminClient.storage.from('leitura-fotos').createSignedUrls(paths, 60 * 60);
            data?.forEach((item, index) => {
                if (item?.signedUrl) {
                    signedUrls.set(paths[index], item.signedUrl);
                }
            });
        } catch {
            signedUrls = new Map<string, string>();
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={backHref}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Detalhe da Leitura</h1>
                    <p className="text-sm text-slate-500">{condominioNome}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
                        {badge.icon} {formatTipo(leitura.tipo)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        <FaCalendarAlt className="h-3 w-3" /> {formatMes(leitura.mes_referencia)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        <FaDoorOpen className="h-3 w-3" /> {unidade ? `${unidade.bloco} - ${unidade.apartamento}` : 'Unidade'}
                    </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Data leitura</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{formatData(leitura.data_leitura)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Medicao</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{Number(leitura.medicao)} m3</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase text-slate-500">Valor</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{formatValor(Number(leitura.valor))}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <FaImage className="h-4 w-4 text-slate-500" />
                    <h2 className="text-lg font-semibold text-slate-900">Fotos da Leitura</h2>
                </div>

                {fotos.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhuma foto vinculada a esta leitura.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {fotos.map((foto) => {
                            const signedUrl = signedUrls.get(foto.storage_path);
                            return (
                                <div key={foto.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    {signedUrl ? (
                                        <a href={signedUrl} target="_blank" rel="noreferrer">
                                            <img
                                                src={signedUrl}
                                                alt="Foto da leitura"
                                                className="h-48 w-full object-cover"
                                            />
                                        </a>
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-slate-400">
                                            <FaImage className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 px-3 py-2">
                                        <p className="truncate text-xs text-slate-500">{foto.storage_path}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
