-- Adicionar colunas para as 3 parcelas de abono na staging table
ALTER TABLE public.stg_abono_2026 
ADD COLUMN IF NOT EXISTS parcela1_inicio date,
ADD COLUMN IF NOT EXISTS parcela1_fim date,
ADD COLUMN IF NOT EXISTS parcela2_inicio date,
ADD COLUMN IF NOT EXISTS parcela2_fim date,
ADD COLUMN IF NOT EXISTS parcela3_inicio date,
ADD COLUMN IF NOT EXISTS parcela3_fim date;

-- Adicionar colunas para as 3 parcelas na tabela fat_abono
-- Renomear data_inicio/data_fim existentes para parcela1
ALTER TABLE public.fat_abono 
ADD COLUMN IF NOT EXISTS parcela1_inicio date,
ADD COLUMN IF NOT EXISTS parcela1_fim date,
ADD COLUMN IF NOT EXISTS parcela2_inicio date,
ADD COLUMN IF NOT EXISTS parcela2_fim date,
ADD COLUMN IF NOT EXISTS parcela3_inicio date,
ADD COLUMN IF NOT EXISTS parcela3_fim date,
ADD COLUMN IF NOT EXISTS parcela integer DEFAULT 1;

-- Migrar dados existentes de data_inicio/data_fim para parcela1
UPDATE public.fat_abono 
SET parcela1_inicio = data_inicio, parcela1_fim = data_fim
WHERE data_inicio IS NOT NULL OR data_fim IS NOT NULL;

-- Criar ou substituir função RPC para sincronizar abono com suporte a 3 parcelas
CREATE OR REPLACE FUNCTION public.sync_stg_to_fat_abono()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar registros existentes e inserir novos
  INSERT INTO fat_abono (
    efetivo_id, 
    mes, 
    ano, 
    observacao,
    parcela1_inicio,
    parcela1_fim,
    parcela2_inicio,
    parcela2_fim,
    parcela3_inicio,
    parcela3_fim,
    data_inicio,
    data_fim,
    updated_at
  )
  SELECT 
    e.id as efetivo_id,
    s.mes,
    s.ano,
    s.observacao,
    s.parcela1_inicio,
    s.parcela1_fim,
    s.parcela2_inicio,
    s.parcela2_fim,
    s.parcela3_inicio,
    s.parcela3_fim,
    -- Manter data_inicio/data_fim com a primeira parcela disponível
    COALESCE(s.parcela1_inicio, s.parcela2_inicio, s.parcela3_inicio) as data_inicio,
    COALESCE(s.parcela1_fim, s.parcela2_fim, s.parcela3_fim) as data_fim,
    NOW()
  FROM stg_abono_2026 s
  INNER JOIN dim_efetivo e ON e.matricula = s.matricula
  ON CONFLICT (efetivo_id, mes, ano) 
  DO UPDATE SET
    observacao = EXCLUDED.observacao,
    parcela1_inicio = EXCLUDED.parcela1_inicio,
    parcela1_fim = EXCLUDED.parcela1_fim,
    parcela2_inicio = EXCLUDED.parcela2_inicio,
    parcela2_fim = EXCLUDED.parcela2_fim,
    parcela3_inicio = EXCLUDED.parcela3_inicio,
    parcela3_fim = EXCLUDED.parcela3_fim,
    data_inicio = EXCLUDED.data_inicio,
    data_fim = EXCLUDED.data_fim,
    updated_at = NOW();
END;
$$;