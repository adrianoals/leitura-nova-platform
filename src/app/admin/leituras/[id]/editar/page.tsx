import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditarLeituraForm from '@/components/admin/EditarLeituraForm';
import { firstOfRelation } from '@/lib/relations';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
    error?: string;
    condominio_id?: string;
    mes?: string;
}>;

type TipoLeitura = 'agua' | 'agua_fria' | 'agua_quente' | 'gas';

type LeituraRaw = {
    id: string;
    unidade_id: string;
    tipo: TipoLeitura;
    mes_referencia: string;
    data_leitura: string;
    medicao: number;
    valor: number;
    unidade:
        | { id: string; condominio_id: string }
        | { id: string; condominio_id: string }[]
        | null;
};

export default async function EditarLeituraPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const query = await searchParams;
    const supabase = await createClient();

    const { data: leituraRaw } = await supabase
        .from('leituras_mensais')
        .select(`
            id,
            unidade_id,
            tipo,
            mes_referencia,
            data_leitura,
            medicao,
            valor,
            unidade:unidades (
                id,
                condominio_id
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (!leituraRaw) {
        notFound();
    }

    const leitura = leituraRaw as unknown as LeituraRaw;
    const unidadeRel = firstOfRelation(leitura.unidade);
    const condominioId = unidadeRel?.condominio_id || '';

    const [{ data: condominios }, { data: unidades }] = await Promise.all([
        supabase
            .from('condominios')
            .select('id, nome, tem_agua, tem_agua_quente, tem_gas')
            .order('nome', { ascending: true }),
        supabase
            .from('unidades')
            .select('id, condominio_id, bloco, apartamento')
            .order('apartamento', { ascending: true }),
    ]);

    return (
        <EditarLeituraForm
            leitura={{
                id: leitura.id,
                unidade_id: leitura.unidade_id,
                tipo: leitura.tipo,
                mes_referencia: leitura.mes_referencia,
                data_leitura: leitura.data_leitura,
                medicao: Number(leitura.medicao),
                valor: Number(leitura.valor),
                condominio_id: condominioId,
            }}
            condominios={(condominios || []) as never}
            unidades={(unidades || []) as never}
            error={query.error}
            returnCondominioId={query.condominio_id}
            returnMes={query.mes}
        />
    );
}
