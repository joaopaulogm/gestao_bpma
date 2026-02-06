import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PawPrint, Scale, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import type { FatControleResgateRow, FatControleCrimeRow } from './RadioOperador.types';
import { formatTimeStr, formatIntervalStr } from './RadioOperador.types';

const SHEET_RESGATES = 'Resgates de Fauna';
const SHEET_CRIMES = 'Crimes Ambientais';

const RESGATE_SELECT = '*, dim_equipe!equipe_id(nome), dim_local!local_id(nome), dim_grupamento!grupamento_id(nome), dim_desfecho!desfecho_id(nome), dim_destinacao!destinacao_id(nome)';

function formatDataControle(d: string | null): string {
  if (!d) return '';
  return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy');
}

function fatControleToRadioRow(
  fat: FatControleResgateRow | FatControleCrimeRow,
  sheetName: string,
  index: number
): RadioRow {
  const isCrime = sheetName === SHEET_CRIMES;
  const equipeNome = fat.dim_equipe?.nome ?? '';
  const localNome = fat.dim_local?.nome ?? '';
  const grupamentoNome = fat.dim_grupamento?.nome ?? '';
  const desfechoNome = fat.dim_desfecho?.nome ?? '';
  const destinacaoNome = fat.dim_destinacao?.nome ?? '';
  const data: Record<string, unknown> = {
    'Data': formatDataControle(fat.data),
    'Equipe': equipeNome,
    'FAUNA': fat.fauna ?? '',
    'CRIME': isCrime && 'crime' in fat ? (fat as FatControleCrimeRow).crime ?? '' : fat.fauna ?? '',
    'LOCAL': localNome,
    'Desfecho': desfechoNome,
    'DESTINAÇÃO': destinacaoNome,
    'N° OCORRÊNCIA COPOM': fat.ocorrencia_copom ?? '',
    'Hora cadastro': formatTimeStr(fat.hora_cadastro_ocorrencia),
    'Hora recebido COPOM': formatTimeStr(fat.hora_recebido_copom_central),
    'Despacho RO': formatTimeStr(fat.hora_despacho_ro),
    'Hora finalização': formatTimeStr(fat.hora_finalizacao_ocorrencia),
    'Telefone': fat.telefone ?? '',
    'PREFIXO': fat.prefixo ?? '',
    'GRUPAMENTO': grupamentoNome,
    'CMT VTR': fat.cmt_vtr ?? '',
    'N° RAP': fat.numero_rap ?? '',
    'Duração cadastro/encaminhamento': formatIntervalStr(fat.duracao_cadastro_190_encaminhamento_copom),
    'Duração despacho/finalização': formatIntervalStr(fat.duracao_despacho_finalizacao),
  };
  if (isCrime && 'numero_tco_pmdf_ou_tco_apf_pcdf' in fat) {
    data['N° TCO'] = (fat as FatControleCrimeRow).numero_tco_pmdf_ou_tco_apf_pcdf ?? '';
  }
  return {
    id: fat.id,
    synced_at: fat.created_at ?? '',
    row_index: index + 1,
    sheet_name: sheetName,
    data,
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
  const [activeTab, setActiveTab] = useState<string>(SHEET_RESGATES);
  const [viewRow, setViewRow] = useState<RadioRow | null>(null);
  const [editingRow, setEditingRow] = useState<RadioRow | null>(null);
  const [editingHeaderKeys, setEditingHeaderKeys] = useState<string[]>([]);
  const [editingHeaderLabels, setEditingHeaderLabels] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resResgates, resCrimes] = await Promise.all([
        supabase
          .from('fat_controle_ocorrencias_resgate_2026')
          .select(RESGATE_SELECT)
          .order('data', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('fat_controle_ocorrencias_crime_ambientais_2026')
          .select(RESGATE_SELECT)
          .order('data', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
      ]);
      if (resResgates.error) throw resResgates.error;
      if (resCrimes.error) throw resCrimes.error;
      const resgatesFat = (resResgates.data || []) as FatControleResgateRow[];
      const crimesFat = (resCrimes.data || []) as FatControleCrimeRow[];
      const resgatesMapped = resgatesFat.map((r, i) => fatControleToRadioRow(r, SHEET_RESGATES, i));
      const crimesMapped = crimesFat.map((r, i) => fatControleToRadioRow(r, SHEET_CRIMES, i));
      setRows([...resgatesMapped, ...crimesMapped]);
      const lastCreated =
        [...resgatesFat, ...crimesFat]
          .map((r) => r.created_at)
          .filter(Boolean)
          .sort()
          .pop() ?? null;
      setLastSync(lastCreated ?? null);
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
      await fetchData();
      toast.success('Dados atualizados');
    } catch {
      // fetchData já mostra toast de erro
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
      headerKeys.reduce(
        (acc, k) => ({ ...acc, [k]: String(row.data[k] ?? '').trim() }),
        {} as Record<string, string>
      )
    );
  }, []);

  const openEditFromFat = useCallback((_row: RadioRow, _sheetName: string) => {
    toast.info('Edição de registros deve ser feita nas telas de Seção Operacional.');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingRow) return;
    setSaving(false);
    toast.info('Edição de registros deve ser feita nas telas de Seção Operacional.');
    setEditingRow(null);
  }, [editingRow]);

  const handleExport = useCallback((tabOverride?: 'resgates' | 'crimes') => {
    const tab = tabOverride ?? (activeTab === SHEET_CRIMES ? 'crimes' : 'resgates');
    const list = tab === 'resgates' ? resgatesFiltered : crimesFiltered;
    const cols = tab === 'resgates' ? RESGATE_TABLE_COLUMNS : CRIMES_TABLE_COLUMNS;
    const header = cols.map((c) => c.header).join(';');
    const body = list
      .map((row) =>
        cols
          .map((c) => {
            const raw = row.data[c.key] ?? '';
            return String(raw).replace(/;/g, ',');
          })
          .join(';')
      )
      .join('\n');
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
    openEditFromFat(row, sheetName);
  }, [openEditFromFat]);

  const hasData = rows.length > 0;
  const totalOcorrencias = resgatesDataRows.length + crimesDataRows.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6 space-y-5 max-w-[1800px]">
        {/* Page Header */}
        <PageHeader
          title="Controle de Ocorrências"
          subtitle={totalOcorrencias > 0 ? `${totalOcorrencias} ocorrências registradas` : undefined}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleSync}
          refreshing={syncing}
          onExport={() => handleExport(activeTab === SHEET_CRIMES ? 'crimes' : 'resgates')}
          onAdd={undefined}
        />

        {/* Main Content Card */}
        <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            {loading && !hasData ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Carregando ocorrências...</p>
              </div>
            ) : !hasData ? (
              <div className="text-center py-24 px-6">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-semibold text-foreground">Nenhum dado carregado</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Os dados vêm das tabelas de controle de ocorrências. Use o botão Atualizar para recarregar.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-xl" 
                  onClick={handleSync} 
                  disabled={syncing}
                >
                  Atualizar Dados
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tabs Header */}
                <div className="px-4 md:px-6 py-4 border-b border-border/40 bg-muted/10 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <TabsList className="h-11 bg-muted/50 backdrop-blur-sm rounded-xl p-1 gap-1">
                      <TabsTrigger
                        value={SHEET_RESGATES}
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 h-9 transition-all duration-200"
                      >
                        <PawPrint className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Resgate de Fauna</span>
                        <span className="sm:hidden">Resgates</span>
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs font-normal bg-primary/10 text-primary">
                          {resgatesDataRows.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value={SHEET_CRIMES}
                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 h-9 transition-all duration-200"
                      >
                        <Scale className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Crimes Ambientais</span>
                        <span className="sm:hidden">Crimes</span>
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs font-normal bg-primary/10 text-primary">
                          {crimesDataRows.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    
                    {lastSync && (
                      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                        Última atualização: {format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Filters and Content */}
                <div className="p-4 md:p-6 space-y-4">
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
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{resgatesFiltered.length}</span>
                        {' '}{resgatesFiltered.length === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}
                      </p>
                    </div>
                    <OcorrenciasTable
                      data={resgatesFiltered}
                      columns={RESGATE_TABLE_COLUMNS}
                      globalFilter={searchQuery}
                      loading={false}
                      onView={handleView}
                      onEdit={(row) => handleEditFromTable(row, SHEET_RESGATES)}
                      emptyMessage="Nenhuma ocorrência de resgate de fauna encontrada."
                    />
                  </TabsContent>

                  <TabsContent value={SHEET_CRIMES} className="mt-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{crimesFiltered.length}</span>
                        {' '}{crimesFiltered.length === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}
                      </p>
                    </div>
                    <OcorrenciasTable
                      data={crimesFiltered}
                      columns={CRIMES_TABLE_COLUMNS}
                      globalFilter={searchQuery}
                      loading={false}
                      onView={handleView}
                      onEdit={(row) => handleEditFromTable(row, SHEET_CRIMES)}
                      emptyMessage="Nenhuma ocorrência de crimes ambientais encontrada."
                      isCrimes
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Modal */}
      <OcorrenciaViewModal
        open={!!viewRow}
        onOpenChange={(open) => !open && setViewRow(null)}
        row={viewRow}
        columns={viewRow?.sheet_name === SHEET_CRIMES ? CRIMES_TABLE_COLUMNS : RESGATE_TABLE_COLUMNS}
        onEdit={() => {
          if (viewRow) handleEditFromTable(viewRow, viewRow.sheet_name === SHEET_CRIMES ? SHEET_CRIMES : SHEET_RESGATES);
        }}
      />

      {/* Edit Modal */}
      <OcorrenciaFormModal
        open={!!editingRow}
        onOpenChange={(open) => !open && setEditingRow(null)}
        title="Editar Ocorrência"
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
