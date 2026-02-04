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
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Mail,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgendaCMDEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  description: string | null;
  location: string | null;
  enviar_lembrete_comandante: boolean;
  created_at: string;
  updated_at: string;
}

function getEventsForDay(events: AgendaCMDEvent[], day: Date): AgendaCMDEvent[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  return events.filter((ev) => {
    const start = new Date(ev.start_at);
    const end = new Date(ev.end_at);
    return start <= dayEnd && end >= dayStart;
  });
}

const defaultForm = {
  title: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  startTime: '08:00',
  endDate: format(new Date(), 'yyyy-MM-dd'),
  endTime: '09:00',
  description: '',
  location: '',
  enviar_lembrete_comandante: false,
};

const AgendaCMD: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<AgendaCMDEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaCMDEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<AgendaCMDEvent | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailEvent, setDetailEvent] = useState<AgendaCMDEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda_cmd_events')
        .select('*')
        .order('start_at', { ascending: true });
      if (error) throw error;
      setEvents((data as AgendaCMDEvent[]) || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar eventos. Verifique se a tabela agenda_cmd_events existe.');
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
      const start = new Date(ev.start_at);
      const end = new Date(ev.end_at);
      return start <= calendarEnd && end >= calendarStart;
    });
  }, [events, calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  const openNewEvent = (day?: Date) => {
    const d = day || new Date();
    setEventToEdit(null);
    setDetailEvent(null);
    setForm({
      ...defaultForm,
      startDate: format(d, 'yyyy-MM-dd'),
      endDate: format(d, 'yyyy-MM-dd'),
    });
    setModalOpen(true);
  };

  const openEditEvent = (ev: AgendaCMDEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToEdit(ev);
    setDetailEvent(null);
    const start = parseISO(ev.start_at);
    const end = parseISO(ev.end_at);
    setForm({
      title: ev.title,
      startDate: format(start, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm'),
      endDate: format(end, 'yyyy-MM-dd'),
      endTime: format(end, 'HH:mm'),
      description: ev.description || '',
      location: ev.location || '',
      enviar_lembrete_comandante: ev.enviar_lembrete_comandante ?? false,
    });
    setModalOpen(true);
  };

  const openDetail = (ev: AgendaCMDEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailEvent(ev);
    setModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Informe o título do evento.');
      return;
    }
    const startAt = new Date(`${form.startDate}T${form.startTime}:00`);
    const endAt = new Date(`${form.endDate}T${form.endTime}:00`);
    if (endAt <= startAt) {
      toast.error('A data/hora de término deve ser posterior ao início.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        enviar_lembrete_comandante: form.enviar_lembrete_comandante,
      };
      if (eventToEdit) {
        const { error } = await supabase
          .from('agenda_cmd_events')
          .update(payload)
          .eq('id', eventToEdit.id);
        if (error) throw error;
        toast.success('Evento atualizado.');
      } else {
        const { data: user } = await supabase.auth.getUser();
        const { error } = await supabase.from('agenda_cmd_events').insert({
          ...payload,
          created_by: user.data.user?.id ?? null,
        });
        if (error) throw error;
        toast.success('Evento criado.');
        if (form.enviar_lembrete_comandante) {
          toast.info('Lembrete será enviado por e-mail para comandante e subcomandante (quando configurado).');
        }
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('agenda_cmd_events')
        .delete()
        .eq('id', eventToDelete.id);
      if (error) throw error;
      toast.success('Evento excluído.');
      setEventToDelete(null);
      setDetailEvent(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/comando">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agenda CMD</h1>
        </div>
        <Button onClick={() => openNewEvent()} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo evento
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
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
                <span className="ml-2">Atualizar</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                          onClick={() => isCurrentMonth && openNewEvent(day)}
                          className={`
                            min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 text-left cursor-pointer
                            hover:bg-muted/30 transition-colors
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
                            {dayEvents.slice(0, 4).map((ev) => (
                              <div
                                key={ev.id}
                                onClick={(e) => openDetail(ev, e)}
                                className="text-[10px] sm:text-xs truncate rounded px-1 py-0.5 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25"
                                title={ev.title}
                              >
                                {ev.title}
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

      {/* Modal: Criar/Editar evento (estilo Google Agenda) */}
      <Dialog open={modalOpen && !detailEvent} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{eventToEdit ? 'Editar evento' : 'Novo evento'}</DialogTitle>
            <DialogDescription>Preencha os dados do evento. Título é obrigatório.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título do evento *</Label>
              <Input
                placeholder="Ex: Reunião de comando"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de início</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de início</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de término</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de término</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Local (opcional)</Label>
              <Input
                placeholder="Ex: Sala do Comando"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Detalhes do evento..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex items-center space-x-2 rounded-lg border p-4 bg-muted/30">
              <Checkbox
                id="lembrete"
                checked={form.enviar_lembrete_comandante}
                onCheckedChange={(checked) =>
                  setForm({ ...form, enviar_lembrete_comandante: checked === true })
                }
              />
              <label
                htmlFor="lembrete"
                className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                Enviar lembrete por e-mail para comandante e subcomandante
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {eventToEdit ? 'Salvar alterações' : 'Criar evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Visualizar evento (com opções Editar e Excluir) */}
      <Dialog open={!!detailEvent} onOpenChange={(open) => !open && setDetailEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {detailEvent && (
                <>
                  {format(parseISO(detailEvent.start_at), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })} ·{' '}
                  {format(parseISO(detailEvent.start_at), 'HH:mm')} –{' '}
                  {format(parseISO(detailEvent.end_at), 'HH:mm', { locale: ptBR })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {detailEvent && (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-3 pr-4">
                {detailEvent.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{detailEvent.location}</span>
                  </div>
                )}
                {detailEvent.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailEvent.description}</p>
                )}
                {detailEvent.enviar_lembrete_comandante && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Lembrete por e-mail para comandante e subcomandante
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (detailEvent) openEditEvent(detailEvent, {} as React.MouseEvent);
                setDetailEvent(null);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (detailEvent) setEventToDelete(detailEvent);
                setDetailEvent(null);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento &quot;{eventToDelete?.title}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendaCMD;
