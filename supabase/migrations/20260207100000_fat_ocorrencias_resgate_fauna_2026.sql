-- Tabelas dimensão e fato para Controle de Ocorrências de Resgate de Fauna 2026 (CSV)
-- Cabeçalho do CSV na linha 1; dados a partir da linha 2.

-- Dimensão: equipe (ALFA, BRAVO, CHARLIE, ...)
CREATE TABLE IF NOT EXISTS public.dim_equipe_radio (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- Dimensão: tipo de fauna (SARUÊ, ARARA, AVE, ...)
CREATE TABLE IF NOT EXISTS public.dim_fauna_tipo_radio (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- Dimensão: desfecho (RESGATADO, EVADIDO, VIDA LIVRE, ...)
CREATE TABLE IF NOT EXISTS public.dim_desfecho_resgate_radio (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- Dimensão: destinação (SEM DESTINAÇÃO, HFAUS, SOLTURA, ...)
CREATE TABLE IF NOT EXISTS public.dim_destinacao_radio (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- Fato: ocorrências de resgate de fauna 2026 (data separada em ano, mês, dia)
CREATE TABLE IF NOT EXISTS public.fat_ocorrencias_resgate_fauna_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia date,
  ano smallint CHECK (ano IS NULL OR ano >= 2000),
  mes smallint CHECK (mes IS NULL OR (mes >= 1 AND mes <= 12)),
  dia smallint CHECK (dia IS NULL OR (dia >= 1 AND dia <= 31)),
  equipe text,
  n_ocorrencia_copom text,
  fauna text,
  hora_cadastro text,
  hora_recebido_copom text,
  hora_despacho_ro text,
  hora_finalizacao text,
  telefone text,
  local text,
  prefixo text,
  grupamento text,
  cmt_vtr text,
  desfecho text,
  destinacao text,
  n_rap text,
  duracao_cadastro_encaminhamento text,
  duracao_despacho_finalizacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fat_ocorrencias_resgate_2026_data ON public.fat_ocorrencias_resgate_fauna_2026(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_fat_ocorrencias_resgate_2026_ano_mes_dia ON public.fat_ocorrencias_resgate_fauna_2026(ano, mes, dia);
CREATE INDEX IF NOT EXISTS idx_fat_ocorrencias_resgate_2026_equipe ON public.fat_ocorrencias_resgate_fauna_2026(equipe);

COMMENT ON TABLE public.fat_ocorrencias_resgate_fauna_2026 IS 'Ocorrências de resgate de fauna 2026 - origem CSV Controle de Ocorrências de Resgate de Fauna 2026';

ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_equipe_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_fauna_tipo_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_desfecho_resgate_radio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_destinacao_radio ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura para roles existentes (mesmo critério do radio_operador_data)
DROP POLICY IF EXISTS "Allowed roles can read fat_ocorrencias_resgate_fauna_2026" ON public.fat_ocorrencias_resgate_fauna_2026;
CREATE POLICY "Allowed roles can read fat_ocorrencias_resgate_fauna_2026"
ON public.fat_ocorrencias_resgate_fauna_2026 FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

DROP POLICY IF EXISTS "Allowed roles can read dim_equipe_radio" ON public.dim_equipe_radio;
CREATE POLICY "Allowed roles can read dim_equipe_radio"
ON public.dim_equipe_radio FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allowed roles can read dim_fauna_tipo_radio" ON public.dim_fauna_tipo_radio;
CREATE POLICY "Allowed roles can read dim_fauna_tipo_radio"
ON public.dim_fauna_tipo_radio FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allowed roles can read dim_desfecho_resgate_radio" ON public.dim_desfecho_resgate_radio;
CREATE POLICY "Allowed roles can read dim_desfecho_resgate_radio"
ON public.dim_desfecho_resgate_radio FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Allowed roles can read dim_destinacao_radio" ON public.dim_destinacao_radio;
CREATE POLICY "Allowed roles can read dim_destinacao_radio"
ON public.dim_destinacao_radio FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

GRANT SELECT ON public.fat_ocorrencias_resgate_fauna_2026 TO authenticated;
GRANT SELECT ON public.dim_equipe_radio TO authenticated;
GRANT SELECT ON public.dim_fauna_tipo_radio TO authenticated;
GRANT SELECT ON public.dim_desfecho_resgate_radio TO authenticated;
GRANT SELECT ON public.dim_destinacao_radio TO authenticated;
