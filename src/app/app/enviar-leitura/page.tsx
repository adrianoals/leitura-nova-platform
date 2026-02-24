import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCamera, FaCheckCircle, FaCloudUploadAlt, FaFire, FaInfoCircle, FaTint, FaThermometerHalf } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/server';
import { enviarLeituraMorador } from '@/actions/moradorActions';
import {
    formatMes,
    formatTipo,
    getMesAtual,
    getMoradorContextByAuthUserId,
    getTiposPermitidos,
    type TipoLeitura,
} from '@/lib/morador';

type SearchParams = Promise<{ success?: string; error?: string }>;

type LeituraTipoRow = {
    tipo: TipoLeitura;
};

function getTipoIcon(tipo: TipoLeitura) {
    if (tipo === 'gas') return FaFire;
    if (tipo === 'agua_quente') return FaThermometerHalf;
    return FaTint;
}

export default async function EnviarLeituraPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
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
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Sua conta ainda não está vinculada a uma unidade.</p>
                    <Link href="/app" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const mesAtual = getMesAtual();
    const tiposPermitidos = getTiposPermitidos(context);
    const success = params.success === '1';
    const errorMessage = params.error ? decodeURIComponent(params.error) : '';

    if (tiposPermitidos.length === 0) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
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
        .eq('condominio_id', context.condominioId)
        .eq('mes_referencia', mesAtual)
        .maybeSingle();

    const mesFechado = fechamento?.fechado === true;
    const envioHabilitado = context.envioLeituraMoradorHabilitado;

    const { data: leiturasMesRaw } = await supabase
        .from('leituras_mensais')
        .select('tipo')
        .eq('unidade_id', context.unidadeId)
        .eq('mes_referencia', mesAtual);

    const leiturasMes = (leiturasMesRaw || []) as unknown as LeituraTipoRow[];
    const tiposEnviados = new Set(leiturasMes.map((l) => l.tipo));

    if (!envioHabilitado) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
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
                    <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
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

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                    <p className="text-slate-500 text-sm">Mes {formatMes(mesAtual)}</p>
                </div>
            </div>

            {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
                    <FaCheckCircle className="h-4 w-4" />
                    Leitura enviada com sucesso.
                </div>
            )}

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <form action={enviarLeituraMorador} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Tipo de leitura</label>
                    <select
                        name="tipo"
                        defaultValue={tiposPermitidos[0] || ''}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    >
                        {tiposPermitidos.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {formatTipo(tipo)} {tiposEnviados.has(tipo) ? '(ja enviada neste mes)' : '(pendente)'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="medicao" className="block text-sm font-medium text-slate-700">
                        Medicao (m3)
                    </label>
                    <input
                        id="medicao"
                        name="medicao"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 123.45"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="fotos" className="block text-sm font-medium text-slate-700">
                        Fotos do medidor
                    </label>
                    <div className="rounded-xl border-2 border-dashed border-slate-300 p-4">
                        <label htmlFor="fotos" className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            <FaCloudUploadAlt className="h-4 w-4" />
                            Selecionar fotos
                        </label>
                        <input
                            id="fotos"
                            name="fotos"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            required
                            className="mt-3 w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-vscode-blue file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-vscode-blue-dark"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Envie ao menos 1 foto legivel (JPG, PNG ou WebP).
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-vscode-blue py-3.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all"
                >
                    <FaCamera className="h-4 w-4" />
                    Enviar leitura
                </button>
            </form>

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
