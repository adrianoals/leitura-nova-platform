export interface Condominio {
  id: string;
  nome: string;
  temAgua: boolean;
  temAguaQuente: boolean;
  temGas: boolean;
  envioLeituraMoradorHabilitado: boolean;
  leituraDiaInicio: number;
  leituraDiaFim: number;
}

export interface Unidade {
  id: string;
  condominioId: string;
  condominio?: Condominio;
  bloco: string;
  apartamento: string;
}

export interface LeituraMensal {
  id: string;
  tipo: 'agua' | 'gas' | 'agua_fria' | 'agua_quente';
  mesReferencia: string; // formato: 'YYYY-MM'
  dataLeitura: string;   // formato: 'YYYY-MM-DD'
  medicao: number;
  valor: number;
  fotos: string[];
  criadoPorMorador?: boolean;
}

export interface MoradorData {
  id: string;
  authUserId: string;
  nome: string;
  unidadeId: string;
  unidade?: Unidade;
}