import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Calendar, Database, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Liquid glass header card */}
      <Card className="overflow-hidden shadow-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                <Radio className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  Rádio Operador
                  <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                    <Database className="h-4 w-4" />
                    Planilha sincronizada 1x ao dia
                  </span>
                </CardTitle>
                {lastSync && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Última sincronização: {format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Atualizar agora'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Liquid glass table card */}
      <Card className="overflow-hidden shadow-xl bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : headers.length === 0 && dataRows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum dado sincronizado ainda.</p>
              <p className="text-sm mt-1">Clique em &quot;Atualizar agora&quot; para importar a planilha.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 dark:border-white/10">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="text-left px-4 py-4 text-sm font-semibold text-foreground/90 bg-white/5 dark:bg-white/5 first:rounded-tl-2xl last:rounded-tr-2xl"
                      >
                        <span className="flex items-center gap-1">
                          <ChevronRight className="h-4 w-4 text-primary/70" />
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
                        border-b border-white/10 dark:border-white/5
                        hover:bg-white/10 dark:hover:bg-white/5
                        transition-colors
                        ${idx % 2 === 0 ? 'bg-white/5 dark:bg-white/[0.02]' : ''}
                      `}
                    >
                      {headers.map((header, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-4 py-3 text-sm text-foreground/90"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioOperador;
