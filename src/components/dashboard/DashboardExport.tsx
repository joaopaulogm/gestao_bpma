import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { DashboardData } from '@/types/hotspots';

interface DashboardExportProps {
  data: DashboardData | null;
  year: number;
  month: number | null;
  isLoading: boolean;
}

const DashboardExport = ({ data, year, month, isLoading }: DashboardExportProps) => {
  const handleExportExcel = () => {
    if (!data) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    try {
      const fileName = `dashboard-${year}${month !== null ? `-${String(month + 1).padStart(2, '0')}` : ''}`;
      exportToExcel(data, fileName);
      toast.success("Dados exportados com sucesso para XLSX");
    } catch (err) {
      console.error("Erro ao exportar para Excel:", err);
      toast.error("Erro ao exportar dados para XLSX");
    }
  };

  const handleExportPDF = () => {
    if (!data) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    try {
      const fileName = `dashboard-${year}${month !== null ? `-${String(month + 1).padStart(2, '0')}` : ''}`;
      exportToPDF(data, fileName);
      toast.success("Dados exportados com sucesso para PDF");
    } catch (err) {
      console.error("Erro ao exportar para PDF:", err);
      toast.error("Erro ao exportar dados para PDF");
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleExportExcel}
        disabled={isLoading || !data}
        className="flex items-center gap-2 bg-white border-primary/30 text-primary hover:bg-primary/10"
      >
        <FileSpreadsheet size={16} />
        Exportar XLSX
      </Button>
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        disabled={isLoading || !data}
        className="flex items-center gap-2 bg-white border-red-200 text-red-700 hover:bg-red-50"
      >
        <FileText size={16} />
        Exportar PDF
      </Button>
    </div>
  );
};

export default DashboardExport;
