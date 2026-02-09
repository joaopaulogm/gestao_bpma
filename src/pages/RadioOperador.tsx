import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PawPrint, Scale, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import RadioOperadorLayout from '@/components/radio-operador/RadioOperadorLayout';
import OcorrenciaViewModal from '@/components/radio-operador/OcorrenciaViewModal';
import {
  type RadioRow,
  type RadioFilters,
  EMPTY_RADIO_FILTERS,
  RESGATE_TABLE_COLUMNS,
  CRIMES_TABLE_COLUMNS,
  getDisplayVal,
  getRowData,
} from '@/components/radio-operador';

import type { FatControleResgateRow, FatControleCrimeRow } from './RadioOperador.types';
import { formatTimeStr, formatIntervalStr } from './RadioOperador.types';

const SHEET_RESGATES = 'Resgates de Fauna';
const SHEET_CRIMES = 'Crimes Ambientais';
const RESGATE_SELECT =
  '*, dim_equipe!equipe_id(nome), dim_local!local_id(nome), dim_grupamento!grupamento_id(nome), dim_desfecho!desfecho_id(nome), dim_destinacao!destinacao_id(nome)';

export type StatusFilter = 'open' | 'in_review' | 'closed' | 'all';

function formatDataControle(d: string | null): string {
  if (!d) return '';
  return format(new Date(d + 'T12:00:00'), 'dd/MM/yyyy');
}

function deriveStatus(desfecho: string | null | undefined): 'Aberto' | 'Em análise' | 'Encerrado' {
  const d = (desfecho ?? '').toUpperCase().trim();
  if (!d || d === '—' || d.includes('PENDENTE') || d.includes('EM ANDAMENTO'))
    return 'Aberto';
  if (
    d.includes('RESGATADO') ||
    d.includes('SOLTURA') ||
    d.includes('ÓBITO') ||
    d.includes('OBITO') ||
    d.includes('PRISÃO') ||
    d.includes('NADA CONSTATADO') ||
    d.includes('LIBERADO') ||
    d.includes('DESTINAÇÃO') ||
    d.includes('DESTINACAO')
  )
    return 'Encerrado';
  return 'Em análise';
}

function fatControleToRadioRow(
  fat: FatControleResgateRow | FatControleCrimeRow,
  sheetName: string,
  index: number
): RadioRow & { status: 'Aberto' | 'Em análise' | 'Encerrado' } {
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
    CRIME: isCrime && 'crime' in fat ? (fat as FatControleCrimeRow).crime ?? '' : fat.fauna ?? '',
    LOCAL: localNome,
    Desfecho: desfechoNome,
    'DESTINAÇÃO': destinacaoNome,
    'N° OCORRÊNCIA COPOM': fat.ocorrencia_copom ?? '',
    'Hora cadastro': formatTimeStr(fat.hora_cadastro_ocorrencia),
    'Hora recebido COPOM': formatTimeStr(fat.hora_recebido_copom_central),
    'Despacho RO': formatTimeStr(fat.hora_despacho_ro),
    'Hora finalização': formatTimeStr(fat.hora_finalizacao_ocorrencia),
    Telefone: fat.telefone ?? '',
    PREFIXO: fat.prefixo ?? '',
    GRUPAMENTO: grupamentoNome,
    'CMT VTR': fat.cmt_vtr ?? '',
    'N° RAP': fat.numero_rap ?? '',
    'Duração cadastro/encaminhamento': formatIntervalStr(
      fat.duracao_cadastro_190_encaminhamento_copom
    ),
    'Duração despacho/finalização': formatIntervalStr(fat.duracao_despacho_finalizacao),
  };
  if (isCrime && 'numero_tco_pmdf_ou_tco_apf_pcdf' in fat) {
    data['N° TCO'] = (fat as FatControleCrimeRow).numero_tco_pmdf_ou_tco_apf_pcdf ?? '';
  }
  const status = deriveStatus(desfechoNome);
  return {
    id: fat.id,
    synced_at: fat.created_at ?? '',
    row_index: index + 1,
    sheet_name: sheetName,
    data,
    status,
  };
}

function parseDateParts(
  val: unknown
): { year: number; month: number; day: number } | null {
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
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function sortByDateDesc<T extends RadioRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const pa = parseDateParts(a.data['Data']);
    const pb = parseDateParts(b.data['Data']);
    const ta = pa ? new Date(pa.year, pa.month - 1, pa.day).getTime() : 0;
    const tb = pb ? new Date(pb.year, pb.month - 1, pb.day).getTime() : 0;
    return tb - ta;
  });
}

type RadioRowWithStatus = RadioRow & { status?: 'Aberto' | 'Em análise' | 'Encerrado' };

const RadioOperador: React.FC = () => {
  const [rows, setRows] = useState<RadioRowWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [filters, setFilters] = useState<RadioFilters>(EMPTY_RADIO_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [activeTab, setActiveTab] = useState<string>(SHEET_RESGATES);
  const [viewRow, setViewRow] = useState<RadioRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resResgates, resCrimes] = await Promise.all([
        (supabase as any)
          .from('fat_controle_ocorrencias_resgate_2026')
          .select(RESGATE_SELECT)
          .order('data', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('fat_controle_ocorrencias_crime_ambientais_2026')
          .select(RESGATE_SELECT)
          .order('data', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
      ]);
      if (resResgates.error) throw resResgates.error;
      if (resCrimes.error) throw resCrimes.error;
      const resgatesFat = (resResgates.data || []) as FatControleResgateRow[];
      const crimesFat = (resCrimes.data || []) as FatControleCrimeRow[];
      const resgatesMapped = resgatesFat.map((r, i) =>
        fatControleToRadioRow(r, SHEET_RESGATES, i)
      );
      const crimesMapped = crimesFat.map((r, i) =>
        fatControleToRadioRow(r, SHEET_CRIMES, i)
      );
      setRows([...resgatesMapped, ...crimesMapped]);
      const lastCreated = [...resgatesFat, ...crimesFat]
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetchData();
      toast.success('Dados atualizados');
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  }, [fetchData]);

  const bySheet = useMemo(() => {
    const map = new Map<string, RadioRowWithStatus[]>();
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

  const currentRows = useMemo(
    () =>
      activeTab === SHEET_CRIMES ? crimesDataRows : resgatesDataRows,
    [activeTab, crimesDataRows, resgatesDataRows]
  );

  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return currentRows;
    const statusMap = {
      open: 'Aberto',
      in_review: 'Em análise',
      closed: 'Encerrado',
    };
    const target = statusMap[statusFilter];
    return currentRows.filter((r) => (r as RadioRowWithStatus).status === target);
  }, [currentRows, statusFilter]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByStatus;
    const q = searchQuery.toLowerCase().trim();
    return filteredByStatus.filter((row) => {
      const str = Object.values(row.data)
        .filter((v) => v != null)
        .join(' ')
        .toLowerCase();
      return str.includes(q);
    });
  }, [filteredByStatus, searchQuery]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredBySearch.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBySearch.map((r) => r.id)));
    }
  }, [filteredBySearch, selectedIds.size]);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  const handleView = useCallback((row: RadioRow) => setViewRow(row), []);
  const hasData = rows.length > 0;
  const totalOcorrencias = resgatesDataRows.length + crimesDataRows.length;

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Em análise':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Encerrado':
        return 'bg-[#071d49]/15 text-[#071d49] border-[#071d49]/30';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <RadioOperadorLayout>
      <div className="px-6 py-5">
        {/* Abas Start | Views (igual à imagem) */}
        <Tabs value="views" className="w-full">
          <TabsList className="h-9 bg-transparent p-0 gap-0 border-b border-gray-200 rounded-none mb-6">
            <TabsTrigger
              value="start"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-gray-700 px-4 pb-2"
            >
              Início
            </TabsTrigger>
            <TabsTrigger
              value="views"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#071d49] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-[#071d49] data-[state=active]:font-medium px-4 pb-2"
            >
              Visualizações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="mt-0">
            {/* Seção "Ocorrências abertas" + pills + search */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Ocorrências abertas
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { key: 'open' as const, label: 'Aberto' },
                      { key: 'in_review' as const, label: 'Em análise' },
                      { key: 'closed' as const, label: 'Encerrado' },
                      { key: 'all' as const, label: 'Todas' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                        statusFilter === key
                          ? 'bg-[#071d49] text-white border-[#071d49]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-white border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* "Ocorrências abertas e atribuídas" + botões */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Ocorrências abertas e atribuídas
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  className="h-9 px-3 rounded-lg border-gray-300 text-gray-700 bg-white"
                >
                  Desmarcar todas
                </Button>
                <Button
                  size="sm"
                  onClick={() => toast.info('Edição deve ser feita na Seção Operacional.')}
                  className="h-9 px-3 rounded-lg bg-[#071d49] hover:bg-[#071d49]/90 text-white"
                >
                  Editar ocorrências
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {loading && !hasData ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#071d49]/30 border-t-[#071d49]" />
                <p className="text-sm text-gray-500">Carregando ocorrências...</p>
              </div>
            ) : !hasData ? (
              <div className="text-center py-24">
                <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">Nenhum dado carregado</p>
                <p className="text-sm text-gray-500 mt-1">Use o botão Atualizar para recarregar.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  Atualizar dados
                </Button>
              </div>
            ) : (
              <>
                {/* Tabs Resgate | Crimes (dentro da área de conteúdo) */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
                  <TabsList className="h-9 bg-gray-100 p-0.5 rounded-lg inline-flex">
                    <TabsTrigger
                      value={SHEET_RESGATES}
                      className="rounded-md px-3 h-8 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <PawPrint className="h-4 w-4 mr-1.5" />
                      Resgate de Fauna
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] rounded bg-[#071d49]/10 text-[#071d49]">
                        {resgatesDataRows.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value={SHEET_CRIMES}
                      className="rounded-md px-3 h-8 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Scale className="h-4 w-4 mr-1.5" />
                      Crimes Ambientais
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] rounded bg-[#071d49]/10 text-[#071d49]">
                        {crimesDataRows.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Tabela no estilo da imagem */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="w-12 h-11 px-4">
                          <Checkbox
                            checked={
                              filteredBySearch.length > 0 &&
                              selectedIds.size === filteredBySearch.length
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label="Selecionar todas"
                          />
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Assunto
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Solicitante
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Requerido
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Atualização
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Grupo
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-11 px-4">
                          Agente atribuído
                        </TableHead>
                        <TableHead className="w-16" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBySearch.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="py-12 text-center text-gray-500"
                          >
                            Nenhuma ocorrência encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBySearch.map((row) => {
                          const status = (row as RadioRowWithStatus).status ?? 'Aberto';
                          const assunto =
                            row.sheet_name === SHEET_CRIMES
                              ? getDisplayVal(getRowData(row, 'CRIME') ?? row.data['CRIME'])
                              : getDisplayVal(getRowData(row, 'FAUNA') ?? row.data['FAUNA']);
                          const dataStr = getDisplayVal(row.data['Data']);
                          const requerido = dataStr;
                          const solicitante = getDisplayVal(row.data['Equipe']);
                          const grupo =
                            getDisplayVal(row.data['GRUPAMENTO']) !== '—'
                              ? getDisplayVal(row.data['GRUPAMENTO'])
                              : row.sheet_name ?? '—';
                          return (
                            <TableRow
                              key={row.id}
                              className="border-b border-gray-100 hover:bg-gray-50/50"
                            >
                              <TableCell className="px-4 py-3">
                                <Checkbox
                                  checked={selectedIds.has(row.id)}
                                  onCheckedChange={() => toggleSelect(row.id)}
                                  aria-label={`Selecionar #${String(row.row_index).padStart(3, '0')}`}
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                    statusBadgeClass(status)
                                  )}
                                >
                                  {status}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-900 font-medium">
                                #{String(row.row_index).padStart(3, '0')}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                                {assunto}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-700">
                                {solicitante}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-700">
                                {requerido}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-700">
                                {requerido}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-700">
                                {grupo}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-700">
                                {solicitante}
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-gray-600 hover:text-[#071d49]"
                                  onClick={() => handleView(row)}
                                >
                                  Ver
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {lastSync && (
                  <p className="mt-3 text-xs text-gray-500">
                    Atualizado:{' '}
                    {format(new Date(lastSync), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <OcorrenciaViewModal
        open={!!viewRow}
        onOpenChange={(open) => !open && setViewRow(null)}
        row={viewRow}
        columns={
          viewRow?.sheet_name === SHEET_CRIMES
            ? CRIMES_TABLE_COLUMNS
            : RESGATE_TABLE_COLUMNS
        }
        onEdit={() =>
          toast.info('Edição deve ser feita na Seção Operacional.')
        }
      />
    </RadioOperadorLayout>
  );
};

export default RadioOperador;
