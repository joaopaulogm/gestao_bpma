
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define the FilterState interface that was missing
export interface FilterState {
  year: number;
  month: number | null;
}

export interface DashboardData {
  totalResgates: number;
  totalApreensoes: number;
  distribuicaoPorClasse: { name: string; value: number }[];
  destinos: { name: string; value: number }[];
  desfechos: { name: string; value: number }[];
  especiesMaisResgatadas: { name: string; quantidade: number }[];
  especiesMaisApreendidas: { name: string; quantidade: number }[];
  atropelamentos: { name: string; quantidade: number }[];
  analysis?: {
    r_data?: {
      summary?: any;
      plots?: string[];
    };
  };
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<FilterState>({
    year: new Date().getFullYear(),
    month: null,
  });

  const fetchDashboardData = async (): Promise<DashboardData> => {
    let query = supabase
      .from('registros')
      .select('*')
      .gte('data', `${filters.year}-01-01`)
      .lte('data', `${filters.year}-12-31`);

    if (filters.month !== null) {
      const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      const nextMonth = filters.month === 11 
        ? `${filters.year + 1}-01-01`
        : `${filters.year}-${String(filters.month + 2).padStart(2, '0')}-01`;
      
      query = query
        .gte('data', monthStart)
        .lt('data', nextMonth);
    }

    const { data: registros, error } = await query;

    if (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }

    const resgates = registros.filter(r => r.origem === 'Resgate de Fauna');
    const apreensoes = registros.filter(r => r.origem === 'Apreensão');

    // Processar dados para distribuição por classe
    const classeCount = registros.reduce((acc, reg) => {
      acc[reg.classe_taxonomica] = (acc[reg.classe_taxonomica] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processar dados para destinos
    const destinosCount = registros.reduce((acc, reg) => {
      acc[reg.destinacao] = (acc[reg.destinacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processar dados para desfechos de apreensão
    const desfechosCount = apreensoes.reduce((acc, reg) => {
      const desfecho = reg.desfecho_apreensao || 'Não informado';
      acc[desfecho] = (acc[desfecho] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processar espécies mais resgatadas
    const especiesResgatadas = resgates.reduce((acc, reg) => {
      acc[reg.nome_popular] = (acc[reg.nome_popular] || 0) + reg.quantidade;
      return acc;
    }, {} as Record<string, number>);

    // Processar espécies mais apreendidas
    const especiesApreendidas = apreensoes.reduce((acc, reg) => {
      acc[reg.nome_popular] = (acc[reg.nome_popular] || 0) + reg.quantidade;
      return acc;
    }, {} as Record<string, number>);

    // Processar atropelamentos
    const atropelamentosData = registros
      .filter(r => r.atropelamento === 'Sim')
      .reduce((acc, reg) => {
        acc[reg.nome_popular] = (acc[reg.nome_popular] || 0) + reg.quantidade;
        return acc;
    }, {} as Record<string, number>);

    return {
      totalResgates: resgates.length,
      totalApreensoes: apreensoes.length,
      distribuicaoPorClasse: Object.entries(classeCount).map(([name, value]) => ({ name, value })),
      destinos: Object.entries(destinosCount).map(([name, value]) => ({ name, value })),
      desfechos: Object.entries(desfechosCount).map(([name, value]) => ({ name, value })),
      especiesMaisResgatadas: Object.entries(especiesResgatadas)
        .map(([name, quantidade]) => ({ name, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5),
      especiesMaisApreendidas: Object.entries(especiesApreendidas)
        .map(([name, quantidade]) => ({ name, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5),
      atropelamentos: Object.entries(atropelamentosData)
        .map(([name, quantidade]) => ({ name, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData
  });

  const updateFilters = (year: number, month: number | null) => {
    setFilters({ year, month });
  };

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilters
  };
};
