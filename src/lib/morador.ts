import { firstOfRelation } from '@/lib/relations';

export type TipoLeitura = 'agua' | 'agua_fria' | 'agua_quente' | 'gas';

type CondominioRaw = {
    id: string;
    nome: string;
    tem_agua: boolean;
    tem_agua_quente: boolean;
    tem_gas: boolean;
    envio_leitura_morador_habilitado: boolean;
};

type UnidadeRaw = {
    id: string;
    bloco: string | null;
    apartamento: string | null;
    condominio: CondominioRaw | CondominioRaw[] | null;
};

type MoradorRaw = {
    id: string;
    nome: string | null;
    email: string | null;
    unidade: UnidadeRaw | UnidadeRaw[] | null;
};

export type MoradorContext = {
    moradorId: string;
    moradorNome: string | null;
    moradorEmail: string | null;
    unidadeId: string;
    bloco: string | null;
    apartamento: string | null;
    condominioId: string;
    condominioNome: string;
    temAgua: boolean;
    temAguaQuente: boolean;
    temGas: boolean;
    envioLeituraMoradorHabilitado: boolean;
};

export function getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getDataHojeIso() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getMesLimite12Meses() {
    const now = new Date();
    now.setMonth(now.getMonth() - 12);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function isMesValido(value: string) {
    return /^\d{4}-\d{2}$/.test(value);
}

export function formatMes(mesRef: string) {
    const [ano, mes] = mesRef.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[Number(mes) - 1] || mes}/${ano}`;
}

export function formatData(dataIso: string) {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatMedicao(medicao: number) {
    return Number(medicao).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function formatTipo(tipo: TipoLeitura) {
    if (tipo === 'agua_fria') return 'Agua Fria';
    if (tipo === 'agua_quente') return 'Agua Quente';
    if (tipo === 'gas') return 'Gas';
    return 'Agua';
}

export function getTiposPermitidos(context: MoradorContext): TipoLeitura[] {
    const tipos: TipoLeitura[] = [];

    if (context.temAgua) {
        if (context.temAguaQuente) {
            tipos.push('agua_fria', 'agua_quente');
        } else {
            tipos.push('agua');
        }
    }

    if (context.temGas) {
        tipos.push('gas');
    }

    return tipos;
}

export function formatUnidade(bloco?: string | null, apartamento?: string | null) {
    const blocoLimpo = (bloco || '').trim();
    const aptoLimpo = (apartamento || '').trim();
    if (blocoLimpo && aptoLimpo) return `${blocoLimpo} - ${aptoLimpo}`;
    if (aptoLimpo) return `Apto ${aptoLimpo}`;
    if (blocoLimpo) return blocoLimpo;
    return 'Unidade';
}

export async function getMoradorContextByAuthUserId(
    supabase: {
        from: (table: string) => {
            select: (query: string) => {
                eq: (column: string, value: string) => {
                    maybeSingle: () => Promise<{ data: MoradorRaw | null }>;
                };
            };
        };
    },
    authUserId: string
) {
    const { data: moradorRaw } = await supabase
        .from('moradores')
        .select(`
            id,
            nome,
            email,
            unidade:unidades(
                id,
                bloco,
                apartamento,
                condominio:condominios(
                    id,
                    nome,
                    tem_agua,
                    tem_agua_quente,
                    tem_gas,
                    envio_leitura_morador_habilitado
                )
            )
        `)
        .eq('auth_user_id', authUserId)
        .maybeSingle();

    if (!moradorRaw) return null;

    const unidade = firstOfRelation(moradorRaw.unidade);
    if (!unidade) return null;

    const condominio = firstOfRelation(unidade.condominio);
    if (!condominio) return null;

    const context: MoradorContext = {
        moradorId: moradorRaw.id,
        moradorNome: moradorRaw.nome,
        moradorEmail: moradorRaw.email,
        unidadeId: unidade.id,
        bloco: unidade.bloco,
        apartamento: unidade.apartamento,
        condominioId: condominio.id,
        condominioNome: condominio.nome,
        temAgua: condominio.tem_agua,
        temAguaQuente: condominio.tem_agua_quente,
        temGas: condominio.tem_gas,
        envioLeituraMoradorHabilitado: condominio.envio_leitura_morador_habilitado,
    };

    return context;
}
