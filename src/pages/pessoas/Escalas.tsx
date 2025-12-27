import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, Users, Building2, Anchor, Plane, Shield, Target, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCampanhaData, TeamType, UnitType } from '@/hooks/useCampanhaData';

const teamColors: Record<TeamType, string> = {
  'Alfa': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Bravo': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
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
  'Administrativo': <Building2 className="h-5 w-5" />,
};

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
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loadingEquipes, setLoadingEquipes] = useState(true);
  
  const year = currentDate.getFullYear();
  const {
    loading: loadingCampanha,
    UNITS,
    getTeamForDate,
    isFeriado,
    administrativoTrabalha,
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

      // Fetch membros for each equipe
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

      setEquipes(equipesWithMembros);
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

  const navigatePrevious = () => setCurrentDate(addDays(currentDate, -1));
  const navigateNext = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const isHoliday = isFeriado(currentDate);
  const isWeekendDay = isWeekend(currentDate);
  const loading = loadingCampanha || loadingEquipes;

  // Get equipes by grupamento for the current day's team
  const getEquipesForUnit = (unidade: UnitType): Equipe[] => {
    const grupamentoMap: Record<UnitType, string[]> = {
      'Guarda': ['GUARDA'],
      'Armeiro': ['ARMEIRO'],
      'RP Ambiental': ['RPA AMBIENTAL'],
      'GOC': ['GOC'],
      'Lacustre': ['LACUSTRE'],
      'GTA': ['GTA'],
      'Administrativo': ['EXPEDIENTE', 'OFICIAIS', 'COMISSÕES'],
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
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Escala do Dia</h1>
              <p className="text-sm text-muted-foreground">Visualização diária das equipes de serviço</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={goToToday}>
          Hoje
        </Button>
      </div>

      {/* Navigation */}
      <Card className="mb-6">
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
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((unidade) => {
            const team = getTeamForDate(currentDate, unidade);
            const isAdmin = unidade === 'Administrativo';
            const works = isAdmin ? administrativoTrabalha(currentDate) : true;
            const campanhaMembers = team ? getMembrosForTeam(team, unidade) : [];
            const unitEquipes = getEquipesForUnit(unidade);

            return (
              <Card 
                key={unidade}
                className={`${
                  isAdmin 
                    ? (works ? 'border-slate-500/30' : 'border-border/30 opacity-50')
                    : team ? 'border-primary/30' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`p-2 rounded-lg ${
                      isAdmin ? 'bg-slate-500/10' : 'bg-primary/10'
                    }`}>
                      {unitIcons[unidade]}
                    </div>
                    {unidade}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isAdmin ? (
                    <div className="text-center py-4">
                      {works ? (
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                          Expediente Normal
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          {isHoliday ? 'Feriado' : 'Fim de Semana'}
                        </Badge>
                      )}
                    </div>
                  ) : team && (
                    <>
                      <div className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`text-lg px-4 py-2 ${teamColors[team]}`}
                        >
                          Equipe {team}
                        </Badge>
                      </div>
                      
                      {/* Campanha members */}
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

                  {/* Regular equipes from dim_equipes */}
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
      <div className="mt-6 text-center">
        <Link to="/secao-pessoas/campanha">
          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Ver Calendário Completo de Campanha
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Escalas;
