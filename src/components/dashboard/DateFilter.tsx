
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateFilterProps {
  year: number;
  month: number | null;
  onFilterChange: (year: number, month: number | null) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ year, month, onFilterChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="flex gap-4">
      <Select
        value={year.toString()}
        onValueChange={(value) => onFilterChange(parseInt(value), month)}
      >
        <SelectTrigger className="w-[160px]">
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

      <Select
        value={month !== null ? month.toString() : "all"}
        onValueChange={(value) => onFilterChange(year, value === "all" ? null : parseInt(value))}
      >
        <SelectTrigger className="w-[160px]">
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
  );
};

export default DateFilter;
