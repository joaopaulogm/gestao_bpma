import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Gift, ArrowLeft, Search, Calendar, Users, ChevronLeft, ChevronRight, Loader2, ArrowRightLeft, Check, X, AlertCircle } from 'lucide-react';
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
import { AbonoQuotaCard, AbonoQuota } from '@/components/abono/AbonoQuotaCard';

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface MilitarAbono {
  id: string;
  efetivo_id: string;
  matricula: string;
  posto: string;
  nome: string;
  nome_guerra: string;
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
  tipo: 'previsto' | 'reprogramado';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear] = useState(2026);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [abonoData, setAbonoData] = useState<any[]>([]);

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
          data_inicio,
          data_fim,
          parcela1_inicio,
          parcela1_fim,
          parcela2_inicio,
          parcela2_fim,
          parcela3_inicio,
          parcela3_fim,
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

  // Processar dados para o mês selecionado
  const militaresDoMes = useMemo(() => {
    const previstos: MilitarAbono[] = [];
    const reprogramados: MilitarAbono[] = [];

    abonoData.forEach((item: any) => {
      if (!item.efetivo) return;
      
      const militar: MilitarAbono = {
        id: item.id,
        efetivo_id: item.efetivo.id,
        matricula: item.efetivo.matricula,
        posto: item.efetivo.posto_graduacao,
        nome: item.efetivo.nome,
        nome_guerra: item.efetivo.nome_guerra,
        mes_previsao: item.mes, // O campo mes armazena o mês atual
        mes_reprogramado: null,
        parcela1_inicio: item.parcela1_inicio,
        parcela1_fim: item.parcela1_fim,
        parcela1_dias: null,
        parcela1_sgpol: false,
        parcela1_campanha: false,
        parcela2_inicio: item.parcela2_inicio,
        parcela2_fim: item.parcela2_fim,
        parcela2_dias: null,
        parcela2_sgpol: false,
        parcela2_campanha: false,
        parcela3_inicio: item.parcela3_inicio,
        parcela3_fim: item.parcela3_fim,
        parcela3_dias: null,
        tipo: 'previsto',
      };

      if (item.mes === selectedMes) {
        previstos.push(militar);
      }
    });

    return { previstos, reprogramados };
  }, [abonoData, selectedMes]);

  // Calcular cota para o mês selecionado
  const quotaMesSelecionado = useMemo(() => {
    // Previsão: quantidade de policiais previstos × 5 dias
    const diasPrevistos = militaresDoMes.previstos.length * 5;
    
    // Marcados: soma dos dias das parcelas que têm data definida neste mês
    let diasMarcados = 0;
    abonoData.forEach((item: any) => {
      const parcelas = [
        { inicio: item.parcela1_inicio, fim: item.parcela1_fim },
        { inicio: item.parcela2_inicio, fim: item.parcela2_fim },
        { inicio: item.parcela3_inicio, fim: item.parcela3_fim },
      ];
      
      parcelas.forEach(parcela => {
        if (parcela.inicio && parcela.fim) {
          const inicioDate = new Date(parcela.inicio);
          if (inicioDate.getMonth() + 1 === selectedMes && inicioDate.getFullYear() === selectedYear) {
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
  }, [abonoData, selectedMes, selectedYear, militaresDoMes.previstos.length]);

  // Calcular cotas para todos os meses (para a tabela anual)
  const abonoQuotas = useMemo<AbonoQuota[]>(() => {
    return mesesNome.map((mes, idx) => {
      const mesNum = idx + 1;
      
      // Contar policiais previstos para este mês
      const previsto = abonoData.filter((item: any) => item.mes === mesNum).length;
      const diasPrevistos = previsto * 5;
      
      // Marcados: dias com datas definidas neste mês
      let diasMarcados = 0;
      abonoData.forEach((item: any) => {
        const parcelas = [
          { inicio: item.parcela1_inicio, fim: item.parcela1_fim },
          { inicio: item.parcela2_inicio, fim: item.parcela2_fim },
          { inicio: item.parcela3_inicio, fim: item.parcela3_fim },
        ];
        
        parcelas.forEach(parcela => {
          if (parcela.inicio && parcela.fim) {
            const inicioDate = new Date(parcela.inicio);
            if (inicioDate.getMonth() + 1 === mesNum && inicioDate.getFullYear() === selectedYear) {
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const prevMonth = () => {
    setSelectedMes(prev => prev === 1 ? 12 : prev - 1);
  };

  const nextMonth = () => {
    setSelectedMes(prev => prev === 12 ? 1 : prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/secao-pessoas">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
                <Gift className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Abono Anual</h1>
                <p className="text-sm text-muted-foreground">{selectedYear} - Gestão de dias de abono</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/secao-pessoas/abono/minuta?mes=${selectedMes}&ano=${selectedYear}`)}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Minuta do Mês
            </Button>
          </div>
        </div>

        {/* Layout com sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
          {/* Conteúdo principal */}
          <div className="space-y-4">
            {/* Navegação por mês */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">{mesesNome[selectedMes - 1]}</h2>
                    <Badge variant="secondary" className="text-lg">
                      {filteredPrevistos.length} policiais
                    </Badge>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs de mês rápidas */}
            <div className="flex gap-1 overflow-x-auto pb-2">
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
                    className={`flex-shrink-0 gap-1 ${isActive ? '' : 'text-muted-foreground'}`}
                  >
                    {mes.slice(0, 3)}
                    {count > 0 && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="ml-1 h-5 px-1.5">
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tabela de previstos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Policiais Previstos - {mesesNome[selectedMes - 1]}
                  <Badge variant="outline">{filteredPrevistos.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredPrevistos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhum policial previsto</p>
                    <p className="text-sm">Não há policiais com abono previsto para {mesesNome[selectedMes - 1]}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Posto</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="w-[100px]">Matrícula</TableHead>
                        <TableHead className="text-center">1ª Parcela</TableHead>
                        <TableHead className="text-center">2ª Parcela</TableHead>
                        <TableHead className="text-center">3ª Parcela</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrevistos.map((militar) => (
                        <TableRow key={militar.id}>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={postoColors[militar.posto] || 'bg-muted'}
                            >
                              {militar.posto}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{militar.nome_guerra}</TableCell>
                          <TableCell className="text-muted-foreground">{militar.matricula}</TableCell>
                          <TableCell className="text-center">
                            {militar.parcela1_inicio ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-medium">
                                  {formatDate(militar.parcela1_inicio)} - {formatDate(militar.parcela1_fim)}
                                </span>
                                <div className="flex gap-1">
                                  <Badge variant={militar.parcela1_sgpol ? "default" : "outline"} className="text-[10px] h-4 px-1">
                                    {militar.parcela1_sgpol ? <Check className="h-2.5 w-2.5 mr-0.5" /> : <X className="h-2.5 w-2.5 mr-0.5" />}
                                    SGPOL
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {militar.parcela2_inicio ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-medium">
                                  {formatDate(militar.parcela2_inicio)} - {formatDate(militar.parcela2_fim)}
                                </span>
                                <div className="flex gap-1">
                                  <Badge variant={militar.parcela2_sgpol ? "default" : "outline"} className="text-[10px] h-4 px-1">
                                    {militar.parcela2_sgpol ? <Check className="h-2.5 w-2.5 mr-0.5" /> : <X className="h-2.5 w-2.5 mr-0.5" />}
                                    SGPOL
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {militar.parcela3_inicio ? (
                              <span className="text-sm font-medium">
                                {formatDate(militar.parcela3_inicio)} - {formatDate(militar.parcela3_fim)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com cota */}
          <div className="space-y-4">
            {/* Card de cota do mês selecionado */}
            <MonthlyAbonoQuotaCard 
              quota={quotaMesSelecionado} 
              mesNome={mesesNome[selectedMes - 1]} 
            />
            
            {/* Resumo anual */}
            <Card className="border-primary/20">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Resumo {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de policiais</span>
                  <span className="font-semibold">{abonoData.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dias previstos</span>
                  <span className="font-semibold text-amber-600">{abonoData.length * 5}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de cota anual */}
            <AbonoQuotaCard quotas={abonoQuotas} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default Abono;
