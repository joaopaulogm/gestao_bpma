-- ============================================
-- CRIAÇÃO DA TABELA DE LOGS DE IMPORTAÇÃO DE RAPs
-- ============================================
-- Esta migration cria a tabela para armazenar logs detalhados
-- de todas as tentativas de importação de RAPs do Google Drive
-- ============================================

BEGIN;

-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS public.rap_import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Informações do arquivo
  file_id text NOT NULL,
  file_name text NOT NULL,
  folder_id text,
  modified_time timestamptz,
  
  -- Informações do RAP extraído
  rap_numero text,
  rap_tipo text, -- 'resgate', 'crime_ambiental', 'crime_comum', 'prevencao'
  
  -- Status do processamento
  status text NOT NULL, -- 'success', 'needs_ocr', 'missing_required_fields', 'error'
  
  -- Detalhes de validação
  missing_fields text[], -- Lista de campos faltantes/incompletos
  warnings text[], -- Lista de avisos (ex: especie_id_nao_resolvida)
  
  -- Informações de erro
  error_message text,
  raw_excerpt text, -- Trecho do texto extraído para depuração (limitado)
  
  -- Resultados da inserção
  inserted_ids uuid[], -- IDs dos registros inseridos em fat_registros_de_resgate
  
  -- Metadados adicionais
  processing_time_ms integer, -- Tempo de processamento em milissegundos
  pdf_size_bytes integer -- Tamanho do PDF em bytes
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_status ON public.rap_import_logs(status);
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_created_at ON public.rap_import_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_file_id ON public.rap_import_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_rap_numero ON public.rap_import_logs(rap_numero);
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_rap_tipo ON public.rap_import_logs(rap_tipo);

-- Índice composto para consultas comuns
CREATE INDEX IF NOT EXISTS idx_rap_import_logs_status_created ON public.rap_import_logs(status, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.rap_import_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS: apenas usuários autenticados podem visualizar
DROP POLICY IF EXISTS "Authenticated users can view rap_import_logs" ON public.rap_import_logs;
CREATE POLICY "Authenticated users can view rap_import_logs"
ON public.rap_import_logs
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Política RLS: apenas service role pode inserir (Edge Function)
-- Nota: Edge Functions usam service role, então não precisamos de política INSERT
-- Mas podemos criar uma política genérica se necessário
DROP POLICY IF EXISTS "Service role can insert rap_import_logs" ON public.rap_import_logs;
CREATE POLICY "Service role can insert rap_import_logs"
ON public.rap_import_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Comentários nas colunas
COMMENT ON TABLE public.rap_import_logs IS 'Logs detalhados de importação de RAPs do Google Drive';
COMMENT ON COLUMN public.rap_import_logs.status IS 'Status: success, needs_ocr, missing_required_fields, error';
COMMENT ON COLUMN public.rap_import_logs.missing_fields IS 'Array de campos faltantes que impediram a inserção';
COMMENT ON COLUMN public.rap_import_logs.warnings IS 'Array de avisos (ex: especie_id_nao_resolvida, destinacao_id_nao_resolvida)';
COMMENT ON COLUMN public.rap_import_logs.inserted_ids IS 'IDs dos registros inseridos em fat_registros_de_resgate quando status=success';

COMMIT;
