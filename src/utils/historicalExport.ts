import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EspecieResumo, DistribuicaoClasse, ResumoAnual } from '@/hooks/useHistoricalData';

interface ExportData {
  topSpecies: EspecieResumo[];
  classDistribution: DistribuicaoClasse[];
  annualSummary: ResumoAnual[];
  filters: { ano?: number | null; classe?: string | null };
}

export const exportHistoricalToExcel = (data: ExportData) => {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Top Species
  const speciesData = data.topSpecies.map(s => ({
    'Nome Popular': s.nome_popular,
    'Nome Científico': s.nome_cientifico,
    'Classe': s.classe_taxonomica,
    'Tipo de Fauna': s.tipo_de_fauna,
    'Estado de Conservação': s.estado_de_conservacao,
    'Total Resgates': s.total_resgates,
    'Ocorrências': s.num_ocorrencias,
    'Filhotes': s.total_filhotes,
    'Óbitos': s.total_obitos,
    'Solturas': s.total_solturas,
    'Feridos': s.total_feridos
  }));
  const wsSpecies = XLSX.utils.json_to_sheet(speciesData);
  XLSX.utils.book_append_sheet(wb, wsSpecies, 'Ranking Espécies');
  
  // Sheet 2: Class Distribution
  const classData = data.classDistribution.map(d => ({
    'Ano': d.ano,
    'Classe Taxonômica': d.classe_taxonomica,
    'Registros': d.registros,
    'Total Resgates': d.total_resgates,
    'Óbitos': d.total_obitos,
    'Solturas': d.total_solturas
  }));
  const wsClass = XLSX.utils.json_to_sheet(classData);
  XLSX.utils.book_append_sheet(wb, wsClass, 'Distribuição por Classe');
  
  // Sheet 3: Annual Summary
  const annualData = data.annualSummary.map(s => ({
    'Ano': s.ano,
    'Classe': s.classe_taxonomica,
    'Tipo de Fauna': s.tipo_de_fauna,
    'Espécies Únicas': s.especies_unicas,
    'Total Resgates': s.total_resgates,
    'Filhotes': s.total_filhotes,
    'Óbitos': s.total_obitos,
    'Solturas': s.total_solturas,
    'Feridos': s.total_feridos
  }));
  const wsAnnual = XLSX.utils.json_to_sheet(annualData);
  XLSX.utils.book_append_sheet(wb, wsAnnual, 'Resumo Anual');
  
  // Sheet 4: Summary totals
  const totalResgates = data.classDistribution.reduce((sum, d) => sum + d.total_resgates, 0);
  const totalOcorrencias = data.classDistribution.reduce((sum, d) => sum + d.registros, 0);
  const totalObitos = data.classDistribution.reduce((sum, d) => sum + d.total_obitos, 0);
  
  const summaryData = [
    { 'Métrica': 'Total de Animais Resgatados', 'Valor': totalResgates },
    { 'Métrica': 'Total de Ocorrências', 'Valor': totalOcorrencias },
    { 'Métrica': 'Total de Óbitos', 'Valor': totalObitos },
    { 'Métrica': 'Período', 'Valor': data.filters.ano ? data.filters.ano : '2020-2024' },
    { 'Métrica': 'Classe', 'Valor': data.filters.classe || 'Todas' }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Geral');
  
  const filterSuffix = data.filters.ano ? `_${data.filters.ano}` : '_2020-2024';
  XLSX.writeFile(wb, `Relatorio_Historico_Resgates${filterSuffix}.xlsx`);
};

export const exportHistoricalToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 100, 0);
  doc.text('Relatório Histórico de Resgates de Fauna', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const periodo = data.filters.ano ? `Ano: ${data.filters.ano}` : 'Período: 2020-2024';
  const classe = data.filters.classe ? `Classe: ${data.filters.classe}` : 'Todas as classes';
  doc.text(`${periodo} | ${classe}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumo Geral', 14, yPos);
  yPos += 8;
  
  const totalResgates = data.classDistribution.reduce((sum, d) => sum + d.total_resgates, 0);
  const totalOcorrencias = data.classDistribution.reduce((sum, d) => sum + d.registros, 0);
  const totalObitos = data.classDistribution.reduce((sum, d) => sum + d.total_obitos, 0);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Animais Resgatados', totalResgates.toLocaleString()],
      ['Total de Ocorrências', totalOcorrencias.toLocaleString()],
      ['Total de Óbitos', totalObitos.toLocaleString()]
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 100, 0] }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Top 10 Species
  doc.setFontSize(14);
  doc.text('Top 10 Espécies Mais Resgatadas', 14, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Espécie', 'Classe', 'Resgates', 'Ocorrências', 'Óbitos']],
    body: data.topSpecies.slice(0, 10).map((s, i) => [
      (i + 1).toString(),
      s.nome_popular,
      s.classe_taxonomica,
      s.total_resgates.toLocaleString(),
      s.num_ocorrencias.toString(),
      s.total_obitos.toString()
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 100, 0] },
    columnStyles: { 0: { cellWidth: 10 } }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Class Distribution
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Distribuição por Classe Taxonômica', 14, yPos);
  yPos += 8;
  
  // Aggregate by class
  const classTotals: Record<string, { resgates: number; ocorrencias: number; obitos: number }> = {};
  data.classDistribution.forEach(d => {
    if (!classTotals[d.classe_taxonomica]) {
      classTotals[d.classe_taxonomica] = { resgates: 0, ocorrencias: 0, obitos: 0 };
    }
    classTotals[d.classe_taxonomica].resgates += d.total_resgates;
    classTotals[d.classe_taxonomica].ocorrencias += d.registros;
    classTotals[d.classe_taxonomica].obitos += d.total_obitos;
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Classe', 'Total Resgates', 'Ocorrências', 'Óbitos']],
    body: Object.entries(classTotals).map(([classe, totals]) => [
      classe,
      totals.resgates.toLocaleString(),
      totals.ocorrencias.toLocaleString(),
      totals.obitos.toString()
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 100, 0] }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  const filterSuffix = data.filters.ano ? `_${data.filters.ano}` : '_2020-2024';
  doc.save(`Relatorio_Historico_Resgates${filterSuffix}.pdf`);
};
