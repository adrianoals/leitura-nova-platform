import { FaTint, FaFire, FaCalendarAlt, FaTachometerAlt, FaThermometerHalf } from 'react-icons/fa';
import { LeituraMensal } from '@/types';
import { formatMedicao } from '@/lib/morador';

// Helper de formatação simples (agora que removemos a dependência direta do mock)
function formatarData(data: string) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarConsumoDelta(consumoDelta?: number | null) {
    if (consumoDelta === null || consumoDelta === undefined) return '-';
    const prefix = consumoDelta > 0 ? '+' : '';
    return `${prefix}${formatMedicao(consumoDelta)} m3`;
}

interface DashboardCardProps {
    tipo: 'agua' | 'gas' | 'agua_fria' | 'agua_quente';
    leitura?: LeituraMensal;
    consumoDelta?: number | null;
    label?: string; // Opcional: overwrite do label automático
    icon?: React.ElementType; // Opcional: overwrite do ícone
}

export default function DashboardCard({ tipo, leitura, consumoDelta, label, icon }: DashboardCardProps) {
    // Definições padrão baseadas no tipo
    let defaultLabel = '';
    let DefaultIcon = FaTint;
    let gradientClass = '';
    let iconBgClass = '';

    switch (tipo) {
        case 'agua':
            defaultLabel = 'Água';
            DefaultIcon = FaTint;
            gradientClass = 'from-blue-500 to-cyan-500';
            iconBgClass = 'bg-blue-100 text-blue-600';
            break;
        case 'agua_fria':
            defaultLabel = 'Água Fria';
            DefaultIcon = FaTint;
            gradientClass = 'from-blue-500 to-cyan-500'; // Azul
            iconBgClass = 'bg-blue-100 text-blue-600';
            break;
        case 'agua_quente':
            defaultLabel = 'Água Quente';
            DefaultIcon = FaThermometerHalf; // Ícone diferente para água quente
            gradientClass = 'from-red-500 to-orange-500'; // Vermelho/Laranja
            iconBgClass = 'bg-red-100 text-red-600';
            break;
        case 'gas':
            defaultLabel = 'Gás';
            DefaultIcon = FaFire;
            gradientClass = 'from-orange-500 to-amber-500';
            iconBgClass = 'bg-orange-100 text-orange-600';
            break;
    }

    // Se props foram passadas, use-as, senão use o default
    const DisplayLabel = label || defaultLabel;
    const DisplayIcon = icon || DefaultIcon;

    if (!leitura) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
                        <DisplayIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{DisplayLabel}</h3>
                </div>
                <p className="text-sm text-slate-500 italic">
                    Leitura do mês ainda não está atualizada.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
                        <DisplayIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{DisplayLabel}</h3>
                </div>
                <span className={`rounded-full bg-gradient-to-r ${gradientClass} px-3 py-1 text-xs font-semibold text-white`}>
                    Mês Atual
                </span>
            </div>

            {/* Stats */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FaCalendarAlt className="h-3 w-3" />
                        Data
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatarData(leitura.dataLeitura)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FaTachometerAlt className="h-3 w-3" />
                        Medicao
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{formatMedicao(leitura.medicao)} m3</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Consumo</span>
                    <span className="text-sm font-semibold text-slate-900">{formatarConsumoDelta(consumoDelta)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">Valor</span>
                    <span className="text-lg font-bold text-slate-900">{formatarValor(leitura.valor)}</span>
                </div>
            </div>
        </div>
    );
}
