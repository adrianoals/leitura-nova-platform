import { FaTint, FaFire, FaCalendarAlt, FaTachometerAlt } from 'react-icons/fa';
import { LeituraMensal, formatarData, formatarValor } from '@/mocks/moradorData';

interface DashboardCardProps {
    tipo: 'agua' | 'gas';
    leitura?: LeituraMensal;
}

export default function DashboardCard({ tipo, leitura }: DashboardCardProps) {
    const isAgua = tipo === 'agua';
    const Icon = isAgua ? FaTint : FaFire;
    const label = isAgua ? 'Água' : 'Gás';
    const gradientClass = isAgua
        ? 'from-blue-500 to-cyan-500'
        : 'from-orange-500 to-amber-500';
    const iconBgClass = isAgua
        ? 'bg-blue-100 text-blue-600'
        : 'bg-orange-100 text-orange-600';

    if (!leitura) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
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
                        <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                </div>
                <span className={`rounded-full bg-gradient-to-r ${gradientClass} px-3 py-1 text-xs font-semibold text-white`}>
                    Mês Atual
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <FaCalendarAlt className="h-3 w-3" />
                        Data
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{formatarData(leitura.dataLeitura)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <FaTachometerAlt className="h-3 w-3" />
                        Medição
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{leitura.medicao} m³</p>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        💰 Valor
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatarValor(leitura.valor)}</p>
                </div>
            </div>
        </div>
    );
}
