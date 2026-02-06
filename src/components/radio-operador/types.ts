/** Linha de ocorrência (resgate ou crime) – dados em data[key]. */
export interface RadioRow {
  id: string;
  synced_at: string;
  row_index: number;
  sheet_name: string | null;
  data: Record<string, unknown> & { _headers?: string[] };
  dados_origem_id?: string | null;
}

export interface RadioFilters {
  year: string;
  month: string;
  day: string;
  equipe: string;
  desfecho?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const EMPTY_RADIO_FILTERS: RadioFilters = {
  year: '',
  month: '',
  day: '',
  equipe: '',
  desfecho: '',
  search: '',
  dateFrom: '',
  dateTo: '',
};

/** Chaves de coluna usadas no row.data (Resgate de Fauna). */
export const RESGATE_COLUMN_KEYS = [
  'Data',
  'Equipe',
  'N° OCORRÊNCIA COPOM',
  'FAUNA',
  'Hora cadastro',
  'Hora recebido COPOM',
  'Despacho RO',
  'Hora finalização',
  'Telefone',
  'LOCAL',
  'PREFIXO',
  'GRUPAMENTO',
  'CMT VTR',
  'Desfecho',
  'DESTINAÇÃO',
  'N° RAP',
  'Duração cadastro/encaminhamento',
  'Duração despacho/finalização',
] as const;

/** Crimes Ambientais: FAUNA substituído por CRIME; coluna extra N° TCO se existir. */
export const CRIMES_COLUMN_KEYS = [
  'Data',
  'Equipe',
  'N° OCORRÊNCIA COPOM',
  'FAUNA', // no data pode vir como CRIME ou FAUNA
  'Hora cadastro',
  'Hora recebido COPOM',
  'Despacho RO',
  'Hora finalização',
  'Telefone',
  'LOCAL',
  'PREFIXO',
  'GRUPAMENTO',
  'CMT VTR',
  'Desfecho',
  'DESTINAÇÃO',
  'N° RAP',
  'Duração cadastro/encaminhamento',
  'Duração despacho/finalização',
] as const;

/** Colunas da tabela Resgate de Fauna (id, header, key em row.data). */
export const RESGATE_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° OCORRÊNCIA COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'FAUNA', header: 'FAUNA', key: 'FAUNA' },
  { id: 'Hora cadastro', header: 'HORA (Cadastro)', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA (Recebido COPOM)', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'HORA (Despacho RO)', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'HORA (Finalização)', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO (Cadastro-Encaminhamento)', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO (Despacho-Finalização)', key: 'Duração despacho/finalização' },
];

/** Colunas da tabela Crimes Ambientais (CRIME no header, mesma key FAUNA/CRIME). */
export const CRIMES_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° OCORRÊNCIA COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'FAUNA', header: 'CRIME', key: 'FAUNA' },
  { id: 'Hora cadastro', header: 'HORA (Cadastro)', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA (Recebido COPOM)', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'HORA (Despacho RO)', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'HORA (Finalização)', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO (Cadastro-Encaminhamento)', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO (Despacho-Finalização)', key: 'Duração despacho/finalização' },
];

export function getDisplayVal(val: unknown): string {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

export function getRowData(row: RadioRow, key: string): unknown {
  if (key === 'FAUNA') return row.data['CRIME'] ?? row.data['FAUNA'];
  return row.data[key];
}
