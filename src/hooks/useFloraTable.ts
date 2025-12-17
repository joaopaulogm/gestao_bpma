import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FloraEspecie {
  id: string;
  nomePopular: string | null;
  nomeCientifico: string | null;
  classe: string | null;
  ordem: string | null;
  familia: string | null;
  estadoConservacao: string | null;
  tipoPlanta: string | null;
  madeiraLei: string | null;
  imuneCorte: string | null;
}

export type SortField = 'nomePopular' | 'nomeCientifico' | 'classe' | 'tipoPlanta' | 'estadoConservacao';
export type SortDirection = 'asc' | 'desc';

export const useFloraTable = () => {
  const [especies, setEspecies] = useState<FloraEspecie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState<string>('all');
  const [filterTipoPlanta, setFilterTipoPlanta] = useState<string>('all');
  const [filterEstadoConservacao, setFilterEstadoConservacao] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('nomePopular');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchEspecies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dim_especies_flora')
        .select('*')
        .order('Nome Popular');

      if (fetchError) throw fetchError;

      const mapped: FloraEspecie[] = (data || []).map((item) => ({
        id: item.id,
        nomePopular: item['Nome Popular'],
        nomeCientifico: item['Nome Científico'],
        classe: item['Classe'],
        ordem: item['Ordem'],
        familia: item['Família'],
        estadoConservacao: item['Estado de Conservação'],
        tipoPlanta: item['Tipo de Planta'],
        madeiraLei: item['Madeira de Lei'],
        imuneCorte: item['Imune ao Corte'],
      }));

      setEspecies(mapped);
    } catch (err) {
      console.error('Erro ao buscar espécies de flora:', err);
      setError('Erro ao carregar espécies de flora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecies();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEspecies = useMemo(() => {
    const filtered = especies.filter((especie) => {
      const matchesSearch =
        !searchTerm ||
        especie.nomePopular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especie.nomeCientifico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especie.familia?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClasse =
        filterClasse === 'all' || especie.classe === filterClasse;

      const matchesTipoPlanta =
        filterTipoPlanta === 'all' || especie.tipoPlanta === filterTipoPlanta;

      const matchesEstadoConservacao =
        filterEstadoConservacao === 'all' || especie.estadoConservacao === filterEstadoConservacao;

      return matchesSearch && matchesClasse && matchesTipoPlanta && matchesEstadoConservacao;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      const comparison = aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [especies, searchTerm, filterClasse, filterTipoPlanta, filterEstadoConservacao, sortField, sortDirection]);

  const uniqueClasses = useMemo(() => {
    const classes = especies
      .map((e) => e.classe)
      .filter((c): c is string => !!c);
    return [...new Set(classes)].sort();
  }, [especies]);

  const uniqueTiposPlanta = useMemo(() => {
    const tipos = especies
      .map((e) => e.tipoPlanta)
      .filter((t): t is string => !!t);
    return [...new Set(tipos)].sort();
  }, [especies]);

  const uniqueEstadosConservacao = useMemo(() => {
    const estados = especies
      .map((e) => e.estadoConservacao)
      .filter((e): e is string => !!e);
    return [...new Set(estados)].sort();
  }, [especies]);

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dim_especies_flora')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEspecies((prev) => prev.filter((e) => e.id !== id));
      setConfirmDeleteId(null);
      toast.success('Espécie de flora excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir espécie:', err);
      toast.error('Erro ao excluir espécie de flora');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClasse('all');
    setFilterTipoPlanta('all');
    setFilterEstadoConservacao('all');
  };

  const hasActiveFilters = searchTerm || filterClasse !== 'all' || filterTipoPlanta !== 'all' || filterEstadoConservacao !== 'all';

  return {
    especies: filteredAndSortedEspecies,
    totalCount: especies.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterClasse,
    setFilterClasse,
    filterTipoPlanta,
    setFilterTipoPlanta,
    filterEstadoConservacao,
    setFilterEstadoConservacao,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    uniqueClasses,
    uniqueTiposPlanta,
    uniqueEstadosConservacao,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
    hasActiveFilters,
  };
};
