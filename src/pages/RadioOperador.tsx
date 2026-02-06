import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PawPrint, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  PageHeader,
  FiltersBar,
  OcorrenciasTable,
  OcorrenciaViewModal,
  OcorrenciaFormModal,
  type RadioRow,
  type RadioFilters,
  EMPTY_RADIO_FILTERS,
  RESGATE_TABLE_COLUMNS,
  CRIMES_TABLE_COLUMNS,
} from '@/components/radio-operador';

import type { FatResgateRow, FatCrimeRow } from './RadioOperador.types';

const SHEET_RESGATES = 'Resgates de Fauna';
const SHEET_CRIMES = 'Crimes Ambientais';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatFatDate(d: string | null, ano: number | null, mes: number | null, dia: number | null): string {
  if (d) return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy');
  if (ano != null && mes != null && dia != null)
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
  return '';
}

function fatRowToRadioRow(fat: FatResgateRow | FatCrimeRow, sheetName: string, index: number): RadioRow {
  const data: Record<string, unknown> = {
    'Data': formatFatDate(fat.data_ocorrencia, fat.ano, fat.mes, fat.dia),
    'Equipe': fat.equipe ?? '',
    'FAUNA': fat.fauna ?? '',
    'LOCAL': fat.local ?? '',
    'Desfecho': fat.desfecho ?? '',
    'DESTINAÇÃO': fat.destinacao ?? '',
    'N° OCORRÊNCIA COPOM': fat.n_ocorrencia_copom ?? '',
    'Hora cadastro': fat.hora_cadastro ?? '',
    'Hora recebido COPOM': fat.hora_recebido_copom ?? '',
    'Despacho RO': fat.hora_despacho_ro ?? '',
    'Hora finalização': fat.hora_finalizacao ?? '',
    'Telefone': fat.telefone ?? '',
    'PREFIXO': fat.prefixo ?? '',
    'GRUPAMENTO': fat.grupamento ?? '',
    'CMT VTR': fat.cmt_vtr ?? '',
    'N° RAP': fat.n_rap ?? '',
    'Duração cadastro/encaminhamento': fat.duracao_cadastro_encaminhamento ?? '',
    'Duração despacho/finalização': fat.duracao_despacho_finalizacao ?? '',
  };
  return {
    id: fat.id,
    synced_at: '',
    row_index: index + 1,
    sheet_name: sheetName,
    data,
    dados_origem_id: fat.dados_origem_id ?? undefined,
  };
}

function parseDateParts(val: unknown): { year: number; month: number; day: number } | null {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  const ddmmyy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (ddmmyy) {
    const [, d, m, y] = ddmmyy;
    const year = y!.length === 2 ? 2000 + parseInt(y!, 10) : parseInt(y!, 10);
    return { year, month: parseInt(m!, 10), day: parseInt(d!, 10) };
  }
  const iso = Date.parse(s);
  if (Number.isNaN(iso)) return null;
  const date = new Date(iso);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function applyFilters(rows: RadioRow[], filters: RadioFilters): RadioRow[] {
  if (!filters.year && !filters.month && !filters.day && !filters.equipe && !filters.desfecho) return rows;
  return rows.filter((row) => {
    const dataVal = row.data['Data'];
    const parts = parseDateParts(dataVal);
    if (filters.year && (!parts || String(parts.year) !== filters.year)) return false;
    if (filters.month && (!parts || String(parts.month) !== filters.month)) return false;
    if (filters.day && (!parts || String(parts.day) !== filters.day)) return false;
    const equipeVal = row.data['Equipe'];
    if (filters.equipe && String(equipeVal ?? '').trim() !== filters.equipe) return false;
    const desfechoVal = row.data['Desfecho'];
    if (filters.desfecho && String(desfechoVal ?? '').trim() !== filters.desfecho) return false;
    return true;
  });
}

function sortByDateDesc(rows: RadioRow[]): RadioRow[] {
  return [...rows].sort((a, b) => {
    const pa = parseDateParts(a.data['Data']);
    const pb = parseDateParts(b.data['Data']);
    const ta = pa ? new Date(pa.year, pa.month - 1, pa.day).getTime() : 0;
    const tb = pb ? new Date(pb.year, pb.month - 1, pb.day).getTime() : 0;
    return tb - ta;
  });
}

const RadioOperador: React.FC = () => {
  const [rows, setRows] = useState<RadioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [filters, setFilters] = useState<RadioFilters>(EMPTY_RADIO_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewRow, setViewRow] = useState<RadioRow | null>(null);
  const [editingRow, setEditingRow] = useState<RadioRow | null>(null);
  const [editingHeaderKeys, setEditingHeaderKeys] = useState<string[]>([]);
  const [editingHeaderLabels, setEditingHeaderLabels] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resResgates, resCrimes, resSync] = await Promise.all([
        supabase
          .from('fat_ocorrencias_resgate_fauna_2026')
          .select('*')
          .order('data_ocorrencia', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('fat_ocorrencias_crimes_ambientais_2026')
          .select('*')
          .order('data_ocorrencia', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase.from('radio_operador_data').select('synced_at').limit(1).order('synced_at', { ascending: false }).maybeSingle(),
      ]);
      if (resResgates.error) throw resResgates.error;
      if (resCrimes.error) throw resCrimes.error;
      const resgatesFat = (resResgates.data || []) as FatResgateRow[];
      const crimesFat = (resCrimes.data || []) as FatCrimeRow[];
      const resgatesMapped = resgatesFat.map((r, i) => fatRowToRadioRow(r, SHEET_RESGATES, i));
      const crimesMapped = crimesFat.map((r, i) => fatRowToRadioRow(r, SHEET_CRIMES, i));
      setRows([...resgatesMapped, ...crimesMapped]);
      setLastSync(resSync.data?.synced_at ?? null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar dados do Rádio Operador');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-radio-operador');
      if (error) throw error;
      if (data?.success) {
        const inserted = data.rows_inserted ?? 0;
        const updated = data.rows_updated ?? 0;
        const deleted = data.rows_deleted ?? 0;
        if (inserted > 0 || updated > 0 || deleted > 0) {
          toast.success(`Sincronização: ${inserted} novos, ${updated} atualizados, ${deleted} removidos`);
        } else {
          toast.info('Dados já atualizados');
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
  }, [fetchData]);

  const bySheet = useMemo(() => {
    const map = new Map<string, RadioRow[]>();
    for (const r of rows) {
      const key = r.sheet_name?.trim() || SHEET_RESGATES;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [rows]);

  const resgatesDataRows = useMemo(
    () => sortByDateDesc(bySheet.get(SHEET_RESGATES) ?? []),
    [bySheet]
  );
  const crimesDataRows = useMemo(
    () => sortByDateDesc(bySheet.get(SHEET_CRIMES) ?? []),
    [bySheet]
  );

  const resgatesFiltered = useMemo(
    () => applyFilters(resgatesDataRows, filters),
    [resgatesDataRows, filters]
  );
  const crimesFiltered = useMemo(
    () => applyFilters(crimesDataRows, filters),
    [crimesDataRows, filters]
  );

  const { uniqueYears, uniqueMonths, uniqueDays, uniqueEquipes, uniqueDesfechos } = useMemo(() => {
    const all = [...resgatesDataRows, ...crimesDataRows];
    const years = new Set<number>();
    const months = new Set<number>();
    const days = new Set<number>();
    const equipes = new Set<string>();
    const desfechos = new Set<string>();
    for (const row of all) {
      const parts = parseDateParts(row.data['Data']);
      if (parts) {
        years.add(parts.year);
        months.add(parts.month);
        days.add(parts.day);
      }
      const eq = row.data['Equipe'];
      if (eq != null && String(eq).trim()) equipes.add(String(eq).trim());
      const df = row.data['Desfecho'];
      if (df != null && String(df).trim()) desfechos.add(String(df).trim());
    }
    return {
      uniqueYears: [...years].sort((a, b) => b - a).map(String),
      uniqueMonths: [...months].sort((a, b) => a - b).map(String),
      uniqueDays: [...days].sort((a, b) => a - b).map(String),
      uniqueEquipes: [...equipes].sort((a, b) => a.localeCompare(b)),
      uniqueDesfechos: [...desfechos].sort((a, b) => a.localeCompare(b)),
    };
  }, [resgatesDataRows, crimesDataRows]);

  const openEdit = useCallback((row: RadioRow, headerKeys: string[], headerLabels: string[]) => {
    setEditingRow(row);
    setEditingHeaderKeys(headerKeys);
    setEditingHeaderLabels(headerLabels);
    setEditFormData(
      headerKeys.reduce((acc, k) => ({ ...acc, [k]: String(row.data[k] ?? '').trim() }), {} as Record<string, string>
    );
  }, []);

  const openEditFromFat = useCallback(async (row: RadioRow, sheetName: string) => {
    if (!row.dados_origem_id) {
      toast.info('Edição disponível apenas para registros com origem na planilha.');
      return;
    }
    try {
      const [rowRes, headerRes] = await Promise.all([
        supabase.from('radio_operador_data').select('id, synced_at, row_index, sheet_name, data').eq('id', row.dados_origem_id).single(),
        supabase.from('radio_operador_data').select('data').eq('sheet_name', sheetName).eq('row_index', 1).maybeSingle(),
      ]);
      if (rowRes.error || !rowRes.data) {
        toast.error('Registro de origem não encontrado.');
        return;
      }
      const origRow = rowRes.data as RadioRow;
      const headerRow = headerRes.data as { data?: { _headers?: string[] } } | null;
      const headerKeys = (headerRow?.data?._headers ?? Object.keys(origRow.data || {}).filter((k) => k !== '_headers')) as string[];
      openEdit(origRow, headerKeys, headerKeys);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar registro para edição.');
    }
  }, [openEdit]);

  const handleSaveEdit = useCallback(async () => {
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
      toast.success('Registro atualizado. Execute no SQL: SELECT * FROM popula_fat_radio_operador(); para atualizar totais.');
      setEditingRow(null);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }, [editingRow, editingHeaderKeys, editFormData, fetchData]);

  const handleExport = useCallback(() => {
    const tab = activeTab === SHEET_CRIMES ? 'crimes' : 'resgates';
    const list = tab === 'resgates' ? resgatesFiltered : crimesFiltered;
    const cols = tab === 'resgates' ? RESGATE_TABLE_COLUMNS : CRIMES_TABLE_COLUMNS;
    const header = cols.map((c) => c.header).join(';');
    const body = list.map((row) =>
      cols.map((c) => String((row.data[c.key] ?? '') || row.data['CRIME'] ?? '').replace(/;/g, ',')).join(';')
    ).join('\n');
    const csv = '\uFEFF' + header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocorrencias-${tab === 'resgates' ? 'resgate-fauna' : 'crimes-ambientais'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação iniciada');
  }, [activeTab, resgatesFiltered, crimesFiltered]);

  const handleView = useCallback((row: RadioRow) => setViewRow(row), []);
  const handleEditFromTable = useCallback((row: RadioRow, sheetName: string) => {
    if (!row.dados_origem_id) {
      toast.info('Edição disponível apenas para registros com origem na planilha.');
      return;
    }
    openEditFromFat(row, sheetName);
  }, [openEditFromFat]);

  const hasData = rows.length > 0;

  return (
    <div className="min-h-screen bg-background/80">
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-[1600px]">
        <PageHeader
          title="Controle de Ocorrências"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleSync}
          refreshing={syncing}
          onExport={() => handleExport('resgates')}
          onAdd={undefined}
        />

        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-lg transition-shadow duration-200">
          <CardContent className="p-0">
            {loading && !hasData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Carregando ocorrências...</p>
              </div>
            ) : !hasData ? (
              <div className="text-center py-20 px-6">
                <p className="text-foreground font-medium">Nenhum dado carregado</p>
                <p className="text-sm text-muted-foreground mt-1">Use Atualizar para sincronizar ou importe via script.</p>
                <Button variant="outline" className="mt-6" onClick={handleSync} disabled={syncing}>
                  Atualizar
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 py-3 border-b border-border/60 bg-muted/20 backdrop-blur-sm flex flex-wrap items-center gap-3">
                  <TabsList className="h-10 bg-transparent p-0 gap-1">
                    <TabsTrigger
                      value={SHEET_RESGATES}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-4 transition-colors duration-200"
                    >
                      <PawPrint className="h-4 w-4 mr-1.5" />
                      Resgate de Fauna
                      <Badge variant="secondary" className="ml-1.5 text-xs font-normal">
                        {resgatesDataRows.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value={SHEET_CRIMES}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-4 transition-colors duration-200"
                    >
                      <Scale className="h-4 w-4 mr-1.5" />
                      Crimes Ambientais
                      <Badge variant="secondary" className="ml-1.5 text-xs font-normal">
                        {crimesDataRows.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                  {lastSync && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Última sync: {format(new Date(lastSync), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <FiltersBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    uniqueYears={uniqueYears}
                    uniqueMonths={uniqueMonths}
                    uniqueDays={uniqueDays}
                    uniqueEquipes={uniqueEquipes}
                    uniqueDesfechos={uniqueDesfechos}
                    onClear={() => setFilters(EMPTY_RADIO_FILTERS)}
                  />

                  <TabsContent value={SHEET_RESGATES} className="mt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {resgatesFiltered.length} {resgatesFiltered.length === 1 ? 'ocorrência' : 'ocorrências'}
                    </p>
                    <OcorrenciasTable
                      data={resgatesFiltered}
                      columns={RESGATE_TABLE_COLUMNS}
                      globalFilter={searchQuery}
                      loading={false}
                      onView={handleView}
                      onEdit={(row) => handleEditFromTable(row, SHEET_RESGATES)}
                      emptyMessage="Nenhuma ocorrência de resgate de fauna."
                    />
                  </TabsContent>

                  <TabsContent value={SHEET_CRIMES} className="mt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {crimesFiltered.length} {crimesFiltered.length === 1 ? 'ocorrência' : 'ocorrências'}
                    </p>
                    <OcorrenciasTable
                      data={crimesFiltered}
                      columns={CRIMES_TABLE_COLUMNS}
                      globalFilter={searchQuery}
                      loading={false}
                      onView={handleView}
                      onEdit={(row) => handleEditFromTable(row, SHEET_CRIMES)}
                      emptyMessage="Nenhuma ocorrência de crimes ambientais."
                      isCrimes
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <OcorrenciaViewModal
        open={!!viewRow}
        onOpenChange={(open) => !open && setViewRow(null)}
        row={viewRow}
        columns={viewRow?.sheet_name === SHEET_CRIMES ? CRIMES_TABLE_COLUMNS : RESGATE_TABLE_COLUMNS}
        onEdit={() => {
          if (viewRow) handleEditFromTable(viewRow, viewRow.sheet_name === SHEET_CRIMES ? SHEET_CRIMES : SHEET_RESGATES);
        }}
      />

      <OcorrenciaFormModal
        open={!!editingRow}
        onOpenChange={(open) => !open && setEditingRow(null)}
        title="Editar ocorrência"
        headerKeys={editingHeaderKeys}
        headerLabels={editingHeaderLabels}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </div>
  );
};

export default RadioOperador;
