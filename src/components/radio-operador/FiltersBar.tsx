import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioFilters } from './types';
import { cn } from '@/lib/utils';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface FiltersBarProps {
  filters: RadioFilters;
  onFiltersChange: (f: RadioFilters) => void;
  uniqueYears: string[];
  uniqueMonths: string[];
  uniqueDays: string[];
  uniqueEquipes: string[];
  uniqueDesfechos?: string[];
  onClear: () => void;
  className?: string;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFiltersChange,
  uniqueYears,
  uniqueMonths,
  uniqueDays,
  uniqueEquipes,
  uniqueDesfechos = [],
  onClear,
  className,
}) => {
  const set = (key: keyof RadioFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.year, filters.month, filters.day, filters.equipe, filters.desfecho
  ].filter(Boolean).length;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 py-2', className)}>
      <span className="text-sm font-medium text-muted-foreground mr-1">Filtros</span>
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs rounded-md">
          {activeFiltersCount}
        </Badge>
      )}

      <Select value={filters.year || '__todos__'} onValueChange={(v) => set('year', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[90px] rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Todos</SelectItem>
          {uniqueYears.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.month || '__todos__'} onValueChange={(v) => set('month', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[120px] rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Todos</SelectItem>
          {uniqueMonths.map((m) => (
            <SelectItem key={m} value={m}>{MESES[parseInt(m, 10) - 1] ?? m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.day || '__todos__'} onValueChange={(v) => set('day', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[80px] rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Todos</SelectItem>
          {uniqueDays.map((d) => (
            <SelectItem key={d} value={d}>{d.padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.equipe || '__todos__'} onValueChange={(v) => set('equipe', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[130px] rounded-md border-border bg-background text-sm">
          <SelectValue placeholder="Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Todas</SelectItem>
          {uniqueEquipes.map((eq) => (
            <SelectItem key={eq} value={eq}>{eq}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {uniqueDesfechos.length > 0 && (
        <Select value={filters.desfecho || '__todos__'} onValueChange={(v) => set('desfecho', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[140px] rounded-md border-border bg-background text-sm">
            <SelectValue placeholder="Desfecho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos</SelectItem>
            {uniqueDesfechos.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground text-xs" onClick={onClear}>
          <X className="h-3.5 w-3.5 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
};

export default FiltersBar;
