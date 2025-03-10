
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Especie, 
  buscarTodasEspecies,
  buscarEspeciesPorClasse,
  excluirEspecie
} from '@/services/especieService';

export const useFaunaTable = () => {
  const queryClient = useQueryClient();
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchEspecies = useCallback(async () => {
    setLoading(true);
    try {
      let data: Especie[];
      
      if (filterClasse) {
        data = await buscarEspeciesPorClasse(filterClasse);
      } else {
        data = await buscarTodasEspecies();
      }
      
      setEspecies(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar espécies:', err);
      setError('Falha ao carregar dados da fauna');
      toast.error('Falha ao carregar dados da fauna');
    } finally {
      setLoading(false);
    }
  }, [filterClasse]);

  useEffect(() => {
    fetchEspecies();
  }, [fetchEspecies]);

  const handleDelete = async (id: string) => {
    try {
      const success = await excluirEspecie(id);
      
      if (success) {
        toast.success('Espécie excluída com sucesso');
        await fetchEspecies();
        queryClient.invalidateQueries({ queryKey: ['especies'] });
      } else {
        toast.error('Erro ao excluir espécie');
      }
    } catch (error) {
      console.error('Erro ao excluir espécie:', error);
      toast.error('Erro ao excluir espécie');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const filteredEspecies = especies.filter(especie => {
    const matchesSearch = searchTerm === '' || 
      especie.nome_popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
      especie.nome_cientifico.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
    refreshEspecies: fetchEspecies
  };
};
