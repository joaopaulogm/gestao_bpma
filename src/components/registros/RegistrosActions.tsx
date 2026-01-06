import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RegistrosActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportXLSX: () => void;
}

const RegistrosActions = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  onExportCSV,
  onExportPDF,
  onExportXLSX,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por região, nome popular ou científico"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportXLSX}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar XLSX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default RegistrosActions;

