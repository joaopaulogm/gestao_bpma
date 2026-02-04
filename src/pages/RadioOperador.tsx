import React, { useState, useEffect } from 'react';
import {
  Radio,
  RefreshCw,
  Calendar,
  Database,
  LayoutList,
  FileSpreadsheet,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RadioRow {
  id: string;
  synced_at: string;
  row_index: number;
  data: Record<string, unknown> & { _headers?: string[] };
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
        .select('id, synced_at, row_index, data')
        .order('row_index', { ascending: true });

      if (error) throw error;
      setRows((data as RadioRow[]) || []);

      const headerRow = (data || []).find((r: RadioRow) => r.row_index === 0);
      if (headerRow?.synced_at) {
        setLastSync(headerRow.synced_at);
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
        toast.success(`Sincronização concluída. ${data.rows_synced ?? 0} linhas importadas.`);
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

  const headerRow = rows.find((r) => r.row_index === 0);
  const headers: string[] = (headerRow?.data?._headers as string[]) || [];
  const dataRows = rows.filter((r) => r.row_index > 0);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 min-h-screen">
      {/* Decorative background gradient */}
      <div
        className="fixed inset-0 -z-10 opacity-30 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, hsl(142 45% 45% / 0.08), transparent)',
        }}
      />

      {/* Liquid glass header card - estilo referência planilhas */}
      <Card
        className="overflow-hidden relative shadow-2xl rounded-2xl
          bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-white/15 dark:via-white/10 dark:to-white/5
          backdrop-blur-xl border border-white/40 dark:border-white/10
          before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-white/50 before:via-transparent before:to-white/20 before:-z-0"
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

      {/* Liquid glass table card - referência Resgates/Crimes (header colorido, listras) */}
      <Card
        className="overflow-hidden relative shadow-2xl rounded-2xl
          bg-gradient-to-br from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/5
          backdrop-blur-xl border border-white/30 dark:border-white/10
          before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-white/10 before:-z-0"
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
          ) : headers.length === 0 && dataRows.length === 0 ? (
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
                Clique em &quot;Atualizar agora&quot; para importar a planilha do Google Sheets.
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
            <>
              <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutList className="h-4 w-4" />
                <span>
                  <strong className="text-foreground">{dataRows.length}</strong> registro(s)
                </span>
              </div>
              <ScrollArea className="w-full" style={{ maxWidth: '100%' }}>
                <div className="min-w-0" style={{ minWidth: 'max-content' }}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {headers.map((h, i) => (
                          <th
                            key={i}
                            className="text-left px-4 py-4 text-sm font-bold text-white whitespace-nowrap first:pl-6 last:pr-6"
                            style={{
                              background: 'linear-gradient(180deg, #7e9175 0%, #5a7a52 100%)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-white/90" strokeWidth={2.5} />
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
                            border-b border-[#daeae3]/80 dark:border-white/10
                            transition-colors duration-150
                            hover:bg-[#daeae3]/50 dark:hover:bg-white/10
                            ${idx % 2 === 0 ? 'bg-[#f3f3f3]/60 dark:bg-white/[0.02]' : 'bg-white/40 dark:bg-white/[0.04]'}
                          `}
                        >
                          {headers.map((header, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-4 py-3 text-sm text-foreground whitespace-nowrap first:pl-6 last:pr-6"
                            >
                              {row.data[header] != null && String(row.data[header]) !== ''
                                ? String(row.data[header])
                                : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioOperador;
