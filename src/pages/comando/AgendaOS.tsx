import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowLeft, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  start: string;
  end: string;
  SUMMARY?: string;
  DESCRIPTION?: string;
  [key: string]: string | undefined;
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  return events.filter((ev) => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    return start <= dayEnd && end >= dayStart;
  });
}

const AgendaOS: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-calendar-events');
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : 'Erro ao carregar eventos');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a agenda.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsInRange = useMemo(() => {
    return events.filter((ev) => {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      return start <= calendarEnd && end >= calendarStart;
    });
  }, [events, calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7));
    }
    return w;
  }, [days]);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/comando">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda OS</h1>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
              <Button variant="outline" size="sm" className="ml-auto" onClick={fetchEvents}>
                Tentar novamente
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
              <h2 className="text-lg font-semibold capitalize ml-2" style={{ minWidth: '180px' }}>
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} disabled={loading}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">{loading ? 'Carregando…' : 'Atualizar'}</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden bg-background">
              <div className="grid grid-cols-7 bg-muted/30 border-b">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-2 sm:py-3"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-border">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
                    {week.map((day, dayIndex) => {
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isTodayDate = isToday(day);
                      const dayEvents = isCurrentMonth ? getEventsForDay(eventsInRange, day) : [];

                      return (
                        <div
                          key={dayIndex}
                          className={`
                            min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 text-left
                            ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground/50' : 'bg-card'}
                          `}
                        >
                          <div className="flex items-center justify-center">
                            <span
                              className={`
                                text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                ${isTodayDate ? 'bg-primary text-primary-foreground' : ''}
                              `}
                            >
                              {format(day, 'd')}
                            </span>
                          </div>
                          <div className="mt-1 space-y-0.5 overflow-hidden">
                            {dayEvents.slice(0, 4).map((ev, idx) => (
                              <div
                                key={idx}
                                className="text-[10px] sm:text-xs truncate rounded px-1 py-0.5 bg-primary/15 text-primary border border-primary/20"
                                title={ev.SUMMARY || ev.DESCRIPTION || 'Evento'}
                              >
                                {ev.SUMMARY || 'Evento'}
                              </div>
                            ))}
                            {dayEvents.length > 4 && (
                              <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 4}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button asChild variant="secondary" size="sm">
              <Link to="/comando">Voltar ao Comando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaOS;
