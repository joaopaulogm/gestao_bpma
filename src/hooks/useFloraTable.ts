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

export const useFloraTable = () => {
  const [especies, setEspecies] = useState<FloraEspecie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const filteredEspecies = useMemo(() => {
    return especies.filter((especie) => {
      const matchesSearch =
        !searchTerm ||
        especie.nomePopular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        especie.nomeCientifico?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClasse =
        filterClasse === 'all' || especie.classe === filterClasse;

      return matchesSearch && matchesClasse;
    });
  }, [especies, searchTerm, filterClasse]);

  const uniqueClasses = useMemo(() => {
    const classes = especies
      .map((e) => e.classe)
      .filter((c): c is string => !!c);
    return [...new Set(classes)].sort();
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

  return {
    especies: filteredEspecies,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterClasse,
    setFilterClasse,
    confirmDeleteId,
    setConfirmDeleteId,
    handleDelete,
    uniqueClasses,
  };
};
