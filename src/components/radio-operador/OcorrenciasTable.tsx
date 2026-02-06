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
import { ArrowUpDown, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { RadioRow, getDisplayVal, getRowData } from './types';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [10, 25, 50];

/** Cor do badge por desfecho (status). */
function getDesfechoVariant(desfecho: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const d = (desfecho || '').toUpperCase();
  if (d.includes('PENDENTE') || d.includes('EVADIDO') || d.includes('ÓBITO')) return 'destructive';
  if (d.includes('RESGATADO') || d.includes('SOLTURA') || d.includes('VIDA LIVRE')) return 'default';
  return 'secondary';
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
              'flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors',
              (isData || isEquipe || isCopom) && 'cursor-pointer'
            )}
            onClick={() => (isData || isEquipe || isCopom) && column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {col.header}
            {(isData || isEquipe || isCopom) && <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />}
          </button>
        ),
        cell: ({ row }) => {
          const val = getRowData(row.original, dataKey) ?? row.original.data[dataKey];
          const str = getDisplayVal(val);
          if (isDesfecho) {
            return (
              <Badge variant={getDesfechoVariant(str)} className="text-xs font-medium">
                {str}
              </Badge>
            );
          }
          return <span className="truncate max-w-[180px] block" title={str}>{str}</span>;
        },
      };
    });

    base.push({
      id: 'acoes',
      header: () => <span className="font-medium text-muted-foreground">Ações</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onView(row.original)}
            aria-label="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row.original)}
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {onRemove && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mais ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(row.original)}>Visualizar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onRemove(row.original)}>
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

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        {onRetry && (
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((c) => (
                <TableHead key={c.id} className="h-10" />
              ))}
              <TableHead className="h-10 w-[120px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.id} className="py-3">
                    <div className="h-4 w-full max-w-[100px] rounded bg-muted animate-pulse" />
                  </TableCell>
                ))}
                <TableCell className="w-[120px]" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {onAdd && (
          <Button className="mt-4" onClick={onAdd}>
            Adicionar Nova Ocorrência
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="h-10 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
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
                  className={cn(
                    'transition-colors duration-150 border-b border-border/40',
                    'hover:bg-primary/5 data-[state=selected]:bg-primary/10'
                  )}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 px-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {table.getState().pagination.pageIndex * pageSize + 1}–
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)} de {data.length}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              const n = parseInt(v, 10);
              setPageSize(n);
              table.setPageSize(n);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); table.previousPage(); }}
                className={pageIndex <= 0 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              let p = pageIndex;
              if (pageCount <= 5) p = i;
              else if (pageIndex < 2) p = i;
              else if (pageIndex >= pageCount - 2) p = pageCount - 5 + i;
              else p = pageIndex - 2 + i;
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === pageIndex}
                    onClick={(e) => { e.preventDefault(); table.setPageIndex(p); }}
                  >
                    {p + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); table.nextPage(); }}
                className={pageIndex >= pageCount - 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
