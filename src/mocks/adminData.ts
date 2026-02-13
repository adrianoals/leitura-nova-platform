import { Condominio, Unidade, LeituraMensal } from './moradorData';

// --- Tipos Admin ---

export interface AdminMorador {
    id: string;
    nome: string;
    identificadorLogin: string;
    unidadeId: string;
}

export interface AdminUnidade extends Unidade {
    moradores: AdminMorador[];
}

export interface AdminCondominio extends Condominio {
    totalUnidades: number;
    totalMoradores: number;
}

// --- Dados Mock Admin ---

export const mockCondominios: AdminCondominio[] = [
    {
        id: 'c1',
        nome: 'Residencial Jardim das Flores',
        temAgua: true,
        temAguaQuente: false,
        temGas: true,
        envioLeituraMoradorHabilitado: true,
        leituraDiaInicio: 1,
        leituraDiaFim: 30,
        totalUnidades: 48,
        totalMoradores: 42,
    },
    {
        id: 'c2',
        nome: 'Edifício Monte Azul',
        temAgua: true,
        temAguaQuente: false,
        temGas: false,
        envioLeituraMoradorHabilitado: false,
        leituraDiaInicio: 1,
        leituraDiaFim: 30,
        totalUnidades: 24,
        totalMoradores: 20,
    },
    {
        id: 'c3',
        nome: 'Condomínio Vila Verde',
        temAgua: true,
        temAguaQuente: true,
        temGas: true,
        envioLeituraMoradorHabilitado: true,
        leituraDiaInicio: 1,
        leituraDiaFim: 30,
        totalUnidades: 96,
        totalMoradores: 81,
    },
    {
        id: 'c4',
        nome: 'Residencial Parque das Águas',
        temAgua: true,
        temAguaQuente: false,
        temGas: false,
        envioLeituraMoradorHabilitado: false,
        leituraDiaInicio: 1,
        leituraDiaFim: 30,
        totalUnidades: 32,
        totalMoradores: 28,
    },
];

export const mockUnidades: AdminUnidade[] = [
    {
        id: 'u1', condominioId: 'c1', condominio: mockCondominios[0], bloco: 'Torre A', apartamento: 'Apto 101',
        moradores: [{ id: 'm1', nome: 'João Silva', identificadorLogin: 'joao@email.com', unidadeId: 'u1' }],
    },
    {
        id: 'u2', condominioId: 'c1', condominio: mockCondominios[0], bloco: 'Torre A', apartamento: 'Apto 102',
        moradores: [{ id: 'm2', nome: 'Maria Santos', identificadorLogin: 'maria@email.com', unidadeId: 'u2' }],
    },
    {
        id: 'u3', condominioId: 'c1', condominio: mockCondominios[0], bloco: 'Torre A', apartamento: 'Apto 201',
        moradores: [],
    },
    {
        id: 'u4', condominioId: 'c1', condominio: mockCondominios[0], bloco: 'Torre B', apartamento: 'Apto 101',
        moradores: [{ id: 'm3', nome: 'Carlos Oliveira', identificadorLogin: 'carlos@email.com', unidadeId: 'u4' }],
    },
    {
        id: 'u5', condominioId: 'c2', condominio: mockCondominios[1], bloco: 'Bloco Único', apartamento: 'Apto 301',
        moradores: [{ id: 'm4', nome: 'Ana Pereira', identificadorLogin: 'ana@email.com', unidadeId: 'u5' }],
    },
    {
        id: 'u6', condominioId: 'c2', condominio: mockCondominios[1], bloco: 'Bloco Único', apartamento: 'Apto 302',
        moradores: [],
    },
];

export const mockMoradores: AdminMorador[] = [
    { id: 'm1', nome: 'João Silva', identificadorLogin: 'joao@email.com', unidadeId: 'u1' },
    { id: 'm2', nome: 'Maria Santos', identificadorLogin: 'maria@email.com', unidadeId: 'u2' },
    { id: 'm3', nome: 'Carlos Oliveira', identificadorLogin: 'carlos@email.com', unidadeId: 'u4' },
    { id: 'm4', nome: 'Ana Pereira', identificadorLogin: 'ana@email.com', unidadeId: 'u5' },
    { id: 'm5', nome: 'Roberto Lima', identificadorLogin: 'roberto@email.com', unidadeId: 'u1' },
];

export const mockLeiturasAdmin: LeituraMensal[] = [
    { id: '1', tipo: 'agua', mesReferencia: '2026-02', dataLeitura: '2026-02-10', medicao: 18, valor: 95.40, fotos: [] },
    { id: '2', tipo: 'gas', mesReferencia: '2026-02', dataLeitura: '2026-02-10', medicao: 6, valor: 42.00, fotos: [] },
    { id: '3', tipo: 'agua', mesReferencia: '2026-01', dataLeitura: '2026-01-12', medicao: 21, valor: 108.50, fotos: ['/img.jpg'] },
    { id: '4', tipo: 'gas', mesReferencia: '2026-01', dataLeitura: '2026-01-12', medicao: 7, valor: 48.30, fotos: [] },
];

// Helpers
export function getCondominioById(id: string) {
    return mockCondominios.find(c => c.id === id);
}

export function getUnidadesByCondominio(condominioId: string) {
    return mockUnidades.filter(u => u.condominio?.id === condominioId);
}

export function getUnidadeById(id: string) {
    return mockUnidades.find(u => u.id === id);
}

export function getMoradorById(id: string) {
    return mockMoradores.find(m => m.id === id);
}

// Stats
export function getAdminStats() {
    const totalCondominios = mockCondominios.length;
    const totalUnidades = mockCondominios.reduce((sum, c) => sum + c.totalUnidades, 0);
    const totalMoradores = mockCondominios.reduce((sum, c) => sum + c.totalMoradores, 0);
    // Simulate pending readings (units without readings this month)
    const leiturasPendentes = 14;
    return { totalCondominios, totalUnidades, totalMoradores, leiturasPendentes };
}
