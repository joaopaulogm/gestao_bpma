import React from 'react';
import { Filter } from 'lucide-react';
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
  const hasAny = Boolean(
    filters.year || filters.month || filters.day || filters.equipe || filters.desfecho || filters.dateFrom || filters.dateTo
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm px-3 py-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-muted-foreground">Filtros</span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        {filters.dateFrom !== undefined && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => set('dateFrom', e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>
        )}
        {filters.dateTo !== undefined && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => set('dateTo', e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Ano</Label>
          <Select value={filters.year || '__todos__'} onValueChange={(v) => set('year', v === '__todos__' ? '' : v)}>
            <SelectTrigger className="h-9 w-[100px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {uniqueYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Mês</Label>
          <Select value={filters.month || '__todos__'} onValueChange={(v) => set('month', v === '__todos__' ? '' : v)}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {uniqueMonths.map((m) => (
                <SelectItem key={m} value={m}>{MESES[parseInt(m, 10) - 1] ?? m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dia</Label>
          <Select value={filters.day || '__todos__'} onValueChange={(v) => set('day', v === '__todos__' ? '' : v)}>
            <SelectTrigger className="h-9 w-[80px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {uniqueDays.map((d) => (
                <SelectItem key={d} value={d}>{d.padStart(2, '0')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Equipe</Label>
          <Select value={filters.equipe || '__todos__'} onValueChange={(v) => set('equipe', v === '__todos__' ? '' : v)}>
            <SelectTrigger className="h-9 w-[140px] min-w-0">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todas</SelectItem>
              {uniqueEquipes.map((eq) => (
                <SelectItem key={eq} value={eq}>{eq}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {uniqueDesfechos.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Desfecho</Label>
            <Select value={filters.desfecho || '__todos__'} onValueChange={(v) => set('desfecho', v === '__todos__' ? '' : v)}>
              <SelectTrigger className="h-9 w-[160px] min-w-0">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todos__">Todos</SelectItem>
                {uniqueDesfechos.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {hasAny && (
          <Button variant="ghost" size="sm" className="text-muted-foreground h-9" onClick={onClear}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
