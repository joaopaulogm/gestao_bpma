/** Linha de ocorrência (resgate ou crime) – dados em data[key]. */
export interface RadioRow {
  id: string;
  synced_at: string;
  row_index: number;
  sheet_name: string | null;
  data: Record<string, unknown> & { _headers?: string[] };
  dados_origem_id?: string | null;
  status?: 'Aberto' | 'Em análise' | 'Encerrado';
}

export interface RadioFilters {
  year: string;
  month: string;
  day: string;
  equipe: string;
  desfecho?: string;
  destinacao?: string;
  prefixo?: string;
  cmtVtr?: string;
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
  destinacao: '',
  prefixo: '',
  cmtVtr: '',
  search: '',
  dateFrom: '',
  dateTo: '',
};

/** Colunas da tabela Resgate de Fauna (id, header, key em row.data). */
export const RESGATE_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° OCORRÊNCIA COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'FAUNA', header: 'FAUNA', key: 'FAUNA' },
  { id: 'Hora cadastro', header: 'HORA\n(Cadastro da Ocorrência)', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA\n(Recebido COPOM na Central)', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'HORA\n(Despacho RO)', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'HORA\n(Finalização Ocorrência)', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO\n(Cadastro do 190 - Encaminhamento do COPOM)', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO\n(Despacho da Ocorrência - Finalização)', key: 'Duração despacho/finalização' },
];

/** Colunas da tabela Crimes Ambientais. */
export const CRIMES_TABLE_COLUMNS = [
  { id: 'Data', header: 'DATA', key: 'Data' },
  { id: 'Equipe', header: 'EQUIPE', key: 'Equipe' },
  { id: 'N° OCORRÊNCIA COPOM', header: 'N° OCORRÊNCIA COPOM', key: 'N° OCORRÊNCIA COPOM' },
  { id: 'CRIME', header: 'CRIME', key: 'CRIME' },
  { id: 'Hora cadastro', header: 'HORA\n(Cadastro da Ocorrência)', key: 'Hora cadastro' },
  { id: 'Hora recebido COPOM', header: 'HORA\n(Recebido COPOM na Central)', key: 'Hora recebido COPOM' },
  { id: 'Despacho RO', header: 'HORA\n(Despacho RO)', key: 'Despacho RO' },
  { id: 'Hora finalização', header: 'HORA\n(Finalização Ocorrência)', key: 'Hora finalização' },
  { id: 'Telefone', header: 'TELEFONE', key: 'Telefone' },
  { id: 'LOCAL', header: 'LOCAL', key: 'LOCAL' },
  { id: 'PREFIXO', header: 'PREFIXO', key: 'PREFIXO' },
  { id: 'GRUPAMENTO', header: 'GRUPAMENTO', key: 'GRUPAMENTO' },
  { id: 'CMT VTR', header: 'CMT VTR', key: 'CMT VTR' },
  { id: 'Desfecho', header: 'DESFECHO', key: 'Desfecho' },
  { id: 'DESTINAÇÃO', header: 'DESTINAÇÃO', key: 'DESTINAÇÃO' },
  { id: 'N° RAP', header: 'N° RAP', key: 'N° RAP' },
  { id: 'N° TCO', header: 'N° TCO - PMDF\nOU\nN° TCO/APF-PCDF', key: 'N° TCO' },
  { id: 'Duração cadastro/encaminhamento', header: 'DURAÇÃO\n(Cadastro do 190 - Encaminhamento do COPOM)', key: 'Duração cadastro/encaminhamento' },
  { id: 'Duração despacho/finalização', header: 'DURAÇÃO\n(Despacho da Ocorrência - Finalização)', key: 'Duração despacho/finalização' },
];

export function getDisplayVal(val: unknown): string {
  return val != null && String(val).trim() !== '' ? String(val).trim() : '—';
}

export function getRowData(row: RadioRow, key: string): unknown {
  if (key === 'FAUNA') return row.data['FAUNA'] ?? row.data['Fauna'];
  if (key === 'CRIME') return row.data['CRIME'] ?? row.data['Crime'] ?? row.data['FAUNA'] ?? row.data['Fauna'];
  return row.data[key];
}
