
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
  quantidade: number;
  quantidade_adulto: number | null;
  quantidade_filhote: number | null;
  quantidade_total: number | null; // Adicionando o novo campo
  destinacao: string;
  numero_termo_entrega: string | null;
  hora_guarda_ceapa: string | null;
  motivo_entrega_ceapa: string | null;
  latitude_soltura: string | null;
  longitude_soltura: string | null;
  outro_destinacao: string | null;
  created_at: string;
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
