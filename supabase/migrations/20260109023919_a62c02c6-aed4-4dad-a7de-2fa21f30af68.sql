-- Drop views existentes e recriar
DROP VIEW IF EXISTS public.vw_ranking_especies_historico CASCADE;
DROP VIEW IF EXISTS public.vw_distribuicao_classe_historico CASCADE;
DROP VIEW IF EXISTS public.vw_serie_mensal_historico CASCADE;
DROP VIEW IF EXISTS public.vw_kpis_anuais_historico CASCADE;
DROP VIEW IF EXISTS public.vw_especies_nao_mapeadas CASCADE;
DROP VIEW IF EXISTS public.vw_anos_disponiveis CASCADE;
DROP VIEW IF EXISTS public.vw_kpis_anuais_formulario CASCADE;
DROP VIEW IF EXISTS public.vw_serie_mensal_formulario CASCADE;
DROP VIEW IF EXISTS public.vw_resgates_basicos_union CASCADE;

-- View unificada para resgates básicos (histórico 2020-2024)
CREATE VIEW public.vw_resgates_basicos_union AS
SELECT 
  2020 as ano, data_ocorrencia as data, mes as mes_texto, nome_popular as nome_popular_raw,
  public.normalize_text(nome_popular) as nome_popular_norm, nome_cientifico, classe_taxonomica,
  COALESCE(quantidade_resgates, 0)::int as total_resgates, COALESCE(quantidade_solturas, 0)::int as total_solturas,
  COALESCE(quantidade_obitos, 0)::int as total_obitos, COALESCE(quantidade_feridos, 0)::int as total_feridos,
  COALESCE(quantidade_filhotes, 0)::int as total_filhotes, especie_id
FROM public.fat_resgates_diarios_2020
UNION ALL
SELECT 2021, data_ocorrencia, mes, nome_popular, public.normalize_text(nome_popular), nome_cientifico, classe_taxonomica,
  COALESCE(quantidade_resgates, 0)::int, COALESCE(quantidade_solturas, 0)::int, COALESCE(quantidade_obitos, 0)::int,
  COALESCE(quantidade_feridos, 0)::int, COALESCE(quantidade_filhotes, 0)::int, especie_id
FROM public.fat_resgates_diarios_2021
UNION ALL
SELECT 2022, data_ocorrencia, mes, nome_popular, public.normalize_text(nome_popular), nome_cientifico, classe_taxonomica,
  COALESCE(quantidade_resgates, 0)::int, COALESCE(quantidade_solturas, 0)::int, COALESCE(quantidade_obitos, 0)::int,
  COALESCE(quantidade_feridos, 0)::int, COALESCE(quantidade_filhotes, 0)::int, especie_id
FROM public.fat_resgates_diarios_2022
UNION ALL
SELECT 2023, data_ocorrencia, mes, nome_popular, public.normalize_text(nome_popular), nome_cientifico, classe_taxonomica,
  COALESCE(quantidade_resgates, 0)::int, COALESCE(quantidade_solturas, 0)::int, COALESCE(quantidade_obitos, 0)::int,
  COALESCE(quantidade_feridos, 0)::int, COALESCE(quantidade_filhotes, 0)::int, especie_id
FROM public.fat_resgates_diarios_2023
UNION ALL
SELECT 2024, data_ocorrencia, mes, nome_popular, public.normalize_text(nome_popular), nome_cientifico, classe_taxonomica,
  COALESCE(quantidade_resgates, 0)::int, COALESCE(quantidade_solturas, 0)::int, COALESCE(quantidade_obitos, 0)::int,
  COALESCE(quantidade_feridos, 0)::int, COALESCE(quantidade_filhotes, 0)::int, especie_id
FROM public.fat_resgates_diarios_2024;

-- View de KPIs por ano
CREATE VIEW public.vw_kpis_anuais_historico AS
SELECT ano, SUM(total_resgates) as total_animais_resgatados, SUM(total_solturas) as total_solturas,
  SUM(total_obitos) as total_obitos, SUM(total_feridos) as total_feridos, SUM(total_filhotes) as total_filhotes,
  COUNT(*) as total_ocorrencias, COUNT(DISTINCT especie_id) FILTER (WHERE especie_id IS NOT NULL) as riqueza_especies,
  ROUND(SUM(total_obitos)::numeric / NULLIF(SUM(total_resgates), 0) * 100, 2) as taxa_mortalidade,
  ROUND(SUM(total_solturas)::numeric / NULLIF(SUM(total_resgates), 0) * 100, 2) as taxa_soltura
FROM public.vw_resgates_basicos_union GROUP BY ano;

-- View série mensal
CREATE VIEW public.vw_serie_mensal_historico AS
SELECT ano, EXTRACT(MONTH FROM data)::int as mes, SUM(total_resgates) as total_resgates,
  SUM(total_solturas) as total_solturas, SUM(total_obitos) as total_obitos
FROM public.vw_resgates_basicos_union WHERE data IS NOT NULL
GROUP BY ano, EXTRACT(MONTH FROM data) ORDER BY ano, mes;

-- View distribuição por classe
CREATE VIEW public.vw_distribuicao_classe_historico AS
SELECT ano, classe_taxonomica, SUM(total_resgates) as total_resgates, SUM(total_solturas) as total_solturas
FROM public.vw_resgates_basicos_union GROUP BY ano, classe_taxonomica;

-- View ranking espécies
CREATE VIEW public.vw_ranking_especies_historico AS
SELECT ano, especie_id, nome_popular_norm, nome_cientifico, classe_taxonomica, SUM(total_resgates) as total_resgates
FROM public.vw_resgates_basicos_union GROUP BY ano, especie_id, nome_popular_norm, nome_cientifico, classe_taxonomica;

-- View anos disponíveis
CREATE VIEW public.vw_anos_disponiveis AS
SELECT DISTINCT ano, 'historico' as fonte, true as tem_resgate, false as tem_crime_ambiental
FROM public.vw_resgates_basicos_union
UNION
SELECT EXTRACT(YEAR FROM data)::int, 'formulario', true, true
FROM public.fat_registros_de_resgate WHERE data >= '2026-01-01'
GROUP BY EXTRACT(YEAR FROM data)
ORDER BY ano DESC;