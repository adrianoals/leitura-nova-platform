import CondominioForm from '@/components/admin/CondominioForm';
import { FaBuilding } from 'react-icons/fa';

export default function NovoCondominioPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FaBuilding className="text-blue-600 h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Novo Condomínio</h1>
                </div>
                <p className="text-slate-500">
                    Cadastre um novo condomínio e defina as regras de medição.
                </p>
            </div>

            <CondominioForm />
        </div>
    );
}
