'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCamera, FaTachometerAlt, FaTint, FaFire, FaCloudUploadAlt, FaCheck, FaTrash } from 'react-icons/fa';
import { mockMorador } from '@/mocks/moradorData';

export default function EnviarLeituraPage() {
    const unidade = mockMorador.unidade;
    const condominio = unidade?.condominio;

    if (!unidade || !condominio) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500">Dados da unidade indisponíveis.</p>
                    <Link href="/app" className="text-vscode-blue mt-2 inline-block">Voltar</Link>
                </div>
            </div>
        );
    }

    const [tipo, setTipo] = useState<'agua' | 'gas'>(condominio.temAgua ? 'agua' : 'gas');
    const [medicao, setMedicao] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!medicao) errs.medicao = 'Informe a medição';
        else if (isNaN(Number(medicao)) || Number(medicao) <= 0) errs.medicao = 'Medição deve ser um número positivo';
        if (fotos.length === 0) errs.fotos = 'Envie pelo menos uma foto do medidor';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFotoUpload = () => {
        // Simula upload de foto
        setFotos(prev => [...prev, `foto_${prev.length + 1}.jpg`]);
        setErrors(prev => ({ ...prev, fotos: '' }));
    };

    const removeFoto = (index: number) => {
        setFotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false);
        setSucesso(true);
        setMedicao('');
        setFotos([]);
    };

    if (sucesso) {
        return (
            <div className="max-w-lg mx-auto space-y-6">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <FaCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-900">Leitura enviada!</h2>
                    <p className="text-green-700 text-sm">
                        Sua medição foi enviada com sucesso e será analisada pela equipe.
                    </p>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 rounded-xl bg-vscode-blue px-5 py-3 text-sm font-semibold text-white hover:bg-vscode-blue-dark transition-all"
                    >
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/app"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enviar Leitura</h1>
                    <p className="text-slate-500 text-sm">Foto do medidor + medição</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                {/* Type selector */}
                {condominio.temAgua && condominio.temGas && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Tipo de Leitura</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setTipo('agua')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${tipo === 'agua'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <FaTint className="h-4 w-4" />
                                Água
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipo('gas')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${tipo === 'gas'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <FaFire className="h-4 w-4" />
                                Gás
                            </button>
                        </div>
                    </div>
                )}

                {/* Measurement */}
                <div className="space-y-2">
                    <label htmlFor="medicao" className="block text-sm font-medium text-slate-700">
                        Medição (m³)
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <FaTachometerAlt className="h-4 w-4" />
                        </div>
                        <input
                            id="medicao"
                            type="number"
                            step="0.01"
                            value={medicao}
                            onChange={e => setMedicao(e.target.value)}
                            className={`w-full rounded-xl border ${errors.medicao ? 'border-red-300' : 'border-slate-200'} pl-11 pr-12 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all`}
                            placeholder="Ex: 18.5"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">m³</span>
                    </div>
                    {errors.medicao && <p className="text-sm text-red-600">{errors.medicao}</p>}
                </div>

                {/* Photo upload */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                        Foto do Medidor
                    </label>

                    {/* Upload area */}
                    <button
                        type="button"
                        onClick={handleFotoUpload}
                        className="w-full rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-vscode-blue hover:bg-vscode-blue/5 transition-all group"
                    >
                        <FaCloudUploadAlt className="h-10 w-10 text-slate-400 group-hover:text-vscode-blue mx-auto mb-3 transition-colors" />
                        <p className="text-sm font-medium text-slate-600 group-hover:text-vscode-blue transition-colors">
                            Clique para tirar foto ou selecionar
                        </p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG ou WebP</p>
                    </button>

                    {/* Uploaded photos */}
                    {fotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {fotos.map((foto, i) => (
                                <div key={i} className="relative aspect-square rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    <FaCamera className="h-6 w-6 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeFoto(i)}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                                    >
                                        <FaTrash className="h-3 w-3" />
                                    </button>
                                    <span className="absolute bottom-1 text-[10px] text-slate-500">{foto}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.fotos && <p className="text-sm text-red-600">{errors.fotos}</p>}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-vscode-blue py-3.5 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        'Enviando...'
                    ) : (
                        <>
                            <FaCamera className="h-4 w-4" />
                            Enviar Leitura
                        </>
                    )}
                </button>
            </form>

            {/* Info */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs text-blue-800">
                    📌 Fotografe o visor do medidor de forma legível. A medição informada será validada pela equipe.
                </p>
            </div>
        </div>
    );
}
