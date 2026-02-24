import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaFire, FaImage, FaTachometerAlt, FaThermometerHalf, FaTint } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import {
    formatData,
    formatMes,
    formatTipo,
    formatUnidade,
    formatValor,
    getMesLimite12Meses,
    getMoradorContextByAuthUserId,
    isMesValido,
    type TipoLeitura,
} from '@/lib/morador';

type Params = Promise<{ mes: string }>;

type LeituraDetalheRow = {
    id: string;
    tipo: TipoLeitura;
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    fotos_leitura: { storage_path: string }[] | null;
};

function getTipoIcon(tipo: TipoLeitura) {
    if (tipo === 'gas') return FaFire;
    if (tipo === 'agua_quente') return FaThermometerHalf;
    return FaTint;
}

function getTipoCardClass(tipo: TipoLeitura) {
    if (tipo === 'gas') return 'border-orange-200';
    if (tipo === 'agua_quente') return 'border-rose-200';
    if (tipo === 'agua_fria') return 'border-cyan-200';
    return 'border-blue-200';
}

function getTipoIconBgClass(tipo: TipoLeitura) {
    if (tipo === 'gas') return 'bg-orange-100 text-orange-600';
    if (tipo === 'agua_quente') return 'bg-rose-100 text-rose-600';
    if (tipo === 'agua_fria') return 'bg-cyan-100 text-cyan-700';
    return 'bg-blue-100 text-blue-600';
}

export default async function LeituraMesPage({ params }: { params: Params }) {
    const { mes } = await params;

    if (!isMesValido(mes)) {
        redirect('/app/leituras');
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const context = await getMoradorContextByAuthUserId(supabase as never, user.id);
    if (!context) {
        redirect('/app');
    }

    if (mes < getMesLimite12Meses()) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/app/leituras"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">{formatMes(mes)}</h1>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    Mes fora da janela de 12 meses disponiveis.
                </div>
            </div>
        );
    }

    const { data: leiturasRaw } = await supabase
        .from('leituras_mensais')
        .select(`
            id,
            tipo,
            mes_referencia,
            data_leitura,
            medicao,
            valor,
            fotos_leitura(storage_path)
        `)
        .eq('unidade_id', context.unidadeId)
        .eq('mes_referencia', mes)
        .order('tipo', { ascending: true });

    const leituras = (leiturasRaw || []) as unknown as LeituraDetalheRow[];
    const paths = leituras.flatMap((l) => (l.fotos_leitura || []).map((f) => f.storage_path));
    const signedUrlByPath = new Map<string, string>();

    if (paths.length > 0) {
        const uniquePaths = Array.from(new Set(paths));
        const { data: signedData } = await supabase.storage.from('leitura-fotos').createSignedUrls(uniquePaths, 60 * 60);
        for (const item of signedData || []) {
            if (item.path && item.signedUrl) {
                signedUrlByPath.set(item.path, item.signedUrl);
            }
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/app/leituras"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{formatMes(mes)}</h1>
                    <p className="text-slate-500 text-sm">{formatUnidade(context.bloco, context.apartamento)}</p>
                </div>
            </div>

            {leituras.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    Nenhuma leitura encontrada para este mes.
                </div>
            ) : (
                leituras.map((leitura) => {
                    const Icon = getTipoIcon(leitura.tipo);
                    const fotos = leitura.fotos_leitura || [];

                    return (
                        <div key={leitura.id} className={`rounded-2xl border-2 ${getTipoCardClass(leitura.tipo)} bg-white p-6 shadow-sm`}>
                            <div className="mb-6 flex items-center gap-3">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getTipoIconBgClass(leitura.tipo)}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{formatTipo(leitura.tipo)}</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <FaCalendarAlt className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">Data da leitura</p>
                                        <p className="text-base font-semibold text-slate-900">{formatData(leitura.data_leitura)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FaTachometerAlt className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">Medicao</p>
                                        <p className="text-base font-semibold text-slate-900">{Number(leitura.medicao)} m3</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Valor</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatValor(Number(leitura.valor))}</p>
                                </div>
                            </div>

                            {fotos.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaImage className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-700">Fotos da leitura</p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {fotos.map((foto) => {
                                            const signedUrl = signedUrlByPath.get(foto.storage_path);
                                            return signedUrl ? (
                                                <a
                                                    key={foto.storage_path}
                                                    href={signedUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block overflow-hidden rounded-xl border border-slate-200"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={signedUrl} alt="Foto da leitura" className="h-32 w-full object-cover" />
                                                </a>
                                            ) : (
                                                <div key={foto.storage_path} className="h-32 rounded-xl border border-slate-200 bg-slate-100" />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

