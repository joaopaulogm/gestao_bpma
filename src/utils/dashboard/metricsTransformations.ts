
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
  
  // Verificar se são dados históricos (2020-2024)
  const isHistorical = validRegistros.length > 0 && (
    (validRegistros[0] as any).tipo_registro === 'historico' ||
    (validRegistros[0] as any).quantidade_resgates !== undefined
  );

  // Calculate total specimens count
  // Para dados históricos, usar quantidade_resgates; para atuais, usar quantidade_total
  const totalSpecimens = validRegistros.reduce(
    (sum, reg) => {
      let qtd = 0;
      if (isHistorical) {
        qtd = (reg as any).quantidade_resgates ?? (reg as any).quantidade ?? (reg as any).quantidade_total ?? 0;
      } else {
        qtd = reg.quantidade_total ?? reg.quantidade ?? 0;
      }
      return sum + (typeof qtd === 'number' && !isNaN(qtd) ? qtd : 0);
    },
    0
  );

  // Calculate total resgates
  // Para dados históricos, somar quantidade_resgates; para atuais, contar registros
  const totalResgatesCount = isHistorical
    ? validResgates.reduce((sum, reg) => {
        const qtd = (reg as any).quantidade_resgates ?? (reg as any).quantidade ?? (reg as any).quantidade_total ?? 1;
        return sum + (typeof qtd === 'number' && !isNaN(qtd) ? qtd : 1);
      }, 0)
    : validResgates.length;

  // Calculate average specimens per occurrence
  const avgSpecimensPerOccurrence = validRegistros.length > 0
    ? Math.round((totalSpecimens / validRegistros.length) * 10) / 10
    : 0;

  // Count unique species
  // Para dados históricos, pode ter nome_cientifico diretamente no registro
  const uniqueSpecies = new Set(
    validRegistros
      .map(reg => {
        // Tentar de várias formas: especie.nome_cientifico ou nome_cientifico direto
        return reg?.especie?.nome_cientifico || (reg as any).nome_cientifico || null;
      })
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
      value: totalResgatesCount,
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
