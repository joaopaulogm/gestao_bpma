
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

  // Verificar se são dados históricos
  const isHistorical = registros.length > 0 && (
    (registros[0] as any).tipo_registro === 'historico' ||
    (registros[0] as any).quantidade_resgates !== undefined
  );

  // Para dados históricos, usar quantidade_resgates; para atuais, usar quantidade_total
  const quantities = registros
    .filter(r => r) // Filtrar registros nulos/undefined
    .map(r => {
      let qtd = 0;
      if (isHistorical) {
        qtd = (r as any).quantidade_resgates ?? (r as any).quantidade ?? (r as any).quantidade_total ?? 0;
      } else {
        qtd = (r as Registro).quantidade_total ?? (r as Registro).quantidade ?? 0;
      }
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
