import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search, Edit2, Users, Target, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getMonth, getYear } from 'date-fns';
import { useCampanhaCalendar, MemberStatus, VolunteerEntry, UnitType, TeamType } from '@/hooks/useCampanhaCalendar';
import { useCampanhaData } from '@/hooks/useCampanhaData';
import { CampanhaCalendarView } from '@/components/campanha/CampanhaCalendarView';
import { CampanhaDayView } from '@/components/campanha/CampanhaDayView';
import { StatusLegendChips } from '@/components/campanha/StatusLegendChips';
import { MonthlyVacationQuotaCard } from '@/components/campanha/MonthlyVacationQuotaCard';
import { DayDetailDrawer } from '@/components/campanha/DayDetailDrawer';
import { EditTeamDialog } from '@/components/campanha/EditTeamDialog';
import { TeamMembersDialog } from '@/components/campanha/TeamMembersDialog';
import { AbonoQuotaCard, AbonoQuota } from '@/components/abono/AbonoQuotaCard';
import { supabase } from '@/integrations/supabase/client';

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-600 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-600 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

const defaultInitialTeams: Record<UnitType, TeamType> = {
  'Guarda': 'Bravo',
  'Armeiro': 'Bravo',
  'RP Ambiental': 'Bravo',
  'GOC': 'Bravo',
  'Lacustre': 'Bravo',
  'GTA': 'Alfa',
};

const Campanha: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<MemberStatus[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [abonoData, setAbonoData] = useState<any[]>([]);
  const [abonoLoading, setAbonoLoading] = useState(true);

  // Modo de edição e diálogos
  const [editMode, setEditMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date>(new Date());
  const [editingUnidade, setEditingUnidade] = useState<UnitType>('Guarda');
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('Alfa');
  const [selectedUnidade, setSelectedUnidade] = useState<UnitType>('Guarda');

  const year = parseInt(selectedYear);
  const month = getMonth(currentDate);

  const {
    loading,
    efetivo,
    equipes,
    configs,
    isFeriado,
    getDayCounts,
    getTeamsForDay,
    getTeamForDate,
    getTeamName,
    vacationQuota,
    saveVolunteer,
    removeVolunteer,
    getVolunteersForDate,
    saveAlteracao,
    removeAlteracao,
    hasAlteracao,
    administrativoTrabalha,
    ADMIN_SECTIONS,
    getMembrosForAdminSection,
    UNITS,
    TEAMS,
  } = useCampanhaCalendar(year, month);

  const {
    loading: loadingData,
    membros: membrosCampanha,
    getMembrosForTeam: getMembrosForTeamData,
    addMembro,
    removeMembro,
    updateMembroEquipe,
  } = useCampanhaData(year);

  // Buscar dados de abono
  const fetchAbonoData = useCallback(async () => {
    setAbonoLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_abono')
        .select('id, mes, ano, data_inicio, data_fim, parcela1_inicio, parcela1_fim, parcela2_inicio, parcela2_fim, parcela3_inicio, parcela3_fim')
        .eq('ano', year);
      if (error) throw error;
      setAbonoData(data || []);
    } catch (e) {
      console.error('Erro ao carregar abono:', e);
    } finally {
      setAbonoLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchAbonoData(); }, [fetchAbonoData]);

  const LIMITE_MENSAL = 80;
  const abonoQuotas = useMemo<AbonoQuota[]>(() => {
    const previstosPorMes: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    abonoData.forEach(item => {
      if (item.mes >= 1 && item.mes <= 12) previstosPorMes[item.mes]++;
    });
    return mesesNome.map((mes, idx) => {
      const mesNum = idx + 1;
      const previsto = (previstosPorMes[mesNum] || 0) * 5;
      let diasMarcados = 0;
      abonoData.forEach(item => {
        [[item.parcela1_inicio, item.parcela1_fim], [item.parcela2_inicio, item.parcela2_fim], [item.parcela3_inicio, item.parcela3_fim]].forEach(([ini, fim]) => {
          if (ini && fim) {
            const i = new Date(ini);
            if (i.getMonth() + 1 === mesNum && i.getFullYear() === year) {
              diasMarcados += Math.ceil((new Date(fim).getTime() - i.getTime()) / 86400000) + 1;
            }
          }
        });
        if (item.data_inicio && item.data_fim && item.mes === mesNum && !item.parcela1_inicio && !item.parcela2_inicio && !item.parcela3_inicio) {
          diasMarcados += Math.ceil((new Date(item.data_fim).getTime() - new Date(item.data_inicio).getTime()) / 86400000) + 1;
        }
      });
      return { mes, mesNum, limite: LIMITE_MENSAL, previsto, marcados: diasMarcados, saldo: LIMITE_MENSAL - diasMarcados };
    });
  }, [abonoData, year]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentDate(new Date(parseInt(value), month, 1));
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    if (getYear(date) !== year) setSelectedYear(getYear(date).toString());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setDrawerOpen(true);
  };

  const handleToggleFilter = (status: MemberStatus) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const selectedDayTeams = useMemo(() => (selectedDay ? getTeamsForDay(selectedDay) : []), [selectedDay, getTeamsForDay]);
  const selectedDayCounts = useMemo(() => (selectedDay ? getDayCounts(selectedDay) : { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, previsao: 0, total: 0 }), [selectedDay, getDayCounts]);
  const existingVolunteers = useMemo(() => (selectedDay ? getVolunteersForDate(selectedDay).map(v => v.efetivo_id) : []), [selectedDay, getVolunteersForDate]);

  const handleSaveVolunteer = (v: VolunteerEntry) => {
    if (selectedDay) { saveVolunteer(selectedDay, v); setDrawerOpen(false); setTimeout(() => setDrawerOpen(true), 50); }
  };
  const handleRemoveVolunteer = (id: string) => {
    if (selectedDay) { removeVolunteer(selectedDay, id); setDrawerOpen(false); setTimeout(() => setDrawerOpen(true), 50); }
  };

  const handleEditUnit = (date: Date, unidade: UnitType) => {
    setEditingDate(date);
    setEditingUnidade(unidade);
    setEditDialogOpen(true);
  };

  const hasAlteracaoInDay = useCallback((date: Date) => UNITS.some(u => hasAlteracao(date, u)), [UNITS, hasAlteracao]);

  // Configuração inicial para o card 1º de janeiro
  const configInicial = useMemo(() => {
    return UNITS.map(u => {
      const c = configs.find((x: any) => x.unidade === u);
      const nome = c ? (getTeamName(c.equipe_inicial_id) || defaultInitialTeams[u]) : defaultInitialTeams[u];
      return { unidade: u, equipe: nome };
    });
  }, [UNITS, configs, getTeamName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-4 md:py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/secao-pessoas">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Campanha</h1>
              <p className="text-sm text-muted-foreground">Gestão de escalas e disponibilidade do efetivo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={editMode ? 'default' : 'outline'} onClick={() => setEditMode(!editMode)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              {editMode ? 'Finalizar Edição' : 'Editar Escalas'}
            </Button>
            <Tabs value={selectedYear} onValueChange={handleYearChange}>
              <TabsList>
                <TabsTrigger value="2025">2025</TabsTrigger>
                <TabsTrigger value="2026">2026</TabsTrigger>
                <TabsTrigger value="2027">2027</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {editMode && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Edit2 className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium">Modo de Edição Ativo</p>
                <p className="text-sm text-muted-foreground">Clique em uma unidade na vista Dia para alterar a equipe de serviço ou use Ver Membros para gerenciar a composição.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legenda das Equipes */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Legenda das Equipes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedTeam('Alfa'); setSelectedUnidade('Guarda'); setMembersDialogOpen(true); }}>
              <Users className="h-4 w-4 mr-1" /> Ver Membros
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {TEAMS.map(t => (
              <Badge key={t} variant="outline" className={`${teamColors[t]} cursor-pointer`} onClick={() => { setSelectedTeam(t); setSelectedUnidade('Guarda'); setMembersDialogOpen(true); }}>Equipe {t}</Badge>
            ))}
            <Badge variant="outline" className="bg-slate-500/20 text-slate-600 border-slate-400/40">Administrativo (Seg–Sex)</Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30">Feriado</Badge>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30"><Edit2 className="h-3 w-3 mr-1" />Alteração Manual</Badge>
          </CardContent>
        </Card>

        {/* Configuração Inicial - 1º de Janeiro */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Configuração Inicial – 1º de Janeiro de {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {configInicial.filter(c => ['Guarda', 'Armeiro', 'RP Ambiental', 'GOC', 'Lacustre'].includes(c.unidade)).map(c => (
                <span key={c.unidade} className="text-sm">{c.unidade}: <Badge variant="outline" className={teamColors[c.equipe]}>{c.equipe}</Badge></span>
              ))}
              {configInicial.filter(c => c.unidade === 'GTA').map(c => (
                <span key={c.unidade} className="text-sm">GTA: <Badge variant="outline" className={teamColors[c.equipe]}>{c.equipe}</Badge></span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top: busca, filtros, cotas */}
        <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome de guerra, nome ou matrícula..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-white" />
            </div>
            <StatusLegendChips activeFilters={statusFilters} onToggleFilter={handleToggleFilter} />
          </div>
          <div className="space-y-4">
            <MonthlyVacationQuotaCard quota={vacationQuota} />
            <AbonoQuotaCard quotas={abonoQuotas} compact />
          </div>
        </div>

        {/* Calendário / Vista Dia */}
        <CampanhaCalendarView
          currentDate={currentDate}
          onDateChange={handleDateChange}
          getDayCounts={getDayCounts}
          isFeriado={isFeriado}
          onDayClick={handleDayClick}
          hasAlteracaoInDay={hasAlteracaoInDay}
          UNITS={UNITS}
          getTeamForDate={getTeamForDate}
          administrativoTrabalha={administrativoTrabalha}
          hasAlteracao={hasAlteracao}
          onMonthSelectFromYear={() => {}}
          renderDayView={() => (
            <CampanhaDayView
              currentDate={currentDate}
              teams={getTeamsForDay(currentDate)}
              isFeriado={isFeriado}
              hasAlteracao={hasAlteracao}
              editMode={editMode}
              onEditUnit={handleEditUnit}
              ADMIN_SECTIONS={ADMIN_SECTIONS}
              getMembrosForAdminSection={getMembrosForAdminSection}
              administrativoTrabalha={administrativoTrabalha}
            />
          )}
        />

        <DayDetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          date={selectedDay}
          teams={selectedDayTeams}
          counts={selectedDayCounts}
          vacationQuota={vacationQuota}
          efetivo={efetivo}
          onSaveVolunteer={handleSaveVolunteer}
          onRemoveVolunteer={handleRemoveVolunteer}
          existingVolunteers={existingVolunteers}
        />

        <EditTeamDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          date={editingDate}
          unidade={editingUnidade}
          currentTeam={getTeamForDate(editingDate, editingUnidade)}
          hasExistingAlteration={hasAlteracao(editingDate, editingUnidade)}
          onSave={(team, motivo) => saveAlteracao(editingDate, editingUnidade, team, motivo)}
          onRemove={() => removeAlteracao(editingDate, editingUnidade)}
        />

        <TeamMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          team={selectedTeam}
          unidade={selectedUnidade}
          membros={getMembrosForTeamData(selectedTeam, selectedUnidade)}
          allEfetivo={efetivo}
          allMembros={membrosCampanha}
          onAddMembro={(efetivoId, funcao) => addMembro(selectedTeam, efetivoId, selectedUnidade, funcao)}
          onRemoveMembro={removeMembro}
          onTransferMembro={updateMembroEquipe}
        />
      </div>
    </div>
  );
};

export default Campanha;
