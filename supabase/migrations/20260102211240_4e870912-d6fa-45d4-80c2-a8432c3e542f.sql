-- Corrigir views com CASCADE para remover dependências
DROP VIEW IF EXISTS public.vw_distribuicao_conservacao_historico CASCADE;
DROP VIEW IF EXISTS public.vw_distribuicao_classe_historico CASCADE;
DROP VIEW IF EXISTS public.vw_resumo_anual_resgates CASCADE;
DROP VIEW IF EXISTS public.vw_resumo_especies_historico CASCADE;
DROP VIEW IF EXISTS public.vw_resgates_historicos CASCADE;

-- Recriar views com SECURITY INVOKER explícito
CREATE VIEW public.vw_resgates_historicos 
WITH (security_invoker = true) AS
SELECT 2020 as ano, * FROM public.fat_resgates_diarios_2020
UNION ALL
SELECT 2021 as ano, * FROM public.fat_resgates_diarios_2021
UNION ALL
SELECT 2022 as ano, * FROM public.fat_resgates_diarios_2022
UNION ALL
SELECT 2023 as ano, * FROM public.fat_resgates_diarios_2023
UNION ALL
SELECT 2024 as ano, * FROM public.fat_resgates_diarios_2024;

CREATE VIEW public.vw_resumo_especies_historico 
WITH (security_invoker = true) AS
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

CREATE VIEW public.vw_resumo_anual_resgates 
WITH (security_invoker = true) AS
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

CREATE VIEW public.vw_distribuicao_classe_historico 
WITH (security_invoker = true) AS
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

CREATE VIEW public.vw_distribuicao_conservacao_historico 
WITH (security_invoker = true) AS
SELECT 
  ano,
  estado_de_conservacao,
  COUNT(DISTINCT nome_cientifico) as especies_unicas,
  SUM(quantidade_resgates) as total_resgates
FROM public.vw_resgates_historicos
GROUP BY ano, estado_de_conservacao
ORDER BY ano, estado_de_conservacao;