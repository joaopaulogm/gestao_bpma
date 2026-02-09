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
import { ArrowUpDown, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
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

function getDesfechoVariant(desfecho: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const d = (desfecho || '').toUpperCase();
  if (d.includes('PENDENTE') || d.includes('EVADIDO') || d.includes('ÓBITO')) return 'destructive';
  if (d.includes('RESGATADO') || d.includes('SOLTURA') || d.includes('VIDA LIVRE') || d.includes('PRISÃO')) return 'default';
  if (d.includes('NADA CONSTATADO') || d.includes('LIBERADO')) return 'secondary';
  return 'outline';
}

function StatusBadge({ status }: { status: string }) {
  const variant = getDesfechoVariant(status);
  const colorMap = {
    default: 'bg-primary/15 text-primary border-primary/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
    secondary: 'bg-accent/40 text-accent-foreground border-accent/50',
    outline: 'bg-muted/50 text-muted-foreground border-border',
  };
  return (
    <Badge variant={variant} className={cn('text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap border', colorMap[variant])}>
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
  emptyMessage = 'Nenhuma ocorrência encontrada.',
  globalFilter: externalFilter = '',
}: OcorrenciasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Data', desc: true }]);
  const [pageSize, setPageSize] = useState(25);

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
              'flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap',
              (isData || isEquipe || isCopom) && 'cursor-pointer'
            )}
            onClick={() => (isData || isEquipe || isCopom) && column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.header}
            {(isData || isEquipe || isCopom) && <ArrowUpDown className="h-3 w-3 opacity-40" />}
          </button>
        ),
        cell: ({ row }) => {
          const val = getRowData(row.original, dataKey) ?? row.original.data[dataKey];
          const str = getDisplayVal(val);
          if (isDesfecho) return <StatusBadge status={str} />;
          return <span className="text-sm text-foreground truncate max-w-[180px] block" title={str}>{str}</span>;
        },
      };
    });

    base.push({
      id: 'acoes',
      header: () => <span className="text-xs font-semibold text-muted-foreground">AÇÕES</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={() => onView(row.original)} aria-label="Visualizar">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={() => onEdit(row.original)} aria-label="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      enableSorting: false,
    });

    return base;
  }, [columns, onView, onEdit]);

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
      const str = Object.values(row.original.data).filter((v) => v != null).join(' ').toLowerCase();
      return str.includes(q);
    },
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;

  if (error) {
    return (
      <div className="border border-destructive/30 bg-destructive/5 p-8 text-center rounded-md">
        <p className="text-destructive font-medium">{error}</p>
        {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Tentar novamente</Button>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-b border-border hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="h-10 px-3 bg-muted/40">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2.5 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, filteredRowsCount)} de {filteredRowsCount}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { const n = parseInt(v, 10); setPageSize(n); table.setPageSize(n); }}
          >
            <SelectTrigger className="h-7 w-[65px] rounded-md border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span>/ pág</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-md" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
                className={cn('h-7 w-7 rounded-md text-xs', p === pageIndex && 'bg-primary text-primary-foreground')}
                onClick={() => table.setPageIndex(p)}
              >
                {p + 1}
              </Button>
            );
          })}
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-md" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
