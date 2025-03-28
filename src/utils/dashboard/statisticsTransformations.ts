
import { DashboardMetric, TimeSeriesItem, Registro } from '@/types/hotspots';
import { format } from 'date-fns';

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
