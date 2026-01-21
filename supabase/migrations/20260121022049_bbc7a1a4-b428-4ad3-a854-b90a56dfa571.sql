-- Fix sync_dm_2026_from_stg: remove data_fim_norm since it's now a generated column
CREATE OR REPLACE FUNCTION public.sync_dm_2026_from_stg(p_source_sheet text DEFAULT '01 | D. MÉDICA 2026'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Upsert into fat_licencas_medicas (excluding data_fim_norm since it's generated)
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.data_inicio,
      s.data_fim,
      s.dias,
      s.tipo,
      s.cid,
      s.observacao
    FROM public.stg_dm_2026 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.data_inicio IS NOT NULL
  )
  INSERT INTO public.fat_licencas_medicas (
    efetivo_id, ano, data_inicio, data_fim, dias, tipo, cid, observacao, updated_at
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
    now()
  FROM src
  ON CONFLICT (efetivo_id, data_inicio, tipo) 
  DO UPDATE SET
    data_fim = EXCLUDED.data_fim,
    dias = EXCLUDED.dias,
    cid = EXCLUDED.cid,
    observacao = EXCLUDED.observacao,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$function$;

-- Fix sync_restricoes_from_stg: remove data_fim_norm since it's now a generated column
CREATE OR REPLACE FUNCTION public.sync_restricoes_from_stg(p_source_sheet text DEFAULT '06 | RESTRIÇÃO - 2025'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Upsert into fat_restricoes (excluding data_fim_norm since it's generated)
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.data_inicio,
      s.data_fim,
      s.tipo_restricao,
      s.observacao
    FROM public.stg_restricoes_2025 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.data_inicio IS NOT NULL
      AND s.tipo_restricao IS NOT NULL
  )
  INSERT INTO public.fat_restricoes (
    efetivo_id, ano, data_inicio, data_fim, tipo_restricao, observacao, updated_at
  )
  SELECT 
    efetivo_id,
    COALESCE(ano, EXTRACT(YEAR FROM data_inicio)::int),
    data_inicio,
    data_fim,
    tipo_restricao,
    observacao,
    now()
  FROM src
  ON CONFLICT (efetivo_id, data_inicio, tipo_restricao) 
  DO UPDATE SET
    data_fim = EXCLUDED.data_fim,
    observacao = EXCLUDED.observacao,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$function$;