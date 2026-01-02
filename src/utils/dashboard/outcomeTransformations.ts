
import { ChartDataItem, HealthDistribution, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into rescue outcome chart data
 */
export const transformRescueOutcomeData = (resgates: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(resgates)) return [];
  
  const desfechoResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    if (reg?.desfecho) {
      // Incluir desfechos de resgate ou sem tipo específico (assumir resgate)
      if (reg.desfecho.tipo === 'resgate' || !reg.desfecho.tipo) {
        const nome = (reg.desfecho.nome || 'Não informado').trim();
        desfechoResgateMap.set(nome, (desfechoResgateMap.get(nome) || 0) + 1);
      }
    }
  });
  
  return Array.from(desfechoResgateMap.entries())
    .map(([name, value]) => ({ name: name || 'Não informado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into seizure outcome chart data
 */
export const transformSeizureOutcomeData = (apreensoes: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(apreensoes)) return [];
  
  const desfechoApreensaoMap = new Map<string, number>();
  apreensoes.forEach(reg => {
    if (reg?.desfecho?.tipo === 'apreensao') {
      const nome = (reg.desfecho.nome || 'Não informado').trim();
      desfechoApreensaoMap.set(nome, (desfechoApreensaoMap.get(nome) || 0) + 1);
    }
  });
  
  return Array.from(desfechoApreensaoMap.entries())
    .map(([name, value]) => ({ name: name || 'Não informado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into health status chart data
 */
export const transformHealthStatusData = (registros: Registro[]): HealthDistribution[] => {
  if (!Array.isArray(registros)) return [];
  
  const estadoSaudeMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.estado_saude?.nome) {
      const estado = reg.estado_saude.nome.trim();
      if (estado) {
        estadoSaudeMap.set(estado, (estadoSaudeMap.get(estado) || 0) + 1);
      }
    }
  });
  
  const totalSaude = registros.length || 1; // Evitar divisão por zero
  return Array.from(estadoSaudeMap.entries())
    .map(([estado, quantidade]) => ({ 
      estado: estado || 'Não informado', 
      quantidade: quantidade || 0, 
      percentual: totalSaude > 0 ? Math.round((quantidade / totalSaude) * 100 * 10) / 10 : 0
    }))
    .filter(item => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade);
};
