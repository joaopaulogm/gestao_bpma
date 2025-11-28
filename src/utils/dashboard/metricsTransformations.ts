
import { DashboardMetric, Registro } from '@/types/hotspots';

/**
 * Calculates summary metrics for the dashboard
 */
export const transformDashboardMetrics = (
  registros: Registro[],
  resgates: Registro[],
  apreensoes: Registro[],
  animaisAtropelados: Registro[]
): DashboardMetric[] => {
  // Calculate total specimens count (using quantidade_total when available)
  const totalSpecimens = registros.reduce(
    (sum, reg) => sum + (reg.quantidade_total || reg.quantidade || 0),
    0
  );

  // Calculate average specimens per occurrence
  const avgSpecimensPerOccurrence = registros.length > 0
    ? Math.round((totalSpecimens / registros.length) * 10) / 10
    : 0;

  // Count unique species
  const uniqueSpecies = new Set(
    registros
      .filter(reg => reg.especie?.nome_cientifico)
      .map(reg => reg.especie!.nome_cientifico)
  ).size;

  // Return dashboard metrics
  return [
    {
      title: 'Total de Registros',
      value: registros.length,
      iconType: 'FileText',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Total de Resgates',
      value: resgates.length,
      iconType: 'Clipboard',
      iconColor: 'text-green-500'
    },
    {
      title: 'Total de Apreensões',
      value: apreensoes.length,
      iconType: 'ShieldAlert',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Animais Atropelados',
      value: animaisAtropelados.length,
      iconType: 'AlertTriangle',
      iconColor: 'text-red-500'
    },
    {
      title: 'Total de Espécimes',
      value: totalSpecimens,
      iconType: 'Paw',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Média de Espécimes por Registro',
      value: avgSpecimensPerOccurrence,
      iconType: 'BarChart',
      iconColor: 'text-indigo-500'
    },
    {
      title: 'Espécies Únicas Registradas',
      value: uniqueSpecies,
      iconType: 'Leaf',
      iconColor: 'text-emerald-500'
    }
  ];
};
