import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardMetrics {
  totalResgates: number;
  totalAnimais: number;
  solturas: number;
  obitos: number;
  atropelamentos: number;
  filhotes: number;
  feridos: number;
  crimesAmbientais: number;
  crimesComuns: number;
  prevencao: number;
}

interface MonthlyData {
  name: string;
  value: number;
}

interface DashboardPublicoExportProps {
  metrics: DashboardMetrics;
  monthlyData: MonthlyData[];
  classDistribution?: Array<{ name: string; value: number }>;
  regionDistribution?: Array<{ name: string; value: number }>;
  speciesRanking?: Array<{ name: string; value: number }>;
  selectedYear: number | null;
  selectedMonth: number | null;
  isLoading?: boolean;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const DashboardPublicoExport: React.FC<DashboardPublicoExportProps> = ({
  metrics,
  monthlyData,
  classDistribution = [],
  regionDistribution = [],
  speciesRanking = [],
  selectedYear,
  selectedMonth,
  isLoading
}) => {
  const getFilterLabel = () => {
    let label = selectedYear ? `${selectedYear}` : 'Todos os anos';
    if (selectedMonth) {
      label += ` - ${MONTHS[selectedMonth - 1]}`;
    }
    return label;
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Resumo Geral
      const resumoData = [
        { 'Indicador': 'Total de Resgates', 'Valor': metrics.totalResgates },
        { 'Indicador': 'Total de Animais', 'Valor': metrics.totalAnimais },
        { 'Indicador': 'Solturas', 'Valor': metrics.solturas },
        { 'Indicador': 'Óbitos', 'Valor': metrics.obitos },
        { 'Indicador': 'Atropelamentos', 'Valor': metrics.atropelamentos },
        { 'Indicador': 'Filhotes', 'Valor': metrics.filhotes },
        { 'Indicador': 'Feridos', 'Valor': metrics.feridos },
        { 'Indicador': 'Crimes Ambientais', 'Valor': metrics.crimesAmbientais },
        { 'Indicador': 'Crimes Comuns', 'Valor': metrics.crimesComuns },
        { 'Indicador': 'Atividades de Prevenção', 'Valor': metrics.prevencao },
        { 'Indicador': '', 'Valor': '' },
        { 'Indicador': 'Período', 'Valor': getFilterLabel() },
        { 'Indicador': 'Data de Exportação', 'Valor': new Date().toLocaleDateString('pt-BR') },
      ];
      const wsResumo = XLSX.utils.json_to_sheet(resumoData);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Geral');
      
      // Sheet 2: Distribuição Mensal
      if (monthlyData.length > 0) {
        const monthlySheetData = monthlyData.map(m => ({
          'Mês': m.name,
          'Resgates': m.value
        }));
        const wsMonthly = XLSX.utils.json_to_sheet(monthlySheetData);
        XLSX.utils.book_append_sheet(wb, wsMonthly, 'Distribuição Mensal');
      }
      
      // Sheet 3: Distribuição por Classe
      if (classDistribution.length > 0) {
        const classSheetData = classDistribution.map(c => ({
          'Classe Taxonômica': c.name,
          'Quantidade': c.value
        }));
        const wsClass = XLSX.utils.json_to_sheet(classSheetData);
        XLSX.utils.book_append_sheet(wb, wsClass, 'Por Classe');
      }
      
      // Sheet 4: Distribuição por Região
      if (regionDistribution.length > 0) {
        const regionSheetData = regionDistribution.map(r => ({
          'Região Administrativa': r.name,
          'Quantidade': r.value
        }));
        const wsRegion = XLSX.utils.json_to_sheet(regionSheetData);
        XLSX.utils.book_append_sheet(wb, wsRegion, 'Por Região');
      }
      
      // Sheet 5: Ranking de Espécies
      if (speciesRanking.length > 0) {
        const speciesSheetData = speciesRanking.slice(0, 20).map((s, i) => ({
          'Posição': i + 1,
          'Espécie': s.name,
          'Quantidade': s.value
        }));
        const wsSpecies = XLSX.utils.json_to_sheet(speciesSheetData);
        XLSX.utils.book_append_sheet(wb, wsSpecies, 'Top Espécies');
      }
      
      const filename = `Dashboard_BPMA_${selectedYear || 'Geral'}${selectedMonth ? `_${String(selectedMonth).padStart(2, '0')}` : ''}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Relatório Excel exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(7, 29, 73); // #071d49
      doc.text('BPMA - Dashboard Público', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório de Estatísticas - ${getFilterLabel()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(7, 29, 73);
      doc.text('Resumo Geral', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Indicador', 'Valor']],
        body: [
          ['Total de Resgates', metrics.totalResgates.toLocaleString('pt-BR')],
          ['Total de Animais', metrics.totalAnimais.toLocaleString('pt-BR')],
          ['Solturas', metrics.solturas.toLocaleString('pt-BR')],
          ['Óbitos', metrics.obitos.toLocaleString('pt-BR')],
          ['Atropelamentos', metrics.atropelamentos.toLocaleString('pt-BR')],
          ['Filhotes', metrics.filhotes.toLocaleString('pt-BR')],
          ['Feridos', metrics.feridos.toLocaleString('pt-BR')],
          ['Crimes Ambientais', metrics.crimesAmbientais.toLocaleString('pt-BR')],
          ['Crimes Comuns', metrics.crimesComuns.toLocaleString('pt-BR')],
          ['Atividades de Prevenção', metrics.prevencao.toLocaleString('pt-BR')],
        ],
        theme: 'striped',
        headStyles: { fillColor: [7, 29, 73] },
        styles: { fontSize: 10 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Monthly distribution
      if (monthlyData.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(7, 29, 73);
        doc.text('Distribuição Mensal', 14, yPos);
        yPos += 8;
        
        autoTable(doc, {
          startY: yPos,
          head: [['Mês', 'Resgates']],
          body: monthlyData.map(m => [m.name, m.value.toLocaleString('pt-BR')]),
          theme: 'striped',
          headStyles: { fillColor: [7, 29, 73] },
          styles: { fontSize: 10 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Class distribution
      if (classDistribution.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(7, 29, 73);
        doc.text('Distribuição por Classe Taxonômica', 14, yPos);
        yPos += 8;
        
        autoTable(doc, {
          startY: yPos,
          head: [['Classe', 'Quantidade', '%']],
          body: classDistribution.map(c => {
            const total = classDistribution.reduce((sum, x) => sum + x.value, 0);
            const pct = total > 0 ? ((c.value / total) * 100).toFixed(1) : '0';
            return [c.name, c.value.toLocaleString('pt-BR'), `${pct}%`];
          }),
          theme: 'striped',
          headStyles: { fillColor: [7, 29, 73] },
          styles: { fontSize: 10 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Top species
      if (speciesRanking.length > 0) {
        if (yPos > 180) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(7, 29, 73);
        doc.text('Top 10 Espécies Mais Resgatadas', 14, yPos);
        yPos += 8;
        
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Espécie', 'Resgates']],
          body: speciesRanking.slice(0, 10).map((s, i) => [
            (i + 1).toString(),
            s.name,
            s.value.toLocaleString('pt-BR')
          ]),
          theme: 'striped',
          headStyles: { fillColor: [7, 29, 73] },
          styles: { fontSize: 10 },
          columnStyles: { 0: { cellWidth: 15 } }
        });
      }
      
      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `BPMA - Batalhão de Polícia Militar Ambiental | Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      const filename = `Dashboard_BPMA_${selectedYear || 'Geral'}${selectedMonth ? `_${String(selectedMonth).padStart(2, '0')}` : ''}.pdf`;
      doc.save(filename);
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório PDF');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportExcel}
        disabled={isLoading}
        className="gap-2 bg-white/80 border-primary/30 text-primary hover:bg-primary/10"
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span> Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        disabled={isLoading}
        className="gap-2 bg-white/80 border-red-300 text-red-700 hover:bg-red-50"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span> PDF
      </Button>
    </div>
  );
};

export default DashboardPublicoExport;
