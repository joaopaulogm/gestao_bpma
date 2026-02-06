/** Linha da tabela fat_controle_ocorrencias_resgate_2026 (com joins opcionais das dimensões). */
export interface FatControleResgateRow {
  id: string;
  data: string; // date ISO
  equipe_id: string | null;
  ocorrencia_copom: string | null;
  fauna: string | null;
  hora_cadastro_ocorrencia: string | null; // time
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
  duracao_cadastro_190_encaminhamento_copom: string | null; // interval
  duracao_despacho_finalizacao: string | null;
  created_at: string;
  // Joins (quando select inclui dim_*)
  dim_equipe?: { nome: string | null } | null;
  dim_local?: { nome: string | null } | null;
  dim_grupamento?: { nome: string | null } | null;
  dim_desfecho?: { nome: string | null } | null;
  dim_destinacao?: { nome: string | null } | null;
}

/** Linha da tabela fat_controle_ocorrencias_crime_ambientais_2026. */
export interface FatControleCrimeRow extends FatControleResgateRow {
  crime: string | null;
  numero_tco_pmdf_ou_tco_apf_pcdf: string | null;
}

/** Formata time "HH:mm:ss" para "HH:mm". */
export function formatTimeStr(t: string | null | undefined): string {
  if (t == null || String(t).trim() === '') return '';
  const s = String(t).trim();
  const part = s.split(':');
  if (part.length >= 2) return `${part[0]!.padStart(2, '0')}:${part[1]!.padStart(2, '0')}`;
  return s;
}

/** Formata interval para exibição (ex: "01:30" ou texto). */
export function formatIntervalStr(i: string | null | undefined): string {
  if (i == null || String(i).trim() === '') return '';
  return String(i).trim();
}
