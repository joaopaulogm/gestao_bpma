import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, Download } from 'lucide-react';

interface RegistrosActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onExportCSV: () => void;
}

const RegistrosActions: React.FC<RegistrosActionsProps> = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  onExportCSV,
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
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onExportCSV}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
};

export default RegistrosActions;

