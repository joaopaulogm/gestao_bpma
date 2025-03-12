
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any, fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dashboard Data");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any, fileName: string) => {
  const doc = new jsPDF();
  
  autoTable(doc, {
    head: [Object.keys(data[0])],
    body: data.map(Object.values),
  });
  
  doc.save(`${fileName}.pdf`);
};
