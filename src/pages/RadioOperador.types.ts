/** Linha da tabela fato resgates (colunas conhecidas). */
export interface FatResgateRow {
  id: string;
  data_ocorrencia: string | null;
  ano: number | null;
  mes: number | null;
  dia: number | null;
  equipe: string | null;
  fauna: string | null;
  desfecho: string | null;
  destinacao: string | null;
  n_ocorrencia_copom: string | null;
  local: string | null;
  hora_cadastro: string | null;
  hora_recebido_copom: string | null;
  hora_despacho_ro: string | null;
  hora_finalizacao: string | null;
  telefone: string | null;
  prefixo: string | null;
  grupamento: string | null;
  cmt_vtr: string | null;
  n_rap: string | null;
  duracao_cadastro_encaminhamento: string | null;
  duracao_despacho_finalizacao: string | null;
  dados_origem_id: string | null;
}

/** Linha da tabela fato crimes (inclui n_tco). */
export interface FatCrimeRow extends FatResgateRow {
  n_tco?: string | null;
}
