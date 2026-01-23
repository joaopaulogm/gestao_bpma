
-- =====================================================
-- RPC FUNCTIONS FOR MATERIALIZATION FROM STAGING
-- =====================================================

-- 1. Sync Dispensas Médicas from staging to fat_licencas_medicas
CREATE OR REPLACE FUNCTION public.sync_dm_2026_from_stg(p_source_sheet text DEFAULT '01 | D. MÉDICAS 2026')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_upserted integer := 0;
  v_not_found text[] := ARRAY[]::text[];
BEGIN
  -- Find matriculas that don't exist in dim_efetivo
  SELECT array_agg(DISTINCT s.matricula)
  INTO v_not_found
  FROM public.stg_dm_2026 s
  LEFT JOIN public.dim_efetivo e ON e.matricula = s.matricula
  WHERE s.source_sheet = p_source_sheet
    AND e.id IS NULL
    AND s.matricula IS NOT NULL;

  -- Upsert into fat_licencas_medicas
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.data_inicio,
      s.data_fim,
      s.dias,
      s.tipo,
      s.cid,
      s.observacao,
      COALESCE(s.data_fim, s.data_inicio + COALESCE(s.dias, 1) * INTERVAL '1 day' - INTERVAL '1 day')::date AS data_fim_norm
    FROM public.stg_dm_2026 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.data_inicio IS NOT NULL
  )
  INSERT INTO public.fat_licencas_medicas (
    efetivo_id, ano, data_inicio, data_fim, dias, tipo, cid, observacao, data_fim_norm, updated_at
  )
  SELECT 
    efetivo_id,
    COALESCE(ano, EXTRACT(YEAR FROM data_inicio)::int),
    data_inicio,
    data_fim,
    dias,
    tipo,
    cid,
    observacao,
    data_fim_norm,
    now()
  FROM src
  ON CONFLICT (efetivo_id, data_inicio, tipo) 
  DO UPDATE SET
    data_fim = EXCLUDED.data_fim,
    dias = EXCLUDED.dias,
    cid = EXCLUDED.cid,
    observacao = EXCLUDED.observacao,
    data_fim_norm = EXCLUDED.data_fim_norm,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$$;

-- 2. Sync Abono from staging to fat_abono
CREATE OR REPLACE FUNCTION public.sync_abono_2026_from_stg(p_source_sheet text DEFAULT '03 | ABONO 2026')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_upserted integer := 0;
  v_not_found text[] := ARRAY[]::text[];
BEGIN
  -- Find matriculas that don't exist
  SELECT array_agg(DISTINCT s.matricula)
  INTO v_not_found
  FROM public.stg_abono_2026 s
  LEFT JOIN public.dim_efetivo e ON e.matricula = s.matricula
  WHERE s.source_sheet = p_source_sheet
    AND e.id IS NULL
    AND s.matricula IS NOT NULL;

  -- Upsert into fat_abono
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.mes,
      s.observacao
    FROM public.stg_abono_2026 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.mes IS NOT NULL
  )
  INSERT INTO public.fat_abono (
    efetivo_id, ano, mes, observacao, updated_at
  )
  SELECT 
    efetivo_id,
    COALESCE(ano, 2026),
    mes,
    observacao,
    now()
  FROM src
  ON CONFLICT (efetivo_id, ano, mes) 
  DO UPDATE SET
    observacao = EXCLUDED.observacao,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$$;

-- 3. Sync Restrições from staging to fat_restricoes
CREATE OR REPLACE FUNCTION public.sync_restricoes_from_stg(p_source_sheet text DEFAULT '06 | RESTRIÇÕES 2025')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_upserted integer := 0;
  v_not_found text[] := ARRAY[]::text[];
BEGIN
  -- Find matriculas that don't exist
  SELECT array_agg(DISTINCT s.matricula)
  INTO v_not_found
  FROM public.stg_restricoes_2025 s
  LEFT JOIN public.dim_efetivo e ON e.matricula = s.matricula
  WHERE s.source_sheet = p_source_sheet
    AND e.id IS NULL
    AND s.matricula IS NOT NULL;

  -- Upsert into fat_restricoes
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.data_inicio,
      s.data_fim,
      s.tipo_restricao,
      s.observacao,
      COALESCE(s.data_fim, '2099-12-31'::date) AS data_fim_norm
    FROM public.stg_restricoes_2025 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.data_inicio IS NOT NULL
      AND s.tipo_restricao IS NOT NULL
  )
  INSERT INTO public.fat_restricoes (
    efetivo_id, ano, data_inicio, data_fim, tipo_restricao, observacao, data_fim_norm, updated_at
  )
  SELECT 
    efetivo_id,
    COALESCE(ano, EXTRACT(YEAR FROM data_inicio)::int),
    data_inicio,
    data_fim,
    tipo_restricao,
    observacao,
    data_fim_norm,
    now()
  FROM src
  ON CONFLICT (efetivo_id, data_inicio, tipo_restricao) 
  DO UPDATE SET
    data_fim = EXCLUDED.data_fim,
    observacao = EXCLUDED.observacao,
    data_fim_norm = EXCLUDED.data_fim_norm,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$$;

-- Add ano column to stg_dm_2026 if not exists
ALTER TABLE public.stg_dm_2026 ADD COLUMN IF NOT EXISTS ano INTEGER DEFAULT 2026;
