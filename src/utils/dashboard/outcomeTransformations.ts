
import { ChartDataItem, HealthDistribution, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into rescue outcome chart data
 */
export const transformRescueOutcomeData = (resgates: Registro[]): ChartDataItem[] => {
  const desfechoResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    if (reg.desfecho?.tipo === 'resgate') {
      const nome = reg.desfecho.nome || 'Não informado';
      desfechoResgateMap.set(nome, (desfechoResgateMap.get(nome) || 0) + 1);
    }
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
    if (reg.desfecho?.tipo === 'apreensao') {
      const nome = reg.desfecho.nome || 'Não informado';
      desfechoApreensaoMap.set(nome, (desfechoApreensaoMap.get(nome) || 0) + 1);
    }
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
    const estado = reg.estado_saude?.nome;
    if (estado) {
      estadoSaudeMap.set(estado, (estadoSaudeMap.get(estado) || 0) + 1);
    }
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
