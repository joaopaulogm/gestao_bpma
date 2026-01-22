import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { AbonoQuotaCard, AbonoQuota } from '@/components/abono/AbonoQuotaCard';
import { supabase } from '@/integrations/supabase/client';

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Campanha: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<MemberStatus[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [abonoData, setAbonoData] = useState<any[]>([]);
  const [abonoLoading, setAbonoLoading] = useState(true);

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

  // Buscar dados de abono
  const fetchAbonoData = useCallback(async () => {
    setAbonoLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_abono')
        .select(`
          id,
          mes,
          ano,
          data_inicio,
          data_fim,
          parcela1_inicio,
          parcela1_fim,
          parcela2_inicio,
          parcela2_fim,
          parcela3_inicio,
          parcela3_fim
        `)
        .eq('ano', year);
      
      if (error) throw error;
      setAbonoData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de abono:', error);
    } finally {
      setAbonoLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchAbonoData();
  }, [fetchAbonoData]);

  // Calcular cotas de abono
  const LIMITE_MENSAL = 80;
  
  const abonoQuotas = useMemo<AbonoQuota[]>(() => {
    // Contar previstos por mês
    const previstosPorMes: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      previstosPorMes[i] = 0;
    }
    abonoData.forEach(item => {
      if (item.mes && item.mes >= 1 && item.mes <= 12) {
        previstosPorMes[item.mes]++;
      }
    });

    return mesesNome.map((mes, idx) => {
      const mesNum = idx + 1;
      const previsto = previstosPorMes[mesNum] || 0;
      const diasPrevistos = previsto * 5;
      
      // Marcados: dias com datas definidas
      let diasMarcados = 0;
      abonoData.forEach(item => {
        const parcelas = [
          { inicio: item.parcela1_inicio, fim: item.parcela1_fim },
          { inicio: item.parcela2_inicio, fim: item.parcela2_fim },
          { inicio: item.parcela3_inicio, fim: item.parcela3_fim },
        ];
        
        parcelas.forEach(parcela => {
          if (parcela.inicio && parcela.fim) {
            const inicioDate = new Date(parcela.inicio);
            if (inicioDate.getMonth() + 1 === mesNum && inicioDate.getFullYear() === year) {
              const fimDate = new Date(parcela.fim);
              const dias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              diasMarcados += dias;
            }
          }
        });
        
        if (item.data_inicio && item.data_fim && item.mes === mesNum) {
          const inicioDate = new Date(item.data_inicio);
          const fimDate = new Date(item.data_fim);
          const dias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (!item.parcela1_inicio && !item.parcela2_inicio && !item.parcela3_inicio) {
            diasMarcados += dias;
          }
        }
      });
      
      return {
        mes,
        mesNum,
        limite: LIMITE_MENSAL,
        previsto: diasPrevistos,
        marcados: diasMarcados,
        saldo: LIMITE_MENSAL - diasMarcados,
      };
    });
  }, [abonoData, year]);

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
    if (!selectedDay) return { apto: 0, impedido: 0, restricao: 0, atestado: 0, voluntario: 0, previsao: 0, total: 0 };
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
      <div className="page-container py-4 md:py-6 space-y-6">
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
          <div className="space-y-4">
            <MonthlyVacationQuotaCard quota={vacationQuota} />
            <AbonoQuotaCard quotas={abonoQuotas} compact />
          </div>
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
