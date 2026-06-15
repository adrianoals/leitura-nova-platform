import { Fragment } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaChevronRight, FaFire, FaTint, FaThermometerHalf } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { resolveUnidadeContextById } from '@/lib/adminPreview';
import {
    formatData,
    formatMedicao,
    formatMes,
    formatTipo,
    formatValor,
    getMesLimite12Meses,
    type TipoLeitura,
} from '@/lib/morador';

type LeituraListRow = {
    id: string;
    tipo: TipoLeitura;
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    consumo: number | null;
    valor: number;
};

function getTipoIcon(tipo: TipoLeitura) {
    if (tipo === 'gas') return FaFire;
    if (tipo === 'agua_quente') return FaThermometerHalf;
    return FaTint;
}

function getTipoColor(tipo: TipoLeitura) {
    if (tipo === 'gas') return 'text-orange-600';
    if (tipo === 'agua_quente') return 'text-rose-600';
    if (tipo === 'agua_fria') return 'text-cyan-600';
    return 'text-blue-600';
}

interface PageProps {
    params: Promise<{ unidadeId: string }>;
}

export default async function LeiturasPage({ params }: PageProps) {
    const { unidadeId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const vinculo = await resolveUnidadeContextById(supabase as never, user.id, unidadeId);
    if (!vinculo) return null;

    const { data: leiturasRaw } = await supabase
        .from('leituras_mensais')
        .select('id, tipo, mes_referencia, data_leitura, medicao, consumo, valor')
        .eq('unidade_id', vinculo.unidadeId)
        .gte('mes_referencia', getMesLimite12Meses())
        .order('mes_referencia', { ascending: false })
        .order('data_leitura', { ascending: false })
        .limit(120);

    const leituras = ((leiturasRaw || []) as unknown as LeituraListRow[]).map((leitura) => ({
        ...leitura,
        medicao: Number(leitura.medicao),
        consumo: leitura.consumo === null || leitura.consumo === undefined ? null : Number(leitura.consumo),
        valor: Number(leitura.valor),
    }));
    const meses = Array.from(new Set(leituras.map((l) => l.mes_referencia)));

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/app/u/${unidadeId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Historico de Leituras</h1>
                    <p className="text-slate-500 text-sm">Ultimos 12 meses publicados</p>
                </div>
            </div>

            {meses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                    Nenhuma leitura disponivel para os ultimos 12 meses.
                </div>
            ) : (
                <div className="space-y-3">
                    {meses.map((mes) => {
                        const leiturasMes = leituras.filter((l) => l.mes_referencia === mes);

                        return (
                            <Link
                                key={mes}
                                href={`/app/u/${unidadeId}/leituras/${mes}`}
                                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-vscode-blue/30 transition-all group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-vscode-blue/10 transition-colors">
                                            <FaCalendarAlt className="h-5 w-5 text-slate-500 group-hover:text-vscode-blue transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{formatMes(mes)}</p>
                                            <p className="text-xs text-slate-500">
                                                {leiturasMes.length} leitura(s)
                                            </p>
                                        </div>
                                    </div>

                                    <FaChevronRight className="h-4 w-4 text-slate-400 group-hover:text-vscode-blue transition-colors" />
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {leiturasMes.map((leitura) => {
                                        const Icon = getTipoIcon(leitura.tipo);
                                        const consumoStr = leitura.consumo === null || leitura.consumo === undefined
                                            ? '-'
                                            : `${formatMedicao(Number(leitura.consumo))} m3`;
                                        return (
                                            <Fragment key={leitura.id}>
                                                {/* Mobile: mini-card empilhado */}
                                                <div className="sm:hidden w-full rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`h-4 w-4 ${getTipoColor(leitura.tipo)}`} />
                                                        <span className="font-semibold text-sm text-slate-900">{formatTipo(leitura.tipo)}</span>
                                                    </div>
                                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Medicao</p>
                                                            <p className="font-medium text-slate-800">{formatMedicao(Number(leitura.medicao))} m3</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-wide text-slate-500">Consumo</p>
                                                            <p className="font-medium text-slate-800">{consumoStr}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
                                                        <span className="font-semibold text-slate-900">{formatValor(Number(leitura.valor))}</span>
                                                        <span className="text-slate-500">{formatData(leitura.data_leitura)}</span>
                                                    </div>
                                                </div>

                                                {/* Desktop/tablet: chip pílula */}
                                                <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                                                    <Icon className={`h-3.5 w-3.5 ${getTipoColor(leitura.tipo)}`} />
                                                    <span className="font-medium">{formatTipo(leitura.tipo)}</span>
                                                    <span>Medicao {formatMedicao(Number(leitura.medicao))} m3</span>
                                                    <span>Consumo {consumoStr}</span>
                                                    <span>{formatValor(Number(leitura.valor))}</span>
                                                    <span className="text-slate-500">({formatData(leitura.data_leitura)})</span>
                                                </div>
                                            </Fragment>
                                        );
                                    })}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
