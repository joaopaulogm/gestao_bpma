
export interface OcorrenciaData {
  id: string;
  tipo: 'resgate' | 'apreensao' | 'soltura';
  lat: number;
  lng: number;
  data_iso: string;
  municipio: string;
  uf: string;
  fonte: string;
}

export interface HeatmapFilters {
  resgates: boolean;
  apreensoes: boolean;
  solturas: boolean;
  dataInicio?: string;
  dataFim?: string;
}

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
  data_ocorrencia?: string; // Campo alternativo para tabelas históricas
  // Foreign key IDs
  especie_id: string | null;
  regiao_administrativa_id: string | null;
  origem_id: string | null;
  destinacao_id: string | null;
  estado_saude_id: string | null;
  estagio_vida_id: string | null;
  desfecho_id: string | null;
  tipo_area_id: string | null;
  // Joined dimension data (populated by joins)
  regiao_administrativa?: { id: string; nome: string } | null;
  origem?: { id: string; nome: string } | null;
  destinacao?: { id: string; nome: string } | null;
  estado_saude?: { id: string; nome: string } | null;
  estagio_vida?: { id: string; nome: string } | null;
  desfecho?: { id: string; nome: string; tipo: string } | null;
  especie?: {
    id: string;
    classe_taxonomica: string;
    nome_popular: string;
    nome_cientifico: string;
    ordem_taxonomica: string;
    estado_de_conservacao: string;
    tipo_de_fauna: string;
  } | null;
  // Location data
  latitude_origem: string;
  longitude_origem: string;
  latitude_soltura: string | null;
  longitude_soltura: string | null;
  // Additional fields
  numero_tco: string | null;
  outro_desfecho: string | null;
  atropelamento: string;
  quantidade: number;
  quantidade_adulto: number | null;
  quantidade_filhote: number | null;
  quantidade_total: number | null;
  numero_termo_entrega: string | null;
  hora_guarda_ceapa: string | null;
  motivo_entrega_ceapa: string | null;
  outro_destinacao: string | null;
  created_at: string;
  // Campo para identificar tipo de registro (resgate, historico, apreensao)
  tipo_registro?: 'resgate' | 'historico' | 'apreensao' | string;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface TimeSeriesItem {
  date: string;
  resgates: number;
  apreensoes: number;
  total: number;
}

export interface MapDataPoint {
  id: string;
  latitude: string;
  longitude: string;
  tipo: string;
  nome_popular: string;
  quantidade: number;
}

export interface HealthDistribution {
  estado: string;
  quantidade: number;
  percentual: number;
}

export interface DashboardMetric {
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  iconType: string; // Nome do ícone em vez de um elemento React
  iconColor: string; // Cor do ícone
}

export interface EspecieQuantidade {
  name: string;
  quantidade: number;
}

export interface DashboardData {
  totalRegistros: number;
  totalResgates: number;
  totalApreensoes: number;
  totalAtropelamentos: number;
  timeSeriesData: TimeSeriesItem[];
  regiaoAdministrativa: ChartDataItem[];
  origemDistribuicao: ChartDataItem[];
  classeTaxonomica: ChartDataItem[];
  desfechoResgate: ChartDataItem[];
  desfechoApreensao: ChartDataItem[];
  estadoSaude: HealthDistribution[];
  destinacaoTipos: ChartDataItem[];
  atropelamentoDistribuicao: ChartDataItem[];
  estagioVidaDistribuicao: ChartDataItem[];
  especiesMaisResgatadas: { name: string; quantidade: number }[];
  especiesMaisApreendidas: { name: string; quantidade: number }[];
  especiesAtropeladas: { name: string; quantidade: number }[];
  motivosEntregaCEAPA: ChartDataItem[];
  mapDataOrigem: MapDataPoint[];
  mapDataSoltura: MapDataPoint[];
  quantidadePorOcorrencia: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  metricas: DashboardMetric[];
  ultimaAtualizacao: string;
  distribuicaoPorClasse: ChartDataItem[];
  destinos: ChartDataItem[];
  desfechos: ChartDataItem[];
  atropelamentos: { name: string; quantidade: number }[];
  rawData?: any[];
}
