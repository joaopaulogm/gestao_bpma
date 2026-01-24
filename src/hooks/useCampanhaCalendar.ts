import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, getMonth, getYear } from 'date-fns';
import { toast } from 'sonner';

// Types
export type TeamType = 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
export type UnitType = 'Guarda' | 'Armeiro' | 'RP Ambiental' | 'GOC' | 'Lacustre' | 'GTA';
export type MemberStatus = 'apto' | 'impedido' | 'restricao' | 'atestado' | 'voluntario' | 'previsao';

// Unit configuration - teams and rotation
interface UnitConfig {
  teams: TeamType[];
  cycleLength: number; // days in cycle (work + rest)
}

const UNIT_CONFIGS: Record<UnitType, UnitConfig> = {
  'Guarda': { teams: ['Alfa', 'Bravo', 'Charlie', 'Delta'], cycleLength: 4 }, // 24x72
  'Armeiro': { teams: ['Alfa', 'Bravo', 'Charlie', 'Delta'], cycleLength: 4 },
  'RP Ambiental': { teams: ['Alfa', 'Bravo', 'Charlie', 'Delta'], cycleLength: 4 },
  'GOC': { teams: ['Alfa', 'Bravo', 'Charlie', 'Delta'], cycleLength: 4 },
  'Lacustre': { teams: ['Alfa', 'Bravo', 'Charlie', 'Delta'], cycleLength: 4 },
  'GTA': { teams: ['Alfa', 'Bravo', 'Charlie'], cycleLength: 6 }, // 12x60 = 0.5 day work, 2.5 days rest = ~6 rotations
};

export interface StatusColors {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export const STATUS_COLORS: Record<MemberStatus, StatusColors> = {
  apto: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700', dot: 'bg-green-500' },
  impedido: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500' },
  restricao: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', dot: 'bg-orange-500' },
  atestado: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', dot: 'bg-purple-500' },
  voluntario: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
  previsao: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
};

export const STATUS_LABELS: Record<MemberStatus, string> = {
  apto: 'Apto',
  impedido: 'Impedido',
  restricao: 'Restrição',
  atestado: 'Atestado',
  voluntario: 'Voluntário',
  previsao: 'Previsão',
};

export interface EquipeCampanha {
  id: string;
  nome: string;
}

export interface EfetivoData {
  id: string;
  nome: string;
  nome_guerra: string;
  posto_graduacao: string;
  matricula: string;
}

export interface MemberWithStatus {
  id: string;
  efetivo_id: string;
  efetivo: EfetivoData;
  status: MemberStatus;
  statusReason?: string;
  returnDate?: string;
  isVolunteer?: boolean;
}

export interface TeamForDay {
  unidade: UnitType;
  equipe: TeamType | null;
  membros: MemberWithStatus[];
  counts: Record<MemberStatus, number>;
}

export interface DayCounts {
  apto: number;
  impedido: number;
  restricao: number;
  atestado: number;
  voluntario: number;
  previsao: number;
  total: number;
}

export interface VolunteerEntry {
  efetivo_id: string;
  equipe_id?: string;
  unidade: string;
  observacao?: string;
}

export interface VolunteerStorage {
  date: string;
  items: VolunteerEntry[];
}

// Constants
export const TEAMS: TeamType[] = ['Alfa', 'Bravo', 'Charlie', 'Delta'];
export const UNITS: UnitType[] = ['Guarda', 'Armeiro', 'RP Ambiental', 'GOC', 'Lacustre', 'GTA'];

const UNIT_TO_GRUPAMENTO: Record<UnitType, string> = {
  'Guarda': 'GUARDA',
  'Armeiro': 'ARMEIRO',
  'RP Ambiental': 'RPA AMBIENTAL',
  'GOC': 'GOC',
  'Lacustre': 'LACUSTRE',
  'GTA': 'GTA',
};

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

const VACATION_QUOTA_PER_MONTH = 480;

export const useCampanhaCalendar = (year: number, month: number) => {
  const [equipes, setEquipes] = useState<EquipeCampanha[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [alteracoes, setAlteracoes] = useState<any[]>([]);
  const [efetivo, setEfetivo] = useState<EfetivoData[]>([]);
  const [equipesReais, setEquipesReais] = useState<any[]>([]);
  const [membrosReais, setMembrosReais] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [feriasParcelas, setFeriasParcelas] = useState<any[]>([]);
  const [abonos, setAbonos] = useState<any[]>([]);
  const [licencas, setLicencas] = useState<any[]>([]);
  const [restricoes, setRestricoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: equipesData },
        { data: configsData },
        { data: alteracoesData },
        { data: efetivoData },
        { data: equipesReaisData },
        { data: membrosReaisData },
        { data: feriasData },
        { data: feriasParcelasData },
        { data: abonosData },
        { data: licencasData },
        { data: restricoesData },
      ] = await Promise.all([
        supabase.from('dim_equipes_campanha').select('*').order('nome'),
        supabase.from('fat_campanha_config').select('*').eq('ano', year),
        supabase.from('fat_campanha_alteracoes').select('*').gte('data', `${year}-01-01`).lte('data', `${year}-12-31`),
        supabase.from('dim_efetivo').select('id, nome, nome_guerra, posto_graduacao, matricula').order('posto_graduacao').order('nome'),
        supabase.from('dim_equipes').select('*').order('grupamento'),
        supabase.from('fat_equipe_membros').select(`
          id, equipe_id, efetivo_id, funcao,
          efetivo:dim_efetivo(id, nome, nome_guerra, posto_graduacao, matricula),
          equipe:dim_equipes(id, nome, grupamento)
        `),
        supabase.from('fat_ferias').select('*').eq('ano', year),
        supabase.from('fat_ferias_parcelas').select('*, fat_ferias!inner(efetivo_id, ano)').eq('fat_ferias.ano', year),
        supabase.from('fat_abono').select('*').eq('ano', year),
        supabase.from('fat_licencas_medicas').select('*').eq('ano', year),
        supabase.from('fat_restricoes').select('*').eq('ano', year),
      ]);

      setEquipes(equipesData || []);
      setConfigs(configsData || []);
      setAlteracoes(alteracoesData || []);
      setEfetivo(efetivoData || []);
      setEquipesReais(equipesReaisData || []);
      setMembrosReais(membrosReaisData || []);
      setFerias(feriasData || []);
      setFeriasParcelas(feriasParcelasData || []);
      setAbonos(abonosData || []);
      setLicencas(licencasData || []);
      setRestricoes(restricoesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da campanha');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for férias, abono, licenças e restrições
  useEffect(() => {
    const channel = supabase
      .channel('campanha-calendar-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias' }, () => {
        console.log('[Campanha] fat_ferias changed, refetching...');
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias_parcelas' }, () => {
        console.log('[Campanha] fat_ferias_parcelas changed, refetching...');
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_abono' }, () => {
        console.log('[Campanha] fat_abono changed, refetching...');
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_licencas_medicas' }, () => {
        console.log('[Campanha] fat_licencas_medicas changed, refetching...');
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_restricoes' }, () => {
        console.log('[Campanha] fat_restricoes changed, refetching...');
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dim_equipes_campanha' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_campanha_membros' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_campanha_alteracoes' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_campanha_config' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_equipe_membros' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dim_efetivo' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

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

  // Default initial teams if no config exists
  const defaultInitialTeams: Record<UnitType, TeamType> = {
    'Guarda': 'Bravo',
    'Armeiro': 'Bravo',
    'RP Ambiental': 'Bravo',
    'GOC': 'Bravo',
    'Lacustre': 'Bravo',
    'GTA': 'Alfa',
  };

  // Calculate team for a specific date and unit
  const getTeamForDate = useCallback((date: Date, unidade: UnitType): TeamType | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for manual alterations first
    const alteracao = alteracoes.find(a => a.data === dateStr && a.unidade === unidade);
    if (alteracao) {
      return getTeamName(alteracao.equipe_nova_id);
    }

    // Get unit configuration
    const unitConfig = UNIT_CONFIGS[unidade];
    const availableTeams = unitConfig.teams;
    const cycleLength = unitConfig.cycleLength;

    // Get initial team from config or default
    const config = configs.find(c => c.unidade === unidade);
    let startTeam: TeamType;
    
    if (config) {
      startTeam = getTeamName(config.equipe_inicial_id) || defaultInitialTeams[unidade]!;
    } else {
      startTeam = defaultInitialTeams[unidade]!;
    }

    // Calculate based on unit-specific rotation
    const startDate = new Date(year, 0, 1);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cyclePosition = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    const startIndex = availableTeams.indexOf(startTeam);
    const teamIndex = (startIndex + cyclePosition) % availableTeams.length;
    
    return availableTeams[teamIndex];
  }, [alteracoes, configs, year, getTeamName]);

  // Check if it's a holiday
  const isFeriado = useCallback((date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return feriados[year]?.includes(dateStr) || false;
  }, [year]);

  // Get members for a team and unit
  const getMembrosForTeam = useCallback((teamName: TeamType | null, unidade: UnitType): any[] => {
    if (!teamName) return [];
    
    const grupamento = UNIT_TO_GRUPAMENTO[unidade];
    if (!grupamento) return [];

    // Find exact team by grupamento and name (case insensitive)
    const equipeExata = equipesReais.find((e: any) => 
      e.grupamento?.toUpperCase() === grupamento &&
      e.nome?.toUpperCase() === teamName.toUpperCase()
    );

    if (equipeExata) {
      return membrosReais.filter(m => m.equipe_id === equipeExata.id);
    }

    // Fallback: find by partial match
    const equipesDoGrupamento = equipesReais.filter((e: any) => 
      e.grupamento?.toUpperCase() === grupamento &&
      e.nome?.toUpperCase().includes(teamName.toUpperCase())
    );

    if (equipesDoGrupamento.length > 0) {
      const equipesIds = equipesDoGrupamento.map((e: any) => e.id);
      return membrosReais.filter(m => equipesIds.includes(m.equipe_id));
    }

    return [];
  }, [equipesReais, membrosReais]);

  // Get volunteers for a specific date from localStorage
  const getVolunteersForDate = useCallback((date: Date): VolunteerEntry[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `voluntarios_${dateStr}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data: VolunteerStorage = JSON.parse(stored);
        return data.items || [];
      }
    } catch (e) {
      console.error('Error reading volunteers:', e);
    }
    return [];
  }, []);

  // Save volunteer
  const saveVolunteer = useCallback((date: Date, volunteer: VolunteerEntry): void => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `voluntarios_${dateStr}`;
    try {
      const existing = getVolunteersForDate(date);
      const updated = [...existing, volunteer];
      const storage: VolunteerStorage = { date: dateStr, items: updated };
      localStorage.setItem(key, JSON.stringify(storage));
    } catch (e) {
      console.error('Error saving volunteer:', e);
    }
  }, [getVolunteersForDate]);

  // Remove volunteer
  const removeVolunteer = useCallback((date: Date, efetivoId: string): void => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const key = `voluntarios_${dateStr}`;
    try {
      const existing = getVolunteersForDate(date);
      const updated = existing.filter(v => v.efetivo_id !== efetivoId);
      if (updated.length === 0) {
        localStorage.removeItem(key);
      } else {
        const storage: VolunteerStorage = { date: dateStr, items: updated };
        localStorage.setItem(key, JSON.stringify(storage));
      }
    } catch (e) {
      console.error('Error removing volunteer:', e);
    }
  }, [getVolunteersForDate]);

  // Calculate member status for a specific date
  const getMemberStatus = useCallback((efetivoId: string, date: Date): { status: MemberStatus; reason?: string; returnDate?: string } => {
    const dateMonth = getMonth(date) + 1; // 1-indexed
    const dateStr = format(date, 'yyyy-MM-dd');

    // Priority 1: Check férias parcelas with specific dates (impedido)
    const parcelaRecord = feriasParcelas.find(p => {
      // Check if efetivo_id matches and ano is from the date (fat_ferias relationship)
      if (p.fat_ferias?.efetivo_id !== efetivoId) return false;
      if (p.fat_ferias?.ano !== getYear(date)) return false;
      if (!p.data_inicio || !p.data_fim) return false;
      
      try {
        const inicio = parseISO(p.data_inicio);
        const fim = parseISO(p.data_fim);
        return isWithinInterval(date, { start: inicio, end: fim });
      } catch {
        return false;
      }
    });
    if (parcelaRecord) {
      return { 
        status: 'impedido', 
        reason: 'Férias', 
        returnDate: parcelaRecord.data_fim 
      };
    }

    // Priority 2: Atestado (licença médica)
    const licencaRecord = licencas.find(l => {
      if (l.efetivo_id !== efetivoId) return false;
      const inicio = parseISO(l.data_inicio);
      const fim = l.data_fim ? parseISO(l.data_fim) : new Date();
      return isWithinInterval(date, { start: inicio, end: fim });
    });
    if (licencaRecord) {
      return { 
        status: 'atestado', 
        reason: licencaRecord.tipo || 'Licença Médica',
        returnDate: licencaRecord.data_fim || undefined 
      };
    }

    // Priority 3: Restrição médica
    const restricaoRecord = restricoes.find(r => {
      if (r.efetivo_id !== efetivoId) return false;
      const inicio = parseISO(r.data_inicio);
      const fim = r.data_fim ? parseISO(r.data_fim) : new Date();
      return isWithinInterval(date, { start: inicio, end: fim });
    });
    if (restricaoRecord) {
      return { 
        status: 'restricao', 
        reason: restricaoRecord.tipo_restricao || 'Restrição',
        returnDate: restricaoRecord.data_fim || undefined 
      };
    }

    // Priority 4: Voluntário (check localStorage)
    const volunteers = getVolunteersForDate(date);
    const isVolunteer = volunteers.some(v => v.efetivo_id === efetivoId);
    if (isVolunteer) {
      return { status: 'voluntario', reason: 'Extra remunerado' };
    }

    // Priority 5: Check férias previsão (without specific dates - only month indication)
    const feriaRecord = ferias.find(f => {
      if (f.efetivo_id !== efetivoId) return false;
      const mesInicio = f.mes_inicio;
      const mesFim = f.mes_fim || f.mes_inicio;
      return dateMonth >= mesInicio && dateMonth <= mesFim;
    });
    
    // Only mark as previsão if there are NO parcelas with dates for this férias
    if (feriaRecord) {
      const hasParcelas = feriasParcelas.some(p => 
        p.fat_ferias_id === feriaRecord.id && p.data_inicio && p.data_fim
      );
      if (!hasParcelas) {
        return { 
          status: 'previsao', 
          reason: 'Férias (previsão)', 
          returnDate: feriaRecord.mes_fim ? `Mês ${feriaRecord.mes_fim}` : undefined 
        };
      }
    }

    // Priority 6: Check abono (impedido if has dates, previsão if not)
    const abonoRecord = abonos.find(a => a.efetivo_id === efetivoId && a.mes === dateMonth);
    if (abonoRecord) {
      // Check if abono has specific dates marked
      const hasAbonoMarcado = (
        (abonoRecord.parcela1_inicio && abonoRecord.parcela1_fim) ||
        (abonoRecord.parcela2_inicio && abonoRecord.parcela2_fim) ||
        (abonoRecord.parcela3_inicio && abonoRecord.parcela3_fim) ||
        (abonoRecord.data_inicio && abonoRecord.data_fim)
      );
      
      if (hasAbonoMarcado) {
        // Check if current date is within any abono period
        const checkAbonoPeriod = (inicio: string | null, fim: string | null): boolean => {
          if (!inicio || !fim) return false;
          try {
            const startDate = parseISO(inicio);
            const endDate = parseISO(fim);
            return isWithinInterval(date, { start: startDate, end: endDate });
          } catch {
            return false;
          }
        };
        
        const isWithinAbono = 
          checkAbonoPeriod(abonoRecord.parcela1_inicio, abonoRecord.parcela1_fim) ||
          checkAbonoPeriod(abonoRecord.parcela2_inicio, abonoRecord.parcela2_fim) ||
          checkAbonoPeriod(abonoRecord.parcela3_inicio, abonoRecord.parcela3_fim) ||
          checkAbonoPeriod(abonoRecord.data_inicio, abonoRecord.data_fim);
        
        if (isWithinAbono) {
          return { status: 'impedido', reason: 'Abono', returnDate: undefined };
        }
      }
      
      // If no dates marked, mark as previsão (still apto for scheduling)
      return { status: 'previsao', reason: 'Abono (previsão)', returnDate: undefined };
    }

    // Priority 7: Apto
    return { status: 'apto' };
  }, [ferias, feriasParcelas, abonos, licencas, restricoes, getVolunteersForDate]);

  // Get all teams for a specific day with member statuses
  const getTeamsForDay = useCallback((date: Date): TeamForDay[] => {
    const volunteers = getVolunteersForDate(date);
    
    return UNITS.map(unidade => {
      const equipe = getTeamForDate(date, unidade);
      const rawMembros = getMembrosForTeam(equipe, unidade);
      
      const membros: MemberWithStatus[] = rawMembros.map(m => {
        const statusInfo = getMemberStatus(m.efetivo_id, date);
        return {
          id: m.id,
          efetivo_id: m.efetivo_id,
          efetivo: m.efetivo,
          status: statusInfo.status,
          statusReason: statusInfo.reason,
          returnDate: statusInfo.returnDate,
        };
      });

      // Add volunteers for this unit
      const unitVolunteers = volunteers.filter(v => v.unidade === unidade);
      unitVolunteers.forEach(v => {
        const ef = efetivo.find(e => e.id === v.efetivo_id);
        if (ef && !membros.some(m => m.efetivo_id === v.efetivo_id)) {
          membros.push({
            id: `vol-${v.efetivo_id}`,
            efetivo_id: v.efetivo_id,
            efetivo: ef,
            status: 'voluntario',
            statusReason: 'Extra remunerado',
            isVolunteer: true,
          });
        }
      });

      const counts: Record<MemberStatus, number> = {
        apto: membros.filter(m => m.status === 'apto').length,
        impedido: membros.filter(m => m.status === 'impedido').length,
        restricao: membros.filter(m => m.status === 'restricao').length,
        atestado: membros.filter(m => m.status === 'atestado').length,
        voluntario: membros.filter(m => m.status === 'voluntario').length,
        previsao: membros.filter(m => m.status === 'previsao').length,
      };

      return { unidade, equipe, membros, counts };
    });
  }, [getTeamForDate, getMembrosForTeam, getMemberStatus, getVolunteersForDate, efetivo]);

  // Get counts for a specific day (for calendar view)
  const getDayCounts = useCallback((date: Date): DayCounts => {
    const teams = getTeamsForDay(date);
    const counts: DayCounts = { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, previsao: 0, total: 0 };
    
    teams.forEach(team => {
      counts.apto += team.counts.apto;
      counts.impedido += team.counts.impedido;
      counts.restricao += team.counts.restricao;
      counts.atestado += team.counts.atestado;
      counts.voluntario += team.counts.voluntario;
      counts.previsao += team.counts.previsao;
    });
    
    counts.total = counts.apto + counts.impedido + counts.restricao + counts.atestado + counts.voluntario + counts.previsao;
    return counts;
  }, [getTeamsForDay]);

  // Calculate vacation quota for the selected month
  const vacationQuota = useMemo(() => {
    // Map month number to abbreviation
    const monthAbbreviations = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const currentMonthAbbrev = monthAbbreviations[month]; // month is 0-indexed

    // Filter parcelas for current month and campaign year
    const parcelasDoMes = feriasParcelas.filter(p => 
      p.fat_ferias?.ano === year && p.mes?.toUpperCase() === currentMonthAbbrev
    );

    // PREVISTO: total de dias das parcelas planejadas para o mês
    const previsto = parcelasDoMes.reduce((acc, p) => acc + (p.dias || 0), 0);

    // MARCADOS: parcelas do mês COM data_inicio E data_fim já registradas
    const marked = parcelasDoMes.reduce((acc, p) => {
      if (p.data_inicio && p.data_fim) {
        return acc + (p.dias || 0);
      }
      return acc;
    }, 0);

    const saldo = VACATION_QUOTA_PER_MONTH - previsto;

    return {
      limit: VACATION_QUOTA_PER_MONTH,
      previsto,
      marked,
      saldo,
      isOverLimit: previsto > VACATION_QUOTA_PER_MONTH,
    };
  }, [feriasParcelas, month, year]);

  // Save alteration
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

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('fat_campanha_alteracoes')
        .upsert({
          data: dateStr,
          unidade,
          equipe_nova_id: novaEquipeId,
          motivo,
          created_by: user.user?.id,
        }, {
          onConflict: 'data,unidade',
        });

      if (error) throw error;

      await fetchData();
      toast.success('Alteração salva');
      return true;
    } catch (error) {
      console.error('Erro ao salvar alteração:', error);
      toast.error('Erro ao salvar alteração');
      return false;
    }
  }, [getTeamId, fetchData]);

  return {
    loading,
    equipes,
    efetivo,
    equipesReais,
    TEAMS,
    UNITS,
    isFeriado,
    getTeamForDate,
    getTeamsForDay,
    getDayCounts,
    getMemberStatus,
    vacationQuota,
    saveVolunteer,
    removeVolunteer,
    getVolunteersForDate,
    saveAlteracao,
    fetchData,
  };
};
