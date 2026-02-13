import { Condominio } from '@/types';

/**
 * Verifica se o período de envio de leitura está aberto para um condomínio.
 * Regra atual: basta o condomínio permitir envio pelo proprietário.
 */
export function isLeituraOpen(condominio: Condominio): boolean {
    return condominio.envioLeituraMoradorHabilitado;
}
