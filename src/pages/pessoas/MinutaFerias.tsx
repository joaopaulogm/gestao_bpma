import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Loader2, Printer, Download, Calendar } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeriasMinuta {
  id: string;
  quadro: string;
  posto_graduacao: string;
  matricula: string;
  nome: string;
  dias: number;
  data_inicio: string;
  data_fim: string;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV: Record<string, number> = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
};

const postoOrdem: Record<string, number> = {
  'TC': 1, 'MAJ': 2, 'CAP': 3, '1º TEN': 4, '2º TEN': 5, 'ASP OF': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12
};

// Parse observacao to get parcelas for a specific month
function getParcelaForMonth(observacao: string | null, mesInicio: number, dias: number, targetMes: number): number | null {
  if (!observacao) {
    return mesInicio === targetMes ? dias : null;
  }

  const regex = /(\d)ª:\s*([A-Z]{3})\((\d+)d\)/g;
  let match;
  
  while ((match = regex.exec(observacao)) !== null) {
    const mesAbrev = match[2];
    const diasParcela = parseInt(match[3], 10);
    const mesNum = MESES_ABREV[mesAbrev];
    
    if (mesNum === targetMes) {
      return diasParcela;
    }
  }

  // Check if single vacation in target month
  return mesInicio === targetMes ? dias : null;
}

// Calculate end date from start date and number of days
function calcularDataFim(ano: number, mes: number, dias: number): string {
  // Assuming vacation starts on day 1 of the month
  const startDate = new Date(ano, mes - 1, 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + dias - 1);
  
  return endDate.toLocaleDateString('pt-BR');
}

const MinutaFerias: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mesParam = searchParams.get('mes');
  const anoParam = searchParams.get('ano');
  
  const mes = mesParam ? parseInt(mesParam) : new Date().getMonth() + 1;
  const ano = anoParam ? parseInt(anoParam) : new Date().getFullYear();
  
  const [data, setData] = useState<FeriasMinuta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: ferias, error } = await supabase
        .from('fat_ferias')
        .select(`
          id,
          mes_inicio,
          dias,
          observacao,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome, quadro)
        `)
        .eq('ano', ano);

      if (error) throw error;

      // Filter and transform data for the selected month
      const minutaData: FeriasMinuta[] = [];
      
      ferias?.forEach((f: any) => {
        const diasNoMes = getParcelaForMonth(f.observacao, f.mes_inicio, f.dias, mes);
        
        if (diasNoMes && f.efetivo) {
          minutaData.push({
            id: f.id,
            quadro: f.efetivo.quadro || '-',
            posto_graduacao: f.efetivo.posto_graduacao || '-',
            matricula: f.efetivo.matricula || '-',
            nome: f.efetivo.nome || '-',
            dias: diasNoMes,
            data_inicio: `01/${mes.toString().padStart(2, '0')}/${ano}`,
            data_fim: calcularDataFim(ano, mes, diasNoMes),
          });
        }
      });

      // Sort by posto
      minutaData.sort((a, b) => {
        const postoA = postoOrdem[a.posto_graduacao] || 99;
        const postoB = postoOrdem[b.posto_graduacao] || 99;
        if (postoA !== postoB) return postoA - postoB;
        return a.nome.localeCompare(b.nome);
      });

      setData(minutaData);
    } catch (error) {
      console.error('Erro ao carregar minuta de férias:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const totalDias = useMemo(() => data.reduce((acc, item) => acc + item.dias, 0), [data]);

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 max-w-6xl pb-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
            <div className="flex items-center gap-4">
              <Link to="/secao-pessoas/ferias">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">Minuta de Férias</h1>
                  <p className="text-sm text-muted-foreground">
                    {MESES[mes - 1]} de {ano}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>

          {/* Print Header */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-xl font-bold">POLÍCIA MILITAR DO DISTRITO FEDERAL</h1>
            <h2 className="text-lg font-semibold">BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL</h2>
            <h3 className="text-md mt-2">MINUTA DE FÉRIAS - {MESES[mes - 1].toUpperCase()} DE {ano}</h3>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 print:hidden">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{MESES[mes - 1]}</p>
                <p className="text-xs text-muted-foreground">Mês Selecionado</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <FileText className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{data.length}</p>
                <p className="text-xs text-muted-foreground">Policiais</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 text-center">
                <Download className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{totalDias}</p>
                <p className="text-xs text-muted-foreground">Total de Dias</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader className="print:py-2">
              <CardTitle className="flex items-center gap-2 text-lg print:text-base">
                <FileText className="h-5 w-5 text-primary print:hidden" />
                Relação de Policiais com Férias em {MESES[mes - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum policial com férias confirmadas para este mês.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Quadro</TableHead>
                        <TableHead>Posto/Graduação</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead className="text-center">Qtd. Dias</TableHead>
                        <TableHead>Data Início</TableHead>
                        <TableHead>Data Término</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.quadro}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.posto_graduacao}</TableCell>
                          <TableCell>{item.matricula}</TableCell>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{item.dias}</Badge>
                          </TableCell>
                          <TableCell>{item.data_inicio}</TableCell>
                          <TableCell>{item.data_fim}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Print Footer */}
          <div className="hidden print:block mt-8 text-sm">
            <div className="flex justify-between mt-12">
              <div className="text-center">
                <div className="border-t border-black w-48 pt-1">
                  Chefe da Seção de Pessoas
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-48 pt-1">
                  Comandante do BPMA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default MinutaFerias;
