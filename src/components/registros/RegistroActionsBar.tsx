
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegistroActionsBarProps {
  onExportPDF: () => void;
}

const RegistroActionsBar = ({ onExportPDF }: RegistroActionsBarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => navigate('/secao-operacional/registros')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Button>
      
      <Button
        variant="outline"
        className="gap-2"
        onClick={onExportPDF}
      >
        <Download className="h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
};

export default RegistroActionsBar;
