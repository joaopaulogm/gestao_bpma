-- Permite NULL em data_ocorrencia/ano/mes/dia nas fats (quando a data não é parseada)
-- Cada coluna em bloco separado para não falhar se já for nullable

DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 ALTER COLUMN data_ocorrencia DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 ALTER COLUMN ano DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 ALTER COLUMN mes DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_resgate_fauna_2026 ALTER COLUMN dia DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 ALTER COLUMN data_ocorrencia DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 ALTER COLUMN ano DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 ALTER COLUMN mes DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.fat_ocorrencias_crimes_ambientais_2026 ALTER COLUMN dia DROP NOT NULL; EXCEPTION WHEN OTHERS THEN NULL; END $$;
