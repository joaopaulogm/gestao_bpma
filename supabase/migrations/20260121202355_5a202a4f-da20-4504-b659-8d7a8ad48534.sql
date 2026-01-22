-- Adicionar novas colunas à tabela stg_abono_2026
ALTER TABLE public.stg_abono_2026
ADD COLUMN IF NOT EXISTS mes_previsao integer,
ADD COLUMN IF NOT EXISTS mes_reprogramado integer,
ADD COLUMN IF NOT EXISTS parcela1_dias integer,
ADD COLUMN IF NOT EXISTS parcela1_sgpol boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela1_campanha boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela2_dias integer,
ADD COLUMN IF NOT EXISTS parcela2_sgpol boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela2_campanha boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela3_dias integer;

-- Adicionar novas colunas à tabela fat_abono
ALTER TABLE public.fat_abono
ADD COLUMN IF NOT EXISTS mes_previsao integer,
ADD COLUMN IF NOT EXISTS mes_reprogramado integer,
ADD COLUMN IF NOT EXISTS parcela1_dias integer,
ADD COLUMN IF NOT EXISTS parcela1_sgpol boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela1_campanha boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela2_dias integer,
ADD COLUMN IF NOT EXISTS parcela2_sgpol boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela2_campanha boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parcela3_dias integer;

-- Atualizar a função sync_stg_to_fat_abono para incluir os novos campos
CREATE OR REPLACE FUNCTION public.sync_stg_to_fat_abono()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO fat_abono (
    efetivo_id, 
    mes, 
    ano, 
    observacao,
    mes_previsao,
    mes_reprogramado,
    parcela1_dias,
    parcela1_inicio,
    parcela1_fim,
    parcela1_sgpol,
    parcela1_campanha,
    parcela2_dias,
    parcela2_inicio,
    parcela2_fim,
    parcela2_sgpol,
    parcela2_campanha,
    parcela3_dias,
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
    s.mes_previsao,
    s.mes_reprogramado,
    s.parcela1_dias,
    s.parcela1_inicio,
    s.parcela1_fim,
    COALESCE(s.parcela1_sgpol, false),
    COALESCE(s.parcela1_campanha, false),
    s.parcela2_dias,
    s.parcela2_inicio,
    s.parcela2_fim,
    COALESCE(s.parcela2_sgpol, false),
    COALESCE(s.parcela2_campanha, false),
    s.parcela3_dias,
    s.parcela3_inicio,
    s.parcela3_fim,
    COALESCE(s.parcela1_inicio, s.parcela2_inicio, s.parcela3_inicio) as data_inicio,
    COALESCE(s.parcela1_fim, s.parcela2_fim, s.parcela3_fim) as data_fim,
    NOW()
  FROM stg_abono_2026 s
  INNER JOIN dim_efetivo e ON e.matricula = s.matricula
  ON CONFLICT (efetivo_id, mes, ano) 
  DO UPDATE SET
    observacao = EXCLUDED.observacao,
    mes_previsao = EXCLUDED.mes_previsao,
    mes_reprogramado = EXCLUDED.mes_reprogramado,
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
    updated_at = NOW();
END;
$function$;