import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight, Building2, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWeekend, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  new Date(2026, 0, 1),   // Confraternização Universal
  new Date(2026, 3, 3),   // Paixão de Cristo
  new Date(2026, 3, 21),  // Tiradentes (Aniversário de Brasília)
  new Date(2026, 4, 1),   // Dia Mundial do Trabalho
  new Date(2026, 8, 7),   // Independência do Brasil
  new Date(2026, 9, 12),  // Nossa Senhora Aparecida
  new Date(2026, 10, 2),  // Finados
  new Date(2026, 10, 15), // Proclamação da República (Domingo)
  new Date(2026, 10, 20), // Dia Nacional de Zumbi e da Consciência Negra
  new Date(2026, 11, 25), // Natal
];

// Pontos Facultativos de 2026
const PONTOS_FACULTATIVOS_2026 = [
  new Date(2026, 0, 2),   // Ponto facultativo
  new Date(2026, 1, 16),  // Carnaval
  new Date(2026, 1, 17),  // Carnaval
  new Date(2026, 1, 18),  // Quarta-feira de Cinzas (até 14h)
  new Date(2026, 3, 20),  // Ponto facultativo (após Tiradentes)
  new Date(2026, 5, 4),   // Corpus Christi
  new Date(2026, 5, 5),   // Ponto facultativo (após Corpus Christi)
  new Date(2026, 9, 28),  // Dia do Servidor Público
  new Date(2026, 11, 24), // Véspera de Natal (após 14h)
  new Date(2026, 11, 31), // Véspera de Ano Novo (após 14h)
];

interface Equipe {
  id: string;
  nome: string;
  grupamento: string;
  membros?: {
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

interface EscalaDia {
  data: Date;
  equipe_id: string | null;
  equipe_nome: string | null;
}

const EscalaAdministrativo: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalas, setEscalas] = useState<Record<string, EscalaDia>>({});
  const [selectedEquipe, setSelectedEquipe] = useState<Record<string, string>>({});

  // Buscar equipes administrativas
  useEffect(() => {
    const fetchEquipes = async () => {
      setLoading(true);
      try {
        const { data: equipesData, error } = await supabase
          .from('dim_equipes')
          .select('*')
          .in('nome', EQUIPES_ADMINISTRATIVAS)
          .order('nome');

        if (error) throw error;

        // Buscar membros de cada equipe
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
        setLoading(false);
      }
    };

    fetchEquipes();
  }, []);

  // Verificar se é feriado
  const isFeriado = (date: Date): boolean => {
    return FERIADOS_2026.some(feriado => isSameDay(feriado, date));
  };

  // Verificar se é ponto facultativo
  const isPontoFacultativo = (date: Date): boolean => {
    return PONTOS_FACULTATIVOS_2026.some(pf => isSameDay(pf, date));
  };

  // Verificar se trabalha no dia (não é feriado, não é ponto facultativo, é segunda a sexta)
  const trabalhaNoDia = (date: Date): boolean => {
    const dayOfWeek = getDay(date);
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Segunda a Sexta
    return isWeekday && !isFeriado(date) && !isPontoFacultativo(date);
  };

  // Obter horário de expediente
  const getHorarioExpediente = (date: Date): string => {
    const dayOfWeek = getDay(date);
    if (dayOfWeek === 5) { // Sexta-feira
      return '07:00h às 13:00h';
    }
    return '13:00h às 19:00h'; // Segunda a Quinta
  };

  // Obter dias da semana atual (segunda a sexta)
  const diasSemana = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Segunda-feira
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Domingo
    const allDays = eachDayOfInterval({ start, end });
    // Filtrar apenas segunda a sexta
    return allDays.filter(day => {
      const dayOfWeek = getDay(day);
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    });
  }, [currentWeek]);

  // Rotacionar equipes para a semana
  const rotacionarEquipes = (data: Date): string | null => {
    if (!trabalhaNoDia(data)) return null;

    // Calcular quantos dias úteis se passaram desde o início do ano (1º de janeiro de 2026)
    const inicioAno = new Date(2026, 0, 1);
    let diasUteis = 0;
    
    // Contar apenas dias úteis (segunda a sexta, excluindo feriados e pontos facultativos)
    for (let d = new Date(inicioAno); d < data; d = addDays(d, 1)) {
      if (trabalhaNoDia(d)) {
        diasUteis++;
      }
    }

    // Rotacionar entre as equipes (começando do índice 0)
    const indiceEquipe = diasUteis % EQUIPES_ADMINISTRATIVAS.length;
    return EQUIPES_ADMINISTRATIVAS[indiceEquipe];
  };

  // Buscar equipe por nome
  const getEquipePorNome = (nome: string): Equipe | undefined => {
    return equipes.find(e => e.nome === nome);
  };

  // Navegar semanas
  const navegarSemana = (direcao: 'anterior' | 'proxima') => {
    setCurrentWeek(addDays(currentWeek, direcao === 'proxima' ? 7 : -7));
  };

  const irParaHoje = () => {
    setCurrentWeek(new Date());
  };

  // Salvar escala manual
  const salvarEscala = async (data: Date, equipeNome: string | null) => {
    const dataKey = format(data, 'yyyy-MM-dd');
    const equipe = equipeNome ? getEquipePorNome(equipeNome) : null;

    setEscalas(prev => ({
      ...prev,
      [dataKey]: {
        data,
        equipe_id: equipe?.id || null,
        equipe_nome: equipeNome,
      },
    }));

    // TODO: Salvar no banco de dados se necessário
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Escala Administrativo</h1>
              <p className="text-sm text-muted-foreground">Escalonamento de segunda a sexta-feira</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={irParaHoje}>
          Semana Atual
        </Button>
      </div>

      {/* Navegação de Semana */}
      <Card className="mb-6">
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
            <Button variant="outline" size="icon" onClick={() => navegarSemana('proxima')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Dias */}
      <div className="grid gap-4 md:grid-cols-5">
        {diasSemana.map((dia) => {
          const dataKey = format(dia, 'yyyy-MM-dd');
          const trabalha = trabalhaNoDia(dia);
          const isFeriadoDia = isFeriado(dia);
          const isPFDia = isPontoFacultativo(dia);
          const equipeEscalada = escalas[dataKey]?.equipe_nome || (trabalha ? rotacionarEquipes(dia) : null);
          const equipe = equipeEscalada ? getEquipePorNome(equipeEscalada) : null;

          return (
            <Card
              key={dataKey}
              className={`${
                trabalha
                  ? 'border-primary/30'
                  : 'border-border/30 opacity-60'
              }`}
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
                {/* Status do Dia */}
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
                    {/* Horário */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{getHorarioExpediente(dia)}</span>
                    </div>

                    {/* Seletor de Equipe */}
                    <Select
                      value={equipeEscalada || ''}
                      onValueChange={(value) => salvarEscala(dia, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe">
                          {equipeEscalada || 'Selecione a equipe'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EQUIPES_ADMINISTRATIVAS.map((nomeEquipe) => (
                          <SelectItem key={nomeEquipe} value={nomeEquipe}>
                            {nomeEquipe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Membros da Equipe */}
                    {equipe && equipe.membros && equipe.membros.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium">Membros:</p>
                        <ScrollArea className="h-[120px]">
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

      {/* Legenda */}
      <Card className="mt-6">
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
  );
};

export default EscalaAdministrativo;

