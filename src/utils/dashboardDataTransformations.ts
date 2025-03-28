
import { format, endOfMonth } from 'date-fns';
import { 
  ChartDataItem, 
  TimeSeriesItem, 
  MapDataPoint,
  HealthDistribution,
  DashboardMetric,
  EspecieQuantidade
} from '@/types/hotspots';
import { Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into regional distribution chart data
 */
export const transformRegionalData = (registros: Registro[]): ChartDataItem[] => {
  const regiaoMap = new Map<string, number>();
  registros.forEach(reg => {
    regiaoMap.set(reg.regiao_administrativa, (regiaoMap.get(reg.regiao_administrativa) || 0) + 1);
  });
  
  return Array.from(regiaoMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into origin distribution chart data
 */
export const transformOriginData = (resgates: Registro[], apreensoes: Registro[]): ChartDataItem[] => {
  return [
    { name: 'Resgate de Fauna', value: resgates.length },
    { name: 'Apreensão', value: apreensoes.length }
  ];
};

/**
 * Transforms raw registro data into taxonomic class distribution chart data
 */
export const transformTaxonomicClassData = (registros: Registro[]): ChartDataItem[] => {
  const classeMap = new Map<string, number>();
  registros.forEach(reg => {
    classeMap.set(reg.classe_taxonomica, (classeMap.get(reg.classe_taxonomica) || 0) + 1);
  });
  
  return Array.from(classeMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into rescue outcome chart data
 */
export const transformRescueOutcomeData = (resgates: Registro[]): ChartDataItem[] => {
  const desfechoResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    const desfecho = reg.desfecho_resgate || 'Não informado';
    desfechoResgateMap.set(desfecho, (desfechoResgateMap.get(desfecho) || 0) + 1);
  });
  
  return Array.from(desfechoResgateMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into seizure outcome chart data
 */
export const transformSeizureOutcomeData = (apreensoes: Registro[]): ChartDataItem[] => {
  const desfechoApreensaoMap = new Map<string, number>();
  apreensoes.forEach(reg => {
    const desfecho = reg.desfecho_apreensao || 'Não informado';
    desfechoApreensaoMap.set(desfecho, (desfechoApreensaoMap.get(desfecho) || 0) + 1);
  });
  
  return Array.from(desfechoApreensaoMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into health status chart data
 */
export const transformHealthStatusData = (registros: Registro[]): HealthDistribution[] => {
  const estadoSaudeMap = new Map<string, number>();
  registros.forEach(reg => {
    estadoSaudeMap.set(reg.estado_saude, (estadoSaudeMap.get(reg.estado_saude) || 0) + 1);
  });
  
  const totalSaude = registros.length;
  return Array.from(estadoSaudeMap.entries())
    .map(([estado, quantidade]) => ({ 
      estado, 
      quantidade, 
      percentual: (quantidade / totalSaude) * 100 
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
};

/**
 * Transforms raw registro data into destination types chart data
 */
export const transformDestinationTypesData = (registros: Registro[]): ChartDataItem[] => {
  const destinacaoMap = new Map<string, number>();
  registros.forEach(reg => {
    destinacaoMap.set(reg.destinacao, (destinacaoMap.get(reg.destinacao) || 0) + 1);
  });
  
  return Array.from(destinacaoMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into roadkill distribution chart data
 */
export const transformRoadkillData = (registros: Registro[], animaisAtropelados: Registro[]): ChartDataItem[] => {
  return [
    { name: 'Atropelamento', value: animaisAtropelados.length },
    { name: 'Outros', value: registros.length - animaisAtropelados.length }
  ];
};

/**
 * Transforms raw registro data into life stage distribution chart data
 */
export const transformLifeStageData = (registros: Registro[]): ChartDataItem[] => {
  const estagioVidaMap = new Map<string, number>();
  registros.forEach(reg => {
    estagioVidaMap.set(reg.estagio_vida, (estagioVidaMap.get(reg.estagio_vida) || 0) + 1);
  });
  
  return Array.from(estagioVidaMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into most rescued species chart data
 */
export const transformMostRescuedSpeciesData = (resgates: Registro[]): EspecieQuantidade[] => {
  const especiesResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesResgateMap.set(chave, (especiesResgateMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesResgateMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into most seized species chart data
 */
export const transformMostSeizedSpeciesData = (apreensoes: Registro[]): EspecieQuantidade[] => {
  const especiesApreensaoMap = new Map<string, number>();
  apreensoes.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesApreensaoMap.set(chave, (especiesApreensaoMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesApreensaoMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into roadkill species chart data
 */
export const transformRoadkillSpeciesData = (animaisAtropelados: Registro[]): EspecieQuantidade[] => {
  const especiesAtropeladasMap = new Map<string, number>();
  animaisAtropelados.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesAtropeladasMap.set(chave, (especiesAtropeladasMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesAtropeladasMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into CEAPA reasons chart data
 */
export const transformCEAPAReasonsData = (registros: Registro[]): ChartDataItem[] => {
  const motivosCEAPAMap = new Map<string, number>();
  registros
    .filter(reg => reg.destinacao === 'CEAPA/BPMA' && reg.motivo_entrega_ceapa)
    .forEach(reg => {
      motivosCEAPAMap.set(
        reg.motivo_entrega_ceapa as string, 
        (motivosCEAPAMap.get(reg.motivo_entrega_ceapa as string) || 0) + 1
      );
    });
  
  return Array.from(motivosCEAPAMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into origin map data
 */
export const transformOriginMapData = (registros: Registro[]): MapDataPoint[] => {
  return registros.map(reg => ({
    id: reg.id,
    latitude: reg.latitude_origem,
    longitude: reg.longitude_origem,
    tipo: reg.origem,
    nome_popular: reg.nome_popular,
    quantidade: reg.quantidade || 1
  }));
};

/**
 * Transforms raw registro data into release map data
 */
export const transformReleaseMapData = (registros: Registro[]): MapDataPoint[] => {
  return registros
    .filter(reg => reg.latitude_soltura && reg.longitude_soltura)
    .map(reg => ({
      id: reg.id,
      latitude: reg.latitude_soltura as string,
      longitude: reg.longitude_soltura as string,
      tipo: 'Soltura',
      nome_popular: reg.nome_popular,
      quantidade: reg.quantidade || 1
    }));
};

/**
 * Transforms raw registro data into time series chart data
 */
export const transformTimeSeriesData = (registros: Registro[]): TimeSeriesItem[] => {
  // Always show all months for 2025 regardless of data
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  let timeSeriesData: TimeSeriesItem[] = monthNames.map((monthName) => {
    return {
      date: monthName,
      resgates: 0,
      apreensoes: 0,
      total: 0
    };
  });
  
  // Preencher os dados reais
  registros.forEach(reg => {
    const regDate = new Date(reg.data);
    const month = regDate.getMonth();
    
    if (timeSeriesData[month]) {
      if (reg.origem === 'Resgate de Fauna') {
        timeSeriesData[month].resgates += 1;
      } else if (reg.origem === 'Apreensão') {
        timeSeriesData[month].apreensoes += 1;
      }
      timeSeriesData[month].total += 1;
    }
  });
  
  return timeSeriesData;
};

/**
 * Transforms raw registro data into quantity statistics
 */
export const transformQuantityStatistics = (registros: Registro[]) => {
  const quantidades = registros
    .map(r => r.quantidade || 0)
    .filter(q => q > 0);
  
  const min = Math.min(...quantidades, 0);
  const max = Math.max(...quantidades, 0);
  const sum = quantidades.reduce((acc, val) => acc + val, 0);
  const avg = quantidades.length ? sum / quantidades.length : 0;
  
  // Calcular mediana
  const sortedQuantidades = [...quantidades].sort((a, b) => a - b);
  const mid = Math.floor(sortedQuantidades.length / 2);
  const median = sortedQuantidades.length % 2 === 0
    ? (sortedQuantidades[mid - 1] + sortedQuantidades[mid]) / 2
    : sortedQuantidades[mid];
    
  return {
    min,
    max,
    avg,
    median
  };
};

/**
 * Transforms raw registro data into dashboard metrics
 */
export const transformDashboardMetrics = (
  registros: Registro[], 
  resgates: Registro[], 
  apreensoes: Registro[], 
  animaisAtropelados: Registro[]
): DashboardMetric[] => {
  return [
    {
      title: 'Total de Registros',
      value: registros.length,
      iconType: 'Layers',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Resgates',
      value: resgates.length,
      iconType: 'Bird',
      iconColor: 'text-green-500'
    },
    {
      title: 'Apreensões',
      value: apreensoes.length,
      iconType: 'Target',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Atropelamentos',
      value: animaisAtropelados.length,
      iconType: 'Car',
      iconColor: 'text-pink-500'
    },
    {
      title: 'Espécies Registradas',
      value: new Set(registros.map(r => r.nome_cientifico)).size,
      iconType: 'Bird',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Animais Contabilizados',
      value: registros.reduce((sum, r) => sum + (r.quantidade || 1), 0),
      iconType: 'Users',
      iconColor: 'text-cyan-500'
    }
  ];
};
