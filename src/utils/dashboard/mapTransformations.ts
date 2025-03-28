
import { MapDataPoint, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into origin map data
 */
export const transformOriginMapData = (registros: Registro[]): MapDataPoint[] => {
  return registros.map(reg => ({
    id: reg.id,
    latitude: reg.latitude_origem,
    longitude: reg.longitude_origem,
    tipo: reg.origem,
    nome_popular: reg.nome_popular,
    quantidade: reg.quantidade || 1
  }));
};

/**
 * Transforms raw registro data into release map data
 */
export const transformReleaseMapData = (registros: Registro[]): MapDataPoint[] => {
  return registros
    .filter(reg => reg.latitude_soltura && reg.longitude_soltura)
    .map(reg => ({
      id: reg.id,
      latitude: reg.latitude_soltura as string,
      longitude: reg.longitude_soltura as string,
      tipo: 'Soltura',
      nome_popular: reg.nome_popular,
      quantidade: reg.quantidade || 1
    }));
};
