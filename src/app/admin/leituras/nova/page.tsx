import { createClient } from '@/lib/supabase/server';
import NovaLeituraForm from '@/components/admin/NovaLeituraForm';

type SearchParams = Promise<{ error?: string }>;

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

export default async function NovaLeituraPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const supabase = await createClient();

    const { data: condominios } = await supabase
        .from('condominios')
        .select('id, nome, tem_agua, tem_agua_quente, tem_gas')
        .order('nome', { ascending: true });

    const { data: unidades } = await supabase
        .from('unidades')
        .select('id, condominio_id, bloco, apartamento')
        .order('apartamento', { ascending: true });

    return (
        <NovaLeituraForm
            condominios={(condominios || []) as CondominioInput[]}
            unidades={(unidades || []) as UnidadeInput[]}
            error={params.error}
        />
    );
}
