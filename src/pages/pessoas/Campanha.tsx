import React, { useState, useMemo } from 'react';
import { Target, ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Building2, Anchor, Plane, Shield } from 'lucide-react';
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, isWeekend, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de equipes
type TeamType = 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
type UnitType = 'Guarda' | 'Armeiro' | 'RP Ambiental' | 'GOC' | 'Lacustre' | 'GTA' | 'Administrativo';

interface Escala {
  unidade: UnitType;
  equipe: TeamType | null;
  isAdministrativo: boolean;
}

// Feriados nacionais 2025 e 2026
const feriados2025 = [
  '2025-01-01', // Confraternização Universal
  '2025-03-03', // Carnaval
  '2025-03-04', // Carnaval
  '2025-04-18', // Sexta-feira Santa
  '2025-04-21', // Tiradentes
  '2025-05-01', // Dia do Trabalho
  '2025-06-19', // Corpus Christi
  '2025-09-07', // Independência
  '2025-10-12', // Nossa Senhora Aparecida
  '2025-11-02', // Finados
  '2025-11-15', // Proclamação da República
  '2025-11-20', // Consciência Negra
  '2025-12-25', // Natal
];

const feriados2026 = [
  '2026-01-01', // Confraternização Universal
  '2026-02-16', // Carnaval
  '2026-02-17', // Carnaval
  '2026-04-03', // Sexta-feira Santa
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-06-04', // Corpus Christi
  '2026-09-07', // Independência
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-11-20', // Consciência Negra
  '2026-12-25', // Natal
];

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const unitIcons: Record<UnitType, React.ReactNode> = {
  'Guarda': <Shield className="h-4 w-4" />,
  'Armeiro': <Target className="h-4 w-4" />,
  'RP Ambiental': <CalendarIcon className="h-4 w-4" />,
  'GOC': <Users className="h-4 w-4" />,
  'Lacustre': <Anchor className="h-4 w-4" />,
  'GTA': <Plane className="h-4 w-4" />,
  'Administrativo': <Building2 className="h-4 w-4" />,
};

type ViewMode = 'day' | 'week' | 'month' | 'year';

const TEAMS: TeamType[] = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

// Função para calcular a equipe de serviço com base na data inicial
const getTeamForDate = (date: Date, startTeam: TeamType, startDate: Date): TeamType => {
  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // Escala de 24h por 72h (1 dia trabalha, 3 folga)
  const cyclePosition = ((diffDays % 4) + 4) % 4;
  const startIndex = TEAMS.indexOf(startTeam);
  const teamIndex = (startIndex + cyclePosition) % 4;
  return TEAMS[teamIndex];
};

// Verifica se é feriado
const isFeriado = (date: Date, year: number): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const feriados = year === 2025 ? feriados2025 : feriados2026;
  return feriados.includes(dateStr);
};

// Verifica se administrativo trabalha nesse dia
const administrativoTrabalha = (date: Date, year: number): boolean => {
  const dayOfWeek = getDay(date);
  // Segunda a sexta (1-5)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  // Não trabalha em feriados
  if (isFeriado(date, year)) return false;
  return true;
};

const Campanha: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const year = parseInt(selectedYear);
  
  // Data de início: 1 de janeiro do ano selecionado
  const startDate = useMemo(() => new Date(year, 0, 1), [year]);
  
  // Equipe inicial para cada unidade em 1 de janeiro de 2026
  const initialTeams: Record<UnitType, TeamType | null> = {
    'Guarda': 'Bravo',
    'Armeiro': 'Bravo',
    'RP Ambiental': 'Bravo',
    'GOC': 'Bravo',
    'Lacustre': 'Bravo',
    'GTA': 'Alfa',
    'Administrativo': null,
  };

  const getEscalaForDate = (date: Date): Escala[] => {
    const escalas: Escala[] = [];
    
    Object.entries(initialTeams).forEach(([unidade, startTeam]) => {
      const unit = unidade as UnitType;
      
      if (unit === 'Administrativo') {
        escalas.push({
          unidade: unit,
          equipe: null,
          isAdministrativo: true,
        });
      } else {
        const team = getTeamForDate(date, startTeam!, startDate);
        escalas.push({
          unidade: unit,
          equipe: team,
          isAdministrativo: false,
        });
      }
    });
    
    return escalas;
  };

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

  // Renderização do calendário mensal
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
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Semanas */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isHoliday = isFeriado(day, year);
              const isWeekendDay = isWeekend(day);
              const escalas = getEscalaForDate(day);
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] p-1 rounded-lg border transition-colors ${
                    !isCurrentMonth 
                      ? 'bg-muted/30 border-border/30' 
                      : isHoliday
                        ? 'bg-red-500/10 border-red-500/30'
                        : isWeekendDay
                          ? 'bg-muted/50 border-border/50'
                          : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-muted-foreground/50' : 
                    isHoliday ? 'text-red-400' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="space-y-0.5">
                      {escalas.slice(0, 4).map((escala, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          {escala.isAdministrativo ? (
                            administrativoTrabalha(day, year) && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-slate-500/20 text-slate-400 border-slate-500/30 truncate">
                                ADM
                              </Badge>
                            )
                          ) : escala.equipe && (
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 ${teamColors[escala.equipe]} truncate`}>
                              {escala.unidade.substring(0, 3)}
                            </Badge>
                          )}
                        </div>
                      ))}
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

  // Renderização da visão diária
  const renderDayView = () => {
    const escalas = getEscalaForDate(currentDate);
    const isHoliday = isFeriado(currentDate, year);
    const isWeekendDay = isWeekend(currentDate);
    
    return (
      <div className="space-y-4">
        {isHoliday && (
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-red-400 font-medium">Feriado Nacional</p>
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {escalas.map((escala, idx) => (
            <Card key={idx} className={`${
              escala.isAdministrativo 
                ? (administrativoTrabalha(currentDate, year) ? 'border-slate-500/30' : 'border-border/30 opacity-50')
                : escala.equipe ? `border-${escala.equipe === 'Alfa' ? 'red' : escala.equipe === 'Bravo' ? 'blue' : escala.equipe === 'Charlie' ? 'green' : 'purple'}-500/30` : ''
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {unitIcons[escala.unidade]}
                  {escala.unidade}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {escala.isAdministrativo ? (
                  <div className="text-center py-4">
                    {administrativoTrabalha(currentDate, year) ? (
                      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                        Expediente Normal
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {isHoliday ? 'Feriado' : 'Fim de Semana'}
                      </Badge>
                    )}
                  </div>
                ) : escala.equipe && (
                  <div className="text-center py-4">
                    <Badge variant="outline" className={`text-lg px-4 py-2 ${teamColors[escala.equipe]}`}>
                      Equipe {escala.equipe}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Renderização da visão semanal
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate, { weekStartsOn: 0 })
    });

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm font-medium text-muted-foreground p-2">Unidade</div>
            {days.map((day, idx) => (
              <div key={idx} className={`text-center p-2 rounded-lg ${
                isFeriado(day, year) ? 'bg-red-500/10' : 
                isWeekend(day) ? 'bg-muted/50' : ''
              }`}>
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className={`text-lg font-bold ${isFeriado(day, year) ? 'text-red-400' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          {/* Linhas por unidade */}
          {Object.keys(initialTeams).map((unidade) => {
            const unit = unidade as UnitType;
            
            return (
              <div key={unit} className="grid grid-cols-8 gap-2 mb-2">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  {unitIcons[unit]}
                  <span className="text-sm font-medium truncate">{unit}</span>
                </div>
                {days.map((day, idx) => {
                  const escala = getEscalaForDate(day).find(e => e.unidade === unit);
                  
                  return (
                    <div key={idx} className={`p-2 rounded-lg text-center ${
                      isFeriado(day, year) ? 'bg-red-500/10' : 
                      isWeekend(day) ? 'bg-muted/30' : 'bg-card'
                    }`}>
                      {escala?.isAdministrativo ? (
                        administrativoTrabalha(day, year) ? (
                          <Badge variant="outline" className="text-xs bg-slate-500/20 text-slate-400">
                            ADM
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )
                      ) : escala?.equipe && (
                        <Badge variant="outline" className={`text-xs ${teamColors[escala.equipe]}`}>
                          {escala.equipe}
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

  // Renderização da visão anual
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
            <Card key={idx} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
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
                    const isHoliday = isFeriado(day, currentDate.getFullYear());
                    
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

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
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
      </div>

      {/* Tabs para anos */}
      <Tabs value={selectedYear} onValueChange={(v) => {
        setSelectedYear(v);
        setCurrentDate(new Date(parseInt(v), 0, 1));
      }}>
        <TabsList className="mb-6">
          <TabsTrigger value="2025">2025</TabsTrigger>
          <TabsTrigger value="2026">2026</TabsTrigger>
        </TabsList>

        {/* Legenda das equipes */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Legenda das Equipes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {TEAMS.map(team => (
              <Badge key={team} variant="outline" className={`${teamColors[team]} text-sm`}>
                Equipe {team}
              </Badge>
            ))}
            <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-sm">
              Administrativo (Seg-Sex)
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-sm">
              Feriado
            </Badge>
          </CardContent>
        </Card>

        {/* Configuração inicial */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Configuração Inicial - 1º de Janeiro de {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Guarda, Armeiro, RP Ambiental, GOC, Lacustre:</span>
                <Badge variant="outline" className={teamColors['Bravo']}>Bravo</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">GTA:</span>
                <Badge variant="outline" className={teamColors['Alfa']}>Alfa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles de navegação */}
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
    </div>
  );
};

export default Campanha;
