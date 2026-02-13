'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaSave, FaWater, FaFire } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

const condominoSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    tem_agua: z.boolean(),
    tem_agua_quente: z.boolean(), // Maps to '2 hidrômetros' logic
    tem_gas: z.boolean(),
    envio_leitura_morador_habilitado: z.boolean(),
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
                        className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-vscode-blue focus:outline-none focus:ring-4 focus:ring-vscode-blue/15"
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
                                <label className="block text-sm font-semibold text-blue-900 mb-2">Tipo de Medição de Água</label>
                                <select
                                    {...register('tem_agua_quente', {
                                        setValueAs: (v) => v === 'true',
                                    })}
                                    className="block w-full rounded-xl border-2 border-blue-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
                                >
                                    <option value="false">1 Hidrômetro (Apenas Água Fria)</option>
                                    <option value="true">2 Hidrômetros (Fria + Quente)</option>
                                </select>
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
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Regras de Leitura</h3>

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
