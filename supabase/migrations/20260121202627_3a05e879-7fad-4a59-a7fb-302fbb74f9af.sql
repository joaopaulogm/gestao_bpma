-- Atualizar sync_abono_2026_from_stg para incluir todos os campos
CREATE OR REPLACE FUNCTION public.sync_abono_2026_from_stg(p_source_sheet text DEFAULT '03 | ABONO 2026'::text)
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
  FROM public.stg_abono_2026 s
  LEFT JOIN public.dim_efetivo e ON e.matricula = s.matricula
  WHERE s.source_sheet = p_source_sheet
    AND e.id IS NULL
    AND s.matricula IS NOT NULL;

  -- Upsert into fat_abono with all fields
  WITH src AS (
    SELECT
      e.id AS efetivo_id,
      s.ano,
      s.mes,
      s.mes_previsao,
      s.mes_reprogramado,
      s.observacao,
      s.parcela1_dias,
      s.parcela1_inicio,
      s.parcela1_fim,
      COALESCE(s.parcela1_sgpol, false) as parcela1_sgpol,
      COALESCE(s.parcela1_campanha, false) as parcela1_campanha,
      s.parcela2_dias,
      s.parcela2_inicio,
      s.parcela2_fim,
      COALESCE(s.parcela2_sgpol, false) as parcela2_sgpol,
      COALESCE(s.parcela2_campanha, false) as parcela2_campanha,
      s.parcela3_dias,
      s.parcela3_inicio,
      s.parcela3_fim,
      COALESCE(s.parcela1_inicio, s.parcela2_inicio, s.parcela3_inicio) as data_inicio,
      COALESCE(s.parcela1_fim, s.parcela2_fim, s.parcela3_fim) as data_fim
    FROM public.stg_abono_2026 s
    JOIN public.dim_efetivo e ON e.matricula = s.matricula
    WHERE s.source_sheet = p_source_sheet
      AND s.mes IS NOT NULL
  )
  INSERT INTO public.fat_abono (
    efetivo_id, ano, mes, mes_previsao, mes_reprogramado, observacao,
    parcela1_dias, parcela1_inicio, parcela1_fim, parcela1_sgpol, parcela1_campanha,
    parcela2_dias, parcela2_inicio, parcela2_fim, parcela2_sgpol, parcela2_campanha,
    parcela3_dias, parcela3_inicio, parcela3_fim,
    data_inicio, data_fim, updated_at
  )
  SELECT 
    efetivo_id,
    COALESCE(ano, 2026),
    mes,
    mes_previsao,
    mes_reprogramado,
    observacao,
    parcela1_dias, parcela1_inicio, parcela1_fim, parcela1_sgpol, parcela1_campanha,
    parcela2_dias, parcela2_inicio, parcela2_fim, parcela2_sgpol, parcela2_campanha,
    parcela3_dias, parcela3_inicio, parcela3_fim,
    data_inicio, data_fim,
    now()
  FROM src
  ON CONFLICT (efetivo_id, ano, mes) 
  DO UPDATE SET
    mes_previsao = EXCLUDED.mes_previsao,
    mes_reprogramado = EXCLUDED.mes_reprogramado,
    observacao = EXCLUDED.observacao,
    parcela1_dias = EXCLUDED.parcela1_dias,
    parcela1_inicio = EXCLUDED.parcela1_inicio,
    parcela1_fim = EXCLUDED.parcela1_fim,
    parcela1_sgpol = EXCLUDED.parcela1_sgpol,
    parcela1_campanha = EXCLUDED.parcela1_campanha,
    parcela2_dias = EXCLUDED.parcela2_dias,
    parcela2_inicio = EXCLUDED.parcela2_inicio,
    parcela2_fim = EXCLUDED.parcela2_fim,
    parcela2_sgpol = EXCLUDED.parcela2_sgpol,
    parcela2_campanha = EXCLUDED.parcela2_campanha,
    parcela3_dias = EXCLUDED.parcela3_dias,
    parcela3_inicio = EXCLUDED.parcela3_inicio,
    parcela3_fim = EXCLUDED.parcela3_fim,
    data_inicio = EXCLUDED.data_inicio,
    data_fim = EXCLUDED.data_fim,
    updated_at = now();

  GET DIAGNOSTICS v_upserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'source_sheet', p_source_sheet,
    'upserted', v_upserted,
    'matriculas_not_found', COALESCE(v_not_found, ARRAY[]::text[])
  );
END;
$function$;