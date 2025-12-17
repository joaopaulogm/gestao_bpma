import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface FaunaEspecie {
  id: string;
  nome_popular: string;
  nome_cientifico: string | null;
  nome_popular_slug: string;
  classe_taxonomica: string | null;
  ordem_taxonomica: string | null;
  tipo_fauna: string | null;
  estado_conservacao: string | null;
  grupo: string | null;
  imagens: string[];
  bucket: string;
  id_dim_especie_fauna: string | null;
  // Photo validation fields from dimension
  foto_principal_path: string | null;
  fotos_paths: string[];
  foto_status: 'validada' | 'pendente' | 'rejeitada' | null;
  foto_fonte_validacao: string | null;
  foto_validada_em: string | null;
}

export type SortField = 'nome_popular' | 'nome_cientifico' | 'classe_taxonomica' | 'grupo' | 'foto_status';
export type SortDirection = 'asc' | 'desc';

export const useFaunaTable = () => {
  const queryClient = useQueryClient();
  const [especies, setEspecies] = useState<FaunaEspecie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterGrupo, setFilterGrupo] = useState('all');
  const [filterFotoStatus, setFilterFotoStatus] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('nome_popular');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchEspecies = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch fauna with joined dimension data
      const { data, error: fetchError } = await supabase
        .from('fauna')
        .select(`
          *,
          dim_especies_fauna:id_dim_especie_fauna (
            foto_principal_path,
            fotos_paths,
            foto_status,
            foto_fonte_validacao,
            foto_validada_em
          )
        `)
        .order('nome_popular');

      if (fetchError) throw fetchError;

      const mapped: FaunaEspecie[] = (data || []).map((item: any) => ({
        id: item.id,
        nome_popular: item.nome_popular,
        nome_cientifico: item.nome_cientifico,
        nome_popular_slug: item.nome_popular_slug,
        classe_taxonomica: item.classe_taxonomica,
        ordem_taxonomica: item.ordem_taxonomica,
        tipo_fauna: item.tipo_fauna,
        estado_conservacao: item.estado_conservacao,
        grupo: item.grupo,
        imagens: item.imagens || [],
        bucket: item.bucket || 'imagens-fauna',
        id_dim_especie_fauna: item.id_dim_especie_fauna,
        foto_principal_path: item.dim_especies_fauna?.foto_principal_path || null,
        fotos_paths: item.dim_especies_fauna?.fotos_paths || [],
        foto_status: item.dim_especies_fauna?.foto_status || null,
        foto_fonte_validacao: item.dim_especies_fauna?.foto_fonte_validacao || null,
        foto_validada_em: item.dim_especies_fauna?.foto_validada_em || null,
      }));

      setEspecies(mapped);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar espécies:', err);
      setError('Falha ao carregar dados da fauna');
      toast.error('Falha ao carregar dados da fauna');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEspecies();
    
    const channel = supabase
      .channel('fauna-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fauna' },
        () => {
          fetchEspecies();
          queryClient.invalidateQueries({ queryKey: ['fauna'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEspecies, queryClient]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('fauna')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Espécie excluída com sucesso');
      fetchEspecies();
    } catch (error) {
      console.error('Erro ao excluir espécie:', error);
      toast.error('Erro ao excluir espécie');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredAndSortedEspecies = useMemo(() => {
    const filtered = especies.filter(especie => {
      const matchesSearch = !searchTerm || 
        especie.nome_popular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especie.nome_cientifico?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClasse = filterClasse === 'all' || especie.classe_taxonomica === filterClasse;
      const matchesGrupo = filterGrupo === 'all' || especie.grupo === filterGrupo;
      const matchesFotoStatus = filterFotoStatus === 'all' || especie.foto_status === filterFotoStatus;
      
      return matchesSearch && matchesClasse && matchesGrupo && matchesFotoStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [especies, searchTerm, filterClasse, filterGrupo, filterFotoStatus, sortField, sortDirection]);

  const uniqueClasses = useMemo(() => {
    const classes = especies.map(e => e.classe_taxonomica).filter((c): c is string => !!c);
    return [...new Set(classes)].sort();
  }, [especies]);

  const uniqueGrupos = useMemo(() => {
    const grupos = especies.map(e => e.grupo).filter((g): g is string => !!g);
    return [...new Set(grupos)].sort();
  }, [especies]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClasse('all');
    setFilterGrupo('all');
    setFilterFotoStatus('all');
  };

  const hasActiveFilters = searchTerm || filterClasse !== 'all' || filterGrupo !== 'all' || filterFotoStatus !== 'all';

  return {
    especies: filteredAndSortedEspecies,
    totalCount: especies.length,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterClasse,
    setFilterClasse,
    filterGrupo,
    setFilterGrupo,
    filterFotoStatus,
    setFilterFotoStatus,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    refreshEspecies: fetchEspecies,
    uniqueClasses,
    uniqueGrupos,
    sortField,
    sortDirection,
    handleSort,
    clearFilters,
    hasActiveFilters,
  };
};
