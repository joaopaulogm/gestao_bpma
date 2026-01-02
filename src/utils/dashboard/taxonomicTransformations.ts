import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into taxonomic class distribution chart data
 */
export const transformTaxonomicClassData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const classeMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.especie?.classe_taxonomica) {
      const classe = reg.especie.classe_taxonomica.trim();
      if (classe) {
        classeMap.set(classe, (classeMap.get(classe) || 0) + 1);
      }
    }
  });
  
  return Array.from(classeMap.entries())
    .map(([name, value]) => ({ name: name || 'Não especificado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into life stage distribution chart data
 */
export const transformLifeStageData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const estagioVidaMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.estagio_vida?.nome) {
      const estagio = reg.estagio_vida.nome.trim();
      if (estagio) {
        estagioVidaMap.set(estagio, (estagioVidaMap.get(estagio) || 0) + 1);
      }
    }
  });
  
  return Array.from(estagioVidaMap.entries())
    .map(([name, value]) => ({ name: name || 'Não especificado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};
