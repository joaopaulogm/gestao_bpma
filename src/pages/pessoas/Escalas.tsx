import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, Users, Building2, Anchor, Plane, Shield, Target, Loader2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isWeekend, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCampanhaData, TeamType, UnitType } from '@/hooks/useCampanhaData';

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-primary/20 text-primary/80 border-primary/30',
  'Charlie': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Delta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const unitIcons: Record<UnitType, React.ReactNode> = {
  'Guarda': <Shield className="h-5 w-5" />,
  'Armeiro': <Target className="h-5 w-5" />,
  'RP Ambiental': <Calendar className="h-5 w-5" />,
  'GOC': <Users className="h-5 w-5" />,
  'Lacustre': <Anchor className="h-5 w-5" />,
  'GTA': <Plane className="h-5 w-5" />,
};

// Equipes administrativas
const EQUIPES_ADMINISTRATIVAS = [
  'OFICIAIS ADM',
  'SEÇÃO GARAGEM',
  'SEÇÃO PROJETOS',
  'SEÇÃO SECRIMPO',
  'SEÇÃO SJD',
  'SEÇÃO SLOG',
  'SEÇÃO SOI',
  'SEÇÃO SP',
  'SEÇÃO SVG',
  'SECRETARIA',
];

// Feriados de 2026
const FERIADOS_2026 = [
  new Date(2026, 0, 1),
  new Date(2026, 3, 3),
  new Date(2026, 3, 21),
  new Date(2026, 4, 1),
  new Date(2026, 8, 7),
  new Date(2026, 9, 12),
  new Date(2026, 10, 2),
  new Date(2026, 10, 15),
  new Date(2026, 10, 20),
  new Date(2026, 11, 25),
];

// Pontos Facultativos de 2026
const PONTOS_FACULTATIVOS_2026 = [
  new Date(2026, 0, 2),
  new Date(2026, 1, 16),
  new Date(2026, 1, 17),
  new Date(2026, 1, 18),
  new Date(2026, 3, 20),
  new Date(2026, 5, 4),
  new Date(2026, 5, 5),
  new Date(2026, 9, 28),
  new Date(2026, 11, 24),
  new Date(2026, 11, 31),
];

interface Equipe {
  id: string;
  nome: string;
  grupamento: string;
  membros: {
    id: string;
    funcao: string;
    efetivo: {
      id: string;
      nome_guerra: string;
      posto_graduacao: string;
      matricula: string;
    };
  }[];
}

const Escalas: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipesAdm, setEquipesAdm] = useState<Equipe[]>([]);
  const [loadingEquipes, setLoadingEquipes] = useState(true);
  const [escalasAdm, setEscalasAdm] = useState<Record<string, string>>({});
  
  const year = currentDate.getFullYear();
  const {
    loading: loadingCampanha,
    UNITS,
    getTeamForDate,
    isFeriado,
    getMembrosForTeam,
  } = useCampanhaData(year);

  // Fetch equipes from dim_equipes with membros
  const fetchEquipes = useCallback(async () => {
    setLoadingEquipes(true);
    try {
      const { data: equipesData, error } = await supabase
        .from('dim_equipes')
        .select('*')
        .order('grupamento');

      if (error) throw error;

      const equipesWithMembros = await Promise.all(
        (equipesData || []).map(async (equipe) => {
          const { data: membrosData } = await supabase
            .from('fat_equipe_membros')
            .select(`
              id,
              funcao,
              dim_efetivo!inner(id, nome_guerra, posto_graduacao, matricula)
            `)
            .eq('equipe_id', equipe.id);

          return {
            ...equipe,
            membros: (membrosData || []).map((m: any) => ({
              id: m.id,
              funcao: m.funcao,
              efetivo: m.dim_efetivo,
            })),
          };
        })
      );

      // Separar equipes operacionais e administrativas
      const operacionais = equipesWithMembros.filter(e => !EQUIPES_ADMINISTRATIVAS.includes(e.nome));
      const administrativas = equipesWithMembros.filter(e => EQUIPES_ADMINISTRATIVAS.includes(e.nome));
      
      setEquipes(operacionais);
      setEquipesAdm(administrativas);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    } finally {
      setLoadingEquipes(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipes();
  }, [fetchEquipes]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('escalas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dim_equipes' }, () => fetchEquipes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_equipe_membros' }, () => fetchEquipes())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEquipes]);

  // Navigation operacional
  const navigatePrevious = () => setCurrentDate(addDays(currentDate, -1));
  const navigateNext = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Navigation administrativo
  const navegarSemana = (direcao: 'anterior' | 'proxima') => {
    setCurrentWeek(addDays(currentWeek, direcao === 'proxima' ? 7 : -7));
  };
  const irParaSemanaAtual = () => setCurrentWeek(new Date());

  const isHoliday = isFeriado(currentDate);
  const isWeekendDay = isWeekend(currentDate);
  const loading = loadingCampanha || loadingEquipes;

  // Admin functions
  const isFeriadoAdm = (date: Date): boolean => {
    return FERIADOS_2026.some(feriado => isSameDay(feriado, date));
  };

  const isPontoFacultativo = (date: Date): boolean => {
    return PONTOS_FACULTATIVOS_2026.some(pf => isSameDay(pf, date));
  };

  const trabalhaNoDia = (date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    return isWeekday && !isFeriadoAdm(date) && !isPontoFacultativo(date);
  };

  const getHorarioExpediente = (date: Date): string => {
    const dayOfWeek = getDay(date);
    if (dayOfWeek === 5) return '07:00h às 13:00h';
    return '13:00h às 19:00h';
  };

  const diasSemana = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });
    return allDays.filter(day => {
      const dayOfWeek = getDay(day);
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    });
  }, [currentWeek]);

  const rotacionarEquipes = (data: Date): string | null => {
    if (!trabalhaNoDia(data)) return null;
    const inicioAno = new Date(2026, 0, 1);
    let diasUteis = 0;
    for (let d = new Date(inicioAno); d < data; d = addDays(d, 1)) {
      if (trabalhaNoDia(d)) diasUteis++;
    }
    const indiceEquipe = diasUteis % EQUIPES_ADMINISTRATIVAS.length;
    return EQUIPES_ADMINISTRATIVAS[indiceEquipe];
  };

  const getEquipePorNome = (nome: string): Equipe | undefined => {
    return equipesAdm.find(e => e.nome === nome);
  };

  const salvarEscalaAdm = (data: Date, equipeNome: string | null) => {
    const dataKey = format(data, 'yyyy-MM-dd');
    setEscalasAdm(prev => ({
      ...prev,
      [dataKey]: equipeNome || '',
    }));
  };

  // Get equipes by grupamento for the current day's team
  const getEquipesForUnit = (unidade: UnitType): Equipe[] => {
    const grupamentoMap: Record<UnitType, string[]> = {
      'Guarda': ['GUARDA'],
      'Armeiro': ['ARMEIRO'],
      'RP Ambiental': ['RPA AMBIENTAL'],
      'GOC': ['GOC'],
      'Lacustre': ['LACUSTRE'],
      'GTA': ['GTA'],
    };

    const grupamentos = grupamentoMap[unidade] || [];
    return equipes.filter(e => grupamentos.includes(e.grupamento));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/secao-pessoas">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Escalas de Serviço</h1>
              <p className="text-sm text-muted-foreground">Escalas operacionais e administrativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="operacional" className="h-full flex flex-col">
          <div className="px-4 md:px-6 pt-4 shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="operacional" className="gap-2">
                <Shield className="h-4 w-4" />
                Operacional
              </TabsTrigger>
              <TabsTrigger value="administrativo" className="gap-2">
                <Building2 className="h-4 w-4" />
                Administrativo
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Operacional Tab */}
          <TabsContent value="operacional" className="flex-1 overflow-hidden mt-0 px-4 md:px-6 pb-4">
            <div className="h-full flex flex-col gap-4">
              {/* Navigation */}
              <Card className="shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={navigatePrevious}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <h2 className="text-xl font-bold capitalize">
                        {format(currentDate, "EEEE", { locale: ptBR })}
                      </h2>
                      <p className="text-muted-foreground">
                        {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <div className="flex justify-center gap-2 mt-2">
                        {isHoliday && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                            Feriado
                          </Badge>
                        )}
                        {isWeekendDay && !isHoliday && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                            Fim de Semana
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoje
                      </Button>
                      <Button variant="outline" size="icon" onClick={navigateNext}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Units Grid */}
              <ScrollArea className="flex-1">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
                  {UNITS.map((unidade) => {
                    const team = getTeamForDate(currentDate, unidade);
                    const campanhaMembers = team ? getMembrosForTeam(team, unidade) : [];
                    const unitEquipes = getEquipesForUnit(unidade);

                    return (
                      <Card 
                        key={unidade}
                        className={team ? 'border-primary/30' : ''}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-lg bg-primary/10">
                              {unitIcons[unidade]}
                            </div>
                            {unidade}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {team && (
                            <>
                              <div className="text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-lg px-4 py-2 ${teamColors[team]}`}
                                >
                                  Equipe {team}
                                </Badge>
                              </div>
                              
                              {campanhaMembers.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground font-medium">Membros da Campanha:</p>
                                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                                    {campanhaMembers.map((m) => (
                                      <div key={m.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                                        <Badge variant="outline" className="text-[10px] px-1 shrink-0">
                                          {m.efetivo?.posto_graduacao}
                                        </Badge>
                                        <span className="truncate">{m.efetivo?.nome_guerra}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {unitEquipes.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-border/50">
                              <p className="text-xs text-muted-foreground font-medium">Equipes Cadastradas:</p>
                              {unitEquipes.slice(0, 3).map((equipe) => (
                                <div key={equipe.id} className="p-2 rounded-lg bg-muted/20">
                                  <p className="font-medium text-sm">{equipe.nome}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {equipe.membros.slice(0, 4).map((m) => (
                                      <Badge key={m.id} variant="outline" className="text-[10px]">
                                        {m.efetivo?.posto_graduacao} {m.efetivo?.nome_guerra}
                                      </Badge>
                                    ))}
                                    {equipe.membros.length > 4 && (
                                      <Badge variant="outline" className="text-[10px]">
                                        +{equipe.membros.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {unitEquipes.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  +{unitEquipes.length - 3} equipes
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Link to Campanha */}
              <div className="text-center shrink-0 pb-2">
                <Link to="/secao-pessoas/campanha">
                  <Button variant="outline" className="gap-2">
                    <Target className="h-4 w-4" />
                    Ver Calendário Completo de Campanha
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* Administrativo Tab */}
          <TabsContent value="administrativo" className="flex-1 overflow-hidden mt-0 px-4 md:px-6 pb-4">
            <div className="h-full flex flex-col gap-4">
              {/* Week Navigation */}
              <Card className="shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={() => navegarSemana('anterior')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <h2 className="text-lg font-bold">
                        Semana de {format(diasSemana[0], "d 'de' MMMM", { locale: ptBR })} a {format(diasSemana[diasSemana.length - 1], "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={irParaSemanaAtual}>
                        Semana Atual
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navegarSemana('proxima')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Week Days Grid */}
              <ScrollArea className="flex-1">
                <div className="grid gap-4 md:grid-cols-5 pb-4">
                  {diasSemana.map((dia) => {
                    const dataKey = format(dia, 'yyyy-MM-dd');
                    const trabalha = trabalhaNoDia(dia);
                    const isFeriadoDia = isFeriadoAdm(dia);
                    const isPFDia = isPontoFacultativo(dia);
                    const equipeEscalada = escalasAdm[dataKey] || (trabalha ? rotacionarEquipes(dia) : null);
                    const equipe = equipeEscalada ? getEquipePorNome(equipeEscalada) : null;

                    return (
                      <Card
                        key={dataKey}
                        className={`${trabalha ? 'border-primary/30' : 'border-border/30 opacity-60'}`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span className="capitalize">
                              {format(dia, "EEEE", { locale: ptBR })}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                              {format(dia, "d/MM", { locale: ptBR })}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {!trabalha ? (
                            <div className="text-center py-4">
                              {isFeriadoDia ? (
                                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                                  Feriado
                                </Badge>
                              ) : isPFDia ? (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                                  Ponto Facultativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Fim de Semana
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{getHorarioExpediente(dia)}</span>
                              </div>

                              <Select
                                value={equipeEscalada || ''}
                                onValueChange={(value) => salvarEscalaAdm(dia, value)}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Selecione a equipe">
                                    {equipeEscalada || 'Selecione a equipe'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {EQUIPES_ADMINISTRATIVAS.map((nomeEquipe) => (
                                    <SelectItem key={nomeEquipe} value={nomeEquipe} className="text-xs">
                                      {nomeEquipe}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {equipe && equipe.membros && equipe.membros.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground font-medium">Membros:</p>
                                  <ScrollArea className="h-[100px]">
                                    <div className="space-y-1">
                                      {equipe.membros.map((m) => (
                                        <div
                                          key={m.id}
                                          className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30"
                                        >
                                          <Badge variant="outline" className="text-[10px] px-1 shrink-0">
                                            {m.efetivo?.posto_graduacao}
                                          </Badge>
                                          <span className="truncate">{m.efetivo?.nome_guerra}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Legend */}
              <Card className="shrink-0">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
                      <span>Dia útil com expediente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500/10 border border-red-500/30" />
                      <span>Feriado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/30" />
                      <span>Ponto Facultativo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Escalas;
