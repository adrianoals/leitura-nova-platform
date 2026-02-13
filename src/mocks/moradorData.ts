export interface Condominio {
    id: string;
    nome: string;
    temAgua: boolean;
    temGas: boolean;
    envioLeituraMoradorHabilitado: boolean;
}

export interface Unidade {
    id: string;
    condominio: Condominio;
    bloco: string;
    apartamento: string;
}

export interface LeituraMensal {
    id: string;
    tipo: 'agua' | 'gas';
    mesReferencia: string; // formato: '2026-01'
    dataLeitura: string;   // formato: '2026-01-15'
    medicao: number;
    valor: number;
    fotos: string[];
}

export interface MoradorData {
    nome: string;
    unidade: Unidade;
    leituras: LeituraMensal[];
}

// --- Dados Mock ---

const leituras: LeituraMensal[] = [
    { id: '1', tipo: 'agua', mesReferencia: '2026-02', dataLeitura: '2026-02-10', medicao: 18, valor: 95.40, fotos: [] },
    { id: '2', tipo: 'gas', mesReferencia: '2026-02', dataLeitura: '2026-02-10', medicao: 6, valor: 42.00, fotos: [] },
    { id: '3', tipo: 'agua', mesReferencia: '2026-01', dataLeitura: '2026-01-12', medicao: 21, valor: 108.50, fotos: ['/images/leitura-agua-jan.jpg'] },
    { id: '4', tipo: 'gas', mesReferencia: '2026-01', dataLeitura: '2026-01-12', medicao: 7, valor: 48.30, fotos: [] },
    { id: '5', tipo: 'agua', mesReferencia: '2025-12', dataLeitura: '2025-12-14', medicao: 25, valor: 126.00, fotos: ['/images/leitura-agua-dez.jpg'] },
    { id: '6', tipo: 'gas', mesReferencia: '2025-12', dataLeitura: '2025-12-14', medicao: 5, valor: 35.50, fotos: [] },
    { id: '7', tipo: 'agua', mesReferencia: '2025-11', dataLeitura: '2025-11-11', medicao: 19, valor: 99.80, fotos: [] },
    { id: '8', tipo: 'gas', mesReferencia: '2025-11', dataLeitura: '2025-11-11', medicao: 8, valor: 55.00, fotos: [] },
    { id: '9', tipo: 'agua', mesReferencia: '2025-10', dataLeitura: '2025-10-13', medicao: 22, valor: 113.40, fotos: [] },
    { id: '10', tipo: 'gas', mesReferencia: '2025-10', dataLeitura: '2025-10-13', medicao: 9, valor: 61.20, fotos: [] },
    { id: '11', tipo: 'agua', mesReferencia: '2025-09', dataLeitura: '2025-09-10', medicao: 16, valor: 84.00, fotos: [] },
    { id: '12', tipo: 'gas', mesReferencia: '2025-09', dataLeitura: '2025-09-10', medicao: 4, valor: 28.80, fotos: [] },
    { id: '13', tipo: 'agua', mesReferencia: '2025-08', dataLeitura: '2025-08-12', medicao: 15, valor: 79.50, fotos: [] },
    { id: '14', tipo: 'gas', mesReferencia: '2025-08', dataLeitura: '2025-08-12', medicao: 3, valor: 22.00, fotos: [] },
    { id: '15', tipo: 'agua', mesReferencia: '2025-07', dataLeitura: '2025-07-14', medicao: 17, valor: 89.60, fotos: [] },
    { id: '16', tipo: 'gas', mesReferencia: '2025-07', dataLeitura: '2025-07-14', medicao: 5, valor: 35.50, fotos: [] },
    { id: '17', tipo: 'agua', mesReferencia: '2025-06', dataLeitura: '2025-06-10', medicao: 20, valor: 104.00, fotos: [] },
    { id: '18', tipo: 'gas', mesReferencia: '2025-06', dataLeitura: '2025-06-10', medicao: 6, valor: 42.00, fotos: [] },
    { id: '19', tipo: 'agua', mesReferencia: '2025-05', dataLeitura: '2025-05-13', medicao: 23, valor: 118.80, fotos: [] },
    { id: '20', tipo: 'gas', mesReferencia: '2025-05', dataLeitura: '2025-05-13', medicao: 7, valor: 48.30, fotos: [] },
    { id: '21', tipo: 'agua', mesReferencia: '2025-04', dataLeitura: '2025-04-11', medicao: 19, valor: 99.80, fotos: [] },
    { id: '22', tipo: 'gas', mesReferencia: '2025-04', dataLeitura: '2025-04-11', medicao: 6, valor: 42.00, fotos: [] },
    { id: '23', tipo: 'agua', mesReferencia: '2025-03', dataLeitura: '2025-03-12', medicao: 14, valor: 74.20, fotos: [] },
    { id: '24', tipo: 'gas', mesReferencia: '2025-03', dataLeitura: '2025-03-12', medicao: 8, valor: 55.00, fotos: [] },
];

export const mockMorador: MoradorData = {
    nome: 'João Silva',
    unidade: {
        id: 'u1',
        condominio: {
            id: 'c1',
            nome: 'Residencial Jardim das Flores',
            temAgua: true,
            temGas: true,
            envioLeituraMoradorHabilitado: true,
        },
        bloco: 'Torre A',
        apartamento: 'Apto 101',
    },
    leituras,
};

// Helpers
export function getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getLeiturasMes(mes: string) {
    return mockMorador.leituras.filter(l => l.mesReferencia === mes);
}

export function getLeiturasAgua() {
    return mockMorador.leituras.filter(l => l.tipo === 'agua');
}

export function getLeiturasGas() {
    return mockMorador.leituras.filter(l => l.tipo === 'gas');
}

export function getMesesUnicos() {
    return [...new Set(mockMorador.leituras.map(l => l.mesReferencia))].sort().reverse();
}

export function formatarMes(mesRef: string) {
    const [ano, mes] = mesRef.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
}

export function formatarData(data: string) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export function formatarValor(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
