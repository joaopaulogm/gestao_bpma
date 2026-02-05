import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Radio,
  RefreshCw,
  Calendar,
  Database,
  FileSpreadsheet,
  Sparkles,
  ChevronRight,
  PawPrint,
  Scale,
  GripVertical,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RadioRow {
  id: string;
  synced_at: string;
  row_index: number;
  sheet_name: string | null;
  data: Record<string, unknown> & { _headers?: string[] };
}

const SHEET_RESGATES = 'Resgates de Fauna';
const SHEET_CRIMES = 'Crimes Ambientais';

/** Ordena linhas por data decrescente (usa label para achar coluna de data). */
function sortRowsByDateDesc(
  dataRows: RadioRow[],
  headerLabels: string[],
  headerKeys: string[]
): RadioRow[] {
  const dateCol = findDateColumnKey(headerLabels, headerKeys);
  if (!dateCol || dataRows.length === 0) return dataRows;

  const parseDate = (val: unknown): number => {
    if (val == null || val === '') return 0;
    const s = String(val).trim();
    const ddmmyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (ddmmyy) {
      const [, d, m, y] = ddmmyy;
      const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
      const date = new Date(year, parseInt(m, 10) - 1, parseInt(d, 10));
      return date.getTime();
    }
    const iso = Date.parse(s);
    return Number.isNaN(iso) ? 0 : iso;
  };

  return [...dataRows].sort((a, b) => {
    const ta = parseDate(a.data[dateCol]);
    const tb = parseDate(b.data[dateCol]);
    return tb - ta;
  });
}

/** Dado labels (ex.: "Data", "Equipe") e keys (ex.: "Coluna 1", "Coluna 2"), devolve a key da coluna de data. */
function findDateColumnKey(labels: string[], keys: string[]): string | null {
  const i = labels.findIndex(
    (label) =>
      /^data$/i.test(String(label).trim()) ||
      /^dt$/i.test(String(label).trim()) ||
      /data\s*(do)?\s*(resgate|registro|ocorrência|fato)?/i.test(String(label))
  );
  return i >= 0 && keys[i] != null ? keys[i] : null;
}

/** Dado labels e keys, devolve a key da coluna de equipe. */
function findEquipeColumnKey(labels: string[], keys: string[]): string | null {
  const i = labels.findIndex(
    (label) =>
      /^equipe$/i.test(String(label).trim()) || /equipe\s*(de)?\s*servi[cç]o?/i.test(String(label))
  );
  return i >= 0 && keys[i] != null ? keys[i] : null;
}

/** Extrai ano, mês (1-12), dia de um valor de data */
function parseDateParts(
  val: unknown
): { year: number; month: number; day: number } | null {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  const ddmmyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (ddmmyy) {
    const [, d, m, y] = ddmmyy;
    const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10);
    return {
      year,
      month: parseInt(m, 10),
      day: parseInt(d, 10),
    };
  }
  const iso = Date.parse(s);
  if (Number.isNaN(iso)) return null;
  const date = new Date(iso);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface ResizableTableProps {
  /** Chaves para ler row.data[key]; mesma ordem que headerLabels */
  headerKeys: string[];
  /** Rótulos exibidos no cabeçalho da tabela (nomes das colunas) */
  headerLabels: string[];
  dataRows: RadioRow[];
  emptyMessage: string;
  onRowClick?: (row: RadioRow) => void;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  headerKeys,
  headerLabels,
  dataRows,
  emptyMessage,
  onRowClick,
}) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    headerKeys.forEach((k) => {
      initialWidths[k] = 150;
    });
    setColumnWidths(initialWidths);
  }, [headerKeys]);

  const handleMouseDown = useCallback((e: React.MouseEvent, key: string) => {
    e.preventDefault();
    setResizing(key);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[key] || 150;
  }, [columnWidths]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(80, startWidthRef.current + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizing]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  if (headerKeys.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div
      className="w-full overflow-x-auto overflow-y-auto max-h-[70vh] rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <table className="w-full border-collapse" style={{ minWidth: headerKeys.length * 100 }}>
        <thead className="sticky top-0 z-10">
          <tr
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <th
              className="text-left px-4 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/70 whitespace-nowrap w-16 min-w-[56px] first:pl-5"
            >
              #
            </th>
            {headerLabels.map((label, i) => {
              const key = headerKeys[i];
              return (
                <th
                  key={key ?? i}
                  className="text-left px-4 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/80 whitespace-nowrap last:pr-5 relative group select-none"
                  style={{
                    width: columnWidths[key] || 150,
                    minWidth: 80,
                  }}
                >
                  <span className="flex items-center gap-1.5 pr-4">
                    <span className="truncate">{label}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-r transition-opacity hover:bg-white/10"
                    onMouseDown={(e) => handleMouseDown(e, key)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dataRows.length === 0 ? (
            <tr>
              <td
                colSpan={headerKeys.length + 1}
                className="text-center py-12 text-sm text-muted-foreground/80"
              >
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            dataRows.map((row, idx) => {
              const isSelected = selectedRow === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row) ?? setSelectedRow(isSelected ? null : row.id)}
                  className={`
                    transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'bg-primary/15 shadow-[inset_3px_0_0_hsl(var(--primary))]'
                      : idx % 2 === 0
                        ? 'bg-white/[0.02] hover:bg-white/[0.08]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08]'
                    }
                  `}
                  style={{
                    borderBottom: idx < dataRows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                  }}
                >
                  <td className="px-4 py-3.5 text-xs font-medium text-muted-foreground/90 w-16 first:pl-5">
                    <span className={isSelected ? 'text-primary font-semibold' : ''}>
                      #{row.row_index}
                    </span>
                  </td>
                  {headerKeys.map((key) => {
                    const val = row.data[key];
                    const display =
                      val != null && String(val).trim() !== '' ? String(val) : '—';
                    return (
                      <td
                        key={key}
                        className="px-4 py-3.5 text-sm text-foreground/90 last:pr-5"
                        style={{
                          width: columnWidths[key] || 150,
                          minWidth: 80,
                          maxWidth: columnWidths[key] || 150,
                        }}
                      >
                        <div className="truncate" title={display}>
                          {display}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export interface RadioFilters {
  year: string;
  month: string;
  day: string;
  equipe: string;
}

const EMPTY_FILTERS: RadioFilters = { year: '', month: '', day: '', equipe: '' };

function applyFilters(
  dataRows: RadioRow[],
  headerKeys: string[],
  headerLabels: string[],
  filters: RadioFilters
): RadioRow[] {
  if (Object.values(filters).every((v) => !v)) return dataRows;
  const dateCol = findDateColumnKey(headerLabels, headerKeys);
  const equipeCol = findEquipeColumnKey(headerLabels, headerKeys);

  return dataRows.filter((row) => {
    if (filters.year && dateCol) {
      const parts = parseDateParts(row.data[dateCol]);
      if (!parts || String(parts.year) !== filters.year) return false;
    }
    if (filters.month && dateCol) {
      const parts = parseDateParts(row.data[dateCol]);
      if (!parts || String(parts.month) !== filters.month) return false;
    }
    if (filters.day && dateCol) {
      const parts = parseDateParts(row.data[dateCol]);
      if (!parts || String(parts.day) !== filters.day) return false;
    }
    if (filters.equipe && equipeCol) {
      const val = row.data[equipeCol];
      const str = val != null ? String(val).trim() : '';
      if (str !== filters.equipe) return false;
    }
    return true;
  });
}

const RadioOperador: React.FC = () => {
  const [rows, setRows] = useState<RadioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [filters, setFilters] = useState<RadioFilters>(EMPTY_FILTERS);
  const [editingRow, setEditingRow] = useState<RadioRow | null>(null);
  const [editingHeaderKeys, setEditingHeaderKeys] = useState<string[]>([]);
  const [editingHeaderLabels, setEditingHeaderLabels] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const openEdit = useCallback((row: RadioRow, headerKeys: string[], headerLabels: string[]) => {
    setEditingRow(row);
    setEditingHeaderKeys(headerKeys);
    setEditingHeaderLabels(headerLabels);
    setEditFormData(
      headerKeys.reduce(
        (acc, k) => ({ ...acc, [k]: String(row.data[k] ?? '').trim() }),
        {} as Record<string, string>
      )
    );
  }, []);

  const handleSaveEdit = async () => {
    if (!editingRow) return;
    setSaving(true);
    try {
      const dataToSave: Record<string, unknown> = { ...editingRow.data };
      editingHeaderKeys.forEach((k) => {
        const v = editFormData[k];
        dataToSave[k] = v != null && v.trim() !== '' ? v.trim() : null;
      });
      delete (dataToSave as Record<string, unknown>)._headers;

      const { error } = await supabase
        .from('radio_operador_data')
        .update({ data: dataToSave })
        .eq('id', editingRow.id);

      if (error) throw error;
      toast.success('Registro atualizado.');
      setEditingRow(null);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio_operador_data')
        .select('id, synced_at, row_index, sheet_name, data')
        .order('sheet_name', { ascending: true })
        .order('row_index', { ascending: true });

      if (error) throw error;
      const typedData = (data || []) as RadioRow[];
      setRows(typedData);

      const firstRow = typedData[0];
      if (firstRow?.synced_at) {
        setLastSync(firstRow.synced_at);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar dados do Rádio Operador');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-radio-operador');
      if (error) throw error;
      if (data?.success) {
        const inserted = data.rows_inserted ?? 0;
        const updated = data.rows_updated ?? 0;
        const unchanged = data.rows_unchanged ?? 0;
        const deleted = data.rows_deleted ?? 0;
        
        const parts: string[] = [];
        if (inserted > 0) parts.push(`${inserted} novos`);
        if (updated > 0) parts.push(`${updated} atualizados`);
        if (deleted > 0) parts.push(`${deleted} removidos`);
        
        if (parts.length === 0) {
          toast.info(`Dados já atualizados (${unchanged} linhas sem alteração)`);
        } else {
          toast.success(`Sincronização concluída: ${parts.join(', ')}`);
        }
        fetchData();
      } else {
        toast.error(data?.error || 'Falha na sincronização');
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao sincronizar com a planilha');
    } finally {
      setSyncing(false);
    }
  };

  const bySheet = useMemo(() => {
    const map = new Map<string, RadioRow[]>();
    for (const r of rows) {
      const key = r.sheet_name && r.sheet_name.trim() !== '' ? r.sheet_name : SHEET_RESGATES;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [rows]);

  const resgatesRows = bySheet.get(SHEET_RESGATES) ?? [];
  const crimesRows = bySheet.get(SHEET_CRIMES) ?? [];

  // Formato novo: row_index 1 tem _headers (nomes das colunas). Formato antigo: row_index 0 tem _headers (Coluna 1, 2...), row_index 1 tem os nomes reais nos VALORES.
  const resgatesRow0 = resgatesRows.find((r) => r.row_index === 0);
  const resgatesRow1 = resgatesRows.find((r) => r.row_index === 1);
  const crimesRow0 = crimesRows.find((r) => r.row_index === 0);
  const crimesRow1 = crimesRows.find((r) => r.row_index === 1);

  const resgatesDataRowsRaw = useMemo(() => resgatesRows.filter((r) => r.row_index > 1), [resgatesRows]);
  const crimesDataRowsRaw = useMemo(() => crimesRows.filter((r) => r.row_index > 1), [crimesRows]);

  const { resgatesHeaderKeys, resgatesHeaderLabels } = useMemo(() => {
    const row1Headers = (resgatesRow1?.data?._headers as string[]) || [];
    if (row1Headers.length > 0) {
      return { resgatesHeaderKeys: row1Headers, resgatesHeaderLabels: row1Headers };
    }
    const row0Headers: string[] = (resgatesRow0?.data?._headers as string[]) || [];
    if (row0Headers.length > 0 && resgatesRow1?.data) {
      const labels = row0Headers.map((k) => {
        const v = resgatesRow1.data[k];
        return v != null && String(v).trim() !== '' ? String(v).trim() : k;
      });
      return { resgatesHeaderKeys: row0Headers, resgatesHeaderLabels: labels };
    }
    const set = new Set<string>();
    resgatesDataRowsRaw.forEach((r) => {
      Object.keys(r.data || {}).filter((k) => k !== '_headers').forEach((k) => set.add(k));
    });
    const keys = [...set];
    return { resgatesHeaderKeys: keys, resgatesHeaderLabels: keys };
  }, [resgatesRow0, resgatesRow1, resgatesDataRowsRaw]);

  const { crimesHeaderKeys, crimesHeaderLabels } = useMemo(() => {
    const row1Headers = (crimesRow1?.data?._headers as string[]) || [];
    if (row1Headers.length > 0) {
      return { crimesHeaderKeys: row1Headers, crimesHeaderLabels: row1Headers };
    }
    const row0Headers: string[] = (crimesRow0?.data?._headers as string[]) || [];
    if (row0Headers.length > 0 && crimesRow1?.data) {
      const labels = row0Headers.map((k) => {
        const v = crimesRow1.data[k];
        return v != null && String(v).trim() !== '' ? String(v).trim() : k;
      });
      return { crimesHeaderKeys: row0Headers, crimesHeaderLabels: labels };
    }
    const set = new Set<string>();
    crimesDataRowsRaw.forEach((r) => {
      Object.keys(r.data || {}).filter((k) => k !== '_headers').forEach((k) => set.add(k));
    });
    const keys = [...set];
    return { crimesHeaderKeys: keys, crimesHeaderLabels: keys };
  }, [crimesRow0, crimesRow1, crimesDataRowsRaw]);

  const resgatesDataRows = useMemo(
    () => sortRowsByDateDesc(resgatesDataRowsRaw, resgatesHeaderLabels, resgatesHeaderKeys),
    [resgatesDataRowsRaw, resgatesHeaderLabels, resgatesHeaderKeys]
  );
  const crimesDataRows = useMemo(
    () => sortRowsByDateDesc(crimesDataRowsRaw, crimesHeaderLabels, crimesHeaderKeys),
    [crimesDataRowsRaw, crimesHeaderLabels, crimesHeaderKeys]
  );

  const resgatesFiltered = useMemo(
    () => applyFilters(resgatesDataRows, resgatesHeaderKeys, resgatesHeaderLabels, filters),
    [resgatesDataRows, resgatesHeaderKeys, resgatesHeaderLabels, filters]
  );
  const crimesFiltered = useMemo(
    () => applyFilters(crimesDataRows, crimesHeaderKeys, crimesHeaderLabels, filters),
    [crimesDataRows, crimesHeaderKeys, crimesHeaderLabels, filters]
  );

  const { uniqueYears, uniqueMonths, uniqueDays, uniqueEquipes } = useMemo(() => {
    const allRows = [...resgatesDataRows, ...crimesDataRows];
    const resgatesDateCol = findDateColumnKey(resgatesHeaderLabels, resgatesHeaderKeys);
    const crimesDateCol = findDateColumnKey(crimesHeaderLabels, crimesHeaderKeys);
    const resgatesEquipeCol = findEquipeColumnKey(resgatesHeaderLabels, resgatesHeaderKeys);
    const crimesEquipeCol = findEquipeColumnKey(crimesHeaderLabels, crimesHeaderKeys);
    const years = new Set<number>();
    const months = new Set<number>();
    const days = new Set<number>();
    const equipes = new Set<string>();
    for (const row of allRows) {
      const dateCol = row.sheet_name === SHEET_CRIMES ? crimesDateCol : resgatesDateCol;
      const equipeCol = row.sheet_name === SHEET_CRIMES ? crimesEquipeCol : resgatesEquipeCol;
      if (dateCol && row.data[dateCol]) {
        const parts = parseDateParts(row.data[dateCol]);
        if (parts) {
          years.add(parts.year);
          months.add(parts.month);
          days.add(parts.day);
        }
      }
      if (equipeCol && row.data[equipeCol]) {
        const v = row.data[equipeCol];
        if (v != null && String(v).trim()) equipes.add(String(v).trim());
      }
    }
    return {
      uniqueYears: [...years].sort((a, b) => b - a).map(String),
      uniqueMonths: [...months].sort((a, b) => a - b).map(String),
      uniqueDays: [...days].sort((a, b) => a - b).map(String),
      uniqueEquipes: [...equipes].sort((a, b) => a.localeCompare(b)),
    };
  }, [resgatesDataRows, crimesDataRows, resgatesHeaderLabels, resgatesHeaderKeys, crimesHeaderLabels, crimesHeaderKeys]);

  const hasData = resgatesHeaderKeys.length > 0 || crimesHeaderKeys.length > 0 || resgatesDataRows.length > 0 || crimesDataRows.length > 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header Card */}
      <Card className="overflow-hidden relative shadow-lg rounded-2xl bg-card border-border">
        <CardHeader className="relative z-10 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="p-4 rounded-2xl shadow-lg border border-border"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
                }}
              >
                <Radio className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2 flex-wrap">
                  Rádio Operador
                  <Badge variant="secondary" className="font-normal text-xs">
                    <Database className="h-3.5 w-3.5 mr-1 inline" />
                    Planilha sincronizada
                  </Badge>
                </CardTitle>
                {lastSync && (
                  <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary/80" />
                    Última sincronização:{' '}
                    {format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing}
              size="lg"
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Atualizar agora'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Data Card with Tabs */}
      <Card className="overflow-hidden relative shadow-lg rounded-2xl bg-card border-border">
        <CardContent className="p-0 relative z-10">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Carregando dados da planilha...</p>
            </div>
          ) : !hasData ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-border bg-muted/50">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">Nenhum dado sincronizado ainda</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Clique em &quot;Atualizar agora&quot; para importar as abas Resgates de Fauna e Crimes Ambientais.
              </p>
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="mt-6"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Importar planilha
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={SHEET_RESGATES} className="w-full">
              <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-3">
                <TabsList className="h-10">
                  <TabsTrigger
                    value={SHEET_RESGATES}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
                  >
                    <PawPrint className="h-4 w-4" />
                    Resgates de Fauna
                    <Badge variant="secondary" className="ml-1 text-xs font-normal">
                      {resgatesDataRows.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value={SHEET_CRIMES}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
                  >
                    <Scale className="h-4 w-4" />
                    Crimes Ambientais
                    <Badge variant="secondary" className="ml-1 text-xs font-normal">
                      {crimesDataRows.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={SHEET_RESGATES} className="mt-0 p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Filtros</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Ano</Label>
                        <Select
                          value={filters.year || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, year: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[100px]">
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
                        <Select
                          value={filters.month || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, month: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__todos__">Todos</SelectItem>
                            {uniqueMonths.map((m) => (
                              <SelectItem key={m} value={m}>
                                {MESES[parseInt(m, 10) - 1] ?? m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Dia</Label>
                        <Select
                          value={filters.day || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, day: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[80px]">
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
                        <Select
                          value={filters.equipe || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, equipe: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[180px] min-w-0">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => setFilters(EMPTY_FILTERS)}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  </div>
                <ResizableTable
                  headerKeys={resgatesHeaderKeys}
                  headerLabels={resgatesHeaderLabels}
                  dataRows={resgatesFiltered}
                  emptyMessage="Nenhuma coluna na aba Resgates de Fauna. Sincronize a planilha."
                  onRowClick={(row) => openEdit(row, resgatesHeaderKeys, resgatesHeaderLabels)}
                />
                </div>
              </TabsContent>

              <TabsContent value={SHEET_CRIMES} className="mt-0 p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Filtros</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Ano</Label>
                        <Select
                          value={filters.year || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, year: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[100px]">
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
                        <Select
                          value={filters.month || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, month: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__todos__">Todos</SelectItem>
                            {uniqueMonths.map((m) => (
                              <SelectItem key={m} value={m}>
                                {MESES[parseInt(m, 10) - 1] ?? m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Dia</Label>
                        <Select
                          value={filters.day || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, day: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[80px]">
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
                        <Select
                          value={filters.equipe || '__todos__'}
                          onValueChange={(v) => setFilters((f) => ({ ...f, equipe: v === '__todos__' ? '' : v }))}
                        >
                          <SelectTrigger className="w-[180px] min-w-0">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => setFilters(EMPTY_FILTERS)}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  </div>
                <ResizableTable
                  headerKeys={crimesHeaderKeys}
                  headerLabels={crimesHeaderLabels}
                  dataRows={crimesFiltered}
                  emptyMessage="Nenhuma coluna na aba Crimes Ambientais. Sincronize a planilha."
                  onRowClick={(row) => openEdit(row, crimesHeaderKeys, crimesHeaderLabels)}
                />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar ocorrência</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto space-y-3 py-2 pr-2 -mr-2">
            {editingHeaderKeys.map((key, i) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {editingHeaderLabels[i] ?? key}
                </Label>
                <Input
                  value={editFormData[key] ?? ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingRow(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RadioOperador;
