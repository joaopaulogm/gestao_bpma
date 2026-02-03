import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Loader2, Calendar, Gift, FileSpreadsheet, FileDown, Save, Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface AbonoMinuta {
  id: string;
  posto_graduacao: string;
  matricula: string;
  nome_guerra: string;
  nome: string;
  parcela: number;
  dias: number;
  data_inicio: string;
  data_fim: string;
  sei: string;
  hasChanges: boolean;
  saving: boolean;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const postoOrdem: Record<string, number> = {
  'TC': 1, 'MAJ': 2, 'CAP': 3, '1º TEN': 4, '2º TEN': 5, 'ASP OF': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12
};

function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  if (!y || !m || !d) return dateStr;
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

function toLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

const MinutaAbono: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mesParam = searchParams.get('mes');
  const anoParam = searchParams.get('ano');
  
  const mes = mesParam ? parseInt(mesParam) : new Date().getMonth() + 1;
  const ano = anoParam ? parseInt(anoParam) : new Date().getFullYear();
  
  const [data, setData] = useState<AbonoMinuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: abonos, error } = await supabase
        .from('fat_abono')
        .select(`
          id,
          mes,
          observacao,
          parcela1_inicio,
          parcela1_fim,
          parcela1_dias,
          parcela2_inicio,
          parcela2_fim,
          parcela2_dias,
          parcela3_inicio,
          parcela3_fim,
          parcela3_dias,
          data_inicio,
          data_fim,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome, nome_guerra)
        `)
        .eq('ano', ano)
        .eq('mes', mes);

      if (error) throw error;

      const minutaData: AbonoMinuta[] = [];
      
      abonos?.forEach((a: any) => {
        if (!a.efetivo) return;
        
        const addParcela = (parcelaNum: number, inicio: string | null, fim: string | null, diasParcela: number | null) => {
          if (inicio && fim) {
            const dataInicio = inicio;
            const dataFim = fim;
            const diffTime = Math.abs(toLocalDate(fim).getTime() - toLocalDate(inicio).getTime());
            const diffDays = diasParcela || Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            minutaData.push({
              id: `${a.id}-p${parcelaNum}`,
              posto_graduacao: a.efetivo.posto_graduacao || '-',
              matricula: a.efetivo.matricula || '-',
              nome_guerra: a.efetivo.nome_guerra || '-',
              nome: a.efetivo.nome || '-',
              parcela: parcelaNum,
              dias: diffDays,
              data_inicio: dataInicio,
              data_fim: dataFim,
              sei: a.observacao || '',
              hasChanges: false,
              saving: false,
            });
          }
        };
        
        addParcela(1, a.parcela1_inicio, a.parcela1_fim, a.parcela1_dias);
        addParcela(2, a.parcela2_inicio, a.parcela2_fim, a.parcela2_dias);
        addParcela(3, a.parcela3_inicio, a.parcela3_fim, a.parcela3_dias);
        
        if (minutaData.filter(m => m.id.startsWith(a.id)).length === 0 && a.data_inicio && a.data_fim) {
          addParcela(1, a.data_inicio, a.data_fim, null);
        }
      });

      minutaData.sort((a, b) => {
        const postoA = postoOrdem[a.posto_graduacao] || 99;
        const postoB = postoOrdem[b.posto_graduacao] || 99;
        if (postoA !== postoB) return postoA - postoB;
        if (a.nome !== b.nome) return a.nome.localeCompare(b.nome);
        return a.parcela - b.parcela;
      });

      setData(minutaData);
    } catch (error) {
      console.error('Erro ao carregar minuta de abono:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDataInicio = (id: string, newDate: Date) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const newDataFim = addDays(newDate, item.dias - 1);
        return { 
          ...item, 
          data_inicio: format(newDate, 'yyyy-MM-dd'), 
          data_fim: format(newDataFim, 'yyyy-MM-dd'), 
          hasChanges: true 
        };
      }
      return item;
    }));
  };

  const updateDataFim = (id: string, newDate: Date) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, data_fim: format(newDate, 'yyyy-MM-dd'), hasChanges: true };
      }
      return item;
    }));
  };

  const updateSEI = (id: string, sei: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, sei, hasChanges: true };
      }
      return item;
    }));
  };

  const saveItem = async (id: string) => {
    const item = data.find(i => i.id === id);
    if (!item) return;

    setData(prev => prev.map(i => i.id === id ? { ...i, saving: true } : i));

    try {
      const realId = id.includes('-p') ? id.split('-p')[0] : id;
      const parcela = item.parcela;
      
      const updateData: Record<string, any> = {
        observacao: item.sei || null,
      };
      
      if (parcela === 1) {
        updateData.parcela1_inicio = item.data_inicio;
        updateData.parcela1_fim = item.data_fim;
        updateData.data_inicio = item.data_inicio;
        updateData.data_fim = item.data_fim;
      } else if (parcela === 2) {
        updateData.parcela2_inicio = item.data_inicio;
        updateData.parcela2_fim = item.data_fim;
      } else if (parcela === 3) {
        updateData.parcela3_inicio = item.data_inicio;
        updateData.parcela3_fim = item.data_fim;
      }
      
      const { error } = await supabase
        .from('fat_abono')
        .update(updateData)
        .eq('id', realId);

      if (error) throw error;

      setData(prev => prev.map(i => i.id === id ? { ...i, hasChanges: false, saving: false } : i));
      toast.success('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
      setData(prev => prev.map(i => i.id === id ? { ...i, saving: false } : i));
    }
  };

  const saveAll = async () => {
    const itemsToSave = data.filter(item => item.hasChanges);
    if (itemsToSave.length === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }

    setSavingAll(true);

    try {
      for (const item of itemsToSave) {
        const realId = item.id.includes('-p') ? item.id.split('-p')[0] : item.id;
        const { error } = await supabase
          .from('fat_abono')
          .update({
            data_inicio: item.data_inicio,
            data_fim: item.data_fim,
            observacao: item.sei || null,
          })
          .eq('id', realId);

        if (error) throw error;
      }

      setData(prev => prev.map(i => ({ ...i, hasChanges: false })));
      toast.success(`${itemsToSave.length} registro(s) salvo(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSavingAll(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(14);
    doc.text('POLÍCIA MILITAR DO DISTRITO FEDERAL', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`MINUTA DE ABONO - ${MESES[mes - 1].toUpperCase()} DE ${ano}`, doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });

    const tableData = data.map((item, index) => [
      index + 1,
      item.posto_graduacao,
      item.matricula,
      item.nome_guerra,
      item.nome,
      formatDateString(item.data_inicio),
      formatDateString(item.data_fim),
      item.dias,
      item.sei || '-',
    ]);

    autoTable(doc, {
      head: [['#', 'Posto/Grad', 'Matrícula', 'Nome de Guerra', 'Nome Completo', 'Data Início', 'Data Término', 'Dias', 'N° do Processo SEI-GDF']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [230, 126, 34] },
      columnStyles: {
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
        8: { cellWidth: 25 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.text('_______________________________', 30, finalY + 30);
    doc.text('Chefe da Seção de Pessoas', 35, finalY + 36);
    doc.text('_______________________________', 130, finalY + 30);
    doc.text('Comandante do BPMA', 140, finalY + 36);

    doc.save(`minuta_abono_${MESES[mes - 1].toLowerCase()}_${ano}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportToExcel = () => {
    const wsData = [
      ['POLÍCIA MILITAR DO DISTRITO FEDERAL'],
      ['BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL'],
      [`MINUTA DE ABONO - ${MESES[mes - 1].toUpperCase()} DE ${ano}`],
      [],
      ['#', 'Posto/Graduação', 'Matrícula', 'Nome de Guerra', 'Nome Completo', 'Data Início', 'Data Término', 'Qtd. Dias', 'N° do Processo SEI-GDF'],
      ...data.map((item, index) => [
        index + 1,
        item.posto_graduacao,
        item.matricula,
        item.nome_guerra,
        item.nome,
        formatDateString(item.data_inicio),
        formatDateString(item.data_fim),
        item.dias,
        item.sei || '',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Minuta de Abono');
    
    ws['!cols'] = [
      { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 30 }
    ];

    XLSX.writeFile(wb, `minuta_abono_${MESES[mes - 1].toLowerCase()}_${ano}.xlsx`);
    toast.success('Excel exportado com sucesso!');
  };

  const exportToWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Minuta de Abono</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="text-align: center;">POLÍCIA MILITAR DO DISTRITO FEDERAL</h2>
        <h3 style="text-align: center;">BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL</h3>
        <h4 style="text-align: center;">MINUTA DE ABONO - ${MESES[mes - 1].toUpperCase()} DE ${ano}</h4>
        <br/>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #e67e22; color: white;">
              <th>#</th>
              <th>Posto/Graduação</th>
              <th>Matrícula</th>
              <th>Nome de Guerra</th>
              <th>Nome Completo</th>
              <th>Data Início</th>
              <th>Data Término</th>
              <th>Dias</th>
              <th>N° do Processo SEI-GDF</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.posto_graduacao}</td>
                <td>${item.matricula}</td>
                <td>${item.nome_guerra}</td>
                <td>${item.nome}</td>
                <td>${formatDateString(item.data_inicio)}</td>
                <td>${formatDateString(item.data_fim)}</td>
                <td style="text-align: center;">${item.dias}</td>
                <td>${item.sei || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <br/><br/><br/>
        <table style="width: 100%;">
          <tr>
            <td style="text-align: center; width: 50%;">
              <div style="border-top: 1px solid black; width: 200px; margin: auto; padding-top: 5px;">
                Chefe da Seção de Pessoas
              </div>
            </td>
            <td style="text-align: center; width: 50%;">
              <div style="border-top: 1px solid black; width: 200px; margin: auto; padding-top: 5px;">
                Comandante do BPMA
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minuta_abono_${MESES[mes - 1].toLowerCase()}_${ano}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Word exportado com sucesso!');
  };

  const totalDias = useMemo(() => data.reduce((acc, item) => acc + item.dias, 0), [data]);
  const hasAnyChanges = data.some(item => item.hasChanges);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="min-h-full bg-background">
        <div className="page-container py-4 md:py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link to="/secao-pessoas/abono">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                  <Gift className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">Minuta de Abono</h1>
                  <p className="text-sm text-muted-foreground">
                    {MESES[mes - 1]} de {ano}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                onClick={saveAll} 
                disabled={!hasAnyChanges || savingAll}
                className="gap-2"
                variant={hasAnyChanges ? "default" : "outline"}
              >
                {savingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Tudo
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToWord} className="gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Exportar Word (DOC)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToExcel} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    Exportar Excel (XLSX)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{MESES[mes - 1]}</p>
                <p className="text-xs text-muted-foreground">Mês Selecionado</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 text-center">
                <Gift className="h-5 w-5 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{data.length}</p>
                <p className="text-xs text-muted-foreground">Policiais</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <FileDown className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{totalDias}</p>
                <p className="text-xs text-muted-foreground">Total de Dias</p>
              </CardContent>
            </Card>
            <Card className={cn(
              "border-2 transition-colors",
              hasAnyChanges 
                ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/40" 
                : "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
            )}>
              <CardContent className="p-4 text-center">
                {hasAnyChanges ? (
                  <>
                    <Save className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{data.filter(i => i.hasChanges).length}</p>
                    <p className="text-xs text-muted-foreground">Alterações Pendentes</p>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-foreground">Salvo</p>
                    <p className="text-xs text-muted-foreground">Tudo Atualizado</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-amber-600" />
                Relação de Policiais com Abono em {MESES[mes - 1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum policial com abono confirmado para este mês.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] whitespace-normal">#</TableHead>
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead className="whitespace-normal">Nome de Guerra</TableHead>
                        <TableHead className="whitespace-normal">Nome Completo</TableHead>
                        <TableHead className="whitespace-normal">Data Início</TableHead>
                        <TableHead className="whitespace-normal">Data Término</TableHead>
                        <TableHead className="text-center">Qtd. Dias</TableHead>
                        <TableHead className="whitespace-normal">N° do Processo SEI-GDF</TableHead>
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={item.id} className={cn(item.hasChanges && "bg-orange-50 dark:bg-orange-950/20")}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{item.posto_graduacao}</TableCell>
                          <TableCell>{item.matricula}</TableCell>
                          <TableCell className="font-medium break-words">{item.nome_guerra}</TableCell>
                          <TableCell className="break-words">{item.nome}</TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-[110px] justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formatDateString(item.data_inicio)}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={item.data_inicio ? toLocalDate(item.data_inicio) : undefined}
                                  onSelect={(date) => date && updateDataInicio(item.id, date)}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="w-[110px] justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formatDateString(item.data_fim)}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={item.data_fim ? toLocalDate(item.data_fim) : undefined}
                                  onSelect={(date) => date && updateDataFim(item.id, date)}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{item.dias}</Badge>
                          </TableCell>
                          <TableCell className="break-words">
                            <Input
                              value={item.sei}
                              onChange={(e) => updateSEI(item.id, e.target.value)}
                              placeholder="N° Processo SEI-GDF..."
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveItem(item.id)}
                              disabled={!item.hasChanges || item.saving}
                              className={cn(
                                "h-8 w-8 p-0",
                                item.hasChanges && "text-orange-600 hover:text-orange-700"
                              )}
                            >
                              {item.saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : item.hasChanges ? (
                                <Save className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
};

export default MinutaAbono;
