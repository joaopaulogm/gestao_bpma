import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into destination types chart data
 */
export const transformDestinationTypesData = (registros: Registro[]): ChartDataItem[] => {
  const destinacaoMap = new Map<string, number>();
  registros.forEach(reg => {
    const dest = reg.destinacao?.nome;
    if (dest) {
      destinacaoMap.set(dest, (destinacaoMap.get(dest) || 0) + 1);
    }
  });
  
  return Array.from(destinacaoMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into CEAPA reasons chart data
 */
export const transformCEAPAReasonsData = (registros: Registro[]): ChartDataItem[] => {
  const motivosCEAPAMap = new Map<string, number>();
  registros
    .filter(reg => reg.destinacao?.nome === 'CEAPA/BPMA' && reg.motivo_entrega_ceapa)
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
