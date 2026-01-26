import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Edit2, Users, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMonth, getYear, format } from 'date-fns';
import { useCampanhaCalendar, TeamType, UnitType } from '@/hooks/useCampanhaCalendar';
import { useCampanhaQuotas } from '@/hooks/useCampanhaQuotas';
import { CampanhaCalendarView } from '@/components/campanha/CampanhaCalendarView';
import { CampanhaQuotaSection } from '@/components/campanha/CampanhaQuotaSection';
import { StatusLegendChips } from '@/components/campanha/StatusLegendChips';
import { TeamMembersDialog } from '@/components/campanha/TeamMembersDialog';
import { useCampanhaData } from '@/hooks/useCampanhaData';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Ler ano e mês dos query params
  const initialYear = searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : 2026;
  const initialMonth = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) - 1 : 0;
  
  const [selectedYear, setSelectedYear] = useState<string>(initialYear.toString());
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('Alfa');
  const [selectedUnidade, setSelectedUnidade] = useState<UnitType>('Guarda');

  const year = parseInt(selectedYear);
  const month = getMonth(currentDate);

  const {
    loading,
    efetivo,
    isFeriado,
    getDayCounts,
    getTeamsForDay,
    getTeamForDate,
    hasAlteracao,
    administrativoTrabalha,
    UNITS,
    TEAMS,
  } = useCampanhaCalendar(year, month);

  const {
    ferias: feriasQuota,
    abono: abonoQuota,
    loading: quotasLoading,
  } = useCampanhaQuotas(year, month);

  const {
    membros: membrosCampanha,
    getMembrosForTeam: getMembrosForTeamData,
    addMembro,
    removeMembro,
    updateMembroEquipe,
  } = useCampanhaData(year);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentDate(new Date(parseInt(value), month, 1));
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    if (getYear(date) !== year) {
      setSelectedYear(getYear(date).toString());
    }
  };

  const handleDayClick = (date: Date) => {
    // Navegar para página detalhada do dia
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/secao-pessoas/campanha/${dateStr}`);
  };

  const hasAlteracaoInDay = (date: Date) => UNITS.some(u => hasAlteracao(date, u));

  // Configuração inicial para o card 1º de janeiro
  const configInicial = useMemo(() => {
    return UNITS.map(u => ({
      unidade: u,
      equipe: defaultInitialTeams[u],
    }));
  }, [UNITS]);

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
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Campanha</h1>
              <p className="text-sm text-muted-foreground">
                Gestão de escalas e disponibilidade do efetivo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={selectedYear} onValueChange={handleYearChange}>
              <TabsList>
                <TabsTrigger value="2025">2025</TabsTrigger>
                <TabsTrigger value="2026">2026</TabsTrigger>
                <TabsTrigger value="2027">2027</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Seção de Cotas */}
        <CampanhaQuotaSection
          feriasQuota={feriasQuota}
          abonoQuota={abonoQuota}
          ano={year}
          mes={month}
          loading={quotasLoading}
        />

        {/* Legenda das Equipes */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Legenda das Equipes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedTeam('Alfa');
                setSelectedUnidade('Guarda');
                setMembersDialogOpen(true);
              }}
            >
              <Users className="h-4 w-4 mr-1" /> Ver Membros
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {TEAMS.map(t => (
              <Badge 
                key={t} 
                variant="outline" 
                className={`${teamColors[t]} cursor-pointer`}
                onClick={() => {
                  setSelectedTeam(t);
                  setSelectedUnidade('Guarda');
                  setMembersDialogOpen(true);
                }}
              >
                Equipe {t}
              </Badge>
            ))}
            <Badge variant="outline" className="bg-slate-500/20 text-slate-600 border-slate-400/40">
              Administrativo (Seg–Sex)
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30">
              Feriado
            </Badge>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
              <Edit2 className="h-3 w-3 mr-1" />
              Alteração Manual
            </Badge>
          </CardContent>
        </Card>

        {/* Configuração Inicial - 1º de Janeiro */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> 
              Configuração Inicial – 1º de Janeiro de {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {configInicial.filter(c => ['Guarda', 'Armeiro', 'RP Ambiental', 'GOC', 'Lacustre'].includes(c.unidade)).map(c => (
                <span key={c.unidade} className="text-sm">
                  {c.unidade}: <Badge variant="outline" className={teamColors[c.equipe]}>{c.equipe}</Badge>
                </span>
              ))}
              {configInicial.filter(c => c.unidade === 'GTA').map(c => (
                <span key={c.unidade} className="text-sm">
                  GTA: <Badge variant="outline" className={teamColors[c.equipe]}>{c.equipe}</Badge>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instrução de clique */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Clique em um dia</strong> para ver todas as equipes e policiais escalados, 
              com sinalizações de impedimentos (férias, abono, atestado) e previsões.
            </p>
          </CardContent>
        </Card>

        {/* Calendário */}
        <CampanhaCalendarView
          currentDate={currentDate}
          onDateChange={handleDateChange}
          getDayCounts={getDayCounts}
          getTeamsForDay={getTeamsForDay}
          isFeriado={isFeriado}
          onDayClick={handleDayClick}
          hasAlteracaoInDay={hasAlteracaoInDay}
          UNITS={UNITS}
          getTeamForDate={getTeamForDate}
          administrativoTrabalha={administrativoTrabalha}
          hasAlteracao={hasAlteracao}
          onMonthSelectFromYear={() => {}}
        />

        {/* Dialog de Membros da Equipe */}
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
