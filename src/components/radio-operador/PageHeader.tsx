import React from 'react';
import { Search, Plus, Download, RefreshCw, Radio } from 'lucide-react';
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
  onAdd,
  onExport,
  onRefresh,
  refreshing = false,
  className,
}) => {
  return (
    <header
      className={cn(
        'rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-lg p-4 md:p-6',
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title section */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Buscar (COPOM, local, telefone, RAP...)"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 bg-background/60 backdrop-blur-sm border-border/50 rounded-xl focus:ring-2 focus:ring-primary/30 transition-all"
              aria-label="Buscar ocorrências"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="h-10 px-4 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm hover:bg-primary/10 transition-all duration-200"
                aria-label="Atualizar dados"
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                Atualizar
              </Button>
            )}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport} 
                className="h-10 px-4 rounded-xl border-border/50 bg-background/60 backdrop-blur-sm hover:bg-primary/10 transition-all duration-200"
                aria-label="Exportar CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            {onAdd && (
              <Button 
                size="sm" 
                onClick={onAdd} 
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200"
                aria-label="Adicionar nova ocorrência"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nova Ocorrência</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
