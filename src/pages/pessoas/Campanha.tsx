import React, { useState } from 'react';
import { Target, ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Building2, Anchor, Plane, Shield, Edit2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isWeekend, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCampanhaData, TeamType, UnitType, AdminSectionType } from '@/hooks/useCampanhaData';
import { EditTeamDialog } from '@/components/campanha/EditTeamDialog';
import { TeamMembersDialog } from '@/components/campanha/TeamMembersDialog';

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary/80 border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const teamBorderColors: Record<TeamType, string> = {
  'Alfa': 'border-red-500/30',
  'Bravo': 'border-primary/30',
  'Charlie': 'border-green-500/30',
  'Delta': 'border-purple-500/30',
};

const unitIcons: Record<UnitType, React.ReactNode> = {
  'Guarda': <Shield className="h-4 w-4" />,
  'Armeiro': <Target className="h-4 w-4" />,
  'RP Ambiental': <CalendarIcon className="h-4 w-4" />,
  'GOC': <Users className="h-4 w-4" />,
  'Lacustre': <Anchor className="h-4 w-4" />,
  'GTA': <Plane className="h-4 w-4" />,
};

type ViewMode = 'day' | 'week' | 'month' | 'year';

const Campanha: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [editMode, setEditMode] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<Date>(new Date());
  const [editingUnidade, setEditingUnidade] = useState<UnitType>('Guarda');

  // Team members dialog state
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('Alfa');
  const [selectedUnidade, setSelectedUnidade] = useState<UnitType>('Guarda');

  const year = parseInt(selectedYear);
  
  const {
    equipes,
    membros,
    loading,
    efetivo,
    TEAMS,
    UNITS,
    ADMIN_SECTIONS,
    getTeamForDate,
    isFeriado,
    administrativoTrabalha,
    getMembrosForTeam,
    getMembrosForAdminSection,
    saveAlteracao,
    removeAlteracao,
    addMembro,
    removeMembro,
    updateMembroEquipe,
    hasAlteracao,
  } = useCampanhaData(year);

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, -7));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, 7));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
        break;
    }
  };

  const getNavigationLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return currentDate.getFullYear().toString();
    }
  };

  const openEditDialog = (date: Date, unidade: UnitType) => {
    setEditingDate(date);
    setEditingUnidade(unidade);
    setEditDialogOpen(true);
  };

  const openMembersDialog = (team: TeamType, unidade: UnitType) => {
    setSelectedTeam(team);
    setSelectedUnidade(unidade);
    setMembersDialogOpen(true);
  };

  // Handle day click from month view
  const handleDayClick = (day: Date, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setCurrentDate(day);
      setViewMode('day');
    }
  };

  // Render month calendar
  const renderMonthCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks: Date[][] = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isHoliday = isFeriado(day);
              const isWeekendDay = isWeekend(day);
              const hasAlt = UNITS.some(u => hasAlteracao(day, u));
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-1 rounded-lg border transition-all ${
                    !isCurrentMonth 
                      ? 'bg-muted/30 border-border/30' 
                      : isHoliday
                        ? 'bg-red-500/10 border-red-500/30'
                        : isWeekendDay
                          ? 'bg-muted/50 border-border/50'
                          : 'bg-card border-border hover:border-primary/50'
                  } ${isCurrentMonth ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => handleDayClick(day, isCurrentMonth)}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center gap-1 ${
                    !isCurrentMonth ? 'text-muted-foreground/50' : 
                    isHoliday ? 'text-red-400' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                    {hasAlt && isCurrentMonth && (
                      <Edit2 className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="space-y-0.5">
                      {UNITS.slice(0, 4).map((unidade) => {
                        const team = getTeamForDate(day, unidade);
                        return team ? (
                          <Badge 
                            key={unidade} 
                            variant="outline" 
                            className={`text-[9px] px-1 py-0 ${teamColors[team]} truncate block`}
                          >
                            {unidade.substring(0, 3)}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render day view with edit and members
  const renderDayView = () => {
    const isHoliday = isFeriado(currentDate);
    const works = administrativoTrabalha(currentDate);
    
    return (
      <div className="space-y-6">
        {isHoliday && (
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-red-400 font-medium">Feriado Nacional</p>
            </CardContent>
          </Card>
        )}
        
        {/* Unidades Operacionais */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Unidades Operacionais
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {UNITS.map((unidade) => {
              const team = getTeamForDate(currentDate, unidade);
              const teamMembros = team ? getMembrosForTeam(team, unidade) : [];
              const hasAlt = hasAlteracao(currentDate, unidade);
              
              return (
                <Card 
                  key={unidade} 
                  className={`flex flex-col ${team ? teamBorderColors[team] : ''}`}
                >
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0">{unitIcons[unidade]}</span>
                        <span className="truncate">{unidade}</span>
                        {hasAlt && <Edit2 className="h-4 w-4 text-accent flex-shrink-0" />}
                      </div>
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 ml-2"
                          onClick={() => openEditDialog(currentDate, unidade)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 min-h-0">
                    {team && (
                      <>
                        <div className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`text-lg px-4 py-2 ${teamColors[team]} cursor-pointer`}
                            onClick={() => openMembersDialog(team, unidade)}
                          >
                            Equipe {team}
                          </Badge>
                        </div>
                        
                        {/* Team members */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Membros ({teamMembros.length}):</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => openMembersDialog(team, unidade)}
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Gerenciar
                            </Button>
                          </div>
                          {teamMembros.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Nenhum membro cadastrado
                            </p>
                          ) : (
                            <ScrollArea className="h-[180px]">
                              <div className="space-y-1.5 pr-2">
                                {teamMembros.map((m) => (
                                  <div key={m.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30 border border-border/50">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0 font-mono">
                                      {m.efetivo?.posto_graduacao}
                                    </Badge>
                                    <span className="truncate font-medium">{m.efetivo?.nome_guerra}</span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Seções Administrativas */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Seções Administrativas
            {!works && (
              <Badge variant="outline" className="text-muted-foreground ml-2">
                {isHoliday ? 'Feriado' : 'Fim de Semana'}
              </Badge>
            )}
          </h3>
          <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${!works ? 'opacity-50' : ''}`}>
            {ADMIN_SECTIONS.map((section) => {
              const sectionMembros = getMembrosForAdminSection(section);
              const sectionLabel = section.replace('SEÇÃO ', '');
              
              return (
                <Card 
                  key={section} 
                  className="flex flex-col border-primary/30"
                >
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{sectionLabel}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 min-h-0">
                    {works ? (
                      <>
                        <div className="text-center">
                          <Badge className="bg-primary/20 text-primary/80 border-primary/30">
                            Expediente Normal
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Membros ({sectionMembros.length}):</span>
                          {sectionMembros.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Nenhum membro cadastrado
                            </p>
                          ) : (
                            <ScrollArea className="h-[150px]">
                              <div className="space-y-1.5 pr-2">
                                {sectionMembros.map((m) => (
                                  <div key={m.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30 border border-border/50">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0 font-mono">
                                      {m.efetivo?.posto_graduacao}
                                    </Badge>
                                    <span className="truncate font-medium">{m.efetivo?.nome_guerra}</span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Badge variant="outline" className="text-muted-foreground">
                          {isHoliday ? 'Feriado' : 'Fim de Semana'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate, { weekStartsOn: 0 })
    });

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm font-medium text-muted-foreground p-2">Unidade</div>
            {days.map((day, idx) => (
              <div 
                key={idx} 
                className={`text-center p-2 rounded-lg cursor-pointer transition-colors ${
                  isFeriado(day) ? 'bg-red-500/10 hover:bg-red-500/20' : 
                  isWeekend(day) ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/30'
                }`}
                onClick={() => {
                  setCurrentDate(day);
                  setViewMode('day');
                }}
              >
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-bold ${isFeriado(day) ? 'text-red-400' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          {UNITS.map((unidade) => {
            return (
              <div key={unidade} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  {unitIcons[unidade]}
                  <span className="text-sm font-medium truncate">{unidade}</span>
                </div>
                {days.map((day, idx) => {
                  const team = getTeamForDate(day, unidade);
                  const hasAlt = hasAlteracao(day, unidade);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg text-center relative ${
                        isFeriado(day) ? 'bg-red-500/10' : 
                        isWeekend(day) ? 'bg-muted/30' : 'bg-card'
                      } ${editMode ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''}`}
                      onClick={() => {
                        if (editMode) {
                          openEditDialog(day, unidade);
                        }
                      }}
                    >
                      {hasAlt && (
                        <Edit2 className="absolute top-1 right-1 h-3 w-3 text-amber-500" />
                      )}
                      {team && (
                        <Badge variant="outline" className={`text-xs ${teamColors[team]}`}>
                          {team}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i, 1));
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((month, idx) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
          const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
          const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
          
          return (
            <Card 
              key={idx} 
              className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <CardHeader className="py-2 px-3 bg-muted/30">
                <CardTitle className="text-sm capitalize">
                  {format(month, 'MMMM', { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-7 gap-0.5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-[8px] text-center text-muted-foreground">
                      {d}
                    </div>
                  ))}
                  {days.map((day, dayIdx) => {
                    const isCurrentMonth = isSameMonth(day, month);
                    const isHoliday = isFeriado(day);
                    
                    return (
                      <div
                        key={dayIdx}
                        className={`text-[9px] text-center p-0.5 rounded ${
                          !isCurrentMonth ? 'text-muted-foreground/30' :
                          isHoliday ? 'text-red-400 font-bold' :
                          isWeekend(day) ? 'text-muted-foreground' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
    <div className="container mx-auto p-4 md:p-6 max-w-7xl pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/secao-pessoas">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campanha</h1>
              <p className="text-sm text-muted-foreground">Escala de Serviço</p>
            </div>
          </div>
        </div>

        <Button
          variant={editMode ? 'default' : 'outline'}
          onClick={() => setEditMode(!editMode)}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          {editMode ? 'Finalizar Edição' : 'Editar Escalas'}
        </Button>
      </div>

      {/* Edit mode alert */}
      {editMode && (
        <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Edit2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Modo de Edição Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Clique em uma unidade para alterar a equipe de serviço ou gerenciar os membros.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={selectedYear} onValueChange={(v) => {
        setSelectedYear(v);
        setCurrentDate(new Date(parseInt(v), 0, 1));
      }}>
        <TabsList className="mb-6">
          <TabsTrigger value="2025">2025</TabsTrigger>
          <TabsTrigger value="2026">2026</TabsTrigger>
        </TabsList>

        {/* Legend */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Legenda das Equipes</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => openMembersDialog('Alfa', 'Guarda')}
              >
                <Users className="h-4 w-4 mr-1" />
                Ver Membros
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {TEAMS.map(team => (
              <Badge 
                key={team} 
                variant="outline" 
                className={`${teamColors[team]} text-sm cursor-pointer`}
                onClick={() => openMembersDialog(team, 'Guarda')}
              >
                Equipe {team}
              </Badge>
            ))}
            <Badge variant="outline" className="bg-primary/20 text-primary/80 border-primary/30 text-sm">
              Administrativo (Seg-Sex)
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-sm">
              Feriado
            </Badge>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm">
              <Edit2 className="h-3 w-3 mr-1" />
              Alteração Manual
            </Badge>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[250px] text-center">
              <h2 className="text-lg font-semibold capitalize">{getNavigationLabel()}</h2>
            </div>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="2025" className="mt-0">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full">
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthCalendar()}
                {viewMode === 'year' && renderYearView()}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2026" className="mt-0">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full">
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthCalendar()}
                {viewMode === 'year' && renderYearView()}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Team Dialog */}
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

      {/* Team Members Dialog */}
      <TeamMembersDialog
        open={membersDialogOpen}
        onOpenChange={setMembersDialogOpen}
        team={selectedTeam}
        unidade={selectedUnidade}
        membros={getMembrosForTeam(selectedTeam, selectedUnidade)}
        allEfetivo={efetivo}
        allMembros={membros}
        onAddMembro={(efetivoId, funcao) => addMembro(selectedTeam, efetivoId, selectedUnidade, funcao)}
        onRemoveMembro={removeMembro}
        onTransferMembro={updateMembroEquipe}
      />
    </div>
    </ScrollArea>
  );
};

export default Campanha;
