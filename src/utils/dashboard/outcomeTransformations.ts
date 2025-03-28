
import { ChartDataItem, HealthDistribution, Registro } from '@/types/hotspots';

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
