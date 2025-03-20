import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardData } from '@/types/hotspots';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const exportToExcel = (data: DashboardData, fileName: string) => {
  // Convertemos a estrutura de dados complexa em um formato plano para Excel
  const workbook = XLSX.utils.book_new();
  
  // Resumo geral
  const resumoSheet = [
    ['Métrica', 'Valor'],
    ['Total de Registros', data.totalRegistros.toString()],
    ['Total de Resgates', data.totalResgates.toString()],
    ['Total de Apreensões', data.totalApreensoes.toString()],
    ['Total de Atropelamentos', data.totalAtropelamentos.toString()],
    ['Quantidade Mínima por Ocorrência', data.quantidadePorOcorrencia.min.toString()],
    ['Quantidade Máxima por Ocorrência', data.quantidadePorOcorrencia.max.toString()],
    ['Quantidade Média por Ocorrência', data.quantidadePorOcorrencia.avg.toString()],
    ['Quantidade Mediana por Ocorrência', data.quantidadePorOcorrencia.median.toString()],
    ['Data da Exportação', data.ultimaAtualizacao]
  ];
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(resumoSheet), 
    "Resumo"
  );
  
  // Série temporal
  const timeSeriesSheet = [
    ['Data', 'Resgates', 'Apreensões', 'Total']
  ];
  
  data.timeSeriesData.forEach(item => {
    timeSeriesSheet.push([
      item.date,
      item.resgates.toString(),
      item.apreensoes.toString(),
      item.total.toString()
    ]);
  });
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(timeSeriesSheet), 
    "Evolução Temporal"
  );
  
  // Regiões administrativas
  const regiaoSheet = [
    ['Região Administrativa', 'Quantidade']
  ];
  
  data.regiaoAdministrativa.forEach(item => {
    regiaoSheet.push([item.name, item.value.toString()]);
  });
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(regiaoSheet), 
    "Regiões Administrativas"
  );
  
  // Distribuições por classe taxonômica e estado de saúde
  const distribuicoesSheet = [
    ['Categoria', 'Nome', 'Quantidade', 'Percentual']
  ];
  
  data.classeTaxonomica.forEach(item => {
    distribuicoesSheet.push(['Classe Taxonômica', item.name, item.value.toString(), '']);
  });
  
  data.estadoSaude.forEach(item => {
    distribuicoesSheet.push([
      'Estado de Saúde', 
      item.estado, 
      item.quantidade.toString(), 
      `${item.percentual.toFixed(2)}%`
    ]);
  });
  
  data.estagioVidaDistribuicao.forEach(item => {
    distribuicoesSheet.push(['Estágio de Vida', item.name, item.value.toString(), '']);
  });
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(distribuicoesSheet), 
    "Distribuições"
  );
  
  // Espécies
  const especiesSheet = [
    ['Categoria', 'Espécie', 'Quantidade']
  ];
  
  data.especiesMaisResgatadas.forEach(item => {
    especiesSheet.push(['Mais Resgatadas', item.name, item.quantidade.toString()]);
  });
  
  data.especiesMaisApreendidas.forEach(item => {
    especiesSheet.push(['Mais Apreendidas', item.name, item.quantidade.toString()]);
  });
  
  data.especiesAtropeladas.forEach(item => {
    especiesSheet.push(['Atropeladas', item.name, item.quantidade.toString()]);
  });
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(especiesSheet), 
    "Espécies"
  );
  
  // Desfechos
  const desfechosSheet = [
    ['Categoria', 'Desfecho', 'Quantidade']
  ];
  
  data.desfechoResgate.forEach(item => {
    desfechosSheet.push(['Resgate', item.name, item.value.toString()]);
  });
  
  data.desfechoApreensao.forEach(item => {
    desfechosSheet.push(['Apreensão', item.name, item.value.toString()]);
  });
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(desfechosSheet), 
    "Desfechos"
  );
  
  // Destinação
  const destinacaoSheet = [
    ['Destinação', 'Quantidade']
  ];
  
  data.destinacaoTipos.forEach(item => {
    destinacaoSheet.push([item.name, item.value.toString()]);
  });
  
  if (data.motivosEntregaCEAPA.length > 0) {
    destinacaoSheet.push(['', '']);
    destinacaoSheet.push(['Motivo Entrega CEAPA', 'Quantidade']);
    
    data.motivosEntregaCEAPA.forEach(item => {
      destinacaoSheet.push([item.name, item.value.toString()]);
    });
  }
  
  XLSX.utils.book_append_sheet(
    workbook, 
    XLSX.utils.aoa_to_sheet(destinacaoSheet), 
    "Destinação"
  );
  
  // Escrever o arquivo XLSX
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: DashboardData, fileName: string) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  
  // Função auxiliar para criar título de seção
  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Cor azul
    doc.text(title, 14, y);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, y + 1, 196, y + 1);
    doc.setTextColor(0);
    doc.setFontSize(10);
    
    return y + 10;
  };
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(23, 37, 84);
  doc.text("Dashboard de Fauna", 14, 20);
  
  // Informações de exportação
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Exportado em: ${data.ultimaAtualizacao}`, 14, 30);
  
  let yPos = 40;
  
  // 1. Resumo
  yPos = addSectionTitle("Resumo", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Registros', data.totalRegistros.toString()],
      ['Total de Resgates', data.totalResgates.toString()],
      ['Total de Apreensões', data.totalApreensoes.toString()],
      ['Total de Atropelamentos', data.totalAtropelamentos.toString()]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 2. Distribuição por classe taxonômica
  yPos = addSectionTitle("Distribuição por Classe Taxonômica", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Classe', 'Quantidade']],
    body: data.classeTaxonomica.map(item => [item.name, item.value.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 3. Regiões administrativas
  yPos = addSectionTitle("Top 10 Regiões Administrativas", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Região', 'Quantidade']],
    body: data.regiaoAdministrativa
      .slice(0, 10)
      .map(item => [item.name, item.value.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  // Nova página
  doc.addPage();
  yPos = 20;
  
  // 4. Top espécies resgatadas
  yPos = addSectionTitle("Top 10 Espécies Mais Resgatadas", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Espécie', 'Quantidade']],
    body: data.especiesMaisResgatadas
      .slice(0, 10)
      .map(item => [item.name, item.quantidade.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 5. Top espécies apreendidas
  yPos = addSectionTitle("Top 10 Espécies Mais Apreendidas", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Espécie', 'Quantidade']],
    body: data.especiesMaisApreendidas
      .slice(0, 10)
      .map(item => [item.name, item.quantidade.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 6. Atropelamentos
  yPos = addSectionTitle("Espécies Atropeladas", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Espécie', 'Quantidade']],
    body: data.especiesAtropeladas
      .slice(0, 10)
      .map(item => [item.name, item.quantidade.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  // Nova página
  doc.addPage();
  yPos = 20;
  
  // 7. Desfechos
  yPos = addSectionTitle("Desfechos de Resgate", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Desfecho', 'Quantidade']],
    body: data.desfechoResgate.map(item => [item.name, item.value.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 8. Desfechos de apreensão
  yPos = addSectionTitle("Desfechos de Apreensão", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Desfecho', 'Quantidade']],
    body: data.desfechoApreensao.map(item => [item.name, item.value.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  
  // 9. Destinação
  yPos = addSectionTitle("Destinação dos Animais", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Destinação', 'Quantidade']],
    body: data.destinacaoTipos.map(item => [item.name, item.value.toString()]),
    theme: 'grid',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  // 10. Estatísticas de quantidade
  yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
  yPos = addSectionTitle("Estatísticas de Quantidade por Ocorrência", yPos);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: [
      ['Quantidade Mínima', data.quantidadePorOcorrencia.min.toString()],
      ['Quantidade Máxima', data.quantidadePorOcorrencia.max.toString()],
      ['Quantidade Média', data.quantidadePorOcorrencia.avg.toFixed(1)],
      ['Quantidade Mediana', data.quantidadePorOcorrencia.median.toString()]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [236, 72, 153],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    }
  });
  
  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${totalPages} - Dashboard de Fauna - ${fileName}`, 14, 285);
  }
  
  // Salvar o PDF
  doc.save(`${fileName}.pdf`);
};

