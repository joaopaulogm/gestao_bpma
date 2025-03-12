import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

    // Process the data and add the quantidade property
    const processedRegistros = registros.map(registro => ({
      ...registro,
      quantidade_adulto: registro.quantidade_adulto || 0,
      quantidade_filhote: registro.quantidade_filhote || 0,
      quantidade: (registro.quantidade_adulto || 0) + (registro.quantidade_filhote || 0)
    }));

    const resgates = processedRegistros.filter(r => r.origem === 'Resgate de Fauna');
    const apreensoes = processedRegistros.filter(r => r.origem === 'Apreensão');

    const classeCount = processedRegistros.reduce((acc, reg) => {
      acc[reg.classe_taxonomica] = (acc[reg.classe_taxonomica] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const destinosCount = processedRegistros.reduce((acc, reg) => {
      acc[reg.destinacao] = (acc[reg.destinacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const desfechosCount = apreensoes.reduce((acc, reg) => {
      const desfecho = reg.desfecho_apreensao || 'Não informado';
      acc[desfecho] = (acc[desfecho] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const especiesResgatadasMap = new Map<string, number>();
    const especiesApreensõesMap = new Map<string, number>();
    const atropelamentosMap = new Map<string, number>();

    resgates.forEach(r => {
      const total = r.quantidade;
      especiesResgatadasMap.set(r.nome_popular, (especiesResgatadasMap.get(r.nome_popular) || 0) + 
        ((r.quantidade_adulto || 0) + (r.quantidade_filhote || 0)));
    });

    apreensoes.forEach(r => {
      const total = r.quantidade;
      especiesApreensõesMap.set(r.nome_popular, (especiesApreensõesMap.get(r.nome_popular) || 0) + 
        ((r.quantidade_adulto || 0) + (r.quantidade_filhote || 0)));
    });

    processedRegistros.forEach(r => {
      const total = r.quantidade;
      atropelamentosMap.set(r.nome_popular, (atropelamentosMap.get(r.nome_popular) || 0) + 
        ((r.quantidade_adulto || 0) + (r.quantidade_filhote || 0)));
    });

    const especiesResgatadas = Array.from(especiesResgatadasMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const especiesApreendidas = Array.from(especiesApreensõesMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const atropelamentos = Array.from(atropelamentosMap.entries())
      .map(([name, quantidade]) => ({ name, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    return {
      totalResgates: resgates.length,
      totalApreensoes: apreensoes.length,
      distribuicaoPorClasse: Object.entries(classeCount).map(([name, value]) => ({ name, value })),
      destinos: Object.entries(destinosCount).map(([name, value]) => ({ name, value })),
      desfechos: Object.entries(desfechosCount).map(([name, value]) => ({ name, value })),
      especiesMaisResgatadas,
      especiesMaisApreendidas,
      atropelamentos
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
