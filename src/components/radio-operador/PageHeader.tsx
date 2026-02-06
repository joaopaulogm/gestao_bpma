import React from 'react';
import { Search, Plus, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onAdd?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title = 'Controle de Ocorrências',
  searchValue,
  onSearchChange,
  onAdd,
  onExport,
  onRefresh,
  refreshing = false,
  className,
}) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar (Nº COPOM, local, telefone, RAP...)"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background/80 backdrop-blur-sm border-border"
            aria-label="Buscar ocorrências"
          />
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="shrink-0"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={cn('h-4 w-4 mr-1.5', refreshing && 'animate-spin')} />
            Atualizar
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="shrink-0" aria-label="Exportar CSV">
            <Download className="h-4 w-4 mr-1.5" />
            Exportar
          </Button>
        )}
        {onAdd && (
          <Button size="sm" onClick={onAdd} className="shrink-0" aria-label="Adicionar nova ocorrência">
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar Nova Ocorrência
          </Button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
