
import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into taxonomic class distribution chart data
 */
export const transformTaxonomicClassData = (registros: Registro[]): ChartDataItem[] => {
  const classeMap = new Map<string, number>();
  registros.forEach(reg => {
    classeMap.set(reg.classe_taxonomica, (classeMap.get(reg.classe_taxonomica) || 0) + 1);
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
    estagioVidaMap.set(reg.estagio_vida, (estagioVidaMap.get(reg.estagio_vida) || 0) + 1);
  });
  
  return Array.from(estagioVidaMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};
