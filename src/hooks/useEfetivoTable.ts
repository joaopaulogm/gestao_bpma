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

// Ordem hierárquica dos postos (Oficiais)
const ORDEM_OFICIAIS: Record<string, number> = {
  'CEL QOPM': 1,
  'TC QOPM': 2,
  'MAJ QOPM': 3,
  'CAP QOPM': 4,
  '1º TEN QOPM': 5,
  '2º TEN QOPM': 6,
  'ASP QOPM': 7,
  'CAP QOPMA': 8,
  '1º TEN QOPMA': 9,
  '2º TEN QOPMA': 10,
};

// Ordem hierárquica das graduações (Praças)
const ORDEM_PRACAS: Record<string, number> = {
  'ST QPPMC': 1,
  '1º SGT QPPMC': 2,
  '2º SGT QPPMC': 3,
  '3º SGT QPPMC': 4,
  'CB QPPMC': 5,
  'SD QPPMC': 6,
  'SD 2ª CL QPPMC': 7,
};

// Função de ordenação por antiguidade militar
const sortByAntiguidade = (a: Efetivo, b: Efetivo): number => {
  // Oficiais sempre antes de Praças
  if (a.quadro === 'Oficiais' && b.quadro === 'Praças') return -1;
  if (a.quadro === 'Praças' && b.quadro === 'Oficiais') return 1;
  
  // Dentro do mesmo quadro, ordenar por posto/graduação
  const ordemA = a.quadro === 'Oficiais' 
    ? ORDEM_OFICIAIS[a.posto_graduacao] || 999 
    : ORDEM_PRACAS[a.posto_graduacao] || 999;
  const ordemB = b.quadro === 'Oficiais' 
    ? ORDEM_OFICIAIS[b.posto_graduacao] || 999 
    : ORDEM_PRACAS[b.posto_graduacao] || 999;
  
  if (ordemA !== ordemB) return ordemA - ordemB;
  
  // Dentro do mesmo posto/graduação, ordenar por número de antiguidade
  return (a.antiguidade || 999) - (b.antiguidade || 999);
};

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

  const filteredEfetivo = efetivo
    .filter((item) => {
      const matchesSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matricula.includes(searchTerm);
      
      const matchesQuadro = quadroFilter === 'all' || item.quadro === quadroFilter;
      const matchesPosto = postoFilter === 'all' || item.posto_graduacao === postoFilter;
      
      return matchesSearch && matchesQuadro && matchesPosto;
    })
    .sort(sortByAntiguidade);

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
