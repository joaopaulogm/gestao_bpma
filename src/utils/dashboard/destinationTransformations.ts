import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into destination types chart data
 */
export const transformDestinationTypesData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const destinacaoMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.destinacao?.nome) {
      const dest = reg.destinacao.nome.trim();
      if (dest) {
        destinacaoMap.set(dest, (destinacaoMap.get(dest) || 0) + 1);
      }
    }
  });
  
  return Array.from(destinacaoMap.entries())
    .map(([name, value]) => ({ name: name || 'Não informado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into CEAPA reasons chart data
 */
export const transformCEAPAReasonsData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const motivosCEAPAMap = new Map<string, number>();
  registros
    .filter(reg => reg && (reg.destinacao?.nome === 'CEAPA/BPMA' || reg.destinacao?.nome === 'CEAPA') && reg.motivo_entrega_ceapa)
    .forEach(reg => {
      const motivo = String(reg.motivo_entrega_ceapa || '').trim();
      if (motivo) {
        motivosCEAPAMap.set(motivo, (motivosCEAPAMap.get(motivo) || 0) + 1);
      }
    });
  
  return Array.from(motivosCEAPAMap.entries())
    .map(([name, value]) => ({ name: name || 'Não informado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};
