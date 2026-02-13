import { Condominio } from '@/types';

/**
 * Verifica se o período de envio de leitura está aberto para um condomínio.
 * Considera habilitado se:
 * 1. envioLeituraMoradorHabilitado é true
 * 2. O dia atual está dentro do intervalo [leituraDiaInicio, leituraDiaFim]
 */
export function isLeituraOpen(condominio: Condominio): boolean {
    if (!condominio.envioLeituraMoradorHabilitado) {
        return false;
    }

    const hoje = new Date().getDate();
    const { leituraDiaInicio, leituraDiaFim } = condominio;

    // Caso simples: Início <= Fim (ex: 10 a 20)
    if (leituraDiaInicio <= leituraDiaFim) {
        return hoje >= leituraDiaInicio && hoje <= leituraDiaFim;
    }

    // Caso virada de mês: Início > Fim (ex: 25 a 05)
    return hoje >= leituraDiaInicio || hoje <= leituraDiaFim;
}
