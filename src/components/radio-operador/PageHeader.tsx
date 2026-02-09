import React from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
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
  subtitle,
  searchValue,
  onSearchChange,
  onExport,
  onRefresh,
  refreshing = false,
  className,
}) => {
  return (
    <header className={cn('border-b border-border/60 bg-card px-6 py-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-background border-border rounded-md text-sm"
              aria-label="Buscar ocorrências"
            />
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="h-9 px-3 rounded-md"
            >
              <RefreshCw className={cn('h-4 w-4 mr-1.5', refreshing && 'animate-spin')} />
              Atualizar
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-9 px-3 rounded-md">
              <Download className="h-4 w-4 mr-1.5" />
              Exportar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
