import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export type TeamType = 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
export type UnitType = 'Guarda' | 'Armeiro' | 'RP Ambiental' | 'GOC' | 'Lacustre' | 'GTA' | 'Administrativo';

export interface EquipeCampanha {
  id: string;
  nome: string;
}

export interface CampanhaMembro {
  id: string;
  equipe_id: string;
  efetivo_id: string;
  unidade: string;
  ano: number;
  funcao: string | null;
  efetivo?: {
    id: string;
    nome: string;
    nome_guerra: string;
    posto_graduacao: string;
    matricula: string;
  };
}

export interface CampanhaAlteracao {
  id: string;
  data: string;
  unidade: string;
  equipe_original_id: string | null;
  equipe_nova_id: string;
  motivo: string | null;
}

export interface CampanhaConfig {
  id: string;
  unidade: string;
  equipe_inicial_id: string;
  data_inicio: string;
  ano: number;
}

const TEAMS: TeamType[] = ['Alfa', 'Bravo', 'Charlie', 'Delta'];
const UNITS: UnitType[] = ['Guarda', 'Armeiro', 'RP Ambiental', 'GOC', 'Lacustre', 'GTA', 'Administrativo'];

// Feriados nacionais
const feriados: Record<number, string[]> = {
  2025: [
    '2025-01-01', '2025-03-03', '2025-03-04', '2025-04-18', '2025-04-21',
    '2025-05-01', '2025-06-19', '2025-09-07', '2025-10-12', '2025-11-02',
    '2025-11-15', '2025-11-20', '2025-12-25',
  ],
  2026: [
    '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21',
    '2026-05-01', '2026-06-04', '2026-09-07', '2026-10-12', '2026-11-02',
    '2026-11-15', '2026-11-20', '2026-12-25',
  ],
};

export const useCampanhaData = (year: number) => {
  const [equipes, setEquipes] = useState<EquipeCampanha[]>([]);
  const [membros, setMembros] = useState<CampanhaMembro[]>([]);
  const [alteracoes, setAlteracoes] = useState<CampanhaAlteracao[]>([]);
  const [configs, setConfigs] = useState<CampanhaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [efetivo, setEfetivo] = useState<any[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch equipes
      const { data: equipesData, error: equipesError } = await supabase
        .from('dim_equipes_campanha')
        .select('*')
        .order('nome');
      
      if (equipesError) throw equipesError;
      setEquipes(equipesData || []);

      // Fetch membros com efetivo
      const { data: membrosData, error: membrosError } = await supabase
        .from('fat_campanha_membros')
        .select(`
          *,
          efetivo:dim_efetivo(id, nome, nome_guerra, posto_graduacao, matricula)
        `)
        .eq('ano', year);
      
      if (membrosError) throw membrosError;
      setMembros(membrosData || []);

      // Fetch alterações do ano
      const { data: alteracoesData, error: alteracoesError } = await supabase
        .from('fat_campanha_alteracoes')
        .select('*')
        .gte('data', `${year}-01-01`)
        .lte('data', `${year}-12-31`);
      
      if (alteracoesError) throw alteracoesError;
      setAlteracoes(alteracoesData || []);

      // Fetch configs do ano
      const { data: configsData, error: configsError } = await supabase
        .from('fat_campanha_config')
        .select('*')
        .eq('ano', year);
      
      if (configsError) throw configsError;
      setConfigs(configsData || []);

      // Fetch efetivo para adicionar membros
      const { data: efetivoData, error: efetivoError } = await supabase
        .from('dim_efetivo')
        .select('*')
        .order('posto_graduacao')
        .order('nome');
      
      if (efetivoError) throw efetivoError;
      setEfetivo(efetivoData || []);

    } catch (error) {
      console.error('Erro ao carregar dados da campanha:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Default initial teams if no config exists
  const defaultInitialTeams: Record<UnitType, TeamType | null> = {
    'Guarda': 'Bravo',
    'Armeiro': 'Bravo',
    'RP Ambiental': 'Bravo',
    'GOC': 'Bravo',
    'Lacustre': 'Bravo',
    'GTA': 'Alfa',
    'Administrativo': null,
  };

  // Get team name by ID
  const getTeamName = useCallback((teamId: string): TeamType | null => {
    const equipe = equipes.find(e => e.id === teamId);
    return equipe ? equipe.nome as TeamType : null;
  }, [equipes]);

  // Get team ID by name
  const getTeamId = useCallback((teamName: TeamType): string | null => {
    const equipe = equipes.find(e => e.nome === teamName);
    return equipe?.id || null;
  }, [equipes]);

  // Calculate team for a specific date and unit
  const getTeamForDate = useCallback((date: Date, unidade: UnitType): TeamType | null => {
    if (unidade === 'Administrativo') return null;

    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for manual alterations first
    const alteracao = alteracoes.find(a => a.data === dateStr && a.unidade === unidade);
    if (alteracao) {
      return getTeamName(alteracao.equipe_nova_id);
    }

    // Get initial team from config or default
    const config = configs.find(c => c.unidade === unidade);
    let startTeam: TeamType;
    
    if (config) {
      startTeam = getTeamName(config.equipe_inicial_id) || defaultInitialTeams[unidade]!;
    } else {
      startTeam = defaultInitialTeams[unidade]!;
    }

    // Calculate based on rotation (24h/72h = 1 work, 3 rest)
    const startDate = new Date(year, 0, 1);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cyclePosition = ((diffDays % 4) + 4) % 4;
    const startIndex = TEAMS.indexOf(startTeam);
    const teamIndex = (startIndex + cyclePosition) % 4;
    
    return TEAMS[teamIndex];
  }, [alteracoes, configs, equipes, year, getTeamName]);

  // Check if it's a holiday
  const isFeriado = useCallback((date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return feriados[year]?.includes(dateStr) || false;
  }, [year]);

  // Check if administrative works on this day
  const administrativoTrabalha = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    if (isFeriado(date)) return false;
    return true;
  }, [isFeriado]);

  // Get members for a specific team and unit
  const getMembrosForTeam = useCallback((teamName: TeamType, unidade: UnitType): CampanhaMembro[] => {
    const teamId = getTeamId(teamName);
    if (!teamId) return [];
    return membros.filter(m => m.equipe_id === teamId && m.unidade === unidade);
  }, [membros, getTeamId]);

  // Save a schedule alteration
  const saveAlteracao = useCallback(async (
    date: Date,
    unidade: UnitType,
    novaEquipe: TeamType,
    motivo?: string
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const novaEquipeId = getTeamId(novaEquipe);
    
    if (!novaEquipeId) {
      toast.error('Equipe inválida');
      return false;
    }

    const originalTeam = getTeamForDate(date, unidade);
    const originalTeamId = originalTeam ? getTeamId(originalTeam) : null;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('fat_campanha_alteracoes')
        .upsert({
          data: dateStr,
          unidade,
          equipe_original_id: originalTeamId,
          equipe_nova_id: novaEquipeId,
          motivo,
          created_by: user.user?.id,
        }, {
          onConflict: 'data,unidade',
        });

      if (error) throw error;

      await fetchData();
      toast.success('Alteração salva com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar alteração:', error);
      toast.error('Erro ao salvar alteração');
      return false;
    }
  }, [getTeamId, getTeamForDate, fetchData]);

  // Remove an alteration
  const removeAlteracao = useCallback(async (date: Date, unidade: UnitType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      const { error } = await supabase
        .from('fat_campanha_alteracoes')
        .delete()
        .eq('data', dateStr)
        .eq('unidade', unidade);

      if (error) throw error;

      await fetchData();
      toast.success('Alteração removida');
      return true;
    } catch (error) {
      console.error('Erro ao remover alteração:', error);
      toast.error('Erro ao remover alteração');
      return false;
    }
  }, [fetchData]);

  // Add a member to a team
  const addMembro = useCallback(async (
    equipeNome: TeamType,
    efetivoId: string,
    unidade: UnitType,
    funcao?: string
  ) => {
    const equipeId = getTeamId(equipeNome);
    if (!equipeId) {
      toast.error('Equipe inválida');
      return false;
    }

    try {
      const { error } = await supabase
        .from('fat_campanha_membros')
        .upsert({
          equipe_id: equipeId,
          efetivo_id: efetivoId,
          unidade,
          ano: year,
          funcao,
        }, {
          onConflict: 'efetivo_id,unidade,ano',
        });

      if (error) throw error;

      await fetchData();
      toast.success('Membro adicionado');
      return true;
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast.error('Erro ao adicionar membro');
      return false;
    }
  }, [getTeamId, year, fetchData]);

  // Remove a member from a team
  const removeMembro = useCallback(async (membroId: string) => {
    try {
      const { error } = await supabase
        .from('fat_campanha_membros')
        .delete()
        .eq('id', membroId);

      if (error) throw error;

      await fetchData();
      toast.success('Membro removido');
      return true;
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error('Erro ao remover membro');
      return false;
    }
  }, [fetchData]);

  // Update member's team (for service swap)
  const updateMembroEquipe = useCallback(async (
    membroId: string,
    novaEquipeNome: TeamType
  ) => {
    const novaEquipeId = getTeamId(novaEquipeNome);
    if (!novaEquipeId) {
      toast.error('Equipe inválida');
      return false;
    }

    try {
      const { error } = await supabase
        .from('fat_campanha_membros')
        .update({ equipe_id: novaEquipeId })
        .eq('id', membroId);

      if (error) throw error;

      await fetchData();
      toast.success('Membro transferido');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast.error('Erro ao transferir membro');
      return false;
    }
  }, [getTeamId, fetchData]);

  // Check if there's an alteration for a date/unit
  const hasAlteracao = useCallback((date: Date, unidade: UnitType): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return alteracoes.some(a => a.data === dateStr && a.unidade === unidade);
  }, [alteracoes]);

  return {
    equipes,
    membros,
    alteracoes,
    configs,
    loading,
    efetivo,
    TEAMS,
    UNITS,
    getTeamForDate,
    isFeriado,
    administrativoTrabalha,
    getMembrosForTeam,
    saveAlteracao,
    removeAlteracao,
    addMembro,
    removeMembro,
    updateMembroEquipe,
    hasAlteracao,
    getTeamId,
    getTeamName,
    refetch: fetchData,
  };
};
