-- Role Operador de Rádio e tabela para dados da planilha (sync 1x/dia)
-- Acesso: operador_radio e operador (operador + operador de rádio)

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operador_radio';

-- Tabela: dados da planilha Rádio Operador (estrutura flexível por linha)
CREATE TABLE IF NOT EXISTS public.radio_operador_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at timestamptz NOT NULL DEFAULT now(),
  row_index int NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_radio_operador_data_synced_at ON public.radio_operador_data(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_radio_operador_data_row_index ON public.radio_operador_data(row_index);

COMMENT ON TABLE public.radio_operador_data IS 'Dados da planilha Google Sheets Rádio Operador, sincronizados uma vez ao dia.';

-- RLS: apenas operador_radio e operador (e admin) podem ler
ALTER TABLE public.radio_operador_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "radio_operador_data_select" ON public.radio_operador_data;
CREATE POLICY "radio_operador_data_select" ON public.radio_operador_data
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'operador_radio'::app_role)
    OR public.has_role(auth.uid(), 'operador'::app_role)
  );

-- Apenas service role / cron (Edge Function) pode inserir; sem policy INSERT para authenticated.
-- A Edge Function usará service_role e fará TRUNCATE + INSERT.

GRANT SELECT ON public.radio_operador_data TO authenticated;
GRANT SELECT ON public.radio_operador_data TO service_role;
GRANT INSERT, DELETE, TRUNCATE ON public.radio_operador_data TO service_role;
