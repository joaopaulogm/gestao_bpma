import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Efetivo {
  id: string;
  antiguidade: number | null;
  posto_graduacao: string;
  quadro: string;
  quadro_sigla: string;
  nome_guerra: string;
  nome: string;
  matricula: string;
  sexo: string;
  lotacao: string;
  created_at: string;
}

export const useEfetivoTable = () => {
  const [efetivo, setEfetivo] = useState<Efetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quadroFilter, setQuadroFilter] = useState<string>('all');
  const [postoFilter, setPostoFilter] = useState<string>('all');

  const fetchEfetivo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dim_efetivo')
        .select('*')
        .order('antiguidade', { ascending: true });

      if (error) throw error;
      setEfetivo((data as Efetivo[]) || []);
    } catch (error: any) {
      console.error('Error fetching efetivo:', error);
      toast.error('Erro ao carregar efetivo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEfetivo();
  }, []);

  const deleteEfetivo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dim_efetivo')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Policial removido com sucesso');
      fetchEfetivo();
    } catch (error: any) {
      console.error('Error deleting efetivo:', error);
      toast.error('Erro ao remover policial');
    }
  };

  const filteredEfetivo = efetivo.filter((item) => {
    const matchesSearch = 
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.matricula.includes(searchTerm);
    
    const matchesQuadro = quadroFilter === 'all' || item.quadro === quadroFilter;
    const matchesPosto = postoFilter === 'all' || item.posto_graduacao === postoFilter;
    
    return matchesSearch && matchesQuadro && matchesPosto;
  });

  // Get unique postos for the selected quadro
  const postosDisponiveis = [...new Set(
    efetivo
      .filter(item => quadroFilter === 'all' || item.quadro === quadroFilter)
      .map(item => item.posto_graduacao)
  )];

  return {
    efetivo: filteredEfetivo,
    loading,
    searchTerm,
    setSearchTerm,
    quadroFilter,
    setQuadroFilter,
    postoFilter,
    setPostoFilter,
    postosDisponiveis,
    deleteEfetivo,
    refetch: fetchEfetivo,
  };
};
