import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardData } from '@/hooks/useDashboardData';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const exportToExcel = (data: DashboardData, fileName: string) => {
  // Convert complex nested data structure to a flattened format for Excel
  const flattenedData = flattenDataForExport(data);
  
  const ws = XLSX.utils.json_to_sheet(flattenedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dashboard Data");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: DashboardData, fileName: string) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Add title
  doc.setFontSize(16);
  doc.text("Dashboard de Análise de Fauna", 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add summary data
  doc.setFontSize(12);
  doc.text("Resumo", 14, 40);
  
  autoTable(doc, {
    startY: 45,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Resgates', data.totalResgates.toString()],
      ['Total de Apreensões', data.totalApreensoes.toString()],
      ['Total de Atropelamentos', data.atropelamentos.reduce((acc: number, curr: any) => acc + curr.quantidade, 0).toString()]
    ],
  });
  
  // Add distribution by class
  let yPos = doc.lastAutoTable?.finalY || 45;
  yPos += 15;
  
  doc.text("Distribuição por Classe", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Classe', 'Quantidade']],
    body: data.distribuicaoPorClasse.map((item: any) => [item.name, item.value.toString()]),
  });
  
  // Add destinations
  yPos = doc.lastAutoTable?.finalY || yPos;
  yPos += 15;
  
  doc.text("Destinos", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Destino', 'Quantidade']],
    body: data.destinos.map((item: any) => [item.name, item.value.toString()]),
  });
  
  // Add outcomes
  yPos = doc.lastAutoTable?.finalY || yPos;
  yPos += 15;
  
  doc.text("Desfechos de Apreensão", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Desfecho', 'Quantidade']],
    body: data.desfechos.map((item: any) => [item.name, item.value.toString()]),
  });
  
  // Add most rescued species (add new page if needed)
  if ((doc.lastAutoTable?.finalY || 0) > 230) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 15;
  }
  
  doc.text("Espécies Mais Resgatadas", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Espécie', 'Quantidade']],
    body: data.especiesMaisResgatadas.map((item: any) => [item.name, item.quantidade.toString()]),
  });
  
  // Add most seized species
  yPos = doc.lastAutoTable?.finalY || yPos;
  yPos += 15;
  
  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.text("Espécies Mais Apreendidas", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Espécie', 'Quantidade']],
    body: data.especiesMaisApreendidas.map((item: any) => [item.name, item.quantidade.toString()]),
  });
  
  // Add roadkill data
  yPos = doc.lastAutoTable?.finalY || yPos;
  yPos += 15;
  
  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.text("Animais Atropelados por Espécie", 14, yPos);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['Espécie', 'Quantidade']],
    body: data.atropelamentos.map((item: any) => [item.name, item.quantidade.toString()]),
  });
  
  // Add R analysis data if available
  if (data.analysis && data.analysis.r_data) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Análise Estatística (R)", 14, 20);
    
    // Add R analysis tables
    // This would depend on the specific structure of your R analysis data
    // You would need to customize this based on what your R API returns
  }
  
  doc.save(`${fileName}.pdf`);
};

// Helper function to flatten nested data for Excel export
function flattenDataForExport(data: any) {
  const result = [];
  
  // Add summary data
  result.push({
    categoria: 'Resumo',
    metrica: 'Total de Resgates',
    valor: data.totalResgates
  });
  
  result.push({
    categoria: 'Resumo',
    metrica: 'Total de Apreensões',
    valor: data.totalApreensoes
  });
  
  result.push({
    categoria: 'Resumo',
    metrica: 'Total de Atropelamentos',
    valor: data.atropelamentos.reduce((acc: number, curr: any) => acc + curr.quantidade, 0)
  });
  
  // Add distribution by class
  data.distribuicaoPorClasse.forEach((item: any) => {
    result.push({
      categoria: 'Distribuição por Classe',
      metrica: item.name,
      valor: item.value
    });
  });
  
  // Add destinations
  data.destinos.forEach((item: any) => {
    result.push({
      categoria: 'Destinos',
      metrica: item.name,
      valor: item.value
    });
  });
  
  // Add outcomes
  data.desfechos.forEach((item: any) => {
    result.push({
      categoria: 'Desfechos de Apreensão',
      metrica: item.name,
      valor: item.value
    });
  });
  
  // Add most rescued species
  data.especiesMaisResgatadas.forEach((item: any) => {
    result.push({
      categoria: 'Espécies Mais Resgatadas',
      metrica: item.name,
      valor: item.quantidade
    });
  });
  
  // Add most seized species
  data.especiesMaisApreendidas.forEach((item: any) => {
    result.push({
      categoria: 'Espécies Mais Apreendidas',
      metrica: item.name,
      valor: item.quantidade
    });
  });
  
  // Add roadkill data
  data.atropelamentos.forEach((item: any) => {
    result.push({
      categoria: 'Animais Atropelados por Espécie',
      metrica: item.name,
      valor: item.quantidade
    });
  });
  
  // Add R analysis data if available
  if (data.analysis && data.analysis.r_data) {
    // Add R specific analysis data
    // This would depend on the structure of your R analysis
  }
  
  return result;
}
