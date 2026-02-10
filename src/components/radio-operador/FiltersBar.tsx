import React from 'react';
import { X, Filter } from 'lucide-react';
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
  uniqueDestinacoes?: string[];
  uniquePrefixos?: string[];
  uniqueCmtVtrs?: string[];
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
  uniqueDestinacoes = [],
  uniquePrefixos = [],
  uniqueCmtVtrs = [],
  onClear,
  className,
}) => {
  const set = (key: keyof RadioFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.year, filters.month, filters.day, filters.equipe,
    filters.desfecho, filters.destinacao, filters.prefixo, filters.cmtVtr,
  ].filter(Boolean).length;

  return (
    <div className={cn('flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/60', className)}>
      <div className="flex items-center gap-1.5 mr-1">
        <Filter className="h-3.5 w-3.5 text-[#071d49]/60" />
        <span className="text-xs font-semibold text-[#071d49]/70 uppercase tracking-wide">Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge className="h-5 px-1.5 text-[10px] rounded-full bg-[#071d49] text-white">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      <Select value={filters.year || '__todos__'} onValueChange={(v) => set('year', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[80px] rounded-lg border-slate-200 bg-white text-xs">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Ano</SelectItem>
          {uniqueYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.month || '__todos__'} onValueChange={(v) => set('month', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[110px] rounded-lg border-slate-200 bg-white text-xs">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Mês</SelectItem>
          {uniqueMonths.map((m) => <SelectItem key={m} value={m}>{MESES[parseInt(m, 10) - 1] ?? m}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.day || '__todos__'} onValueChange={(v) => set('day', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[70px] rounded-lg border-slate-200 bg-white text-xs">
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Dia</SelectItem>
          {uniqueDays.map((d) => <SelectItem key={d} value={d}>{d.padStart(2, '0')}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.equipe || '__todos__'} onValueChange={(v) => set('equipe', v === '__todos__' ? '' : v)}>
        <SelectTrigger className="h-8 w-[110px] rounded-lg border-slate-200 bg-white text-xs">
          <SelectValue placeholder="Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__todos__">Equipe</SelectItem>
          {uniqueEquipes.map((eq) => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
        </SelectContent>
      </Select>

      {uniquePrefixos.length > 0 && (
        <Select value={filters.prefixo || '__todos__'} onValueChange={(v) => set('prefixo', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[100px] rounded-lg border-slate-200 bg-white text-xs">
            <SelectValue placeholder="Prefixo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Prefixo</SelectItem>
            {uniquePrefixos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {uniqueDesfechos.length > 0 && (
        <Select value={filters.desfecho || '__todos__'} onValueChange={(v) => set('desfecho', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[120px] rounded-lg border-slate-200 bg-white text-xs">
            <SelectValue placeholder="Desfecho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Desfecho</SelectItem>
            {uniqueDesfechos.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {uniqueDestinacoes.length > 0 && (
        <Select value={filters.destinacao || '__todos__'} onValueChange={(v) => set('destinacao', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[120px] rounded-lg border-slate-200 bg-white text-xs">
            <SelectValue placeholder="Destinação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Destinação</SelectItem>
            {uniqueDestinacoes.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {uniqueCmtVtrs.length > 0 && (
        <Select value={filters.cmtVtr || '__todos__'} onValueChange={(v) => set('cmtVtr', v === '__todos__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[120px] rounded-lg border-slate-200 bg-white text-xs">
            <SelectValue placeholder="CMT VTR" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">CMT VTR</SelectItem>
            {uniqueCmtVtrs.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onClear}>
          <X className="h-3.5 w-3.5 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
};

export default FiltersBar;
