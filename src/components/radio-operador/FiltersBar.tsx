import React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
  uniqueGrupamentos?: string[];
  uniqueLocais?: string[];
  onClear: () => void;
  className?: string;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  filters, onFiltersChange,
  uniqueYears, uniqueMonths, uniqueDays, uniqueEquipes,
  uniqueDesfechos = [], uniqueDestinacoes = [], uniquePrefixos = [],
  uniqueCmtVtrs = [], uniqueGrupamentos = [], uniqueLocais = [],
  onClear, className,
}) => {
  const set = (key: keyof RadioFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.year, filters.month, filters.day, filters.equipe,
    filters.desfecho, filters.destinacao, filters.prefixo, filters.cmtVtr,
    filters.grupamento, filters.local,
  ].filter(Boolean).length;

  const renderSelect = (key: keyof RadioFilters, label: string, options: string[], width = 'w-[110px]', formatter?: (v: string) => string) => (
    <Select value={(filters[key] as string) || '__todos__'} onValueChange={(v) => set(key, v === '__todos__' ? '' : v)}>
      <SelectTrigger className={cn('h-8 rounded-lg border-slate-200 bg-white text-xs', width)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__todos__">{label}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{formatter ? formatter(o) : o}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/60', className)}>
      <div className="flex items-center gap-1.5 mr-1">
        <Filter className="h-3.5 w-3.5 text-[#071d49]/60" />
        <span className="text-xs font-semibold text-[#071d49]/70 uppercase tracking-wide">Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge className="h-5 px-1.5 text-[10px] rounded-full bg-[#071d49] text-white">{activeFiltersCount}</Badge>
        )}
      </div>

      {renderSelect('year', 'Ano', uniqueYears, 'w-[80px]')}
      {renderSelect('month', 'Mês', uniqueMonths, 'w-[110px]', (m) => MESES[parseInt(m, 10) - 1] ?? m)}
      {renderSelect('day', 'Dia', uniqueDays, 'w-[70px]', (d) => d.padStart(2, '0'))}
      {renderSelect('equipe', 'Equipe', uniqueEquipes)}
      {uniquePrefixos.length > 0 && renderSelect('prefixo', 'Prefixo', uniquePrefixos, 'w-[100px]')}
      {uniqueGrupamentos.length > 0 && renderSelect('grupamento', 'Grupamento', uniqueGrupamentos, 'w-[130px]')}
      {uniqueDesfechos.length > 0 && renderSelect('desfecho', 'Desfecho', uniqueDesfechos, 'w-[140px]')}
      {uniqueDestinacoes.length > 0 && renderSelect('destinacao', 'Destinação', uniqueDestinacoes, 'w-[140px]')}
      {uniqueCmtVtrs.length > 0 && renderSelect('cmtVtr', 'CMT VTR', uniqueCmtVtrs, 'w-[120px]')}
      {uniqueLocais.length > 0 && renderSelect('local', 'Local (RA)', uniqueLocais, 'w-[150px]')}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={onClear}>
          <X className="h-3.5 w-3.5 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
};

export default FiltersBar;
