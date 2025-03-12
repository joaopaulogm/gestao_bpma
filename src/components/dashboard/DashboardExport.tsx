
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { DashboardData } from '@/hooks/useDashboardData';

interface DashboardExportProps {
  data: DashboardData | null;
  year: number;
  month: number | null;
}

const DashboardExport = ({ data, year, month }: DashboardExportProps) => {
  const handleExportExcel = () => {
    if (!data) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    try {
      exportToExcel(data, `dashboard-${year}-${month !== null ? month + 1 : 'todos'}`);
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
      exportToPDF(data, `dashboard-${year}-${month !== null ? month + 1 : 'todos'}`);
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
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Exportar XLSX
      </Button>
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        Exportar PDF
      </Button>
    </div>
  );
};

export default DashboardExport;
