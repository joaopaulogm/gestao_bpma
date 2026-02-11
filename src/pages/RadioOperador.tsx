import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PawPrint, Scale, AlertTriangle, Search, Plus, RefreshCw,
  Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Radio,
  Clock, MapPin, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import RadioOperadorLayout from '@/components/radio-operador/RadioOperadorLayout';
import OcorrenciaViewModal from '@/components/radio-operador/OcorrenciaViewModal';
import NovaOcorrenciaModal from '@/components/radio-operador/NovaOcorrenciaModal';
import OcorrenciaFormModal from '@/components/radio-operador/OcorrenciaFormModal';
import FiltersBar from '@/components/radio-operador/FiltersBar';
import {
  type RadioRow, type RadioFilters,
  RESGATE_TABLE_COLUMNS, CRIMES_TABLE_COLUMNS,
  EMPTY_RADIO_FILTERS, getDisplayVal, getRowData,
} from '@/components/radio-operador/types';
import { useRadioDimensions, formatIntervalHHMM, intervalToMinutes } from '@/components/radio-operador/useRadioDimensions';

const SHEET_RESGATES = 'Resgates de Fauna';
const SHEET_CRIMES = 'Crimes Ambientais';
const RESGATE_SELECT =
  '*, dim_equipe!equipe_id(nome), dim_local!local_id(nome), dim_grupamento!grupamento_id(nome), dim_desfecho!desfecho_id(nome), dim_destinacao!destinacao_id(nome)';
const PAGE_SIZE = 20;

function formatDataControle(d: string | null): string {
  if (!d) return '';
  try { return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy'); } catch { return d; }
}

function formatTimeHHMM(t: string | null | undefined): string {
  if (!t || String(t).trim() === '') return '';
  const s = String(t).trim();
  const parts = s.split(':');
  if (parts.length >= 2) return `${parts[0]!.padStart(2, '0')}:${parts[1]!.padStart(2, '0')}`;
  return s;
}

interface FatRow {
  id: string;
  data: string;
  equipe_id: string | null;
  ocorrencia_copom: string | null;
  fauna?: string | null;
  crime?: string | null;
  hora_cadastro_ocorrencia: string | null;
  hora_recebido_copom_central: string | null;
  hora_despacho_ro: string | null;
  hora_finalizacao_ocorrencia: string | null;
  telefone: string | null;
  local_id: string | null;
  prefixo: string | null;
  grupamento_id: string | null;
  cmt_vtr: string | null;
  desfecho_id: string | null;
  destinacao_id: string | null;
  numero_rap: string | null;
  numero_tco_pmdf_ou_tco_apf_pcdf?: string | null;
  duracao_cadastro_190_encaminhamento_copom: string | null;
  duracao_despacho_finalizacao: string | null;
  created_at: string;
  dim_equipe?: { nome: string | null } | null;
  dim_local?: { nome: string | null } | null;
  dim_grupamento?: { nome: string | null } | null;
  dim_desfecho?: { nome: string | null } | null;
  dim_destinacao?: { nome: string | null } | null;
}

function fatToRadioRow(fat: FatRow, sheetName: string, index: number): RadioRow {
  const isCrime = sheetName === SHEET_CRIMES;
  const equipeNome = fat.dim_equipe?.nome ?? '';
  const localNome = fat.dim_local?.nome ?? '';
  const grupamentoNome = fat.dim_grupamento?.nome ?? '';
  const desfechoNome = fat.dim_desfecho?.nome ?? '';
  const destinacaoNome = fat.dim_destinacao?.nome ?? '';

  const data: Record<string, unknown> = {
    Data: formatDataControle(fat.data),
    Equipe: equipeNome,
    FAUNA: fat.fauna ?? '',
    CRIME: isCrime ? (fat.crime ?? '') : (fat.fauna ?? ''),
    LOCAL: localNome,
    Desfecho: desfechoNome,
    'DESTINAÇÃO': destinacaoNome,
    'N° OCORRÊNCIA COPOM': fat.ocorrencia_copom ?? '',
    'Hora cadastro': formatTimeHHMM(fat.hora_cadastro_ocorrencia),
    'Hora recebido COPOM': formatTimeHHMM(fat.hora_recebido_copom_central),
    'Despacho RO': formatTimeHHMM(fat.hora_despacho_ro),
    'Hora finalização': formatTimeHHMM(fat.hora_finalizacao_ocorrencia),
    Telefone: fat.telefone ?? '',
    PREFIXO: fat.prefixo ?? '',
    GRUPAMENTO: grupamentoNome,
    'CMT VTR': fat.cmt_vtr ?? '',
    'N° RAP': fat.numero_rap ?? '',
    'Duração cadastro/encaminhamento': fat.duracao_cadastro_190_encaminhamento_copom,
    'Duração despacho/finalização': fat.duracao_despacho_finalizacao,
    // Raw IDs for edit
    _equipe_id: fat.equipe_id,
    _local_id: fat.local_id,
    _grupamento_id: fat.grupamento_id,
    _desfecho_id: fat.desfecho_id,
    _destinacao_id: fat.destinacao_id,
  };
  if (isCrime) {
    data['N° TCO'] = fat.numero_tco_pmdf_ou_tco_apf_pcdf ?? '';
  }

  const status = fat.desfecho_id ? 'Encerrado' as const : 'Aberto' as const;
  return { id: fat.id, synced_at: fat.created_at ?? '', row_index: index + 1, sheet_name: sheetName, data, status };
}

function parseDateParts(val: unknown): { year: number; month: number; day: number } | null {
  if (val == null || val === '') return null;
  const s = String(val).trim();
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    const year = m[3]!.length === 2 ? 2000 + parseInt(m[3]!, 10) : parseInt(m[3]!, 10);
    return { year, month: parseInt(m[2]!, 10), day: parseInt(m[1]!, 10) };
  }
  return null;
}

const RadioOperador: React.FC = () => {
  const [rows, setRows] = useState<RadioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(SHEET_RESGATES);
  const [viewRow, setViewRow] = useState<RadioRow | null>(null);
  const [editRow, setEditRow] = useState<RadioRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<RadioRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filters, setFilters] = useState<RadioFilters>(EMPTY_RADIO_FILTERS);
  const [pageIndex, setPageIndex] = useState(0);

  const dims = useRadioDimensions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resResgates, resCrimes] = await Promise.all([
        (supabase as any).from('fat_controle_ocorrencias_resgate_2026').select(RESGATE_SELECT).order('data', { ascending: false }).order('created_at', { ascending: false }),
        (supabase as any).from('fat_controle_ocorrencias_crime_ambientais_2026').select(RESGATE_SELECT).order('data', { ascending: false }).order('created_at', { ascending: false }),
      ]);
      if (resResgates.error) throw resResgates.error;
      if (resCrimes.error) throw resCrimes.error;
      const resgatesMapped = (resResgates.data || []).map((r: any, i: number) => fatToRadioRow(r, SHEET_RESGATES, i));
      const crimesMapped = (resCrimes.data || []).map((r: any, i: number) => fatToRadioRow(r, SHEET_CRIMES, i));
      setRows([...resgatesMapped, ...crimesMapped]);
      const allCreated = [...(resResgates.data || []), ...(resCrimes.data || [])].map((r: any) => r.created_at).filter(Boolean).sort().pop();
      setLastSync(allCreated ?? null);
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
      const { data, error } = await (supabase as any).functions.invoke('sync-radio-operador');
      if (data && data.success === false) throw new Error(data.error ?? 'Erro na sincronização');
      if (error) {
        const msg = data?.error ?? error?.message ?? (error as any)?.context?.body ?? 'Erro na sincronização';
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      await fetchData();
      if (data?.synced_at) setLastSync(data.synced_at);
      toast.success('Dados sincronizados com a planilha');
    } catch (e: any) {
      const msg = e?.message ?? 'Erro ao sincronizar. Tente novamente.';
      toast.error(msg);
      console.error('[sync-radio-operador]', msg, e);
    } finally {
      setSyncing(false);
    }
  }, [fetchData]);

  const resgatesRows = useMemo(() => rows.filter(r => r.sheet_name === SHEET_RESGATES), [rows]);
  const crimesRows = useMemo(() => rows.filter(r => r.sheet_name === SHEET_CRIMES), [rows]);
  const currentRows = activeTab === SHEET_CRIMES ? crimesRows : resgatesRows;

  const extractUniques = (key: string) => {
    const vals = currentRows.map(r => String(r.data[key] ?? '').trim()).filter(v => v && v !== '—' && !v.match(/^-+$/));
    return [...new Set(vals)].sort();
  };

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    currentRows.forEach(r => { const p = parseDateParts(r.data['Data']); if (p) years.add(String(p.year)); });
    return [...years].sort().reverse();
  }, [currentRows]);
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    currentRows.forEach(r => { const p = parseDateParts(r.data['Data']); if (p) months.add(String(p.month)); });
    return [...months].sort((a, b) => parseInt(a) - parseInt(b));
  }, [currentRows]);
  const uniqueDays = useMemo(() => {
    const days = new Set<string>();
    currentRows.forEach(r => { const p = parseDateParts(r.data['Data']); if (p) days.add(String(p.day)); });
    return [...days].sort((a, b) => parseInt(a) - parseInt(b));
  }, [currentRows]);
  const uniqueEquipes = useMemo(() => extractUniques('Equipe'), [currentRows]);
  const uniqueDesfechos = useMemo(() => extractUniques('Desfecho'), [currentRows]);
  const uniqueDestinacoes = useMemo(() => extractUniques('DESTINAÇÃO'), [currentRows]);
  const uniquePrefixos = useMemo(() => extractUniques('PREFIXO'), [currentRows]);
  const uniqueCmtVtrs = useMemo(() => extractUniques('CMT VTR'), [currentRows]);
  const uniqueGrupamentos = useMemo(() => extractUniques('GRUPAMENTO'), [currentRows]);
  const uniqueLocais = useMemo(() => extractUniques('LOCAL'), [currentRows]);

  const filteredRows = useMemo(() => {
    let result = currentRows;
    if (filters.year || filters.month || filters.day) {
      result = result.filter(r => {
        const p = parseDateParts(r.data['Data']);
        if (!p) return false;
        if (filters.year && String(p.year) !== filters.year) return false;
        if (filters.month && String(p.month) !== filters.month) return false;
        if (filters.day && String(p.day) !== filters.day) return false;
        return true;
      });
    }
    if (filters.equipe) result = result.filter(r => String(r.data['Equipe']).toUpperCase().includes(filters.equipe!.toUpperCase()));
    if (filters.desfecho) result = result.filter(r => String(r.data['Desfecho']) === filters.desfecho);
    if (filters.destinacao) result = result.filter(r => String(r.data['DESTINAÇÃO']) === filters.destinacao);
    if (filters.prefixo) result = result.filter(r => String(r.data['PREFIXO']) === filters.prefixo);
    if (filters.cmtVtr) result = result.filter(r => String(r.data['CMT VTR']).toUpperCase().includes(filters.cmtVtr!.toUpperCase()));
    if (filters.grupamento) result = result.filter(r => String(r.data['GRUPAMENTO']) === filters.grupamento);
    if (filters.local) result = result.filter(r => String(r.data['LOCAL']) === filters.local);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => Object.values(r.data).filter(v => v != null).join(' ').toLowerCase().includes(q));
    }
    return result;
  }, [currentRows, filters, searchQuery]);

  const pageCount = Math.ceil(filteredRows.length / PAGE_SIZE);
  const paginatedRows = filteredRows.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  useEffect(() => { setPageIndex(0); }, [activeTab, filters, searchQuery]);

  const handleDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const table = deleteRow.sheet_name === SHEET_CRIMES
        ? 'fat_controle_ocorrencias_crime_ambientais_2026'
        : 'fat_controle_ocorrencias_resgate_2026';
      const { error } = await (supabase as any).from(table).delete().eq('id', deleteRow.id);
      if (error) throw error;
      toast.success('Ocorrência excluída');
      setDeleteRow(null);
      fetchData();
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + (e.message || ''));
    } finally {
      setDeleting(false);
    }
  };

  const columns = activeTab === SHEET_CRIMES ? CRIMES_TABLE_COLUMNS : RESGATE_TABLE_COLUMNS;

  return (
    <RadioOperadorLayout>
      <div className="px-4 sm:px-6 py-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071d49] to-[#0d3a7a] shadow-lg shadow-[#071d49]/20">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#071d49]">Controle de Ocorrências</h1>
              <p className="text-xs text-slate-500">
                {lastSync ? `Atualizado: ${format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}` : 'Rádio Operador'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="search" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-sm" />
            </div>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="h-9 rounded-xl border-slate-200">
              <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
            </Button>
            <Button size="sm" onClick={() => setShowNewModal(true)} className="h-9 rounded-xl bg-gradient-to-r from-[#071d49] to-[#0d3a7a] text-white hover:opacity-90 shadow-md shadow-[#071d49]/20">
              <Plus className="h-4 w-4 mr-1" /> Nova Ocorrência
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-11 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <TabsTrigger value={SHEET_RESGATES} className="rounded-lg px-4 h-9 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md">
              <PawPrint className="h-4 w-4 mr-2" /> Resgate de Fauna
              <Badge className="ml-2 h-5 px-1.5 text-[10px] rounded-full bg-white/20 text-current border-0">{resgatesRows.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value={SHEET_CRIMES} className="rounded-lg px-4 h-9 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md">
              <Scale className="h-4 w-4 mr-2" /> Crimes Ambientais
              <Badge className="ml-2 h-5 px-1.5 text-[10px] rounded-full bg-white/20 text-current border-0">{crimesRows.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          uniqueYears={uniqueYears}
          uniqueMonths={uniqueMonths}
          uniqueDays={uniqueDays}
          uniqueEquipes={uniqueEquipes}
          uniqueDesfechos={uniqueDesfechos}
          uniqueDestinacoes={uniqueDestinacoes}
          uniquePrefixos={uniquePrefixos}
          uniqueCmtVtrs={uniqueCmtVtrs}
          uniqueGrupamentos={uniqueGrupamentos}
          uniqueLocais={uniqueLocais}
          onClear={() => setFilters(EMPTY_RADIO_FILTERS)}
        />

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{filteredRows.length} ocorrência{filteredRows.length !== 1 ? 's' : ''}</span>
          {filteredRows.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-600">{filteredRows.filter(r => r.status === 'Aberto').length} Abertas</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#071d49]" />
                <span className="text-xs font-medium text-[#071d49]">{filteredRows.filter(r => r.status === 'Encerrado').length} Encerradas</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#071d49]/30 border-t-[#071d49]" />
            <p className="text-sm text-slate-500">Carregando ocorrências...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-24">
            <AlertTriangle className="h-10 w-10 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">Nenhum dado carregado</p>
            <Button variant="outline" className="mt-4" onClick={handleSync} disabled={syncing}>Atualizar dados</Button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhuma ocorrência encontrada com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedRows.map((row) => {
              const isAberto = row.status === 'Aberto';
              const dataVal = getDisplayVal(row.data['Data']);
              const equipeVal = getDisplayVal(row.data['Equipe']);
              const copomVal = getDisplayVal(row.data['N° OCORRÊNCIA COPOM']);
              const mainVal = activeTab === SHEET_CRIMES
                ? getDisplayVal(getRowData(row, 'CRIME'))
                : getDisplayVal(getRowData(row, 'FAUNA'));
              const horaCadastro = getDisplayVal(row.data['Hora cadastro']);
              const horaRecebido = getDisplayVal(row.data['Hora recebido COPOM']);
              const localVal = getDisplayVal(row.data['LOCAL']);
              const desfechoNome = String(row.data['Desfecho'] ?? '').trim();
              const desfechoDisplay = desfechoNome || 'Sem desfecho';

              // Duration alerts
              const dur1 = row.data['Duração cadastro/encaminhamento'];
              const dur2 = row.data['Duração despacho/finalização'];
              const dur1Min = intervalToMinutes(dur1 as string);
              const dur2Min = intervalToMinutes(dur2 as string);
              const dur1Alert = dur1Min != null && dur1Min > 30;
              const dur2Alert = dur2Min != null && dur2Min > 120;

              return (
                <div
                  key={row.id}
                  className={cn(
                    'group relative rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden',
                    isAberto && 'border-l-4 border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200',
                    !isAberto && 'border-l-4 border-l-[#071d49] border-t-slate-200 border-r-slate-200 border-b-slate-200',
                  )}
                >
                  <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5">
                    {/* Main info */}
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-x-5 gap-y-3 sm:gap-y-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Data</p>
                        <p className="text-sm font-medium text-slate-800">{dataVal}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Equipe</p>
                        <p className="text-sm font-medium text-slate-800 break-words">{equipeVal}</p>
                      </div>
                      <div className="min-w-[120px]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">COPOM</p>
                        <p className="text-sm font-medium text-slate-800 break-all" title={copomVal}>{copomVal}</p>
                      </div>
                      <div className="min-w-[100px]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {activeTab === SHEET_CRIMES ? 'Crime' : 'Fauna'}
                        </p>
                        <p className="text-sm font-medium text-emerald-700 break-words" title={mainVal}>{mainVal}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Horários</p>
                        <p className="text-xs text-slate-600">
                          <Clock className="inline h-3 w-3 mr-0.5 text-slate-400 shrink-0" />
                          {horaCadastro} → {horaRecebido}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Local</p>
                        <p className="text-xs text-slate-600 break-words" title={localVal}>
                          <MapPin className="inline h-3 w-3 mr-0.5 text-slate-400 shrink-0" />{localVal}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Desfecho</p>
                        {desfechoNome ? (
                          <Badge className="text-[10px] font-medium mt-0.5 bg-[#071d49]/10 text-[#071d49] border-[#071d49]/20">{desfechoDisplay}</Badge>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">Sem desfecho</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Durações</p>
                        <div className="flex flex-col gap-0.5">
                          <span className={cn('text-xs px-1.5 py-0.5 rounded', dur1Alert && 'bg-red-100 text-red-700 font-bold')}>
                            {dur1Alert && <AlertCircle className="inline h-3 w-3 mr-0.5 text-red-600" />}
                            190: {formatIntervalHHMM(dur1 as string)}
                          </span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded', dur2Alert && 'bg-red-100 text-red-700 font-bold')}>
                            {dur2Alert && <AlertCircle className="inline h-3 w-3 mr-0.5 text-red-600" />}
                            Desp: {formatIntervalHHMM(dur2 as string)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-0.5 sm:gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => setViewRow(row)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-amber-50 hover:text-amber-600" onClick={() => setEditRow(row)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteRow(row)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between pt-2 text-sm text-slate-500">
            <span>{pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, filteredRows.length)} de {filteredRows.length}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex(p => p - 1)} disabled={pageIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let p: number;
                if (pageCount <= 5) p = i;
                else if (pageIndex < 2) p = i;
                else if (pageIndex >= pageCount - 2) p = pageCount - 5 + i;
                else p = pageIndex - 2 + i;
                return (
                  <Button key={p} variant={p === pageIndex ? 'default' : 'ghost'} size="icon" className={cn('h-8 w-8 rounded-lg text-xs', p === pageIndex && 'bg-[#071d49] text-white')} onClick={() => setPageIndex(p)}>
                    {p + 1}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex(p => p + 1)} disabled={pageIndex >= pageCount - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <OcorrenciaViewModal
        open={!!viewRow}
        onOpenChange={(open) => !open && setViewRow(null)}
        row={viewRow}
        columns={viewRow?.sheet_name === SHEET_CRIMES ? CRIMES_TABLE_COLUMNS : RESGATE_TABLE_COLUMNS}
        onEdit={() => { if (viewRow) { setEditRow(viewRow); setViewRow(null); } }}
      />

      {/* Edit Modal */}
      {editRow && (
        <OcorrenciaFormModal
          open={!!editRow}
          onOpenChange={(open) => !open && setEditRow(null)}
          row={editRow}
          isCrime={editRow.sheet_name === SHEET_CRIMES}
          dims={dims}
          onSaved={fetchData}
        />
      )}

      {/* Nova Ocorrência Modal */}
      <NovaOcorrenciaModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
        type={activeTab === SHEET_CRIMES ? 'crime' : 'resgate'}
        dims={dims}
        onSaved={fetchData}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRow} onOpenChange={(open) => !open && setDeleteRow(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ocorrência?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-xl bg-red-600 hover:bg-red-700">
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RadioOperadorLayout>
  );
};

export default RadioOperador;
