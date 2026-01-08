import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMonth, getYear, format } from 'date-fns';
import { useCampanhaCalendar, MemberStatus, VolunteerEntry } from '@/hooks/useCampanhaCalendar';
import { CampanhaCalendarView } from '@/components/campanha/CampanhaCalendarView';
import { StatusLegendChips } from '@/components/campanha/StatusLegendChips';
import { MonthlyVacationQuotaCard } from '@/components/campanha/MonthlyVacationQuotaCard';
import { DayDetailDrawer } from '@/components/campanha/DayDetailDrawer';

const Campanha: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<MemberStatus[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const year = parseInt(selectedYear);
  const month = getMonth(currentDate);

  const {
    loading,
    efetivo,
    isFeriado,
    getDayCounts,
    getTeamsForDay,
    vacationQuota,
    saveVolunteer,
    removeVolunteer,
    getVolunteersForDate,
  } = useCampanhaCalendar(year, month);

  // Handle year change
  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentDate(new Date(parseInt(value), month, 1));
  };

  // Handle date change from calendar navigation
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    // Update year if changed
    const newYear = getYear(date);
    if (newYear !== year) {
      setSelectedYear(newYear.toString());
    }
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setDrawerOpen(true);
  };

  // Handle filter toggle
  const handleToggleFilter = (status: MemberStatus) => {
    setStatusFilters(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      }
      return [...prev, status];
    });
  };

  // Get data for selected day
  const selectedDayTeams = useMemo(() => {
    if (!selectedDay) return [];
    return getTeamsForDay(selectedDay);
  }, [selectedDay, getTeamsForDay]);

  const selectedDayCounts = useMemo(() => {
    if (!selectedDay) return { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, total: 0 };
    return getDayCounts(selectedDay);
  }, [selectedDay, getDayCounts]);

  const existingVolunteers = useMemo(() => {
    if (!selectedDay) return [];
    return getVolunteersForDate(selectedDay).map(v => v.efetivo_id);
  }, [selectedDay, getVolunteersForDate]);

  // Handle volunteer actions
  const handleSaveVolunteer = (volunteer: VolunteerEntry) => {
    if (selectedDay) {
      saveVolunteer(selectedDay, volunteer);
      // Force refresh by toggling drawer
      setDrawerOpen(false);
      setTimeout(() => setDrawerOpen(true), 50);
    }
  };

  const handleRemoveVolunteer = (efetivoId: string) => {
    if (selectedDay) {
      removeVolunteer(selectedDay, efetivoId);
      setDrawerOpen(false);
      setTimeout(() => setDrawerOpen(true), 50);
    }
  };

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
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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

          {/* Year selector */}
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top bar with search, filters and quota */}
        <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome de guerra, nome ou matrícula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Status legend chips */}
            <StatusLegendChips
              activeFilters={statusFilters}
              onToggleFilter={handleToggleFilter}
            />
          </div>

          {/* Vacation quota card */}
          <MonthlyVacationQuotaCard quota={vacationQuota} />
        </div>

        {/* Calendar */}
        <CampanhaCalendarView
          currentDate={currentDate}
          onDateChange={handleDateChange}
          getDayCounts={getDayCounts}
          isFeriado={isFeriado}
          onDayClick={handleDayClick}
        />

        {/* Day detail drawer */}
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
      </div>
    </div>
  );
};

export default Campanha;
