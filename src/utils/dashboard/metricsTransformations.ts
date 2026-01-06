
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
  // Validar entradas
  const validRegistros = Array.isArray(registros) ? registros.filter(r => r) : [];
  const validResgates = Array.isArray(resgates) ? resgates.filter(r => r) : [];
  const validApreensoes = Array.isArray(apreensoes) ? apreensoes.filter(r => r) : [];
  const validAtropelados = Array.isArray(animaisAtropelados) ? animaisAtropelados.filter(r => r) : [];
  
  // Calculate total specimens count (using quantidade_total when available)
  const totalSpecimens = validRegistros.reduce(
    (sum, reg) => {
      const qtd = reg.quantidade_total ?? reg.quantidade ?? 0;
      return sum + (typeof qtd === 'number' && !isNaN(qtd) ? qtd : 0);
    },
    0
  );

  // Calculate average specimens per occurrence
  const avgSpecimensPerOccurrence = validRegistros.length > 0
    ? Math.round((totalSpecimens / validRegistros.length) * 10) / 10
    : 0;

  // Count unique species
  const uniqueSpecies = new Set(
    validRegistros
      .filter(reg => reg?.especie?.nome_cientifico)
      .map(reg => reg.especie!.nome_cientifico)
      .filter(Boolean)
  ).size;

  // Return dashboard metrics
  return [
    {
      title: 'Total de Registros',
      value: validRegistros.length,
      iconType: 'FileText',
      iconColor: 'text-primary'
    },
    {
      title: 'Total de Resgates',
      value: validResgates.length,
      iconType: 'Clipboard',
      iconColor: 'text-green-500'
    },
    {
      title: 'Total de Apreensões',
      value: validApreensoes.length,
      iconType: 'ShieldAlert',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Animais Atropelados',
      value: validAtropelados.length,
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
