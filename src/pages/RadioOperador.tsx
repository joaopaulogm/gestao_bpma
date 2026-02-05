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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

/** Detecta coluna de data por nome e ordena linhas por data decrescente */
function sortRowsByDateDesc(
  dataRows: RadioRow[],
  headers: string[]
): RadioRow[] {
  const dateCol = headers.find(
    (h) =>
      /^data$/i.test(String(h).trim()) ||
      /^dt$/i.test(String(h).trim()) ||
      /data\s*(do)?\s*(resgate|registro|ocorrência|fato)?/i.test(String(h))
  );
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

interface ResizableTableProps {
  headers: string[];
  dataRows: RadioRow[];
  headerColor: string;
  emptyMessage: string;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  headers,
  dataRows,
  headerColor,
  emptyMessage,
}) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Initialize column widths
  useEffect(() => {
    const initialWidths: Record<string, number> = {};
    headers.forEach((h) => {
      initialWidths[h] = 150;
    });
    setColumnWidths(initialWidths);
  }, [headers]);

  const handleMouseDown = useCallback((e: React.MouseEvent, header: string) => {
    e.preventDefault();
    setResizing(header);
    startXRef.current = e.clientX;
    startWidthRef.current = columnWidths[header] || 150;
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

  if (headers.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-border/30">
      <table className="w-full border-collapse" style={{ minWidth: headers.length * 100 }}>
        <thead className="sticky top-0 z-10">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-3 py-3 text-xs font-bold text-white whitespace-nowrap first:pl-4 last:pr-4 border-b border-r border-white/20 last:border-r-0 relative group select-none"
                style={{
                  background: headerColor,
                  width: columnWidths[h] || 150,
                  minWidth: 80,
                }}
              >
                <span className="flex items-center gap-1 pr-4">
                  <ChevronRight className="h-3.5 w-3.5 text-white/90 flex-shrink-0" />
                  <span className="truncate">{h}</span>
                </span>
                {/* Resize handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity"
                  onMouseDown={(e) => handleMouseDown(e, h)}
                >
                  <GripVertical className="h-4 w-4 text-white/70" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            dataRows.map((row, idx) => (
              <tr
                key={row.id}
                className={`
                  border-b border-border/30
                  hover:bg-accent/50
                  transition-colors
                  ${idx % 2 === 0 ? 'bg-background/50' : 'bg-muted/30'}
                `}
              >
                {headers.map((header) => {
                  const val = row.data[header];
                  const display =
                    val != null && String(val).trim() !== '' ? String(val) : '—';
                  return (
                    <td
                      key={header}
                      className="px-3 py-2 text-xs text-foreground first:pl-4 last:pr-4 border-r border-border/20 last:border-r-0"
                      style={{
                        width: columnWidths[header] || 150,
                        minWidth: 80,
                        maxWidth: columnWidths[header] || 150,
                      }}
                    >
                      <div className="truncate" title={display}>
                        {display}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const RadioOperador: React.FC = () => {
  const [rows, setRows] = useState<RadioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

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

  const resgatesHeaderRow = resgatesRows.find((r) => r.row_index === 0);
  const crimesHeaderRow = crimesRows.find((r) => r.row_index === 0);
  const resgatesHeadersBase: string[] = (resgatesHeaderRow?.data?._headers as string[]) || [];
  const crimesHeadersBase: string[] = (crimesHeaderRow?.data?._headers as string[]) || [];

  const resgatesDataRowsRaw = useMemo(() => resgatesRows.filter((r) => r.row_index > 0), [resgatesRows]);
  const crimesDataRowsRaw = useMemo(() => crimesRows.filter((r) => r.row_index > 0), [crimesRows]);

  const resgatesHeaders = useMemo(() => {
    const set = new Set<string>(resgatesHeadersBase);
    resgatesDataRowsRaw.forEach((r) => {
      Object.keys(r.data || {}).filter((k) => k !== '_headers').forEach((k) => set.add(k));
    });
    return resgatesHeadersBase.length > 0
      ? [...resgatesHeadersBase, ...[...set].filter((k) => !resgatesHeadersBase.includes(k))]
      : [...set];
  }, [resgatesHeadersBase, resgatesDataRowsRaw]);

  const crimesHeaders = useMemo(() => {
    const set = new Set<string>(crimesHeadersBase);
    crimesDataRowsRaw.forEach((r) => {
      Object.keys(r.data || {}).filter((k) => k !== '_headers').forEach((k) => set.add(k));
    });
    return crimesHeadersBase.length > 0
      ? [...crimesHeadersBase, ...[...set].filter((k) => !crimesHeadersBase.includes(k))]
      : [...set];
  }, [crimesHeadersBase, crimesDataRowsRaw]);

  const resgatesDataRows = useMemo(
    () => sortRowsByDateDesc(resgatesDataRowsRaw, resgatesHeaders),
    [resgatesDataRowsRaw, resgatesHeaders]
  );
  const crimesDataRows = useMemo(
    () => sortRowsByDateDesc(crimesDataRowsRaw, crimesHeaders),
    [crimesDataRowsRaw, crimesHeaders]
  );

  const hasData = resgatesHeaders.length > 0 || crimesHeaders.length > 0 || resgatesDataRows.length > 0 || crimesDataRows.length > 0;

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
                <ResizableTable
                  headers={resgatesHeaders}
                  dataRows={resgatesDataRows}
                  headerColor="linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)"
                  emptyMessage="Nenhuma coluna na aba Resgates de Fauna. Sincronize a planilha."
                />
              </TabsContent>

              <TabsContent value={SHEET_CRIMES} className="mt-0 p-4">
                <ResizableTable
                  headers={crimesHeaders}
                  dataRows={crimesDataRows}
                  headerColor="linear-gradient(180deg, hsl(210 80% 40%) 0%, hsl(210 80% 30%) 100%)"
                  emptyMessage="Nenhuma coluna na aba Crimes Ambientais. Sincronize a planilha."
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioOperador;
