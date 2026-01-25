import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isWeekend, 
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Calendar as CalendarIcon,
  LayoutGrid,
  Edit2,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { DayCounts, STATUS_COLORS, TeamType, UnitType, TeamForDay } from '@/hooks/useCampanhaCalendar';

type ViewMode = 'month' | 'week' | 'day' | 'year';

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary/80 border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

interface CampanhaCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  getDayCounts: (date: Date) => DayCounts;
  isFeriado: (date: Date) => boolean;
  onDayClick: (date: Date) => void;
  /** Mostra ícone de alteração manual no dia (mês) */
  hasAlteracaoInDay?: (date: Date) => boolean;
  /** Vista semana em matriz unidade×dia; se ausentes, usa grid 7 dias */
  UNITS?: UnitType[];
  getTeamForDate?: (date: Date, unidade: UnitType) => TeamType | null;
  administrativoTrabalha?: (date: Date) => boolean;
  hasAlteracao?: (date: Date, unidade: UnitType) => boolean;
  /** Ano: ao clicar em um mês, chama e depois o parent pode mudar para mês */
  onMonthSelectFromYear?: (date: Date) => void;
  /** Conteúdo da vista Dia; se não for passado, usa o bloco padrão com "Ver detalhes do dia" */
  renderDayView?: () => React.ReactNode;
  /** Retorna as equipes e membros escalados no dia; usado na vista mês para listar policiais e sinalizar impedidos (ex. férias) */
  getTeamsForDay?: (date: Date) => TeamForDay[];
}

export const CampanhaCalendarView: React.FC<CampanhaCalendarViewProps> = ({
  currentDate,
  onDateChange,
  getDayCounts,
  isFeriado,
  onDayClick,
  hasAlteracaoInDay,
  UNITS = [],
  getTeamForDate,
  administrativoTrabalha,
  hasAlteracao,
  onMonthSelectFromYear,
  renderDayView,
  getTeamsForDay: getTeamsForDayProp,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'day':
        onDateChange(subDays(currentDate, 1));
        break;
      case 'year':
        onDateChange(new Date(currentDate.getFullYear() - 1, 0, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'month':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'week':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'day':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'year':
        onDateChange(new Date(currentDate.getFullYear() + 1, 0, 1));
        break;
    }
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getNavigationLabel = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, "d MMM 'de' yyyy", { locale: ptBR })}`;
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
      case 'year':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  // Generate days for month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Generate weeks for month view
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7));
    }
    return result;
  }, [monthDays]);

  // Mini status dots component
  const StatusDots: React.FC<{ counts: DayCounts }> = ({ counts }) => (
    <div className="flex items-center gap-0.5 justify-center mt-1">
      {counts.apto > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.apto.dot}`} title={`${counts.apto} aptos`} />
      )}
      {counts.impedido > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.impedido.dot}`} title={`${counts.impedido} impedidos`} />
      )}
      {counts.restricao > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.restricao.dot}`} title={`${counts.restricao} restrição`} />
      )}
      {counts.atestado > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.atestado.dot}`} title={`${counts.atestado} atestado`} />
      )}
      {counts.voluntario > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.voluntario.dot}`} title={`${counts.voluntario} voluntários`} />
      )}
      {counts.previsao > 0 && (
        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS.previsao.dot}`} title={`${counts.previsao} previsão`} />
      )}
    </div>
  );

  const renderMonthView = () => (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Week days header */}
      <div className="grid grid-cols-7 bg-muted/30 border-b">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-border">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isHoliday = isFeriado(day);
              const isWeekendDay = isWeekend(day);
              const isTodayDate = isToday(day);
              const counts = isCurrentMonth ? getDayCounts(day) : { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, previsao: 0, total: 0 };
              const teams = (isCurrentMonth && getTeamsForDayProp) ? getTeamsForDayProp(day) : [];
              const allMembros = teams.flatMap(t => t.membros);
              const unicos = allMembros.filter((m, i, arr) => arr.findIndex(x => x.efetivo_id === m.efetivo_id) === i);
              const MAX_NAMES = 5;

              return (
                <button
                  key={dayIndex}
                  onClick={() => isCurrentMonth && onDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    min-h-[112px] p-2 text-left transition-all relative
                    ${!isCurrentMonth 
                      ? 'bg-muted/20 text-muted-foreground/40 cursor-default' 
                      : isHoliday
                        ? 'bg-red-50/50 hover:bg-red-50'
                        : isWeekendDay
                          ? 'bg-muted/20 hover:bg-muted/40'
                          : 'bg-white hover:bg-muted/30'
                    }
                    ${isCurrentMonth ? 'cursor-pointer' : ''}
                  `}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full shrink-0
                      ${isTodayDate 
                        ? 'bg-primary text-primary-foreground' 
                        : isHoliday 
                          ? 'text-red-500' 
                          : ''
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && hasAlteracaoInDay?.(day) && (
                      <span title="Alteração manual">
                        <Edit2 className="h-3 w-3 text-amber-500 shrink-0" />
                      </span>
                    )}
                  </div>
                  
                  {isCurrentMonth && counts.total > 0 && (
                    <StatusDots counts={counts} />
                  )}

                  {/* Policiais escalados no dia: nome e sinalização de impedidos (férias, etc.) */}
                  {isCurrentMonth && unicos.length > 0 && (
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {unicos.slice(0, MAX_NAMES).map((m) => {
                        const impedido = m.status === 'impedido';
                        const nome = m.efetivo?.nome_guerra || m.efetivo?.nome || '—';
                        return (
                          <div
                            key={m.id}
                            className={`text-[10px] truncate flex items-center gap-0.5 ${impedido ? 'text-red-600 line-through' : 'text-foreground/90'}`}
                            title={impedido ? `Impedido de escalar: ${m.statusReason || 'férias/abono'}` : nome}
                          >
                            {impedido && <AlertCircle className="h-2.5 w-2.5 shrink-0 text-red-500" aria-label="Impedido" />}
                            <span className="truncate">{nome}</span>
                          </div>
                        );
                      })}
                      {unicos.length > MAX_NAMES && (
                        <div className="text-[10px] text-muted-foreground">+{unicos.length - MAX_NAMES}</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold capitalize ml-2">
            {getNavigationLabel()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          
          {/* View mode toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('year')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'year' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              title="Ano"
            >
              <span className="text-xs font-medium px-0.5">Ano</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'month' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              title="Mês"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              title="Semana"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              title="Dia"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar content */}
      {viewMode === 'month' && renderMonthView()}
      
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {UNITS.length > 0 && getTeamForDate && administrativoTrabalha ? (
            /* Matriz unidade × dia */
            <div className=" overflow-x-auto">
              <div className="grid gap-0 min-w-[600px]" style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}>
                {/* Cabeçalho: vazio + 7 dias */}
                <div className="p-2 bg-muted/30 border-b border-r font-medium text-xs text-muted-foreground" />
                {eachDayOfInterval({
                  start: startOfWeek(currentDate, { weekStartsOn: 0 }),
                  end: endOfWeek(currentDate, { weekStartsOn: 0 }),
                }).map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2 border-b border-r text-center ${isFeriado(day) ? 'bg-red-50/50' : ''}`}
                  >
                    <div className="text-[10px] text-muted-foreground">{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className={`text-sm font-semibold ${isFeriado(day) ? 'text-red-500' : ''}`}>{format(day, 'd')}</div>
                  </div>
                ))}
                {/* Linhas: cada unidade + Administrativo */}
                {UNITS.map((unidade) => (
                  <React.Fragment key={unidade}>
                    <div className="p-2 bg-muted/20 border-b border-r text-xs font-medium truncate">{unidade}</div>
                    {eachDayOfInterval({
                      start: startOfWeek(currentDate, { weekStartsOn: 0 }),
                      end: endOfWeek(currentDate, { weekStartsOn: 0 }),
                    }).map((day, idx) => {
                      const team = getTeamForDate(day, unidade);
                      const hasAlt = hasAlteracao?.(day, unidade);
                      return (
                        <button
                          key={idx}
                          onClick={() => onDayClick(day)}
                          className={`p-2 border-b border-r text-center hover:bg-muted/30 transition-colors ${isFeriado(day) ? 'bg-red-50/30' : ''}`}
                        >
                          {team ? (
                            <span className="flex items-center justify-center gap-0.5">
                              <Badge variant="outline" className={`text-[10px] ${teamColors[team]}`}>{team}</Badge>
                              {hasAlt && <Edit2 className="h-2.5 w-2.5 text-amber-500" />}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
                <React.Fragment key="adm">
                  <div className="p-2 bg-muted/20 border-b border-r text-xs font-medium truncate flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> ADM
                  </div>
                  {eachDayOfInterval({
                    start: startOfWeek(currentDate, { weekStartsOn: 0 }),
                    end: endOfWeek(currentDate, { weekStartsOn: 0 }),
                  }).map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => onDayClick(day)}
                      className={`p-2 border-b border-r text-center hover:bg-muted/30 ${isFeriado(day) ? 'bg-red-50/30' : ''}`}
                    >
                      {administrativoTrabalha(day) ? (
                        <Badge variant="outline" className="text-[10px] bg-slate-500/20 text-slate-600 border-slate-400/40">ADM</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </button>
                  ))}
                </React.Fragment>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 p-4">
              {eachDayOfInterval({
                start: startOfWeek(currentDate, { weekStartsOn: 0 }),
                end: endOfWeek(currentDate, { weekStartsOn: 0 }),
              }).map((day, idx) => {
                const isHoliday = isFeriado(day);
                const isTodayDate = isToday(day);
                const counts = getDayCounts(day);
                return (
                  <button
                    key={idx}
                    onClick={() => onDayClick(day)}
                    className={`
                      p-3 rounded-xl border transition-all text-center
                      ${isHoliday ? 'bg-red-50 border-red-200' : isTodayDate ? 'bg-primary/5 border-primary' : 'bg-white border-border hover:border-primary/50'}
                    `}
                  >
                    <div className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className={`text-lg font-semibold ${isHoliday ? 'text-red-500' : ''}`}>{format(day, 'd')}</div>
                    <StatusDots counts={counts} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === 'year' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const month = new Date(currentDate.getFullYear(), i, 1);
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
            const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
            return (
              <button
                key={i}
                onClick={() => {
                  onDateChange(month);
                  setViewMode('month');
                  onMonthSelectFromYear?.(month);
                }}
                className="bg-white rounded-xl border border-border shadow-sm p-3 text-left hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="text-sm font-semibold capitalize mb-2">
                  {format(month, 'MMMM', { locale: ptBR })}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, j) => (
                    <div key={j} className="text-[8px] text-center text-muted-foreground">{d}</div>
                  ))}
                  {days.map((day, j) => {
                    const inMonth = isSameMonth(day, month);
                    const isH = isFeriado(day);
                    return (
                      <div
                        key={j}
                        className={`text-[9px] text-center p-0.5 rounded ${!inMonth ? 'text-muted-foreground/30' : isH ? 'text-red-500 font-bold' : isWeekend(day) ? 'text-muted-foreground' : ''}`}
                      >
                        {format(day, 'd')}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {viewMode === 'day' && (
        renderDayView ? renderDayView() : (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center">
            <p className="text-muted-foreground text-sm mb-2">{format(currentDate, 'EEEE', { locale: ptBR })}</p>
            <p className="text-4xl font-bold mb-4">{format(currentDate, 'd')}</p>
            <p className="text-muted-foreground">{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</p>
            <Button onClick={() => onDayClick(currentDate)} className="mt-4">Ver detalhes do dia</Button>
          </div>
        )
      )}
    </div>
  );
};
