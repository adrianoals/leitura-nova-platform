'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import { createLeitura } from '@/actions/leituraActions';

type TipoLeitura = 'agua' | 'agua_fria' | 'agua_quente' | 'gas';

type CondominioInput = {
    id: string;
    nome: string;
    tem_agua: boolean;
    tem_agua_quente: boolean;
    tem_gas: boolean;
};

type UnidadeInput = {
    id: string;
    condominio_id: string;
    bloco: string;
    apartamento: string;
};

interface NovaLeituraFormProps {
    condominios: CondominioInput[];
    unidades: UnidadeInput[];
    error?: string;
}

function getTiposDisponiveis(condominio?: CondominioInput): Array<{ value: TipoLeitura; label: string }> {
    if (!condominio) return [];

    const tipos: Array<{ value: TipoLeitura; label: string }> = [];

    if (condominio.tem_agua) {
        if (condominio.tem_agua_quente) {
            tipos.push({ value: 'agua_fria', label: 'Água Fria' });
            tipos.push({ value: 'agua_quente', label: 'Água Quente' });
        } else {
            tipos.push({ value: 'agua', label: 'Água' });
        }
    }

    if (condominio.tem_gas) {
        tipos.push({ value: 'gas', label: 'Gás' });
    }

    return tipos;
}

function getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getDataAtual() {
    return new Date().toISOString().slice(0, 10);
}

export default function NovaLeituraForm({ condominios, unidades, error }: NovaLeituraFormProps) {
    const [condominioId, setCondominioId] = useState('');
    const [tipo, setTipo] = useState<TipoLeitura | ''>('');

    const condominioSelecionado = useMemo(
        () => condominios.find((cond) => cond.id === condominioId),
        [condominios, condominioId]
    );

    const unidadesFiltradas = useMemo(
        () => unidades.filter((u) => (condominioId ? u.condominio_id === condominioId : false)),
        [unidades, condominioId]
    );

    const tiposDisponiveis = useMemo(
        () => getTiposDisponiveis(condominioSelecionado),
        [condominioSelecionado]
    );

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/leituras" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FaArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nova Leitura</h1>
                    <p className="text-sm text-slate-500">Lançamento mensal por unidade</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {decodeURIComponent(error)}
                </div>
            )}

            <form action={createLeitura} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Condomínio</label>
                    <select
                        value={condominioId}
                        onChange={(e) => {
                            const nextCondominioId = e.target.value;
                            setCondominioId(nextCondominioId);
                            const nextCondominio = condominios.find((cond) => cond.id === nextCondominioId);
                            const nextTipos = getTiposDisponiveis(nextCondominio);
                            setTipo(nextTipos[0]?.value || '');
                        }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        required
                    >
                        <option value="">Selecione...</option>
                        {condominios.map((cond) => (
                            <option key={cond.id} value={cond.id}>{cond.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Unidade</label>
                    <select
                        name="unidade_id"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        disabled={!condominioId}
                        required
                    >
                        <option value="">Selecione...</option>
                        {unidadesFiltradas.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.bloco} — {u.apartamento}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Tipo</label>
                    <select
                        name="tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as TipoLeitura)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all bg-white"
                        disabled={!condominioId || tiposDisponiveis.length === 0}
                        required
                    >
                        <option value="">Selecione...</option>
                        {tiposDisponiveis.map((tipoOption) => (
                            <option key={tipoOption.value} value={tipoOption.value}>
                                {tipoOption.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Mês Referência</label>
                        <input
                            type="month"
                            name="mes_referencia"
                            defaultValue={getMesAtual()}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Data Leitura</label>
                        <input
                            type="date"
                            name="data_leitura"
                            defaultValue={getDataAtual()}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Medição (m³)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            name="medicao"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="valor"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-vscode-blue/20 focus:border-vscode-blue transition-all"
                            placeholder="0.00"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Fotos (opcional)</label>
                    <input
                        type="file"
                        name="fotos"
                        accept="image/*"
                        multiple
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-vscode-blue file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-vscode-blue-dark"
                    />
                    <p className="text-xs text-slate-500">Formatos permitidos: JPG, PNG e WebP</p>
                </div>

                <button type="submit"
                    className="w-full rounded-xl bg-vscode-blue py-3.5 text-white font-semibold shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <FaCheck className="h-4 w-4" /> Salvar Leitura
                </button>
            </form>
        </div>
    );
}
