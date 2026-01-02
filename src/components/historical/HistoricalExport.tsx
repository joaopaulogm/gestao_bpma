import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportHistoricalToExcel, exportHistoricalToPDF } from '@/utils/historicalExport';
import { EspecieResumo, DistribuicaoClasse, ResumoAnual, HistoricalFilters } from '@/hooks/useHistoricalData';

interface HistoricalExportProps {
  topSpecies: EspecieResumo[];
  classDistribution: DistribuicaoClasse[];
  annualSummary: ResumoAnual[];
  filters: HistoricalFilters;
  isLoading?: boolean;
}

export const HistoricalExport: React.FC<HistoricalExportProps> = ({
  topSpecies,
  classDistribution,
  annualSummary,
  filters,
  isLoading
}) => {
  const handleExportExcel = () => {
    try {
      exportHistoricalToExcel({ topSpecies, classDistribution, annualSummary, filters });
      toast.success('Relatório Excel exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      exportHistoricalToPDF({ topSpecies, classDistribution, annualSummary, filters });
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar relatório PDF');
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportExcel}
        disabled={isLoading || !classDistribution.length}
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        disabled={isLoading || !classDistribution.length}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
};
