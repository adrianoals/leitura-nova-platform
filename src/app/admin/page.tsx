import Link from 'next/link';
import { FaBuilding, FaDoorOpen, FaPlus, FaClipboardList, FaArrowRight, FaKey } from 'react-icons/fa';
import StatsCard from '@/components/admin/StatsCard';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirecionar para login admin se não estiver autenticado
        // Em um app real, verificaríamos também a role do usuário (admin vs morador)
        const { redirect } = await import('next/navigation');
        redirect('/login/admin');
    }

    // Buscar dados reais do banco
    // 1. Total de Condomínios
    const { count: totalCondominios } = await supabase
        .from('condominios')
        .select('*', { count: 'exact', head: true });

    // 2. Total de Unidades
    const { count: totalUnidades } = await supabase
        .from('unidades')
        .select('*', { count: 'exact', head: true });

    // 3. Leituras concluídas no mês atual
    const date = new Date();
    const mesReferencia = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const { count: leiturasEsteMes } = await supabase
        .from('leituras_mensais')
        .select('*', { count: 'exact', head: true })
        .eq('mes_referencia', mesReferencia);

    const leiturasRealizadas = leiturasEsteMes || 0;

    // 4. Lista de condomínios recentes
    const { data: condominios } = await supabase
        .from('condominios')
        .select(`
            id,
            nome,
            tem_agua,
            tem_gas,
            unidades (count)
        `)
        .limit(5)
        .order('created_at', { ascending: false });

    // Ajustando os dados para o formato da tabela
    const condominiosList = (condominios || []).map(c => ({
        id: c.id,
        nome: c.nome,
        temAgua: c.tem_agua,
        temGas: c.tem_gas,
        totalUnidades: c.unidades?.[0]?.count || 0, // Supabase retorna count assim quando pedido no select
    }));

    const quickActions = [
        { label: 'Novo Condomínio', href: '/admin/condominios/novo', icon: FaPlus, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
        { label: 'Inserir Leitura', href: '/admin/leituras/nova', icon: FaClipboardList, color: 'text-green-600 bg-green-50 hover:bg-green-100' },
        { label: 'Ver Unidades', href: '/admin/unidades', icon: FaDoorOpen, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
        { label: 'Moradores', href: '/admin/moradores', icon: FaKey, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
                <p className="text-slate-500 mt-1">Visão geral operacional do sistema</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard
                    title="Condomínios"
                    value={totalCondominios || 0}
                    icon={<FaBuilding className="h-6 w-6" />}
                    color="blue"
                />
                <StatsCard
                    title="Unidades"
                    value={totalUnidades || 0}
                    icon={<FaDoorOpen className="h-6 w-6" />}
                    color="green"
                />
                <StatsCard
                    title="Leituras Concluídas"
                    value={leiturasRealizadas}
                    icon={<FaClipboardList className="h-6 w-6" />}
                    color="orange"
                    subtitle={`Referência: ${mesReferencia}`}
                />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map(action => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-all duration-200 ${action.color}`}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {action.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recent condos */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Condomínios Recentes</h2>
                    <Link href="/admin/condominios" className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium flex items-center gap-1">
                        Ver todos <FaArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Nome</th>
                                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Unidades</th>
                                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Água</th>
                                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Gás</th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {condominiosList.map(cond => (
                                <tr key={cond.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900">{cond.nome}</p>
                                    </td>
                                    <td className="text-center px-4 py-4 text-sm text-slate-600 hidden sm:table-cell">
                                        {/* @ts-ignore */}
                                        {cond.totalUnidades}
                                    </td>
                                    <td className="text-center px-4 py-4 hidden md:table-cell">
                                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${cond.temAgua ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                    </td>
                                    <td className="text-center px-4 py-4 hidden md:table-cell">
                                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${cond.temGas ? 'bg-orange-500' : 'bg-slate-300'}`} />
                                    </td>
                                    <td className="text-right px-6 py-4">
                                        <Link href={`/admin/condominios/${cond.id}`} className="text-sm text-vscode-blue hover:text-vscode-blue-dark font-medium">
                                            Gerenciar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {condominiosList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Nenhum condomínio encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
