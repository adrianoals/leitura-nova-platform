
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaHistory, FaCamera } from 'react-icons/fa';
import DashboardCard from '@/components/morador/DashboardCard';
import ConsumoChart from '@/components/morador/ConsumoChart';
import { createClient } from '@/lib/supabase/server';
import { LeituraMensal, Condominio } from '@/types';
import { isLeituraOpen } from '@/utils/dateUtils';

// Helper para converter dados do banco para o tipo do front
function normalizeLeitura(l: any): LeituraMensal {
    return {
        id: l.id,
        tipo: l.tipo,
        mesReferencia: l.mes_referencia,
        dataLeitura: l.data_leitura,
        medicao: Number(l.medicao),
        valor: Number(l.valor),
        fotos: [], // TODO: Buscar fotos se necessário
        criadoPorMorador: l.criado_por_morador
    };
}

export default async function AppDashboard() {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Buscar dados do Morador + Unidade + Condominio
    const { data: morador } = await supabase
        .from('moradores')
        .select(`
            *,
            unidade:unidades (
                *,
                condominio:condominios (*)
            )
        `)
        .eq('auth_user_id', user.id)
        .single();

    if (!morador) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Conta criada!</h1>
                <p className="text-slate-600 max-w-md">
                    Seu usuário ainda não está vinculado a nenhuma unidade.
                    Entre em contato com o síndico para liberar seu acesso.
                </p>
                <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                    Seu ID de usuário: <br />
                    <code className="font-mono font-bold mt-1 block">{user.id}</code>
                </div>
            </div>
        );
    }

    const { unidade } = morador;
    const { condominio } = unidade;

    // Mapear condominio para tipo Condominio (snake_case -> camelCase)
    const condominioMapped: Condominio = {
        id: condominio.id,
        nome: condominio.nome,
        temAgua: condominio.tem_agua,
        temAguaQuente: condominio.tem_agua_quente,
        temGas: condominio.tem_gas,
        envioLeituraMoradorHabilitado: condominio.envio_leitura_morador_habilitado,
        leituraDiaInicio: condominio.leitura_dia_inicio,
        leituraDiaFim: condominio.leitura_dia_fim,
    };

    const podeEnviarLeitura = isLeituraOpen(condominioMapped);

    // 3. Buscar últimas leituras (24 registros para cobrir todos tipos)
    const { data: leiturasRaw } = await supabase
        .from('leituras_mensais')
        .select('*')
        .eq('unidade_id', unidade.id)
        .order('data_leitura', { ascending: false })
        .limit(24);

    const leituras = (leiturasRaw || []).map(normalizeLeitura);

    const leituraAgua = leituras.find(l => l.tipo === 'agua');
    const leituraAguaFria = leituras.find(l => l.tipo === 'agua_fria');
    const leituraAguaQuente = leituras.find(l => l.tipo === 'agua_quente');
    const leituraGas = leituras.find(l => l.tipo === 'gas');

    const leiturasAguaChart = leituras.filter(l => l.tipo === 'agua' || l.tipo === 'agua_fria');
    const leiturasGasChart = leituras.filter(l => l.tipo === 'gas');

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Resumo da sua unidade — {unidade.bloco ? `${unidade.bloco} • ` : ''}{unidade.apartamento}
                </p>
                <div className="text-sm text-slate-400 mt-1">
                    Condomínio {condominio.nome}
                </div>
            </div>

            {/* Reading cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Água (sistema antigo/único) */}
                {condominio.tem_agua && !condominio.tem_agua_quente && (
                    <DashboardCard tipo="agua" leitura={leituraAgua} />
                )}

                {/* Água Fria & Quente */}
                {condominio.tem_agua_quente && (
                    <>
                        <DashboardCard
                            tipo="agua_fria"
                            leitura={leituraAguaFria}
                            label="Água Fria"
                        />
                        <DashboardCard
                            tipo="agua_quente"
                            leitura={leituraAguaQuente}
                            label="Água Quente"
                        />
                    </>
                )}

                {/* Gás */}
                {condominio.tem_gas && (
                    <DashboardCard tipo="gas" leitura={leituraGas} />
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
                <Link
                    href="/app/leituras"
                    className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                    <FaHistory className="h-4 w-4" />
                    Ver histórico completo
                </Link>

                {podeEnviarLeitura && (
                    <Link
                        href="/app/enviar-leitura"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-vscode-blue px-5 py-3 text-sm font-semibold text-vscode-blue hover:bg-vscode-blue/5 transition-all duration-200"
                    >
                        <FaCamera className="h-4 w-4" />
                        Enviar leitura
                    </Link>
                )}
            </div>

            {/* Consumption chart */}
            <ConsumoChart
                leiturasAgua={leiturasAguaChart}
                leiturasGas={leiturasGasChart}
                mostrarGas={condominio.tem_gas}
            />
        </div>
    );
}
