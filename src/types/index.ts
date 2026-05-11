import type { IconType } from 'react-icons';

export interface Condominio {
  id: string;
  nome: string;
  temAgua: boolean;
  temAguaQuente: boolean;
  temGas: boolean;
  envioLeituraMoradorHabilitado: boolean;
}

export interface Unidade {
  id: string;
  condominioId: string;
  condominio?: Condominio;
  bloco: string;
  apartamento: string;
}

export type TipoAcesso = 'proprietario' | 'locatario';

export interface Pessoa {
  id: string;          // = auth.users.id
  nome: string | null;
}

export interface UnidadeAcesso {
  id: string;
  unidadeId: string;
  authUserId: string;
  tipo: TipoAcesso | null;
  ativo: boolean;
  pessoa?: Pessoa;
  unidade?: Unidade;
}

export interface LeituraMensal {
  id: string;
  tipo: 'agua' | 'gas' | 'agua_fria' | 'agua_quente';
  mesReferencia: string; // formato: 'YYYY-MM'
  dataLeitura: string;   // formato: 'YYYY-MM-DD'
  medicao: number;
  consumo?: number | null; // delta em relação ao mês anterior
  valor: number;
  fotos: string[];
  criadoPorMorador?: boolean;
}

export interface Service {
  icon: IconType;
  title: string;
  description: string;
}

export interface Differentiator {
  icon: IconType;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon?: IconType;
}
