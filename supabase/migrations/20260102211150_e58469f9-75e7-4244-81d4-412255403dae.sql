-- =====================================================
-- MIGRAÇÃO: Criar tabelas fat_resgates_diarios por ano
-- Permite análise segmentada de resgates históricos
-- =====================================================

-- 1. Criar tabela para 2020
CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2020 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia DATE,
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_de_fauna TEXT,
  estado_de_conservacao TEXT,
  quantidade_resgates NUMERIC DEFAULT 0,
  quantidade_solturas NUMERIC DEFAULT 0,
  quantidade_obitos NUMERIC DEFAULT 0,
  quantidade_feridos NUMERIC DEFAULT 0,
  quantidade_filhotes NUMERIC DEFAULT 0,
  mes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  especie_id UUID REFERENCES public.dim_especies_fauna(id)
);

-- 2. Criar tabela para 2021
CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2021 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia DATE,
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_de_fauna TEXT,
  estado_de_conservacao TEXT,
  quantidade_resgates NUMERIC DEFAULT 0,
  quantidade_solturas NUMERIC DEFAULT 0,
  quantidade_obitos NUMERIC DEFAULT 0,
  quantidade_feridos NUMERIC DEFAULT 0,
  quantidade_filhotes NUMERIC DEFAULT 0,
  mes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  especie_id UUID REFERENCES public.dim_especies_fauna(id)
);

-- 3. Criar tabela para 2022
CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2022 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia DATE,
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_de_fauna TEXT,
  estado_de_conservacao TEXT,
  quantidade_resgates NUMERIC DEFAULT 0,
  quantidade_solturas NUMERIC DEFAULT 0,
  quantidade_obitos NUMERIC DEFAULT 0,
  quantidade_feridos NUMERIC DEFAULT 0,
  quantidade_filhotes NUMERIC DEFAULT 0,
  mes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  especie_id UUID REFERENCES public.dim_especies_fauna(id)
);

-- 4. Criar tabela para 2023
CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2023 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia DATE,
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_de_fauna TEXT,
  estado_de_conservacao TEXT,
  quantidade_resgates NUMERIC DEFAULT 0,
  quantidade_solturas NUMERIC DEFAULT 0,
  quantidade_obitos NUMERIC DEFAULT 0,
  quantidade_feridos NUMERIC DEFAULT 0,
  quantidade_filhotes NUMERIC DEFAULT 0,
  mes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  especie_id UUID REFERENCES public.dim_especies_fauna(id)
);

-- 5. Criar tabela para 2024
CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia DATE,
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_de_fauna TEXT,
  estado_de_conservacao TEXT,
  quantidade_resgates NUMERIC DEFAULT 0,
  quantidade_solturas NUMERIC DEFAULT 0,
  quantidade_obitos NUMERIC DEFAULT 0,
  quantidade_feridos NUMERIC DEFAULT 0,
  quantidade_filhotes NUMERIC DEFAULT 0,
  mes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  especie_id UUID REFERENCES public.dim_especies_fauna(id)
);

-- 6. Habilitar RLS em todas as tabelas
ALTER TABLE public.fat_resgates_diarios_2020 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_diarios_2021 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_diarios_2022 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_diarios_2023 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_resgates_diarios_2024 ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas de leitura para usuários autenticados
CREATE POLICY "Authenticated users can view fat_resgates_diarios_2020"
ON public.fat_resgates_diarios_2020 FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fat_resgates_diarios_2021"
ON public.fat_resgates_diarios_2021 FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fat_resgates_diarios_2022"
ON public.fat_resgates_diarios_2022 FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fat_resgates_diarios_2023"
ON public.fat_resgates_diarios_2023 FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fat_resgates_diarios_2024"
ON public.fat_resgates_diarios_2024 FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. Criar índices para otimizar queries analíticas
CREATE INDEX IF NOT EXISTS idx_resgates_2020_classe ON public.fat_resgates_diarios_2020(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_resgates_2020_tipo ON public.fat_resgates_diarios_2020(tipo_de_fauna);
CREATE INDEX IF NOT EXISTS idx_resgates_2020_conservacao ON public.fat_resgates_diarios_2020(estado_de_conservacao);
CREATE INDEX IF NOT EXISTS idx_resgates_2020_data ON public.fat_resgates_diarios_2020(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_resgates_2020_especie ON public.fat_resgates_diarios_2020(especie_id);

CREATE INDEX IF NOT EXISTS idx_resgates_2021_classe ON public.fat_resgates_diarios_2021(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_resgates_2021_tipo ON public.fat_resgates_diarios_2021(tipo_de_fauna);
CREATE INDEX IF NOT EXISTS idx_resgates_2021_conservacao ON public.fat_resgates_diarios_2021(estado_de_conservacao);
CREATE INDEX IF NOT EXISTS idx_resgates_2021_data ON public.fat_resgates_diarios_2021(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_resgates_2021_especie ON public.fat_resgates_diarios_2021(especie_id);

CREATE INDEX IF NOT EXISTS idx_resgates_2022_classe ON public.fat_resgates_diarios_2022(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_resgates_2022_tipo ON public.fat_resgates_diarios_2022(tipo_de_fauna);
CREATE INDEX IF NOT EXISTS idx_resgates_2022_conservacao ON public.fat_resgates_diarios_2022(estado_de_conservacao);
CREATE INDEX IF NOT EXISTS idx_resgates_2022_data ON public.fat_resgates_diarios_2022(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_resgates_2022_especie ON public.fat_resgates_diarios_2022(especie_id);

CREATE INDEX IF NOT EXISTS idx_resgates_2023_classe ON public.fat_resgates_diarios_2023(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_resgates_2023_tipo ON public.fat_resgates_diarios_2023(tipo_de_fauna);
CREATE INDEX IF NOT EXISTS idx_resgates_2023_conservacao ON public.fat_resgates_diarios_2023(estado_de_conservacao);
CREATE INDEX IF NOT EXISTS idx_resgates_2023_data ON public.fat_resgates_diarios_2023(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_resgates_2023_especie ON public.fat_resgates_diarios_2023(especie_id);

CREATE INDEX IF NOT EXISTS idx_resgates_2024_classe ON public.fat_resgates_diarios_2024(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_resgates_2024_tipo ON public.fat_resgates_diarios_2024(tipo_de_fauna);
CREATE INDEX IF NOT EXISTS idx_resgates_2024_conservacao ON public.fat_resgates_diarios_2024(estado_de_conservacao);
CREATE INDEX IF NOT EXISTS idx_resgates_2024_data ON public.fat_resgates_diarios_2024(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_resgates_2024_especie ON public.fat_resgates_diarios_2024(especie_id);

-- 9. Popular as tabelas com dados da tabela consolidada
-- Vincular especie_id usando nome_cientifico como chave de ligação

-- 2020
INSERT INTO public.fat_resgates_diarios_2020 (
  data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, 
  ordem_taxonomica, tipo_de_fauna, estado_de_conservacao,
  quantidade_resgates, quantidade_solturas, quantidade_obitos, 
  quantidade_feridos, quantidade_filhotes, mes, especie_id
)
SELECT 
  f.data_ocorrencia,
  f.nome_popular,
  f.nome_cientifico,
  f.classe_taxonomica,
  f.ordem_taxonomica,
  f.tipo_de_fauna,
  f.estado_de_conservacao,
  COALESCE(f.quantidade_resgates, 0),
  COALESCE(f.quantidade_solturas, 0),
  COALESCE(f.quantidade_obitos, 0),
  COALESCE(f.quantidade_feridos, 0),
  COALESCE(f.quantidade_filhotes, 0),
  f."Mês",
  d.id
FROM public.fat_resgates_diarios_2020a2024 f
LEFT JOIN public.dim_especies_fauna d ON LOWER(TRIM(d.nome_cientifico)) = LOWER(TRIM(f.nome_cientifico))
WHERE f."Ano" = 2020;

-- 2021
INSERT INTO public.fat_resgates_diarios_2021 (
  data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, 
  ordem_taxonomica, tipo_de_fauna, estado_de_conservacao,
  quantidade_resgates, quantidade_solturas, quantidade_obitos, 
  quantidade_feridos, quantidade_filhotes, mes, especie_id
)
SELECT 
  f.data_ocorrencia,
  f.nome_popular,
  f.nome_cientifico,
  f.classe_taxonomica,
  f.ordem_taxonomica,
  f.tipo_de_fauna,
  f.estado_de_conservacao,
  COALESCE(f.quantidade_resgates, 0),
  COALESCE(f.quantidade_solturas, 0),
  COALESCE(f.quantidade_obitos, 0),
  COALESCE(f.quantidade_feridos, 0),
  COALESCE(f.quantidade_filhotes, 0),
  f."Mês",
  d.id
FROM public.fat_resgates_diarios_2020a2024 f
LEFT JOIN public.dim_especies_fauna d ON LOWER(TRIM(d.nome_cientifico)) = LOWER(TRIM(f.nome_cientifico))
WHERE f."Ano" = 2021;

-- 2022
INSERT INTO public.fat_resgates_diarios_2022 (
  data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, 
  ordem_taxonomica, tipo_de_fauna, estado_de_conservacao,
  quantidade_resgates, quantidade_solturas, quantidade_obitos, 
  quantidade_feridos, quantidade_filhotes, mes, especie_id
)
SELECT 
  f.data_ocorrencia,
  f.nome_popular,
  f.nome_cientifico,
  f.classe_taxonomica,
  f.ordem_taxonomica,
  f.tipo_de_fauna,
  f.estado_de_conservacao,
  COALESCE(f.quantidade_resgates, 0),
  COALESCE(f.quantidade_solturas, 0),
  COALESCE(f.quantidade_obitos, 0),
  COALESCE(f.quantidade_feridos, 0),
  COALESCE(f.quantidade_filhotes, 0),
  f."Mês",
  d.id
FROM public.fat_resgates_diarios_2020a2024 f
LEFT JOIN public.dim_especies_fauna d ON LOWER(TRIM(d.nome_cientifico)) = LOWER(TRIM(f.nome_cientifico))
WHERE f."Ano" = 2022;

-- 2023
INSERT INTO public.fat_resgates_diarios_2023 (
  data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, 
  ordem_taxonomica, tipo_de_fauna, estado_de_conservacao,
  quantidade_resgates, quantidade_solturas, quantidade_obitos, 
  quantidade_feridos, quantidade_filhotes, mes, especie_id
)
SELECT 
  f.data_ocorrencia,
  f.nome_popular,
  f.nome_cientifico,
  f.classe_taxonomica,
  f.ordem_taxonomica,
  f.tipo_de_fauna,
  f.estado_de_conservacao,
  COALESCE(f.quantidade_resgates, 0),
  COALESCE(f.quantidade_solturas, 0),
  COALESCE(f.quantidade_obitos, 0),
  COALESCE(f.quantidade_feridos, 0),
  COALESCE(f.quantidade_filhotes, 0),
  f."Mês",
  d.id
FROM public.fat_resgates_diarios_2020a2024 f
LEFT JOIN public.dim_especies_fauna d ON LOWER(TRIM(d.nome_cientifico)) = LOWER(TRIM(f.nome_cientifico))
WHERE f."Ano" = 2023;

-- 2024
INSERT INTO public.fat_resgates_diarios_2024 (
  data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, 
  ordem_taxonomica, tipo_de_fauna, estado_de_conservacao,
  quantidade_resgates, quantidade_solturas, quantidade_obitos, 
  quantidade_feridos, quantidade_filhotes, mes, especie_id
)
SELECT 
  f.data_ocorrencia,
  f.nome_popular,
  f.nome_cientifico,
  f.classe_taxonomica,
  f.ordem_taxonomica,
  f.tipo_de_fauna,
  f.estado_de_conservacao,
  COALESCE(f.quantidade_resgates, 0),
  COALESCE(f.quantidade_solturas, 0),
  COALESCE(f.quantidade_obitos, 0),
  COALESCE(f.quantidade_feridos, 0),
  COALESCE(f.quantidade_filhotes, 0),
  f."Mês",
  d.id
FROM public.fat_resgates_diarios_2020a2024 f
LEFT JOIN public.dim_especies_fauna d ON LOWER(TRIM(d.nome_cientifico)) = LOWER(TRIM(f.nome_cientifico))
WHERE f."Ano" = 2024;

-- 10. Criar view consolidada para análises multi-ano
CREATE OR REPLACE VIEW public.vw_resgates_historicos AS
SELECT 2020 as ano, * FROM public.fat_resgates_diarios_2020
UNION ALL
SELECT 2021 as ano, * FROM public.fat_resgates_diarios_2021
UNION ALL
SELECT 2022 as ano, * FROM public.fat_resgates_diarios_2022
UNION ALL
SELECT 2023 as ano, * FROM public.fat_resgates_diarios_2023
UNION ALL
SELECT 2024 as ano, * FROM public.fat_resgates_diarios_2024;

-- 11. Criar view de resumo por espécie (agregada)
CREATE OR REPLACE VIEW public.vw_resumo_especies_historico AS
SELECT 
  nome_cientifico,
  nome_popular,
  classe_taxonomica,
  tipo_de_fauna,
  estado_de_conservacao,
  SUM(quantidade_resgates) as total_resgates,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  SUM(quantidade_feridos) as total_feridos,
  SUM(quantidade_filhotes) as total_filhotes,
  COUNT(*) as num_ocorrencias
FROM public.vw_resgates_historicos
GROUP BY nome_cientifico, nome_popular, classe_taxonomica, tipo_de_fauna, estado_de_conservacao;

-- 12. Criar view de resumo por ano
CREATE OR REPLACE VIEW public.vw_resumo_anual_resgates AS
SELECT 
  ano,
  classe_taxonomica,
  tipo_de_fauna,
  COUNT(DISTINCT nome_cientifico) as especies_unicas,
  SUM(quantidade_resgates) as total_resgates,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  SUM(quantidade_feridos) as total_feridos,
  SUM(quantidade_filhotes) as total_filhotes
FROM public.vw_resgates_historicos
GROUP BY ano, classe_taxonomica, tipo_de_fauna
ORDER BY ano, classe_taxonomica;

-- 13. Criar view de distribuição por classe
CREATE OR REPLACE VIEW public.vw_distribuicao_classe_historico AS
SELECT 
  ano,
  classe_taxonomica,
  COUNT(*) as registros,
  SUM(quantidade_resgates) as total_resgates,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos
FROM public.vw_resgates_historicos
GROUP BY ano, classe_taxonomica
ORDER BY ano, classe_taxonomica;

-- 14. Criar view por estado de conservação
CREATE OR REPLACE VIEW public.vw_distribuicao_conservacao_historico AS
SELECT 
  ano,
  estado_de_conservacao,
  COUNT(DISTINCT nome_cientifico) as especies_unicas,
  SUM(quantidade_resgates) as total_resgates
FROM public.vw_resgates_historicos
GROUP BY ano, estado_de_conservacao
ORDER BY ano, estado_de_conservacao;