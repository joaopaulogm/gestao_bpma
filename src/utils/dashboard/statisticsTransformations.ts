
import { Registro } from '@/types/hotspots';

/**
 * Calculates basic statistical measures for quantities of specimens per occurrence
 */
export const transformQuantityStatistics = (registros: Registro[]) => {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0
    };
  }

  // Usamos agora o campo quantidade_total, com fallback para quantidade
  const quantities = registros
    .filter(r => r) // Filtrar registros nulos/undefined
    .map(r => {
      const qtd = r.quantidade_total ?? r.quantidade ?? 0;
      return typeof qtd === 'number' && !isNaN(qtd) ? qtd : 0;
    })
    .filter(q => q > 0) // Filtrar quantidades inválidas
    .sort((a, b) => a - b);
  
  if (quantities.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0
    };
  }

  const min = quantities[0];
  const max = quantities[quantities.length - 1];
  const sum = quantities.reduce((acc, current) => acc + current, 0);
  const avg = Math.round((sum / quantities.length) * 10) / 10;

  // Cálculo da mediana
  const mid = Math.floor(quantities.length / 2);
  const median = quantities.length % 2 === 0
    ? (quantities[mid - 1] + quantities[mid]) / 2
    : quantities[mid];

  return {
    min,
    max,
    avg,
    median
  };
};
