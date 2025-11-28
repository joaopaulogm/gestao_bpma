import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into regional distribution chart data
 */
export const transformRegionalData = (registros: Registro[]): ChartDataItem[] => {
  const regiaoMap = new Map<string, number>();
  registros.forEach(reg => {
    const nome = reg.regiao_administrativa?.nome;
    if (nome) {
      regiaoMap.set(nome, (regiaoMap.get(nome) || 0) + 1);
    }
  });
  
  return Array.from(regiaoMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into origin distribution chart data
 */
export const transformOriginData = (resgates: Registro[], apreensoes: Registro[]): ChartDataItem[] => {
  return [
    { name: 'Resgate de Fauna', value: resgates.length },
    { name: 'Apreensão', value: apreensoes.length }
  ];
};
