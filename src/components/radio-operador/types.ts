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

/** Crimes Ambientais: CRIME em vez de FAUNA; inclui N° TCO. */
export const CRIMES_COLUMN_KEYS = [
  'Data',
  'Equipe',
  'N° OCORRÊNCIA COPOM',
  'CRIME',
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
  'N° TCO',
  'Duração cadastro/encaminhamento',
  'Duração despacho/finalização',
] as const;

/** Colunas da tabela Resgate de Fauna (id, header, key em row.data). */
export const RESGATE_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'FAUNA', header: 'FAUNA', key: 'FAUNA' },
  { id: 'Hora cadastro', header: 'HORA CADASTRO', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA COPOM', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'DESPACHO RO', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'FINALIZAÇÃO', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO CAD-ENC', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO DESP-FIN', key: 'Duração despacho/finalização' },
];

/** Colunas da tabela Crimes Ambientais. */
export const CRIMES_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'CRIME', header: 'CRIME', key: 'CRIME' },
  { id: 'Hora cadastro', header: 'HORA CADASTRO', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA COPOM', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'DESPACHO RO', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'FINALIZAÇÃO', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'N° TCO', header: 'N° TCO', key: 'N° TCO' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO CAD-ENC', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO DESP-FIN', key: 'Duração despacho/finalização' },
];

export function getDisplayVal(val: unknown): string {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

export function getRowData(row: RadioRow, key: string): unknown {
  if (key === 'FAUNA') return row.data['FAUNA'] ?? row.data['Fauna'];
  if (key === 'CRIME') return row.data['CRIME'] ?? row.data['Crime'] ?? row.data['FAUNA'] ?? row.data['Fauna'];
  return row.data[key];
}
