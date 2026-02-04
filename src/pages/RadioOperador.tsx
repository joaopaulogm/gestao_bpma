import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  RefreshCw,
  Calendar,
  Database,
  LayoutList,
  FileSpreadsheet,
  Sparkles,
  ChevronRight,
  PawPrint,
  Scale,
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
        .order('sheet_name', { nullsFirst: true })
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
        const total = data.rows_synced ?? 0;
        const sheets = data.sheets;
        const msg = sheets?.length
          ? `Sincronizado: ${sheets.map((s: { sheet: string; rows: number }) => `${s.sheet} (${s.rows})`).join(', ')}`
          : `${total} linhas importadas.`;
        toast.success(msg);
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

  const resgatesRows = bySheet.get(SHEET_RESGATES) ?? bySheet.get('Resgates de Fauna') ?? [];
  const crimesRows = bySheet.get(SHEET_CRIMES) ?? bySheet.get('Crimes Ambientais') ?? [];

  const resgatesHeaderRow = resgatesRows.find((r) => r.row_index === 0);
  const crimesHeaderRow = crimesRows.find((r) => r.row_index === 0);
  const resgatesHeadersBase: string[] = (resgatesHeaderRow?.data?._headers as string[]) || [];
  const crimesHeadersBase: string[] = (crimesHeaderRow?.data?._headers as string[]) || [];

  // Garantir todas as colunas: cabeçalhos + qualquer chave presente nas linhas de dados (como nos HTMLs)
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

  const renderTable = (
    headers: string[],
    dataRows: RadioRow[],
    headerColor: string
  ) => (
    <div className="w-full overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-white/20 dark:border-white/10">
      <table className="w-full border-collapse" style={{ minWidth: headers.length * 120 }}>
        <thead className="sticky top-0 z-10">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-3 text-xs font-bold text-white whitespace-nowrap first:pl-4 last:pr-4 border-b border-r border-white/20 last:border-r-0"
                style={{
                  background: headerColor,
                  minWidth: 100,
                }}
              >
                <span className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-white/90 flex-shrink-0" />
                  {h}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, idx) => (
            <tr
              key={row.id}
              className={`
                border-b border-[#daeae3]/60 dark:border-white/10
                hover:bg-[#daeae3]/40 dark:hover:bg-white/5
                transition-colors
                ${idx % 2 === 0 ? 'bg-[#f3f3f3]/70 dark:bg-white/[0.02]' : 'bg-white/50 dark:bg-white/[0.04]'}
              `}
            >
              {headers.map((header, colIdx) => {
                const val = row.data[header];
                const display =
                  val != null && String(val).trim() !== '' ? String(val) : '—';
                return (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-xs text-foreground whitespace-nowrap first:pl-4 last:pr-4 border-r border-[#daeae3]/50 dark:border-white/5 last:border-r-0"
                    style={{ minWidth: 100 }}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
      <div
        className="fixed inset-0 -z-10 opacity-30 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, hsl(142 45% 45% / 0.08), transparent)',
        }}
      />

      <Card
        className="overflow-hidden relative shadow-2xl rounded-2xl
          bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-white/15 dark:via-white/10 dark:to-white/5
          backdrop-blur-xl border border-white/40 dark:border-white/10"
      >
        <CardHeader className="relative z-10 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/10"
                style={{
                  background: 'linear-gradient(135deg, #7e9175 0%, #5a7a52 100%)',
                  boxShadow: '0 4px 20px rgba(126, 145, 117, 0.35)',
                }}
              >
                <Radio className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2 flex-wrap">
                  Rádio Operador
                  <Badge
                    variant="secondary"
                    className="font-normal text-xs border border-border/50 bg-white/60 dark:bg-white/10 backdrop-blur-sm"
                  >
                    <Database className="h-3.5 w-3.5 mr-1 inline" />
                    Planilha 1x/dia
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all shrink-0 border-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Atualizar agora'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card
        className="overflow-hidden relative shadow-2xl rounded-2xl
          bg-gradient-to-br from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/5
          backdrop-blur-xl border border-white/30 dark:border-white/10"
      >
        <CardContent className="p-0 relative z-10">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <div
                className="h-12 w-12 animate-spin rounded-full border-4 border-[#7e9175] border-t-transparent"
                style={{ boxShadow: '0 0 20px rgba(126, 145, 117, 0.3)' }}
              />
              <p className="text-sm text-muted-foreground">Carregando dados da planilha...</p>
            </div>
          ) : !hasData ? (
            <div className="text-center py-20 px-6">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(126,145,117,0.2) 0%, rgba(90,122,82,0.15) 100%)',
                }}
              >
                <FileSpreadsheet className="h-10 w-10 text-[#7e9175]" />
              </div>
              <p className="text-foreground font-medium">Nenhum dado sincronizado ainda</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Clique em &quot;Atualizar agora&quot; para importar as abas Resgates de Fauna e Crimes Ambientais.
              </p>
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="mt-6 border-[#7e9175]/50 text-[#5a7a52] hover:bg-[#7e9175]/10"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Importar planilha
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={SHEET_RESGATES} className="w-full">
              <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 flex flex-wrap items-center gap-3">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
                <TabsList className="bg-white/20 dark:bg-white/10 border border-white/20 h-10">
                  <TabsTrigger value={SHEET_RESGATES} className="data-[state=active]:bg-[#7e9175] data-[state=active]:text-white gap-1.5">
                    <PawPrint className="h-4 w-4" />
                    Resgates de Fauna
                    <Badge variant="secondary" className="ml-1 text-xs font-normal">
                      {resgatesDataRows.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value={SHEET_CRIMES} className="data-[state=active]:bg-[#1c4587] data-[state=active]:text-white gap-1.5">
                    <Scale className="h-4 w-4" />
                    Crimes Ambientais
                    <Badge variant="secondary" className="ml-1 text-xs font-normal">
                      {crimesDataRows.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value={SHEET_RESGATES} className="mt-0 p-4">
                {resgatesHeaders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">Nenhuma coluna na aba Resgates de Fauna. Sincronize a planilha.</p>
                ) : (
                  renderTable(
                    resgatesHeaders,
                    resgatesDataRows,
                    'linear-gradient(180deg, #7e9175 0%, #5a7a52 100%)'
                  )
                )}
              </TabsContent>
              <TabsContent value={SHEET_CRIMES} className="mt-0 p-4">
                {crimesHeaders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">Nenhuma coluna na aba Crimes Ambientais. Sincronize a planilha.</p>
                ) : (
                  renderTable(
                    crimesHeaders,
                    crimesDataRows,
                    'linear-gradient(180deg, #1c4587 0%, #0f2d5c 100%)'
                  )
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioOperador;
