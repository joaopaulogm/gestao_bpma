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
  ativo?: boolean;
  // Relacionamentos (opcionais, carregados sob demanda)
  user_role?: {
    id: string;
    role: string;
    login?: string;
    email?: string;
    ativo: boolean;
  };
  total_ferias?: number;
  total_abono?: number;
  total_licencas?: number;
  total_restricoes?: number;
  total_equipes?: number;
  total_os?: number;
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
      
      // Buscar dados de dim_efetivo com relacionamentos
      const { data: efetivoData, error: efetivoError } = await supabase
        .from('dim_efetivo')
        .select(`
          *,
          user_roles(
            id,
            role,
            login,
            email,
            ativo
          )
        `)
        .eq('ativo', true) // Apenas efetivo ativo
        .order('antiguidade', { ascending: true });

      if (efetivoError) throw efetivoError;

      // Buscar contagens de relacionamentos em paralelo
      const efetivoIds = (efetivoData || []).map(e => e.id);
      
      if (efetivoIds.length > 0) {
        // Buscar contagens de cada tabela relacionada
        const [feriasRes, abonoRes, licencasRes, restricoesRes, equipesRes, osRes] = await Promise.all([
          supabase.from('fat_ferias').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
          supabase.from('fat_abono').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
          supabase.from('fat_licencas_medicas').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
          supabase.from('fat_restricoes').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
          supabase.from('fat_equipe_membros').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
          supabase.from('fat_os_efetivo').select('efetivo_id', { count: 'exact', head: true }).in('efetivo_id', efetivoIds),
        ]);

        // Criar mapas de contagens por efetivo_id
        const contagensMap = new Map<string, {
          ferias: number;
          abono: number;
          licencas: number;
          restricoes: number;
          equipes: number;
          os: number;
        }>();

        // Processar contagens (as queries acima retornam apenas o total, então vamos fazer queries individuais)
        // Por performance, vamos fazer queries agrupadas
        const [feriasCounts, abonoCounts, licencasCounts, restricoesCounts, equipesCounts, osCounts] = await Promise.all([
          supabase.from('fat_ferias').select('efetivo_id').in('efetivo_id', efetivoIds),
          supabase.from('fat_abono').select('efetivo_id').in('efetivo_id', efetivoIds),
          supabase.from('fat_licencas_medicas').select('efetivo_id').in('efetivo_id', efetivoIds),
          supabase.from('fat_restricoes').select('efetivo_id').in('efetivo_id', efetivoIds),
          supabase.from('fat_equipe_membros').select('efetivo_id').in('efetivo_id', efetivoIds),
          supabase.from('fat_os_efetivo').select('efetivo_id').in('efetivo_id', efetivoIds),
        ]);

        // Contar por efetivo_id
        const countByEfetivo = (data: any[], field: string) => {
          const counts = new Map<string, number>();
          data?.forEach((item: any) => {
            const id = item[field];
            counts.set(id, (counts.get(id) || 0) + 1);
          });
          return counts;
        };

        const feriasCountsMap = countByEfetivo(feriasCounts.data || [], 'efetivo_id');
        const abonoCountsMap = countByEfetivo(abonoCounts.data || [], 'efetivo_id');
        const licencasCountsMap = countByEfetivo(licencasCounts.data || [], 'efetivo_id');
        const restricoesCountsMap = countByEfetivo(restricoesCounts.data || [], 'efetivo_id');
        const equipesCountsMap = countByEfetivo(equipesCounts.data || [], 'efetivo_id');
        const osCountsMap = countByEfetivo(osCounts.data || [], 'efetivo_id');

        // Enriquecer dados com contagens e relacionamentos
        const enrichedData = (efetivoData || []).map((e: any) => ({
          ...e,
          user_role: e.user_roles && e.user_roles.length > 0 ? e.user_roles[0] : undefined,
          total_ferias: feriasCountsMap.get(e.id) || 0,
          total_abono: abonoCountsMap.get(e.id) || 0,
          total_licencas: licencasCountsMap.get(e.id) || 0,
          total_restricoes: restricoesCountsMap.get(e.id) || 0,
          total_equipes: equipesCountsMap.get(e.id) || 0,
          total_os: osCountsMap.get(e.id) || 0,
        }));

        setEfetivo(enrichedData as Efetivo[]);
      } else {
        setEfetivo([]);
      }
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
