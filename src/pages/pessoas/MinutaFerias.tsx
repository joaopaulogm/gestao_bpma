import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, Loader2, Printer, Calendar, FileSpreadsheet, FileDown, Save, Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
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

interface FeriasMinuta {
  id: string;
  quadro: string;
  posto_graduacao: string;
  matricula: string;
  nome: string;
  dias: number;
  data_inicio: Date;
  data_fim: Date;
  processoSei: string;
  hasChanges: boolean;
  saving: boolean;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV: Record<string, number> = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
};

const MESES_NUM_TO_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function extractSeiFromObservacao(observacao: string | null): string {
  if (!observacao) return '';
  // formato atual gravado no banco: "...; sei=XXXX; ..."
  const match = observacao.match(/(?:^|[;\s])sei\s*=\s*([^;\n\r]+)/i);
  return (match?.[1] || '').trim();
}

function normalizeMinutaDate(isoDate: string, ano: number): string {
  // alguns registros estão com ano incorreto (ex.: 2025) apesar de fat_ferias.ano = 2026
  // Aqui preservamos mês/dia e forçamos o ano da minuta.
  const d = parseISO(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const y = d.getFullYear();
  if (y === ano) return format(d, 'yyyy-MM-dd');
  const fixed = new Date(ano, d.getMonth(), d.getDate());
  return format(fixed, 'yyyy-MM-dd');
}

const postoOrdem: Record<string, number> = {
  'TC': 1, 'MAJ': 2, 'CAP': 3, '1º TEN': 4, '2º TEN': 5, 'ASP OF': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12
};

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

  return mesInicio === targetMes ? dias : null;
}

const MinutaFerias: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mesParam = searchParams.get('mes');
  const anoParam = searchParams.get('ano');
  
  const mes = mesParam ? parseInt(mesParam) : new Date().getMonth() + 1;
  const ano = anoParam ? parseInt(anoParam) : new Date().getFullYear();
  
  const [data, setData] = useState<FeriasMinuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

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
          minuta_data_inicio,
          minuta_data_fim,
          minuta_observacao,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome, quadro)
        `)
        .eq('ano', ano);

      if (error) throw error;

      const minutaData: FeriasMinuta[] = [];
      
      ferias?.forEach((f: any) => {
        const diasNoMes = getParcelaForMonth(f.observacao, f.mes_inicio, f.dias, mes);
        
        // Only include entries with confirmed dates (minuta_data_inicio and minuta_data_fim set)
        if (diasNoMes && f.efetivo && f.minuta_data_inicio && f.minuta_data_fim) {
          const dataInicio = parseISO(f.minuta_data_inicio);
          const dataFim = parseISO(f.minuta_data_fim);
          
          minutaData.push({
            id: f.id,
            quadro: f.efetivo.quadro || '-',
            posto_graduacao: f.efetivo.posto_graduacao || '-',
            matricula: f.efetivo.matricula || '-',
            nome: f.efetivo.nome || '-',
            dias: diasNoMes,
            data_inicio: dataInicio,
            data_fim: dataFim,
            processoSei: f.minuta_observacao || '',
            hasChanges: false,
            saving: false,
          });
        }
      });

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

  const autoFillFromParcelas = useCallback(async () => {
    setAutoFilling(true);
    try {
      const mesAbrev = MESES_NUM_TO_ABREV[mes - 1];
      if (!mesAbrev) {
        toast.error('Mês inválido');
        return;
      }

      // 1) buscar ferias do ano
      const { data: ferias, error: feriasError } = await supabase
        .from('fat_ferias')
        .select('id, mes_inicio, dias, observacao, minuta_data_inicio, minuta_data_fim, minuta_observacao')
        .eq('ano', ano);

      if (feriasError) throw feriasError;
      const feriasIds = (ferias || []).map((f: any) => f.id).filter(Boolean);
      if (feriasIds.length === 0) {
        toast.info('Nenhum registro de férias encontrado para o ano selecionado');
        return;
      }

      // 2) buscar parcelas do mês selecionado
      const { data: parcelas, error: parcelasError } = await supabase
        .from('fat_ferias_parcelas')
        .select('fat_ferias_id, parcela_num, mes, dias, data_inicio, data_fim')
        .in('fat_ferias_id', feriasIds)
        .eq('mes', mesAbrev);

      if (parcelasError) throw parcelasError;

      const parcelasByFeriasId = new Map<string, any>();
      (parcelas || []).forEach((p: any) => {
        // se houver mais de uma parcela no mesmo mês (caso raro), manter a de menor parcela_num
        const prev = parcelasByFeriasId.get(p.fat_ferias_id);
        if (!prev || (p.parcela_num || 99) < (prev.parcela_num || 99)) {
          parcelasByFeriasId.set(p.fat_ferias_id, p);
        }
      });

      // 3) atualizar fat_ferias.minuta_* usando data_inicio/data_fim da parcela do mês
      let updated = 0;
      for (const f of ferias || []) {
        const p = parcelasByFeriasId.get(f.id);
        if (!p?.data_inicio || !p?.data_fim) continue;

        const sei = (f.minuta_observacao || '').trim() || extractSeiFromObservacao(f.observacao);
        const minutaInicio = normalizeMinutaDate(p.data_inicio, ano);
        const minutaFim = normalizeMinutaDate(p.data_fim, ano);

        // evitar write desnecessário
        const sameInicio = f.minuta_data_inicio === minutaInicio;
        const sameFim = f.minuta_data_fim === minutaFim;
        const sameSei = (f.minuta_observacao || '') === (sei || null);
        if (sameInicio && sameFim && sameSei) continue;

        const { error: updErr } = await supabase
          .from('fat_ferias')
          .update({
            minuta_data_inicio: minutaInicio,
            minuta_data_fim: minutaFim,
            minuta_observacao: sei || null,
          })
          .eq('id', f.id);

        if (updErr) throw updErr;
        updated++;
      }

      toast.success(`Auto-preenchimento concluído: ${updated} registro(s) atualizado(s).`);
      await fetchData();
    } catch (e) {
      console.error('Erro no auto-preenchimento da minuta (parcelas):', e);
      toast.error('Falha ao auto-preencher a minuta a partir das parcelas');
    } finally {
      setAutoFilling(false);
    }
  }, [ano, mes, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDataInicio = (id: string, newDate: Date) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const newDataFim = addDays(newDate, item.dias - 1);
        return { ...item, data_inicio: newDate, data_fim: newDataFim, hasChanges: true };
      }
      return item;
    }));
  };

  const updateDataFim = (id: string, newDate: Date) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, data_fim: newDate, hasChanges: true };
      }
      return item;
    }));
  };

  const updateProcessoSei = (id: string, processoSei: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, processoSei, hasChanges: true };
      }
      return item;
    }));
  };

  const saveItem = async (id: string) => {
    const item = data.find(i => i.id === id);
    if (!item) return;

    setData(prev => prev.map(i => i.id === id ? { ...i, saving: true } : i));

    try {
      const { error } = await supabase
        .from('fat_ferias')
        .update({
          minuta_data_inicio: format(item.data_inicio, 'yyyy-MM-dd'),
          minuta_data_fim: format(item.data_fim, 'yyyy-MM-dd'),
          minuta_observacao: item.processoSei || null,
        })
        .eq('id', id);

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
        const { error } = await supabase
          .from('fat_ferias')
          .update({
            minuta_data_inicio: format(item.data_inicio, 'yyyy-MM-dd'),
            minuta_data_fim: format(item.data_fim, 'yyyy-MM-dd'),
            minuta_observacao: item.processoSei || null,
          })
          .eq('id', item.id);

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

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(14);
    doc.text('POLÍCIA MILITAR DO DISTRITO FEDERAL', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`MINUTA DE FÉRIAS - ${MESES[mes - 1].toUpperCase()} DE ${ano}`, doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });

    const tableData = data.map((item, index) => [
      index + 1,
      item.quadro,
      item.posto_graduacao,
      item.matricula,
      item.nome,
      item.dias,
      format(item.data_inicio, 'dd/MM/yyyy'),
      format(item.data_fim, 'dd/MM/yyyy'),
      item.processoSei || '-',
    ]);

    autoTable(doc, {
      head: [['#', 'Quadro', 'Posto/Grad', 'Matrícula', 'Nome', 'Dias', 'Início', 'Término', 'Nº SEI']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
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

    doc.save(`minuta_ferias_${MESES[mes - 1].toLowerCase()}_${ano}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportToExcel = () => {
    const wsData = [
      ['POLÍCIA MILITAR DO DISTRITO FEDERAL'],
      ['BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL'],
      [`MINUTA DE FÉRIAS - ${MESES[mes - 1].toUpperCase()} DE ${ano}`],
      [],
      ['#', 'Quadro', 'Posto/Graduação', 'Matrícula', 'Nome Completo', 'Qtd. Dias', 'Data Início', 'Data Término', 'N° do Processo SEI-GDF'],
      ...data.map((item, index) => [
        index + 1,
        item.quadro,
        item.posto_graduacao,
        item.matricula,
        item.nome,
        item.dias,
        format(item.data_inicio, 'dd/MM/yyyy'),
        format(item.data_fim, 'dd/MM/yyyy'),
        item.processoSei || '',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Minuta de Férias');
    
    ws['!cols'] = [
      { wch: 5 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 30 }
    ];

    XLSX.writeFile(wb, `minuta_ferias_${MESES[mes - 1].toLowerCase()}_${ano}.xlsx`);
    toast.success('Excel exportado com sucesso!');
  };

  const exportToWord = () => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Minuta de Férias</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="text-align: center;">POLÍCIA MILITAR DO DISTRITO FEDERAL</h2>
        <h3 style="text-align: center;">BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL</h3>
        <h4 style="text-align: center;">MINUTA DE FÉRIAS - ${MESES[mes - 1].toUpperCase()} DE ${ano}</h4>
        <br/>
        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #2980b9; color: white;">
              <th>#</th>
              <th>Quadro</th>
              <th>Posto/Graduação</th>
              <th>Matrícula</th>
              <th>Nome Completo</th>
              <th>Dias</th>
              <th>Data Início</th>
              <th>Data Término</th>
              <th>N° do Processo SEI-GDF</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.quadro}</td>
                <td>${item.posto_graduacao}</td>
                <td>${item.matricula}</td>
                <td>${item.nome}</td>
                <td style="text-align: center;">${item.dias}</td>
                <td>${format(item.data_inicio, 'dd/MM/yyyy')}</td>
                <td>${format(item.data_fim, 'dd/MM/yyyy')}</td>
                <td>${item.processoSei || '-'}</td>
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
    link.download = `minuta_ferias_${MESES[mes - 1].toLowerCase()}_${ano}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Word exportado com sucesso!');
  };

  const totalDias = useMemo(() => data.reduce((acc, item) => acc + item.dias, 0), [data]);
  const hasAnyChanges = data.some(item => item.hasChanges);

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-background">
        <div className="page-container py-4 md:py-6 pb-20">
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

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={autoFillFromParcelas}
                disabled={autoFilling}
                variant="outline"
                className="gap-2"
              >
                {autoFilling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Auto-preencher do Banco
              </Button>
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
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Print Header */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-xl font-bold">POLÍCIA MILITAR DO DISTRITO FEDERAL</h1>
            <h2 className="text-lg font-semibold">BATALHÃO DE POLICIAMENTO DE PROTEÇÃO AMBIENTAL</h2>
            <h3 className="text-md mt-2">MINUTA DE FÉRIAS - {MESES[mes - 1].toUpperCase()} DE {ano}</h3>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:hidden">
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
                <FileDown className="h-5 w-5 text-amber-600 mx-auto mb-2" />
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
                        <TableHead>Posto/Grad</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead className="text-center">Dias</TableHead>
                        <TableHead>Data Início</TableHead>
                        <TableHead>Data Término</TableHead>
                        <TableHead className="min-w-[200px]">N° do Processo SEI-GDF</TableHead>
                        <TableHead className="w-[80px] print:hidden">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item, index) => (
                        <TableRow key={item.id} className={cn(item.hasChanges && "bg-orange-50 dark:bg-orange-950/20")}>
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
                          <TableCell className="print:hidden">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="min-w-fit px-3 justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {format(item.data_inicio, 'dd/MM/yyyy')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={item.data_inicio}
                                  onSelect={(date) => date && updateDataInicio(item.id, date)}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="print:hidden">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="min-w-fit px-3 justify-start text-left font-normal">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {format(item.data_fim, 'dd/MM/yyyy')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={item.data_fim}
                                  onSelect={(date) => date && updateDataFim(item.id, date)}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="hidden print:table-cell">
                            {format(item.data_inicio, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="hidden print:table-cell">
                            {format(item.data_fim, 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="print:hidden">
                            <Input
                              value={item.processoSei}
                              onChange={(e) => updateProcessoSei(item.id, e.target.value)}
                              placeholder="N° Processo SEI-GDF..."
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell className="hidden print:table-cell">
                            {item.processoSei || '-'}
                          </TableCell>
                          <TableCell className="print:hidden">
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
