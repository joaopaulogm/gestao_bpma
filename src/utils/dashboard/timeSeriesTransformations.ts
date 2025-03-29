
import { Registro, TimeSeriesItem } from '@/types/hotspots';
import { format, parseISO } from 'date-fns';

/**
 * Transforms registro data into time series data for trend visualization
 */
export const transformTimeSeriesData = (registros: Registro[]): TimeSeriesItem[] => {
  // Group registros by date
  const dateMap = new Map<string, { resgates: number; apreensoes: number; total: number }>();
  
  registros.forEach(registro => {
    try {
      // Format date to YYYY-MM-DD
      const date = format(parseISO(registro.data), 'yyyy-MM-dd');
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { resgates: 0, apreensoes: 0, total: 0 });
      }
      
      const currentCount = dateMap.get(date)!;
      
      // Increment counts based on origem
      if (registro.origem === 'Resgate de Fauna') {
        currentCount.resgates += 1;
      } else if (registro.origem === 'Apreensão') {
        currentCount.apreensoes += 1;
      }
      
      currentCount.total += 1;
    } catch (error) {
      console.error('Error processing date for time series:', error);
    }
  });
  
  // Convert map to array sorted by date
  return Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      resgates: counts.resgates,
      apreensoes: counts.apreensoes,
      total: counts.total
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
