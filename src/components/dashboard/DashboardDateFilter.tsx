import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DashboardDateFilterProps {
  year: number;
  month: number | null;
  onFilterChange: (year: number, month: number | null) => void;
}

const DashboardDateFilter = ({ 
  year, 
  month, 
  onFilterChange 
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-background border-border"
        >
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">
            {year}
            {month !== null ? 
              ` - ${months[month]}` : 
              ' - Todo o ano'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ano</h4>
            <Select
              value={year.toString()}
              onValueChange={(value) => onFilterChange(parseInt(value), month)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Mês</h4>
            <Select
              value={month !== null ? month.toString() : "all"}
              onValueChange={(value) => onFilterChange(
                year, 
                value === "all" ? null : parseInt(value)
              )}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {months.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onFilterChange(new Date().getFullYear(), null)}
            >
              Limpar
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                const now = new Date();
                onFilterChange(now.getFullYear(), now.getMonth());
              }}
            >
              Mês atual
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardDateFilter;
