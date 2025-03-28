import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parse, parseISO, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChartDataItem, 
  TimeSeriesItem, 
  MapDataPoint,
  HealthDistribution,
  DashboardMetric,
  DashboardData
} from '@/types/hotspots';

export interface FilterState {
  year: number;
  month: number | null;
  classeTaxonomica: string | null;
  origem: string | null;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<FilterState>({
    year: 2025,
    month: null,
    classeTaxonomica: null,
    origem: null,
  });

  const fetchDashboardData = async (): Promise<DashboardData> => {
    console.log("Fetching dashboard data with filters:", filters);
    
    // Construir query de data base
    let query = supabase
      .from('registros')
      .select('*');
    
    // Aplicar filtro de ano
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('data', startDate).lte('data', endDate);
    
    // Aplicar filtro de mês se especificado
    if (filters.month !== null) {
      const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      const monthEnd = format(
        endOfMonth(new Date(filters.year, filters.month, 1)),
        'yyyy-MM-dd'
      );
      
      query = query.gte('data', monthStart).lte('data', monthEnd);
    }
    
    // Aplicar filtro de classe taxonômica se especificado
    if (filters.classeTaxonomica) {
      query = query.eq('classe_taxonomica', filters.classeTaxonomica);
    }
    
    // Aplicar filtro de origem se especificado
    if (filters.origem) {
      query = query.eq('origem', filters.origem);
    }
    
    const { data: registros, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
    
    // 1. Dados de base/contagem
    const resgates = registros.filter(r => r.origem === 'Resgate de Fauna');
    const apreensoes = registros.filter(r => r.origem === 'Apreensão');
    const animaisAtropelados = registros.filter(r => r.atropelamento === 'Sim');
    
    // 2. Distribuição por região administrativa
    const regiaoMap = new Map<string, number>();
    registros.forEach(reg => {
      regiaoMap.set(reg.regiao_administrativa, (regiaoMap.get(reg.regiao_administrativa) || 0) + 1);
    });
    
    const regiaoAdministrativa = Array.from(regiaoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 3. Distribuição por origem
    const origemDistribuicao = [
      { name: 'Resgate de Fauna', value: resgates.length },
      { name: 'Apreensão', value: apreensoes.length }
    ];
    
    // 4. Distribuição por classe taxonômica
    const classeMap = new Map<string, number>();
    registros.forEach(reg => {
      classeMap.set(reg.classe_taxonomica, (classeMap.get(reg.classe_taxonomica) || 0) + 1);
    });
    
    const classeTaxonomica = Array.from(classeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 5. Desfecho de resgate
    const desfechoResgateMap = new Map<string, number>();
    resgates.forEach(reg => {
      const desfecho = reg.desfecho_resgate || 'Não informado';
      desfechoResgateMap.set(desfecho, (desfechoResgateMap.get(desfecho) || 0) + 1);
    });
    
    const desfechoResgate = Array.from(desfechoResgateMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 6. Desfecho de apreensão
    const desfechoApreensaoMap = new Map<string, number>();
    apreensoes.forEach(reg => {
      const desfecho = reg.desfecho_apreensao || 'Não informado';
      desfechoApreensaoMap.set(desfecho, (desfechoApreensaoMap.get(desfecho) || 0) + 1);
    });
    
    const desfechoApreensao = Array.from(desfechoApreensaoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 7. Estado de saúde
    const estadoSaudeMap = new Map<string, number>();
    registros.forEach(reg => {
      estadoSaudeMap.set(reg.estado_saude, (estadoSaudeMap.get(reg.estado_saude) || 0) + 1);
    });
    
    const totalSaude = registros.length;
    const estadoSaude = Array.from(estadoSaudeMap.entries())
      .map(([estado, quantidade]) => ({ 
        estado, 
        quantidade, 
        percentual: (quantidade / totalSaude) * 100 
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
    
    // 8. Tipos de destinação
    const destinacaoMap = new Map<string, number>();
    registros.forEach(reg => {
      destinacaoMap.set(reg.destinacao, (destinacaoMap.get(reg.destinacao) || 0) + 1);
    });
    
    const destinacaoTipos = Array.from(destinacaoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 9. Distribuição de atropelamento
    const atropelamentoDistribuicao = [
      { name: 'Atropelamento', value: animaisAtropelados.length },
      { name: 'Outros', value: registros.length - animaisAtropelados.length }
    ];
    
    // 10. Distribuição por estágio de vida
    const estagioVidaMap = new Map<string, number>();
    registros.forEach(reg => {
      estagioVidaMap.set(reg.estagio_vida, (estagioVidaMap.get(reg.estagio_vida) || 0) + 1);
    });
    
    const estagioVidaDistribuicao = Array.from(estagioVidaMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 11. Espécies mais resgatadas
    const especiesResgateMap = new Map<string, number>();
    resgates.forEach(reg => {
      const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
      especiesResgateMap.set(chave, (especiesResgateMap.get(chave) || 0) + (reg.quantidade || 1));
    });
    
    const especiesMaisResgatadas = Array.from(especiesResgateMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    
    // 12. Espécies mais apreendidas
    const especiesApreensaoMap = new Map<string, number>();
    apreensoes.forEach(reg => {
      const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
      especiesApreensaoMap.set(chave, (especiesApreensaoMap.get(chave) || 0) + (reg.quantidade || 1));
    });
    
    const especiesMaisApreendidas = Array.from(especiesApreensaoMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    
    // 13. Espécies atropeladas
    const especiesAtropeladasMap = new Map<string, number>();
    animaisAtropelados.forEach(reg => {
      const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
      especiesAtropeladasMap.set(chave, (especiesAtropeladasMap.get(chave) || 0) + (reg.quantidade || 1));
    });
    
    const especiesAtropeladas = Array.from(especiesAtropeladasMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
    
    // 14. Motivos de entrega no CEAPA
    const motivosCEAPAMap = new Map<string, number>();
    registros
      .filter(reg => reg.destinacao === 'CEAPA/BPMA' && reg.motivo_entrega_ceapa)
      .forEach(reg => {
        motivosCEAPAMap.set(
          reg.motivo_entrega_ceapa as string, 
          (motivosCEAPAMap.get(reg.motivo_entrega_ceapa as string) || 0) + 1
        );
      });
    
    const motivosEntregaCEAPA = Array.from(motivosCEAPAMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // 15. Dados para mapa de origem
    const mapDataOrigem = registros.map(reg => ({
      id: reg.id,
      latitude: reg.latitude_origem,
      longitude: reg.longitude_origem,
      tipo: reg.origem,
      nome_popular: reg.nome_popular,
      quantidade: reg.quantidade || 1
    }));
    
    // 16. Dados para mapa de soltura
    const mapDataSoltura = registros
      .filter(reg => reg.latitude_soltura && reg.longitude_soltura)
      .map(reg => ({
        id: reg.id,
        latitude: reg.latitude_soltura as string,
        longitude: reg.longitude_soltura as string,
        tipo: 'Soltura',
        nome_popular: reg.nome_popular,
        quantidade: reg.quantidade || 1
      }));
    
    // 17. Dados para série temporal
    // Always show all months for 2025 regardless of data
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    let timeSeriesData: TimeSeriesItem[] = monthNames.map((monthName, index) => {
      return {
        date: monthName,
        resgates: 0,
        apreensoes: 0,
        total: 0
      };
    });
    
    // Preencher os dados reais
    registros.forEach(reg => {
      const regDate = new Date(reg.data);
      const month = regDate.getMonth();
      
      if (timeSeriesData[month]) {
        if (reg.origem === 'Resgate de Fauna') {
          timeSeriesData[month].resgates += 1;
        } else if (reg.origem === 'Apreensão') {
          timeSeriesData[month].apreensoes += 1;
        }
        timeSeriesData[month].total += 1;
      }
    });
    
    // 18. Estatísticas de quantidade por ocorrência
    const quantidades = registros
      .map(r => r.quantidade || 0)
      .filter(q => q > 0);
    
    const min = Math.min(...quantidades, 0);
    const max = Math.max(...quantidades, 0);
    const sum = quantidades.reduce((acc, val) => acc + val, 0);
    const avg = quantidades.length ? sum / quantidades.length : 0;
    
    // Calcular mediana
    const sortedQuantidades = [...quantidades].sort((a, b) => a - b);
    const mid = Math.floor(sortedQuantidades.length / 2);
    const median = sortedQuantidades.length % 2 === 0
      ? (sortedQuantidades[mid - 1] + sortedQuantidades[mid]) / 2
      : sortedQuantidades[mid];
    
    // Criar as propriedades adicionais que faltam para os gráficos
    const distribuicaoPorClasse = classeTaxonomica; // Usar a mesma distribuição por classe taxonômica
    const destinos = destinacaoTipos; // Usar os mesmos tipos de destinação
    const desfechos = desfechoApreensao; // Usar os mesmos desfechos de apreensão
    const atropelamentos = especiesAtropeladas; // Usar as mesmas espécies atropeladas
    
    // 19. Métricas para cartões de resumo
    const metricas: DashboardMetric[] = [
      {
        title: 'Total de Registros',
        value: registros.length,
        iconType: 'Layers',
        iconColor: 'text-blue-500'
      },
      {
        title: 'Resgates',
        value: resgates.length,
        iconType: 'Bird',
        iconColor: 'text-green-500'
      },
      {
        title: 'Apreensões',
        value: apreensoes.length,
        iconType: 'Target',
        iconColor: 'text-purple-500'
      },
      {
        title: 'Atropelamentos',
        value: animaisAtropelados.length,
        iconType: 'Car',
        iconColor: 'text-pink-500'
      },
      {
        title: 'Espécies Registradas',
        value: new Set(registros.map(r => r.nome_cientifico)).size,
        iconType: 'Bird',
        iconColor: 'text-amber-500'
      },
      {
        title: 'Animais Contabilizados',
        value: registros.reduce((sum, r) => sum + (r.quantidade || 1), 0),
        iconType: 'Users',
        iconColor: 'text-cyan-500'
      }
    ];
    
    return {
      totalRegistros: registros.length,
      totalResgates: resgates.length,
      totalApreensoes: apreensoes.length,
      totalAtropelamentos: animaisAtropelados.length,
      timeSeriesData,
      regiaoAdministrativa,
      origemDistribuicao,
      classeTaxonomica,
      desfechoResgate,
      desfechoApreensao,
      estadoSaude,
      destinacaoTipos,
      atropelamentoDistribuicao,
      estagioVidaDistribuicao,
      especiesMaisResgatadas,
      especiesMaisApreendidas,
      especiesAtropeladas,
      motivosEntregaCEAPA,
      mapDataOrigem,
      mapDataSoltura,
      quantidadePorOcorrencia: {
        min,
        max,
        avg,
        median
      },
      metricas,
      ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
      // Adicionar as propriedades que faltam
      distribuicaoPorClasse,
      destinos,
      desfechos,
      atropelamentos,
      rawData: registros // Adicionar os dados brutos para uso no componente de recordes
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch
  };
};
