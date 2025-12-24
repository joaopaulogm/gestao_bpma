import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  imagens: string[];
  nomesPopulares: string[];
  // Photo validation fields
  fotoPrincipalPath: string | null;
  fotosPaths: string[];
  fotoStatus: 'validada' | 'pendente' | 'rejeitada' | null;
  fotoFonteValidacao: string | null;
  fotoValidadaEm: string | null;
}

export type SortField = 'nomePopular' | 'nomeCientifico' | 'classe' | 'tipoPlanta' | 'estadoConservacao' | 'fotoStatus';
export type SortDirection = 'asc' | 'desc';

export const useFloraTable = () => {
  const queryClient = useQueryClient();
  const [especies, setEspecies] = useState<FloraEspecie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState<string>('all');
  const [filterTipoPlanta, setFilterTipoPlanta] = useState<string>('all');
  const [filterEstadoConservacao, setFilterEstadoConservacao] = useState<string>('all');
  const [filterFotoStatus, setFilterFotoStatus] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('nomePopular');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchEspecies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dim_especies_flora')
        .select('*')
        .order('nome_popular');

      if (fetchError) throw fetchError;

      const mapped: FloraEspecie[] = (data || []).map((item: any) => ({
        id: item.id,
        nomePopular: item.nome_popular,
        nomeCientifico: item.nome_cientifico,
        classe: item.classe_taxonomica,
        ordem: item.ordem_taxonomica,
        familia: item.familia_taxonomica,
        estadoConservacao: item.estado_de_conservacao,
        tipoPlanta: item.tipo_de_planta,
        madeiraLei: item.madeira_de_lei,
        imuneCorte: item.imune_ao_corte,
        imagens: item.imagens || [],
        nomesPopulares: item.nomes_populares || [],
        fotoPrincipalPath: item.foto_principal_path || null,
        fotosPaths: Array.isArray(item.fotos_paths) ? item.fotos_paths as string[] : [],
        fotoStatus: item.foto_status as 'validada' | 'pendente' | 'rejeitada' | null,
        fotoFonteValidacao: item.foto_fonte_validacao || null,
        fotoValidadaEm: item.foto_validada_em || null,
      }));

      setEspecies(mapped);
    } catch (err) {
      console.error('Erro ao buscar espécies de flora:', err);
      setError('Erro ao carregar espécies de flora');
      toast.error('Falha ao carregar dados da flora');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEspecies();
    
    // Real-time subscription
    const channel = supabase
      .channel('flora-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dim_especies_flora' },
        () => {
          fetchEspecies();
          queryClient.invalidateQueries({ queryKey: ['flora'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEspecies, queryClient]);

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

      const matchesClasse = filterClasse === 'all' || especie.classe === filterClasse;
      const matchesTipoPlanta = filterTipoPlanta === 'all' || especie.tipoPlanta === filterTipoPlanta;
      const matchesEstadoConservacao = filterEstadoConservacao === 'all' || especie.estadoConservacao === filterEstadoConservacao;
      const matchesFotoStatus = filterFotoStatus === 'all' || especie.fotoStatus === filterFotoStatus;

      return matchesSearch && matchesClasse && matchesTipoPlanta && matchesEstadoConservacao && matchesFotoStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [especies, searchTerm, filterClasse, filterTipoPlanta, filterEstadoConservacao, filterFotoStatus, sortField, sortDirection]);

  const uniqueClasses = useMemo(() => {
    const classes = especies.map((e) => e.classe).filter((c): c is string => !!c);
    return [...new Set(classes)].sort();
  }, [especies]);

  const uniqueTiposPlanta = useMemo(() => {
    const tipos = especies.map((e) => e.tipoPlanta).filter((t): t is string => !!t);
    return [...new Set(tipos)].sort();
  }, [especies]);

  const uniqueEstadosConservacao = useMemo(() => {
    const estados = especies.map((e) => e.estadoConservacao).filter((e): e is string => !!e);
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
    setFilterFotoStatus('all');
  };

  const hasActiveFilters = searchTerm || filterClasse !== 'all' || filterTipoPlanta !== 'all' || filterEstadoConservacao !== 'all' || filterFotoStatus !== 'all';

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
    filterFotoStatus,
    setFilterFotoStatus,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    refreshEspecies: fetchEspecies,
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
