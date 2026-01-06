
import { Registro } from '@/types/hotspots';

export interface RescueStatistics {
  totalResgates: number;
  totalSolturas: number;
  totalFilhotes: number;
  totalObitos: number;
  recordeDiario: number;
  recordeDiarioData: string;
}

export interface WeekdayDistribution {
  name: string;
  value: number;
  fullName: string;
}

/**
 * Calcula estatísticas de resgates para tabelas históricas (2020-2024)
 * Esses dados usam campos agregados: quantidade_resgates, quantidade_solturas, etc.
 * Para 2021-2024, também pode usar dados das novas tabelas BPMA (agregados ou por espécie)
 */
export const transformHistoricalRescueStatistics = (registros: any[]): RescueStatistics => {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      totalResgates: 0,
      totalSolturas: 0,
      totalFilhotes: 0,
      totalObitos: 0,
      recordeDiario: 0,
      recordeDiarioData: ''
    };
  }

  // Verificar se são dados agregados das novas tabelas BPMA
  const temDadosAgregados = registros.some((r: any) => r.tipo_registro === 'agregado' || r.natureza);
  const temDadosPorEspecie = registros.some((r: any) => 
    r.tipo_registro === 'historico' && 
    (r.quantidade_resgates !== undefined || r.quantidade !== undefined)
  );

  let totalResgates = 0;
  let totalSolturas = 0;
  let totalFilhotes = 0;
  let totalObitos = 0;

  if (temDadosPorEspecie) {
    // Usar dados por espécie (mais detalhados) - prioridade
    totalResgates = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_resgates) || Number(r.quantidade) || Number(r.quantidade_total) || 0;
      return acc + qtd;
    }, 0);

    totalSolturas = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_solturas) || Number(r.quantidade_soltura) || 0;
      return acc + qtd;
    }, 0);

    totalFilhotes = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_filhotes) || Number(r.quantidade_filhote) || 0;
      return acc + qtd;
    }, 0);

    totalObitos = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_obitos) || Number(r.quantidade_obito) || 0;
      return acc + qtd;
    }, 0);
  } else if (temDadosAgregados) {
    // Usar dados agregados das novas tabelas BPMA
    // Os dados já vêm consolidados por mês com todas as naturezas
    registros.forEach((r: any) => {
      totalResgates += Number(r.quantidade) || Number(r.quantidade_total) || 0;
      totalSolturas += Number(r.quantidade_solturas) || 0;
      totalFilhotes += Number(r.quantidade_filhotes) || Number(r.quantidade_filhote) || 0;
      totalObitos += Number(r.quantidade_obitos) || 0;
    });
  } else {
    // Fallback: usar campos padrão das tabelas históricas antigas
    totalResgates = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_resgates) || 0;
      return acc + qtd;
    }, 0);

    totalSolturas = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_solturas) || 0;
      return acc + qtd;
    }, 0);

    totalFilhotes = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_filhotes) || 0;
      return acc + qtd;
    }, 0);

    totalObitos = registros.reduce((acc, r) => {
      const qtd = Number(r.quantidade_obitos) || 0;
      return acc + qtd;
    }, 0);
  }

  // Agrupar por data para encontrar o recorde diário
  const resgatesPorData = new Map<string, number>();
  
  registros.forEach(r => {
    const data = r.data_ocorrencia || r.data || '';
    if (data) {
      // Para dados agregados, usar quantidade_total; para por espécie, usar quantidade_resgates
      const qtd = Number(r.quantidade_resgates) || 
                  Number(r.quantidade) || 
                  Number(r.quantidade_total) || 
                  1;
      resgatesPorData.set(data, (resgatesPorData.get(data) || 0) + qtd);
    }
  });

  let recordeDiario = 0;
  let recordeDiarioData = '';
  
  resgatesPorData.forEach((qtd, data) => {
    if (qtd > recordeDiario) {
      recordeDiario = qtd;
      recordeDiarioData = data;
    }
  });

  return {
    totalResgates,
    totalSolturas,
    totalFilhotes,
    totalObitos,
    recordeDiario,
    recordeDiarioData
  };
};

/**
 * Calcula estatísticas de resgates para tabela atual (2025+)
 * Usa campos do formulário: quantidade_total, desfecho, etc.
 */
export const transformCurrentRescueStatistics = (registros: Registro[]): RescueStatistics => {
  if (!Array.isArray(registros) || registros.length === 0) {
    return {
      totalResgates: 0,
      totalSolturas: 0,
      totalFilhotes: 0,
      totalObitos: 0,
      recordeDiario: 0,
      recordeDiarioData: ''
    };
  }

  // Total de resgates = contagem de registros
  const totalResgates = registros.length;

  // Solturas = registros com desfecho contendo 'soltura'
  const totalSolturas = registros.filter(r => {
    const desfecho = r.desfecho?.nome?.toLowerCase() || '';
    return desfecho.includes('soltura') || desfecho.includes('solto');
  }).length;

  // Filhotes = soma de quantidade_filhote
  const totalFilhotes = registros.reduce((acc, r) => {
    return acc + (Number(r.quantidade_filhote) || 0);
  }, 0);

  // Óbitos = registros com desfecho contendo 'óbito' ou 'morte'
  const totalObitos = registros.filter(r => {
    const desfecho = r.desfecho?.nome?.toLowerCase() || '';
    return desfecho.includes('óbito') || desfecho.includes('obito') || desfecho.includes('morte');
  }).length;

  // Agrupar por data para encontrar o recorde diário
  const resgatesPorData = new Map<string, number>();
  
  registros.forEach(r => {
    const data = r.data || r.data_ocorrencia || '';
    if (data) {
      resgatesPorData.set(data, (resgatesPorData.get(data) || 0) + 1);
    }
  });

  let recordeDiario = 0;
  let recordeDiarioData = '';
  
  resgatesPorData.forEach((qtd, data) => {
    if (qtd > recordeDiario) {
      recordeDiario = qtd;
      recordeDiarioData = data;
    }
  });

  return {
    totalResgates,
    totalSolturas,
    totalFilhotes,
    totalObitos,
    recordeDiario,
    recordeDiarioData
  };
};

/**
 * Calcula distribuição de resgates por dia da semana
 */
export const transformWeekdayDistribution = (registros: any[]): WeekdayDistribution[] => {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const diasSemanaFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const contagem = [0, 0, 0, 0, 0, 0, 0]; // Dom-Sáb

  if (!Array.isArray(registros)) {
    return diasSemana.map((name, i) => ({ name, value: 0, fullName: diasSemanaFull[i] }));
  }

  registros.forEach(r => {
    const dataStr = r.data || r.data_ocorrencia;
    if (dataStr) {
      try {
        const data = new Date(dataStr);
        if (!isNaN(data.getTime())) {
          const diaSemana = data.getDay();
          // Para tabelas históricas, usar quantidade_resgates; para atuais, contar 1
          const qtd = Number(r.quantidade_resgates) || 1;
          contagem[diaSemana] += qtd;
        }
      } catch {
        // Ignorar datas inválidas
      }
    }
  });

  // Retornar todos os dias da semana com suas contagens
  return diasSemana.map((name, i) => ({
    name,
    value: contagem[i],
    fullName: diasSemanaFull[i]
  }));
};

/**
 * Retorna top 3 dias da semana com mais resgates
 */
export const getTopWeekdays = (distribution: WeekdayDistribution[]): WeekdayDistribution[] => {
  return [...distribution]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
};
