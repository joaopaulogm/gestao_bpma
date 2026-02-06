-- Tabela fato para a aba Crimes Ambientais (mesma estrutura da de Resgates)
-- e função para popular ambas as fatos + dimensões a partir de radio_operador_data.

CREATE TABLE IF NOT EXISTS public.fat_ocorrencias_crimes_ambientais_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia date,
  ano smallint,
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
  dados_origem_id uuid REFERENCES public.radio_operador_data(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fat_crimes_ambientais_2026_data ON public.fat_ocorrencias_crimes_ambientais_2026(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_ambientais_2026_ano_mes_dia ON public.fat_ocorrencias_crimes_ambientais_2026(ano, mes, dia);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_ambientais_2026_equipe ON public.fat_ocorrencias_crimes_ambientais_2026(equipe);

COMMENT ON TABLE public.fat_ocorrencias_crimes_ambientais_2026 IS 'Ocorrências da aba Crimes Ambientais - populado a partir de radio_operador_data';

ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allowed roles can read fat_ocorrencias_crimes_ambientais_2026" ON public.fat_ocorrencias_crimes_ambientais_2026;
CREATE POLICY "Allowed roles can read fat_ocorrencias_crimes_ambientais_2026"
ON public.fat_ocorrencias_crimes_ambientais_2026 FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);

GRANT SELECT ON public.fat_ocorrencias_crimes_ambientais_2026 TO authenticated;

-- Coluna opcional na fat resgate para referência à origem
ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026
  ADD COLUMN IF NOT EXISTS dados_origem_id uuid REFERENCES public.radio_operador_data(id) ON DELETE SET NULL;

-- Função auxiliar: obtém valor do jsonb pela primeira chave que bate no padrão (ex.: '%data%')
CREATE OR REPLACE FUNCTION public.get_data_key(data jsonb, key_pattern text)
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  k text;
BEGIN
  FOR k IN SELECT jsonb_object_keys(data)
  LOOP
    IF k ILIKE key_pattern THEN
      RETURN (data->>k)::text;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$$;

-- Função que popula as tabelas fato e dimensões a partir de radio_operador_data
CREATE OR REPLACE FUNCTION public.popula_fat_radio_operador()
RETURNS TABLE(inserted_resgates bigint, inserted_crimes bigint, dim_equipe bigint, dim_fauna bigint, dim_desfecho bigint, dim_destinacao bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_date date;
  v_ano smallint; v_mes smallint; v_dia smallint;
  v_data_str text;
  v_equipe text; v_fauna text; v_desfecho text; v_destinacao text;
  cnt_resgates bigint := 0;
  cnt_crimes bigint := 0;
BEGIN
  TRUNCATE public.fat_ocorrencias_resgate_fauna_2026 CASCADE;
  TRUNCATE public.fat_ocorrencias_crimes_ambientais_2026 CASCADE;

  FOR r IN
    SELECT id, sheet_name, data
    FROM public.radio_operador_data
    WHERE row_index > 1
      AND (data->>'_headers') IS NULL
  LOOP
    v_data_str := coalesce(public.get_data_key(r.data, '%data%'), r.data->>'DATA', r.data->>'Data');
    v_equipe   := coalesce(public.get_data_key(r.data, '%equipe%'), r.data->>'EQUIPE', r.data->>'Equipe');
    v_fauna    := coalesce(public.get_data_key(r.data, '%fauna%'), r.data->>'FAUNA', r.data->>'Fauna');
    v_desfecho := coalesce(public.get_data_key(r.data, '%desfecho%'), r.data->>'DESFECHO', r.data->>'Desfecho');
    v_destinacao := coalesce(public.get_data_key(r.data, '%destina%'), r.data->>'DESTINAÇÃO', r.data->>'DESTINACAO', r.data->>'Destinação', r.data->>'Destinacao');

    BEGIN
      v_data_str := replace(replace(trim(coalesce(v_data_str, '')), '.', '/'), ' ', '');
      IF v_data_str ~ '^\d{1,2}/\d{1,2}/\d{2,4}$' THEN
        v_date := to_date(v_data_str, 'DD/MM/YYYY');
      ELSE
        v_date := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_date := NULL;
    END;

    IF v_date IS NOT NULL THEN
      v_ano := extract(year from v_date)::smallint;
      v_mes := extract(month from v_date)::smallint;
      v_dia := extract(day from v_date)::smallint;
    ELSE
      v_ano := NULL; v_mes := NULL; v_dia := NULL;
    END IF;

    IF v_equipe IS NOT NULL AND trim(v_equipe) <> '' AND trim(v_equipe) <> '-' THEN
      INSERT INTO public.dim_equipe_radio (nome) VALUES (trim(v_equipe)) ON CONFLICT (nome) DO NOTHING;
    END IF;
    IF v_fauna IS NOT NULL AND trim(v_fauna) <> '' AND trim(v_fauna) <> '-' THEN
      INSERT INTO public.dim_fauna_tipo_radio (nome) VALUES (trim(v_fauna)) ON CONFLICT (nome) DO NOTHING;
    END IF;
    IF v_desfecho IS NOT NULL AND trim(v_desfecho) <> '' AND trim(v_desfecho) <> '-' THEN
      INSERT INTO public.dim_desfecho_resgate_radio (nome) VALUES (trim(v_desfecho)) ON CONFLICT (nome) DO NOTHING;
    END IF;
    IF v_destinacao IS NOT NULL AND trim(v_destinacao) <> '' AND trim(v_destinacao) <> '-' THEN
      INSERT INTO public.dim_destinacao_radio (nome) VALUES (trim(v_destinacao)) ON CONFLICT (nome) DO NOTHING;
    END IF;

    IF r.sheet_name = 'Resgates de Fauna' THEN
      INSERT INTO public.fat_ocorrencias_resgate_fauna_2026 (
        data_ocorrencia, ano, mes, dia, equipe, fauna, desfecho, destinacao,
        n_ocorrencia_copom, hora_cadastro, hora_recebido_copom, hora_despacho_ro, hora_finalizacao,
        telefone, local, prefixo, grupamento, cmt_vtr, n_rap,
        duracao_cadastro_encaminhamento, duracao_despacho_finalizacao, dados_origem_id
      ) VALUES (
        v_date, v_ano, v_mes, v_dia, nullif(trim(v_equipe), ''), nullif(trim(v_fauna), ''), nullif(trim(v_desfecho), ''), nullif(trim(v_destinacao), ''),
        nullif(trim(r.data->>'N° OCORRÊNCIA COPOM'), ''), nullif(trim(public.get_data_key(r.data, '%hora%cadastro%')), ''),
        nullif(trim(public.get_data_key(r.data, '%hora%recebido%')), ''), nullif(trim(public.get_data_key(r.data, '%despacho%')), ''), nullif(trim(public.get_data_key(r.data, '%finaliza%')), ''),
        nullif(trim(r.data->>'TELEFONE'), ''), nullif(trim(r.data->>'LOCAL'), ''), nullif(trim(r.data->>'PREFIXO'), ''), nullif(trim(r.data->>'GRUPAMENTO'), ''), nullif(trim(r.data->>'CMT VTR'), ''), nullif(trim(r.data->>'N° RAP'), ''),
        nullif(trim(public.get_data_key(r.data, '%dura%cadastro%')), ''), nullif(trim(public.get_data_key(r.data, '%dura%despacho%')), ''), r.id
      );
      cnt_resgates := cnt_resgates + 1;
    ELSIF r.sheet_name = 'Crimes Ambientais' THEN
      INSERT INTO public.fat_ocorrencias_crimes_ambientais_2026 (
        data_ocorrencia, ano, mes, dia, equipe, fauna, desfecho, destinacao,
        n_ocorrencia_copom, hora_cadastro, hora_recebido_copom, hora_despacho_ro, hora_finalizacao,
        telefone, local, prefixo, grupamento, cmt_vtr, n_rap,
        duracao_cadastro_encaminhamento, duracao_despacho_finalizacao, dados_origem_id
      ) VALUES (
        v_date, v_ano, v_mes, v_dia, nullif(trim(v_equipe), ''), nullif(trim(v_fauna), ''), nullif(trim(v_desfecho), ''), nullif(trim(v_destinacao), ''),
        nullif(trim(r.data->>'N° OCORRÊNCIA COPOM'), ''), nullif(trim(public.get_data_key(r.data, '%hora%cadastro%')), ''),
        nullif(trim(public.get_data_key(r.data, '%hora%recebido%')), ''), nullif(trim(public.get_data_key(r.data, '%despacho%')), ''), nullif(trim(public.get_data_key(r.data, '%finaliza%')), ''),
        nullif(trim(r.data->>'TELEFONE'), ''), nullif(trim(r.data->>'LOCAL'), ''), nullif(trim(r.data->>'PREFIXO'), ''), nullif(trim(r.data->>'GRUPAMENTO'), ''), nullif(trim(r.data->>'CMT VTR'), ''), nullif(trim(r.data->>'N° RAP'), ''),
        nullif(trim(public.get_data_key(r.data, '%dura%cadastro%')), ''), nullif(trim(public.get_data_key(r.data, '%dura%despacho%')), ''), r.id
      );
      cnt_crimes := cnt_crimes + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT
    cnt_resgates, cnt_crimes,
    (SELECT count(*) FROM public.dim_equipe_radio),
    (SELECT count(*) FROM public.dim_fauna_tipo_radio),
    (SELECT count(*) FROM public.dim_desfecho_resgate_radio),
    (SELECT count(*) FROM public.dim_destinacao_radio);
END;
$$;

COMMENT ON FUNCTION public.popula_fat_radio_operador() IS 'Popula fat_ocorrencias_resgate_fauna_2026 e fat_ocorrencias_crimes_ambientais_2026 a partir de radio_operador_data. Executar após sincronização.';

-- Permitir execução por service_role e por roles autorizados (via RPC)
GRANT EXECUTE ON FUNCTION public.popula_fat_radio_operador() TO service_role;
GRANT EXECUTE ON FUNCTION public.popula_fat_radio_operador() TO authenticated;
