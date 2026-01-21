import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Gift, ArrowLeft, Search, Calendar, Users, ChevronLeft, ChevronRight, Loader2, Check, X, AlertCircle, Edit2, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MonthlyAbonoQuotaCard } from '@/components/abono/MonthlyAbonoQuotaCard';
import { AbonoQuota } from '@/components/abono/AbonoQuotaCard';
import { EditarParcelasDialog } from '@/components/abono/EditarParcelasDialog';

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface MilitarAbono {
  id: string;
  efetivo_id: string;
  matricula: string;
  posto: string;
  nome: string;
  nome_guerra: string;
  mes: number;
  mes_previsao: number | null;
  mes_reprogramado: number | null;
  parcela1_inicio: string | null;
  parcela1_fim: string | null;
  parcela1_dias: number | null;
  parcela1_sgpol: boolean;
  parcela1_campanha: boolean;
  parcela2_inicio: string | null;
  parcela2_fim: string | null;
  parcela2_dias: number | null;
  parcela2_sgpol: boolean;
  parcela2_campanha: boolean;
  parcela3_inicio: string | null;
  parcela3_fim: string | null;
  parcela3_dias: number | null;
  tipo: 'previsto' | 'marcado';
}

const postoColors: Record<string, string> = {
  'ST': 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  '1º SGT': 'bg-primary/20 text-primary border-primary/30',
  '2º SGT': 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  '3º SGT': 'bg-teal-500/20 text-teal-600 border-teal-500/30',
  'CB': 'bg-green-500/20 text-green-600 border-green-500/30',
  'SD': 'bg-slate-500/20 text-slate-600 border-slate-500/30',
};

const Abono: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear] = useState(2026);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [abonoData, setAbonoData] = useState<any[]>([]);
  
  // Estado para edição
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMilitar, setSelectedMilitar] = useState<MilitarAbono | null>(null);

  const LIMITE_MENSAL = 80;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_abono')
        .select(`
          id,
          mes,
          ano,
          mes_previsao,
          mes_reprogramado,
          data_inicio,
          data_fim,
          parcela1_inicio,
          parcela1_fim,
          parcela1_dias,
          parcela1_sgpol,
          parcela1_campanha,
          parcela2_inicio,
          parcela2_fim,
          parcela2_dias,
          parcela2_sgpol,
          parcela2_campanha,
          parcela3_inicio,
          parcela3_fim,
          parcela3_dias,
          efetivo:dim_efetivo(id, matricula, nome, nome_guerra, posto_graduacao)
        `)
        .eq('ano', selectedYear)
        .order('mes');
      
      if (error) throw error;
      setAbonoData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de abono:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('abono-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_abono' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Sincronizar com a planilha
  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-afastamentos-sheets', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      if (data?.detalhes?.abono?.rpc_result) {
        const result = data.detalhes.abono.rpc_result;
        toast.success(`Sincronização concluída: ${result.upserted} registros atualizados`);
      } else {
        toast.success('Sincronização concluída');
      }
      
      await fetchData();
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  // Processar dados para o mês selecionado - separar previstos e marcados/reprogramados
  const militaresDoMes = useMemo(() => {
    const previstos: MilitarAbono[] = [];
    const marcados: MilitarAbono[] = [];

    abonoData.forEach((item: any) => {
      if (!item.efetivo) return;
      
      const temDataMarcada = item.parcela1_inicio || item.parcela2_inicio || item.parcela3_inicio;
      
      const militar: MilitarAbono = {
        id: item.id,
        efetivo_id: item.efetivo.id,
        matricula: item.efetivo.matricula,
        posto: item.efetivo.posto_graduacao,
        nome: item.efetivo.nome,
        nome_guerra: item.efetivo.nome_guerra,
        mes: item.mes,
        mes_previsao: item.mes_previsao || item.mes,
        mes_reprogramado: item.mes_reprogramado,
        parcela1_inicio: item.parcela1_inicio,
        parcela1_fim: item.parcela1_fim,
        parcela1_dias: item.parcela1_dias,
        parcela1_sgpol: item.parcela1_sgpol || false,
        parcela1_campanha: item.parcela1_campanha || false,
        parcela2_inicio: item.parcela2_inicio,
        parcela2_fim: item.parcela2_fim,
        parcela2_dias: item.parcela2_dias,
        parcela2_sgpol: item.parcela2_sgpol || false,
        parcela2_campanha: item.parcela2_campanha || false,
        parcela3_inicio: item.parcela3_inicio,
        parcela3_fim: item.parcela3_fim,
        parcela3_dias: item.parcela3_dias,
        tipo: temDataMarcada ? 'marcado' : 'previsto',
      };

      // Se o mês do registro é o mês selecionado
      if (item.mes === selectedMes) {
        if (temDataMarcada) {
          marcados.push(militar);
        } else {
          previstos.push(militar);
        }
      }
      // Se foi reprogramado para o mês selecionado (vindo de outro mês)
      else if (item.mes_reprogramado === selectedMes && item.mes !== selectedMes) {
        militar.tipo = 'marcado';
        marcados.push(militar);
      }
    });

    return { previstos, marcados };
  }, [abonoData, selectedMes]);

  // Calcular cota para o mês selecionado
  const quotaMesSelecionado = useMemo(() => {
    const totalMilitares = militaresDoMes.previstos.length + militaresDoMes.marcados.length;
    const diasPrevistos = totalMilitares * 5;
    
    let diasMarcados = 0;
    abonoData.forEach((item: any) => {
      const parcelas = [
        { inicio: item.parcela1_inicio, fim: item.parcela1_fim },
        { inicio: item.parcela2_inicio, fim: item.parcela2_fim },
        { inicio: item.parcela3_inicio, fim: item.parcela3_fim },
      ];
      
      parcelas.forEach(parcela => {
        if (parcela.inicio && parcela.fim) {
          const [year, month] = parcela.inicio.split('-').map(Number);
          if (month === selectedMes && year === selectedYear) {
            const inicioDate = new Date(parcela.inicio);
            const fimDate = new Date(parcela.fim);
            const dias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            diasMarcados += dias;
          }
        }
      });
    });
    
    return {
      limite: LIMITE_MENSAL,
      previsto: diasPrevistos,
      marcados: diasMarcados,
      saldo: LIMITE_MENSAL - diasMarcados,
      isOverLimit: diasMarcados > LIMITE_MENSAL,
    };
  }, [abonoData, selectedMes, selectedYear, militaresDoMes]);

  // Calcular cotas para todos os meses
  const abonoQuotas = useMemo<AbonoQuota[]>(() => {
    return mesesNome.map((mes, idx) => {
      const mesNum = idx + 1;
      const previsto = abonoData.filter((item: any) => item.mes === mesNum).length;
      const diasPrevistos = previsto * 5;
      
      let diasMarcados = 0;
      abonoData.forEach((item: any) => {
        const parcelas = [
          { inicio: item.parcela1_inicio, fim: item.parcela1_fim },
          { inicio: item.parcela2_inicio, fim: item.parcela2_fim },
          { inicio: item.parcela3_inicio, fim: item.parcela3_fim },
        ];
        
        parcelas.forEach(parcela => {
          if (parcela.inicio && parcela.fim) {
            const [year, month] = parcela.inicio.split('-').map(Number);
            if (month === mesNum && year === selectedYear) {
              const inicioDate = new Date(parcela.inicio);
              const fimDate = new Date(parcela.fim);
              const dias = Math.ceil((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              diasMarcados += dias;
            }
          }
        });
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
  }, [abonoData, selectedYear]);

  // Filtrar militares
  const filteredPrevistos = useMemo(() => {
    if (!searchTerm) return militaresDoMes.previstos;
    const term = searchTerm.toLowerCase();
    return militaresDoMes.previstos.filter(m => 
      m.nome.toLowerCase().includes(term) ||
      m.nome_guerra.toLowerCase().includes(term) ||
      m.matricula.includes(searchTerm)
    );
  }, [militaresDoMes.previstos, searchTerm]);

  const filteredMarcados = useMemo(() => {
    if (!searchTerm) return militaresDoMes.marcados;
    const term = searchTerm.toLowerCase();
    return militaresDoMes.marcados.filter(m => 
      m.nome.toLowerCase().includes(term) ||
      m.nome_guerra.toLowerCase().includes(term) ||
      m.matricula.includes(searchTerm)
    );
  }, [militaresDoMes.marcados, searchTerm]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  };

  const handleEditClick = (militar: MilitarAbono) => {
    setSelectedMilitar(militar);
    setEditDialogOpen(true);
  };

  const prevMonth = () => {
    setSelectedMes(prev => prev === 1 ? 12 : prev - 1);
  };

  const nextMonth = () => {
    setSelectedMes(prev => prev === 12 ? 1 : prev + 1);
  };

  // Render tabela mobile
  const renderMilitarCardMobile = (militar: MilitarAbono) => (
    <div key={militar.id} className="p-3 border-b last:border-b-0 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${postoColors[militar.posto] || 'bg-muted'} text-xs`}>
            {militar.posto}
          </Badge>
          <span className="font-medium text-sm">{militar.nome_guerra}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => handleEditClick(militar)} className="h-7 w-7 p-0">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{militar.matricula}</span>
        <span>•</span>
        <Badge variant="outline" className="text-[10px] h-4">
          {militar.tipo === 'previsto' ? `Prev: ${mesesAbrev[(militar.mes_previsao || militar.mes) - 1]}` : 
           militar.mes_reprogramado ? `Reprog: ${mesesAbrev[(militar.mes_previsao || militar.mes) - 1]} → ${mesesAbrev[militar.mes_reprogramado - 1]}` : 
           `Mês: ${mesesAbrev[militar.mes - 1]}`}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="space-y-0.5">
          <span className="text-muted-foreground">1ª Parcela</span>
          <div className="font-medium">{militar.parcela1_inicio ? `${formatDate(militar.parcela1_inicio)}` : '-'}</div>
          {militar.parcela1_inicio && (
            <div className="flex gap-0.5">
              <Badge variant={militar.parcela1_sgpol ? "default" : "outline"} className="text-[8px] h-3 px-0.5">SG</Badge>
              <Badge variant={militar.parcela1_campanha ? "secondary" : "outline"} className="text-[8px] h-3 px-0.5">CP</Badge>
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <span className="text-muted-foreground">2ª Parcela</span>
          <div className="font-medium">{militar.parcela2_inicio ? `${formatDate(militar.parcela2_inicio)}` : '-'}</div>
          {militar.parcela2_inicio && (
            <div className="flex gap-0.5">
              <Badge variant={militar.parcela2_sgpol ? "default" : "outline"} className="text-[8px] h-3 px-0.5">SG</Badge>
              <Badge variant={militar.parcela2_campanha ? "secondary" : "outline"} className="text-[8px] h-3 px-0.5">CP</Badge>
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <span className="text-muted-foreground">3ª Parcela</span>
          <div className="font-medium">{militar.parcela3_inicio ? `${formatDate(militar.parcela3_inicio)}` : '-'}</div>
        </div>
      </div>
    </div>
  );

  const renderMilitaresTable = (militares: MilitarAbono[], showPrevisaoColumn: boolean = false) => (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Posto</TableHead>
              <TableHead className="min-w-[120px]">Nome</TableHead>
              <TableHead className="w-[90px]">Matrícula</TableHead>
              {showPrevisaoColumn && (
                <TableHead className="w-[130px] text-center">Previsão/Reprog.</TableHead>
              )}
              <TableHead className="text-center min-w-[100px]">1ª Parcela</TableHead>
              <TableHead className="text-center min-w-[100px]">2ª Parcela</TableHead>
              <TableHead className="text-center min-w-[80px]">3ª Parcela</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {militares.map((militar) => (
              <TableRow key={militar.id}>
                <TableCell>
                  <Badge variant="outline" className={`${postoColors[militar.posto] || 'bg-muted'} text-xs`}>
                    {militar.posto}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm">{militar.nome_guerra}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{militar.matricula}</TableCell>
                {showPrevisaoColumn && (
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {militar.mes_reprogramado && militar.mes_reprogramado !== (militar.mes_previsao || militar.mes) ? (
                        <>
                          <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-600 border-amber-500/30">
                            {mesesAbrev[(militar.mes_previsao || militar.mes) - 1]} → {mesesAbrev[militar.mes_reprogramado - 1]}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Prev: {mesesAbrev[(militar.mes_previsao || militar.mes) - 1]}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-center">
                  {militar.parcela1_inicio ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium">
                        {formatDate(militar.parcela1_inicio)} - {formatDate(militar.parcela1_fim)}
                      </span>
                      <div className="flex gap-0.5">
                        <Badge variant={militar.parcela1_sgpol ? "default" : "outline"} className="text-[9px] h-4 px-1">
                          {militar.parcela1_sgpol ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                        </Badge>
                        <Badge variant={militar.parcela1_campanha ? "secondary" : "outline"} className="text-[9px] h-4 px-1">
                          {militar.parcela1_campanha ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {militar.parcela2_inicio ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium">
                        {formatDate(militar.parcela2_inicio)} - {formatDate(militar.parcela2_fim)}
                      </span>
                      <div className="flex gap-0.5">
                        <Badge variant={militar.parcela2_sgpol ? "default" : "outline"} className="text-[9px] h-4 px-1">
                          {militar.parcela2_sgpol ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                        </Badge>
                        <Badge variant={militar.parcela2_campanha ? "secondary" : "outline"} className="text-[9px] h-4 px-1">
                          {militar.parcela2_campanha ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {militar.parcela3_inicio ? (
                    <span className="text-xs font-medium">
                      {formatDate(militar.parcela3_inicio)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick(militar)} className="h-7 w-7 p-0">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden">
        {militares.map(militar => renderMilitarCardMobile(militar))}
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header fixo */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/secao-pessoas">
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
                <Gift className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Abono Anual</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{selectedYear} - Gestão de dias de abono</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-1.5 h-8 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/secao-pessoas/abono/minuta?mes=${selectedMes}&ano=${selectedYear}`)}
              className="gap-1.5 h-8 text-xs"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Minuta</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-3 md:p-4">
          <div className="h-full grid gap-4 lg:grid-cols-[1fr,280px]">
            {/* Coluna principal */}
            <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
              {/* Navegação por mês */}
              <Card className="flex-shrink-0">
                <CardContent className="p-2 md:p-3">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2 md:gap-3">
                      <h2 className="text-base md:text-lg font-bold">{mesesNome[selectedMes - 1]}</h2>
                      <Badge variant="secondary" className="text-sm">
                        {militaresDoMes.previstos.length + militaresDoMes.marcados.length}
                      </Badge>
                    </div>
                    
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs de mês rápidas */}
              <ScrollArea className="flex-shrink-0">
                <div className="flex gap-1 pb-1">
                  {mesesNome.map((mes, idx) => {
                    const mesNum = idx + 1;
                    const count = abonoData.filter((item: any) => item.mes === mesNum).length;
                    const isActive = selectedMes === mesNum;
                    
                    return (
                      <Button
                        key={mesNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMes(mesNum)}
                        className={`flex-shrink-0 gap-1 h-7 text-xs px-2 ${isActive ? '' : 'text-muted-foreground'}`}
                      >
                        {mesesAbrev[idx]}
                        {count > 0 && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="ml-0.5 h-4 px-1 text-[10px]">
                            {count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Busca */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Tabelas - exibição completa */}
              <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-3">
                {/* Seção Previstos */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      Previstos para {mesesNome[selectedMes - 1]}
                      <Badge variant="secondary" className="ml-auto text-xs">{filteredPrevistos.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredPrevistos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">Nenhum policial previsto</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {renderMilitaresTable(filteredPrevistos, true)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Seção Marcados/Reprogramados */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      Marcados/Reprogramados
                      <Badge variant="secondary" className="ml-auto text-xs">{filteredMarcados.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredMarcados.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm font-medium">Nenhum policial marcado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {renderMilitaresTable(filteredMarcados, true)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar com cotas - visível apenas em desktop */}
            <div className="hidden lg:flex flex-col gap-3 min-h-0 overflow-hidden">
              {/* Card de cota do mês selecionado */}
              <div className="flex-shrink-0">
                <MonthlyAbonoQuotaCard 
                  quota={quotaMesSelecionado} 
                  mesNome={mesesNome[selectedMes - 1]} 
                />
              </div>
              
              {/* Resumo anual */}
              <Card className="border-primary/20 flex-shrink-0">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs font-medium">Resumo {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total de policiais</span>
                    <span className="font-semibold">{abonoData.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Dias previstos</span>
                    <span className="font-semibold text-amber-600">{abonoData.length * 5}</span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Cards de cota em drawer ou colapsável */}
      <div className="lg:hidden flex-shrink-0 p-3 border-t bg-muted/30">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background rounded-lg p-2 border">
            <div className="text-muted-foreground">Limite Mensal</div>
            <div className="font-bold text-primary">{LIMITE_MENSAL} dias</div>
          </div>
          <div className="bg-background rounded-lg p-2 border">
            <div className="text-muted-foreground">Marcados</div>
            <div className={`font-bold ${quotaMesSelecionado.isOverLimit ? 'text-destructive' : 'text-amber-600'}`}>
              {quotaMesSelecionado.marcados} dias
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de edição */}
      <EditarParcelasDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        militar={selectedMilitar}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Abono;
