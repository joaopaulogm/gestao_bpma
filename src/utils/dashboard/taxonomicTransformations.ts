import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into taxonomic class distribution chart data
 */
export const transformTaxonomicClassData = (registros: Registro[]): ChartDataItem[] => {
  const classeMap = new Map<string, number>();
  registros.forEach(reg => {
    const classe = reg.especie?.classe_taxonomica;
    if (classe) {
      classeMap.set(classe, (classeMap.get(classe) || 0) + 1);
    }
  });
  
  return Array.from(classeMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into life stage distribution chart data
 */
export const transformLifeStageData = (registros: Registro[]): ChartDataItem[] => {
  const estagioVidaMap = new Map<string, number>();
  registros.forEach(reg => {
    const estagio = reg.estagio_vida?.nome;
    if (estagio) {
      estagioVidaMap.set(estagio, (estagioVidaMap.get(estagio) || 0) + 1);
    }
  });
  
  return Array.from(estagioVidaMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};
