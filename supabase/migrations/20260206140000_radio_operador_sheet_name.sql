-- Permite armazenar dados de duas abas: Resgates de Fauna e Crimes Ambientais
ALTER TABLE public.radio_operador_data
  ADD COLUMN IF NOT EXISTS sheet_name text;

CREATE INDEX IF NOT EXISTS idx_radio_operador_data_sheet_name
  ON public.radio_operador_data(sheet_name);

COMMENT ON COLUMN public.radio_operador_data.sheet_name IS 'Nome da aba da planilha: Resgates de Fauna ou Crimes Ambientais';
