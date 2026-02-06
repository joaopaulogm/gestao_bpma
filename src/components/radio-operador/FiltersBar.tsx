import React from 'react';
import { Filter, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
    filters.year, filters.month, filters.day, filters.equipe, filters.desfecho, filters.dateFrom, filters.dateTo
  ].filter(Boolean).length;

  return (
    <div
      className={cn(
        'rounded-xl border border-border/40 bg-card/50 backdrop-blur-lg px-4 py-3 shadow-sm transition-all duration-200',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter icon and label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Filter className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <span className="text-sm font-medium text-foreground">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {/* Date range filters */}
        {filters.dateFrom !== undefined && (
          <div className="flex items-center gap-2 rounded-lg bg-background/50 px-2 py-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => set('dateFrom', e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent p-0 text-sm focus:ring-0"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => set('dateTo', e.target.value)}
              className="h-8 w-[130px] border-0 bg-transparent p-0 text-sm focus:ring-0"
            />
          </div>
        )}
        
        {/* Year filter */}
        <Select value={filters.year || '__todos__'} onValueChange={(v) => set('year', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-9 w-[100px] rounded-lg border-border/40 bg-background/60 text-sm">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos Anos</SelectItem>
            {uniqueYears.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month filter */}
        <Select value={filters.month || '__todos__'} onValueChange={(v) => set('month', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-9 w-[130px] rounded-lg border-border/40 bg-background/60 text-sm">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos Meses</SelectItem>
            {uniqueMonths.map((m) => (
              <SelectItem key={m} value={m}>{MESES[parseInt(m, 10) - 1] ?? m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Day filter */}
        <Select value={filters.day || '__todos__'} onValueChange={(v) => set('day', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-9 w-[90px] rounded-lg border-border/40 bg-background/60 text-sm">
            <SelectValue placeholder="Dia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos</SelectItem>
            {uniqueDays.map((d) => (
              <SelectItem key={d} value={d}>{d.padStart(2, '0')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team filter */}
        <Select value={filters.equipe || '__todos__'} onValueChange={(v) => set('equipe', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-9 w-[140px] rounded-lg border-border/40 bg-background/60 text-sm">
            <SelectValue placeholder="Equipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todas Equipes</SelectItem>
            {uniqueEquipes.map((eq) => (
              <SelectItem key={eq} value={eq}>{eq}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        {uniqueDesfechos.length > 0 && (
          <Select value={filters.desfecho || '__todos__'} onValueChange={(v) => set('desfecho', v === '__todos__' ? '' : v)}>
            <SelectTrigger className="h-9 w-[160px] rounded-lg border-border/40 bg-background/60 text-sm">
              <SelectValue placeholder="Desfecho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos Desfechos</SelectItem>
              {uniqueDesfechos.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear button */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 text-muted-foreground hover:text-foreground rounded-lg" 
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
