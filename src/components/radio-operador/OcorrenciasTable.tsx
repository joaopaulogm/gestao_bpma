import React, { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Eye, Pencil, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioRow, getDisplayVal, getRowData } from './types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZES = [10, 25, 50];

/** Badge color by status */
function getDesfechoVariant(desfecho: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const d = (desfecho || '').toUpperCase();
  if (d.includes('PENDENTE') || d.includes('EVADIDO') || d.includes('ÓBITO')) return 'destructive';
  if (d.includes('RESGATADO') || d.includes('SOLTURA') || d.includes('VIDA LIVRE') || d.includes('PRISÃO')) return 'default';
  if (d.includes('NADA CONSTATADO') || d.includes('LIBERADO')) return 'secondary';
  return 'outline';
}

/** Status badge with improved semantic colors */
function StatusBadge({ status }: { status: string }) {
  const variant = getDesfechoVariant(status);
  const statusClasses = {
    default: 'bg-primary/15 text-primary border-primary/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
    secondary: 'bg-accent/40 text-accent-foreground border-accent/50',
    outline: 'bg-muted/50 text-muted-foreground border-border',
  };
  
  return (
    <Badge 
      variant={variant} 
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap border',
        statusClasses[variant]
      )}
    >
      {status}
    </Badge>
  );
}

interface OcorrenciasTableProps {
  data: RadioRow[];
  columns: { id: string; header: string; key: string }[];
  globalFilter?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onView: (row: RadioRow) => void;
  onEdit: (row: RadioRow) => void;
  onRemove?: (row: RadioRow) => void;
  onAdd?: () => void;
  emptyMessage?: string;
  isCrimes?: boolean;
}

export default function OcorrenciasTable({
  data,
  columns,
  loading = false,
  error,
  onRetry,
  onView,
  onEdit,
  onRemove,
  onAdd,
  emptyMessage = 'Nenhuma ocorrência encontrada.',
  isCrimes = false,
  globalFilter: externalFilter = '',
}: OcorrenciasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Data', desc: true }]);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const cols: ColumnDef<RadioRow>[] = useMemo(() => {
    const base: ColumnDef<RadioRow>[] = columns.map((col) => {
      const isData = col.id === 'Data';
      const isEquipe = col.id === 'Equipe';
      const isCopom = col.id === 'N° OCORRÊNCIA COPOM';
      const isDesfecho = col.id === 'Desfecho';
      const dataKey = col.key;
      
      return {
        id: col.id,
        accessorFn: (row) => {
          const v = getRowData(row, dataKey) ?? row.data[dataKey];
          if (isData && v) {
            const s = String(v).trim();
            const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
            if (m) {
              const [, d, mo, y] = m;
              const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
              return new Date(year, parseInt(mo, 10) - 1, parseInt(d, 10)).getTime();
            }
          }
          return v != null ? String(v) : '';
        },
        header: ({ column }) => (
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80 hover:text-foreground transition-colors',
              (isData || isEquipe || isCopom) && 'cursor-pointer'
            )}
            onClick={() => (isData || isEquipe || isCopom) && column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.header}
            {(isData || isEquipe || isCopom) && (
              <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const val = getRowData(row.original, dataKey) ?? row.original.data[dataKey];
          const str = getDisplayVal(val);
          if (isDesfecho) {
            return <StatusBadge status={str} />;
          }
          return (
            <span className="text-sm text-foreground/90 truncate max-w-[180px] block" title={str}>
              {str}
            </span>
          );
        },
      };
    });

    // Actions column
    base.push({
      id: 'acoes',
      header: () => <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Ações</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onView(row.original)}
            aria-label="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onEdit(row.original)}
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {onRemove && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted transition-colors" aria-label="Mais ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={() => onView(row.original)} className="rounded-lg">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original)} className="rounded-lg">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive rounded-lg focus:text-destructive" 
                  onClick={() => onRemove(row.original)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
      enableSorting: false,
    });

    return base;
  }, [columns, onView, onEdit, onRemove]);

  const table = useReactTable({
    data,
    columns: cols,
    state: { sorting, globalFilter: externalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 25 } },
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const q = String(filterValue).toLowerCase();
      const data = row.original.data;
      const str = Object.values(data).filter((v) => v != null).join(' ').toLowerCase();
      return str.includes(q);
    },
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        {onRetry && (
          <Button variant="outline" className="mt-4 rounded-xl" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-lg p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">{emptyMessage}</p>
        {onAdd && (
          <Button className="mt-4 rounded-xl" onClick={onAdd}>
            Adicionar Nova Ocorrência
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table container with glassmorphism */}
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow 
                  key={hg.id} 
                  className="bg-muted/30 hover:bg-muted/30 border-b border-border/40"
                >
                  {hg.headers.map((h) => (
                    <TableHead 
                      key={h.id} 
                      className="h-11 px-3 whitespace-nowrap"
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedRow(row.id === selectedRow ? null : row.id)}
                  className={cn(
                    'cursor-pointer transition-all duration-150 border-b border-border/20',
                    row.id === selectedRow 
                      ? 'bg-primary/10 shadow-[inset_4px_0_0_hsl(var(--primary))]' 
                      : index % 2 === 0 
                        ? 'bg-background/30 hover:bg-muted/40' 
                        : 'bg-muted/10 hover:bg-muted/40'
                  )}
                  data-state={row.id === selectedRow ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Mostrando {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, filteredRowsCount)} de {filteredRowsCount}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              const n = parseInt(v, 10);
              setPageSize(n);
              table.setPageSize(n);
            }}
          >
            <SelectTrigger className="h-8 w-[75px] rounded-lg border-border/40 bg-background/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              let p: number;
              if (pageCount <= 5) p = i;
              else if (pageIndex < 2) p = i;
              else if (pageIndex >= pageCount - 2) p = pageCount - 5 + i;
              else p = pageIndex - 2 + i;
              
              return (
                <Button
                  key={p}
                  variant={p === pageIndex ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-lg text-sm font-medium transition-all',
                    p === pageIndex && 'bg-primary text-primary-foreground shadow-md'
                  )}
                  onClick={() => table.setPageIndex(p)}
                >
                  {p + 1}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
