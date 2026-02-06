-- Remover dependências de radio_operador_data e dropar a tabela; aplicar RLS nas fat_controle_*.
-- Página /radio-operador passa a usar fat_controle_ocorrencias_resgate_2026 e fat_controle_ocorrencias_crime_ambientais_2026.

-- 1) Remover FK de fat_ocorrencias_* que referenciam radio_operador_data (se existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fat_ocorrencias_crimes_ambientais_2026' AND column_name = 'dados_origem_id') THEN
    ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 DROP COLUMN IF EXISTS dados_origem_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fat_ocorrencias_resgate_fauna_2026' AND column_name = 'dados_origem_id') THEN
    ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 DROP COLUMN IF EXISTS dados_origem_id;
  END IF;
END $$;

-- 2) Dropar função que referencia radio_operador_data (se existir)
DROP FUNCTION IF EXISTS public.popula_fat_radio_operador();
DROP FUNCTION IF EXISTS public.import_radio_operador_sheet(text[], jsonb[]);

-- 3) Dropar políticas e tabela radio_operador_data
DROP POLICY IF EXISTS "Allowed roles can read radio_operador_data" ON public.radio_operador_data;
DROP POLICY IF EXISTS "Allowed roles can update radio_operador_data" ON public.radio_operador_data;
DROP POLICY IF EXISTS "Authenticated users can read radio_operador_data" ON public.radio_operador_data;
DROP POLICY IF EXISTS "radio_operador_data_select" ON public.radio_operador_data;
DROP TABLE IF EXISTS public.radio_operador_data;

-- 4) RLS nas fat_controle_* (mesmas roles que tinham acesso ao radio_operador_data)
ALTER TABLE public.fat_controle_ocorrencias_resgate_2026 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allowed roles can read fat_controle_resgate_2026" ON public.fat_controle_ocorrencias_resgate_2026;
CREATE POLICY "Allowed roles can read fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);
GRANT SELECT ON public.fat_controle_ocorrencias_resgate_2026 TO authenticated;

ALTER TABLE public.fat_controle_ocorrencias_crime_ambientais_2026 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allowed roles can read fat_controle_crimes_2026" ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE POLICY "Allowed roles can read fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('operador_radio', 'admin', 'comando', 'secao_operacional', 'secao_pessoas')
  )
);
GRANT SELECT ON public.fat_controle_ocorrencias_crime_ambientais_2026 TO authenticated;
