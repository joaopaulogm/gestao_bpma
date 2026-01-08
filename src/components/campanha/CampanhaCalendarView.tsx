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
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Calendar as CalendarIcon,
  LayoutGrid,
} from 'lucide-react';
import { DayCounts, STATUS_COLORS } from '@/hooks/useCampanhaCalendar';

type ViewMode = 'month' | 'week' | 'day';

interface CampanhaCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  getDayCounts: (date: Date) => DayCounts;
  isFeriado: (date: Date) => boolean;
  onDayClick: (date: Date) => void;
}

export const CampanhaCalendarView: React.FC<CampanhaCalendarViewProps> = ({
  currentDate,
  onDateChange,
  getDayCounts,
  isFeriado,
  onDayClick,
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
              const counts = isCurrentMonth ? getDayCounts(day) : { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, total: 0 };

              return (
                <button
                  key={dayIndex}
                  onClick={() => isCurrentMonth && onDayClick(day)}
                  disabled={!isCurrentMonth}
                  className={`
                    min-h-[80px] p-2 text-left transition-all relative
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
                  <div className="flex items-center justify-center">
                    <span className={`
                      text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isTodayDate 
                        ? 'bg-primary text-primary-foreground' 
                        : isHoliday 
                          ? 'text-red-500' 
                          : ''
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  {isCurrentMonth && counts.total > 0 && (
                    <StatusDots counts={counts} />
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
              onClick={() => setViewMode('month')}
              className={`
                p-1.5 rounded-md transition-colors
                ${viewMode === 'month' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
              `}
              title="Mês"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`
                p-1.5 rounded-md transition-colors
                ${viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
              `}
              title="Semana"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`
                p-1.5 rounded-md transition-colors
                ${viewMode === 'day' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
              `}
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
        <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
          <div className="grid grid-cols-7 gap-2">
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
                    ${isHoliday 
                      ? 'bg-red-50 border-red-200' 
                      : isTodayDate 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-white border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={`text-lg font-semibold ${isHoliday ? 'text-red-500' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <StatusDots counts={counts} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center">
          <p className="text-muted-foreground text-sm mb-2">
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </p>
          <p className="text-4xl font-bold mb-4">
            {format(currentDate, 'd')}
          </p>
          <p className="text-muted-foreground">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <Button onClick={() => onDayClick(currentDate)} className="mt-4">
            Ver detalhes do dia
          </Button>
        </div>
      )}
    </div>
  );
};
