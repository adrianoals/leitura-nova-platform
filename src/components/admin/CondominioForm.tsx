'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaSave, FaWater, FaFire, FaCalendarAlt } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

const condominoSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    tem_agua: z.boolean(),
    tem_agua_quente: z.boolean(), // Maps to '2 hidrômetros' logic
    tem_gas: z.boolean(),
    envio_leitura_morador_habilitado: z.boolean(),
    leitura_dia_inicio: z.number().min(1).max(31),
    leitura_dia_fim: z.number().min(1).max(31),
});

type CondominioFormData = z.infer<typeof condominoSchema>;

export default function CondominioForm() {
    const router = useRouter();
    const supabase = createClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CondominioFormData>({
        resolver: zodResolver(condominoSchema),
        defaultValues: {
            nome: '',
            tem_agua: true,
            tem_agua_quente: false, // Default 1 meter (Cold only)
            tem_gas: false,
            envio_leitura_morador_habilitado: false,
            leitura_dia_inicio: 1,
            leitura_dia_fim: 10,
        },
    });

    const temAgua = watch('tem_agua');

    const onSubmit = async (data: CondominioFormData) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const { error } = await supabase.from('condominios').insert(data);

            if (error) {
                setServerError(error.message);
                return;
            }

            // Success
            router.push('/admin/condominios');
            router.refresh();
        } catch (err) {
            setServerError('Ocorreu um erro ao salvar o condomínio.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            {/* Nome */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informações Básicas</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Condomínio</label>
                    <input
                        type="text"
                        {...register('nome')}
                        className="w-full rounded-lg border-slate-300 focus:border-vscode-blue focus:ring-vscode-blue"
                        placeholder="Ex: Residencial Flores do Campo"
                    />
                    {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
                </div>
            </div>

            {/* Configuração de Água e Gás */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FaWater className="text-blue-500" /> Medição e Consumo
                </h3>

                <div className="grid gap-6">
                    {/* Água */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="tem_agua"
                                {...register('tem_agua')}
                                className="h-5 w-5 rounded border-slate-300 text-vscode-blue focus:ring-vscode-blue"
                            />
                            <label htmlFor="tem_agua" className="text-sm font-medium text-slate-700">Este condomínio possui medição de Água?</label>
                        </div>

                        {temAgua && (
                            <div className="ml-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <label className="block text-sm font-medium text-blue-900 mb-2">Tipo de Medição de Água</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="false"
                                            {...register('tem_agua_quente')}
                                            // Convert string value back to boolean for react-hook-form if needed, but radio usually returns string.
                                            // Actually with boolean in schema, radio inputs are tricky. Let's use standard handling or check logic.
                                            // Standard trick: value="false" -> hook form constraints?
                                            // Simplification: Manual onChange or use select.
                                            // Let's use a simple Select for clarity.
                                            className="hidden" // Hiding and using custom logic or Just use Select?
                                        />
                                        {/* Let's redo this part as a Select to be safer with types */}
                                    </label>

                                    <select
                                        {...register('tem_agua_quente', {
                                            setValueAs: (v) => v === 'true',
                                        })}
                                        className="block w-full rounded-lg border-blue-200 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="false">1 Hidrômetro (Apenas Água Fria)</option>
                                        <option value="true">2 Hidrômetros (Fria + Quente)</option>
                                    </select>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    Selecione "2 Hidrômetros" se houver medição individual para Água Quente (aquecimento central).
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="tem_gas"
                                {...register('tem_gas')}
                                className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                            />
                            <label htmlFor="tem_gas" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FaFire className="text-orange-500" />
                                Este condomínio possui medição de Gás?
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuração de Leitura */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" /> Regras de Leitura
                </h3>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="envio_morador"
                            {...register('envio_leitura_morador_habilitado')}
                            className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                        />
                        <label htmlFor="envio_morador" className="text-sm font-medium text-slate-700">
                            Permitir que moradores enviem a própria leitura (foto)?
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dia Início da Leitura</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                {...register('leitura_dia_inicio', { valueAsNumber: true })}
                                className="w-full rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                            {errors.leitura_dia_inicio && <p className="text-red-500 text-sm mt-1">{errors.leitura_dia_inicio.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dia Fim da Leitura</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                {...register('leitura_dia_fim', { valueAsNumber: true })}
                                className="w-full rounded-lg border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                            {errors.leitura_dia_fim && <p className="text-red-500 text-sm mt-1">{errors.leitura_dia_fim.message}</p>}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        O envio pelo morador (se habilitado) só estará disponível entre esses dias de cada mês.
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {serverError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {serverError}
                </div>
            )}

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-vscode-blue rounded-lg hover:bg-vscode-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vscode-blue disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Salvar Condomínio
                </button>
            </div>
        </form>
    );
}
