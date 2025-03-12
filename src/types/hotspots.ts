
export interface RegistroLocation {
  id: string;
  regiao_administrativa: string;
  latitude: string;
  longitude: string;
  count: number;
}

export interface HotspotRegion {
  regiao: string;
  contagem: number;
}

export interface Registro {
  id: string;
  data: string;
  regiao_administrativa: string;
  origem: string;
  latitude_origem: string;
  longitude_origem: string;
  desfecho_apreensao: string | null;
  desfecho_resgate: string | null;
  numero_tco: string | null;
  outro_desfecho: string | null;
  classe_taxonomica: string;
  nome_cientifico: string;
  nome_popular: string;
  estado_saude: string;
  atropelamento: string;
  estagio_vida: string;
  quantidade?: number; // Make it optional since it's calculated
  quantidade_adulto: number | null;
  quantidade_filhote: number | null;
  destinacao: string;
  numero_termo_entrega: string | null;
  hora_guarda_ceapa: string | null;
  motivo_entrega_ceapa: string | null;
  latitude_soltura: string | null;
  longitude_soltura: string | null;
  outro_destinacao: string | null;
  created_at: string;
}
