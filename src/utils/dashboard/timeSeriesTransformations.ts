
import { Registro, TimeSeriesItem } from '@/types/hotspots';
import { format, parseISO } from 'date-fns';

/**
 * Transforms registro data into time series data for trend visualization
 */
export const transformTimeSeriesData = (registros: Registro[]): TimeSeriesItem[] => {
  if (!Array.isArray(registros)) return [];
  
  // Group registros by date
  const dateMap = new Map<string, { resgates: number; apreensoes: number; total: number }>();
  
  registros.forEach(registro => {
    if (!registro || !registro.data) return;
    
    try {
      // Parse date - pode ser string ISO ou Date object
      let dateStr: string;
      if (typeof registro.data === 'string') {
        dateStr = registro.data.split('T')[0]; // Pega apenas a parte da data
      } else if (typeof registro.data === 'object' && registro.data !== null) {
        dateStr = format(registro.data as Date, 'yyyy-MM-dd');
      } else {
        return; // Skip se não for formato válido
      }
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { resgates: 0, apreensoes: 0, total: 0 });
      }
      
      const currentCount = dateMap.get(dateStr)!;
      
      // Increment counts based on origem ou tipo_registro
      const origemNome = registro.origem?.nome;
      const tipoRegistro = registro.tipo_registro;
      
      if (origemNome === 'Resgate de Fauna' || tipoRegistro === 'resgate' || tipoRegistro === 'historico' || !origemNome) {
        currentCount.resgates += 1;
      } else if (origemNome === 'Apreensão' || origemNome === 'Ação Policial') {
        currentCount.apreensoes += 1;
      }
      
      currentCount.total += 1;
    } catch (error) {
      console.warn('Error processing date for time series:', error, registro);
      // Continue processando outros registros
    }
  });
  
  // Convert map to array sorted by date
  return Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      resgates: counts.resgates || 0,
      apreensoes: counts.apreensoes || 0,
      total: counts.total || 0
    }))
    .filter(item => item.total > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};
