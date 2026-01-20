-- Tabela de controle para RAPs processados
CREATE TABLE IF NOT EXISTS public.rap_processados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_file_id TEXT NOT NULL UNIQUE,
  drive_file_name TEXT NOT NULL,
  rap_numero TEXT,
  form_type TEXT,
  extracted_data JSONB,
  confidence_score NUMERIC,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rap_processados ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read
CREATE POLICY "Authenticated users can read rap_processados"
  ON public.rap_processados FOR SELECT
  TO authenticated USING (true);

-- Policy for service role to insert/update
CREATE POLICY "Service role can manage rap_processados"
  ON public.rap_processados FOR ALL
  TO service_role USING (true);

-- Index for fast lookups
CREATE INDEX idx_rap_processados_drive_file_id ON public.rap_processados(drive_file_id);
CREATE INDEX idx_rap_processados_rap_numero ON public.rap_processados(rap_numero);