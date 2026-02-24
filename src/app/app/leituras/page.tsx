import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaChevronRight, FaFire, FaTint, FaThermometerHalf } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import {
    formatData,
    formatMes,
    formatTipo,
    formatValor,
    getMesLimite12Meses,
    getMoradorContextByAuthUserId,
    type TipoLeitura,
} from '@/lib/morador';

type LeituraListRow = {
    id: string;
    tipo: TipoLeitura;
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
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

export default async function LeiturasPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const context = await getMoradorContextByAuthUserId(supabase as never, user.id);
    if (!context) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Sua conta ainda não está vinculada a uma unidade.</p>
                    <Link href="/app" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const { data: leiturasRaw } = await supabase
        .from('leituras_mensais')
        .select('id, tipo, mes_referencia, data_leitura, medicao, valor')
        .eq('unidade_id', context.unidadeId)
        .gte('mes_referencia', getMesLimite12Meses())
        .order('mes_referencia', { ascending: false })
        .order('data_leitura', { ascending: false })
        .limit(120);

    const leituras = (leiturasRaw || []) as unknown as LeituraListRow[];
    const meses = Array.from(new Set(leituras.map((l) => l.mes_referencia)));

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/app"
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
                                href={`/app/leituras/${mes}`}
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
                                        return (
                                            <div
                                                key={leitura.id}
                                                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                                            >
                                                <Icon className={`h-3.5 w-3.5 ${getTipoColor(leitura.tipo)}`} />
                                                <span className="font-medium">{formatTipo(leitura.tipo)}</span>
                                                <span>{Number(leitura.medicao)} m3</span>
                                                <span>{formatValor(Number(leitura.valor))}</span>
                                                <span className="text-slate-500">({formatData(leitura.data_leitura)})</span>
                                            </div>
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

