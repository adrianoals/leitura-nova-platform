import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCheckCircle, FaFire, FaInfoCircle, FaTint, FaThermometerHalf } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { resolveUnidadeContextById } from '@/lib/adminPreview';
import LeituraSubmitModal from '@/components/morador/LeituraSubmitModal';
import EnviarLeituraForm from '@/components/morador/EnviarLeituraForm';
import {
    formatMes,
    formatTipo,
    getMesAtual,
    getTiposPermitidos,
    type TipoLeitura,
} from '@/lib/morador';

type LeituraTipoRow = {
    tipo: TipoLeitura;
    criado_por_morador: boolean;
};

function getTipoIcon(tipo: TipoLeitura) {
    if (tipo === 'gas') return FaFire;
    if (tipo === 'agua_quente') return FaThermometerHalf;
    return FaTint;
}

interface PageProps {
    params: Promise<{ unidadeId: string }>;
}

export default async function EnviarLeituraPage({ params }: PageProps) {
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

    const mesAtual = getMesAtual();
    const tiposPermitidos = getTiposPermitidos({
        temAgua: vinculo.condominio.temAgua,
        temAguaQuente: vinculo.condominio.temAguaQuente,
        temGas: vinculo.condominio.temGas,
    } as never);

    if (tiposPermitidos.length === 0) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/app/u/${vinculo.unidadeId}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                        <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    Sua unidade nao possui tipos de leitura habilitados.
                </div>
            </div>
        );
    }

    const { data: fechamento } = await supabase
        .from('fechamentos_mensais')
        .select('fechado')
        .eq('condominio_id', vinculo.condominio.id)
        .eq('mes_referencia', mesAtual)
        .maybeSingle();

    const mesFechado = fechamento?.fechado === true;
    const envioHabilitado = vinculo.condominio.envioLeituraMoradorHabilitado;

    const { data: leiturasMesRaw } = await supabase
        .from('leituras_mensais')
        .select('tipo, criado_por_morador')
        .eq('unidade_id', vinculo.unidadeId)
        .eq('mes_referencia', mesAtual);

    const leiturasMes = (leiturasMesRaw || []) as unknown as LeituraTipoRow[];
    const tiposEnviados = new Set(leiturasMes.map((l) => l.tipo));
    const tiposLancadosPorAdmin = new Set(
        leiturasMes.filter((l) => !l.criado_por_morador).map((l) => l.tipo)
    );
    const tiposEnviadosPorMorador = new Set(
        leiturasMes.filter((l) => l.criado_por_morador).map((l) => l.tipo)
    );
    const tiposPendentes = tiposPermitidos.filter((t) => !tiposEnviados.has(t));
    const todosEnviados = tiposPermitidos.length > 0 && tiposPendentes.length === 0;
    const todosLancadosSoPeloAdmin =
        todosEnviados
        && tiposPermitidos.every((t) => tiposLancadosPorAdmin.has(t))
        && tiposEnviadosPorMorador.size === 0;

    if (!envioHabilitado) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/app/u/${vinculo.unidadeId}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                        <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    O envio de leitura nao esta habilitado para sua unidade.
                </div>
            </div>
        );
    }

    if (mesFechado) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/app/u/${vinculo.unidadeId}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                        <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    Este mes ja foi fechado. Nao e mais possivel enviar leitura.
                </div>
            </div>
        );
    }

    if (todosEnviados) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/app/u/${vinculo.unidadeId}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        <FaArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                        <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 space-y-3">
                    <div className="flex items-start gap-3">
                        <FaCheckCircle className="h-5 w-5 mt-0.5 text-green-600 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-900">
                                {todosLancadosSoPeloAdmin
                                    ? `As leituras de ${formatMes(mesAtual)} já foram lançadas pela administração.`
                                    : `Todas as leituras de ${formatMes(mesAtual)} já foram enviadas.`}
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                Para corrigir alguma leitura, entre em contato com a administração.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/app/u/${vinculo.unidadeId}/leituras`}
                        className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all hover:scale-[1.02]"
                    >
                        Ver minhas leituras
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/app/u/${vinculo.unidadeId}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                    <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                </div>
            </div>

            <Suspense fallback={null}>
                <LeituraSubmitModal unidadeId={vinculo.unidadeId} />
            </Suspense>

            <EnviarLeituraForm
                unidadeId={vinculo.unidadeId}
                tiposPermitidos={tiposPermitidos}
                tiposEnviados={Array.from(tiposEnviados)}
                tiposLancadosPorAdmin={Array.from(tiposLancadosPorAdmin)}
                defaultTipo={tiposPendentes[0] || ''}
            />

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 flex items-start gap-2">
                <FaInfoCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                    E permitido apenas um envio por tipo no mes atual. Se precisar corrigir, contate a administracao.
                </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-700 mb-2">Tipos habilitados para sua unidade</p>
                <div className="flex flex-wrap gap-2">
                    {tiposPermitidos.map((tipo) => {
                        const Icon = getTipoIcon(tipo);
                        return (
                            <span key={tipo} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                                <Icon className="h-3.5 w-3.5" />
                                {formatTipo(tipo)}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
