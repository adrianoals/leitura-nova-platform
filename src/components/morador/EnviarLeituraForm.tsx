'use client';

import { useRef, useState, type FormEvent } from 'react';
import { FaCamera, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { enviarLeituraMorador } from '@/actions/moradorActions';
import { formatTipo, type TipoLeitura } from '@/lib/morador';

interface Props {
    unidadeId: string;
    tiposPermitidos: TipoLeitura[];
    tiposEnviados: TipoLeitura[];
    tiposLancadosPorAdmin: TipoLeitura[];
    defaultTipo: TipoLeitura | '';
}

const MAX_DIM = 1920;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Falha ao decodificar imagem'));
        el.src = dataUrl;
    });

    const { width, height } = img;
    let targetW = width;
    let targetH = height;
    if (width >= height && width > MAX_DIM) {
        targetW = MAX_DIM;
        targetH = Math.round(height * (MAX_DIM / width));
    } else if (height > width && height > MAX_DIM) {
        targetH = MAX_DIM;
        targetW = Math.round(width * (MAX_DIM / height));
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
}

export default function EnviarLeituraForm({
    unidadeId,
    tiposPermitidos,
    tiposEnviados,
    tiposLancadosPorAdmin,
    defaultTipo,
}: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [erroLocal, setErroLocal] = useState<string | null>(null);

    const enviadosSet = new Set(tiposEnviados);
    const lancadosAdminSet = new Set(tiposLancadosPorAdmin);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        setErroLocal(null);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const fileInput = form.elements.namedItem('fotos') as HTMLInputElement | null;
        const files = Array.from(fileInput?.files ?? []);

        if (files.length === 0) {
            setErroLocal('Envie ao menos uma foto do medidor.');
            return;
        }

        setSubmitting(true);
        try {
            formData.delete('fotos');
            for (const file of files) {
                const compressed = await compressImage(file).catch(() => file);
                formData.append('fotos', compressed, compressed.name);
            }
            await enviarLeituraMorador(formData);
        } catch (error) {
            const isRedirect =
                error instanceof Error &&
                (error.message === 'NEXT_REDIRECT' ||
                    'digest' in error &&
                    typeof (error as { digest?: unknown }).digest === 'string' &&
                    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT'));
            if (isRedirect) throw error;
            setErroLocal('Não foi possível enviar a leitura. Verifique sua conexão e tente novamente.');
            setSubmitting(false);
        }
    }

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
            <input type="hidden" name="unidade_id" value={unidadeId} />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Tipo de leitura</label>
                <select
                    name="tipo"
                    defaultValue={defaultTipo}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                    required
                    disabled={submitting}
                >
                    {tiposPermitidos.map((tipo) => {
                        const jaEnviada = enviadosSet.has(tipo);
                        const sufixo = lancadosAdminSet.has(tipo)
                            ? ' — já lançada pela administração'
                            : (jaEnviada ? ' — já enviada neste mês' : '');
                        return (
                            <option key={tipo} value={tipo} disabled={jaEnviada}>
                                {formatTipo(tipo)}{sufixo}
                            </option>
                        );
                    })}
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
                    step="0.001"
                    min="0.001"
                    placeholder="Ex: 123.456"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                    required
                    disabled={submitting}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="fotos" className="block text-sm font-medium text-slate-700">
                    Fotos do medidor
                </label>
                <div className="rounded-xl border-2 border-dashed border-slate-300 p-4">
                    <label
                        htmlFor="fotos"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
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
                        disabled={submitting}
                        className="mt-3 w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-vscode-blue file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-vscode-blue-dark"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Envie ao menos 1 foto legível do medidor. As fotos são otimizadas automaticamente antes do envio.
                    </p>
                </div>
            </div>

            {erroLocal && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {erroLocal}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-vscode-blue py-3.5 text-sm font-semibold text-white shadow-lg shadow-vscode-blue/25 hover:bg-vscode-blue-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {submitting ? (
                    <>
                        <FaSpinner className="h-4 w-4 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <FaCamera className="h-4 w-4" />
                        Enviar leitura
                    </>
                )}
            </button>
        </form>
    );
}
