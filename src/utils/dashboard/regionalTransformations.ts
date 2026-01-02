import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into regional distribution chart data
 */
export const transformRegionalData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const regiaoMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.regiao_administrativa?.nome) {
      const nome = reg.regiao_administrativa.nome;
      regiaoMap.set(nome, (regiaoMap.get(nome) || 0) + 1);
    }
  });
  
  return Array.from(regiaoMap.entries())
    .map(([name, value]) => ({ name, value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into origin distribution chart data
 */
export const transformOriginData = (resgates: Registro[], apreensoes: Registro[]): ChartDataItem[] => {
  const validResgates = Array.isArray(resgates) ? resgates.filter(r => r) : [];
  const validApreensoes = Array.isArray(apreensoes) ? apreensoes.filter(r => r) : [];
  
  return [
    { name: 'Resgate de Fauna', value: validResgates.length },
    { name: 'Apreensão', value: validApreensoes.length }
  ];
};
