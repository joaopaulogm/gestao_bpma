-- =====================================================
-- MIGRAÇÃO: Criar views para dashboard avançado
-- Views para otimizar queries e agregar dados
-- =====================================================

-- 1. VIEW: vw_resgates_base
-- Join da fato com dim_especies_fauna para trazer dados completos
-- =====================================================
CREATE OR REPLACE VIEW public.vw_resgates_base AS
-- Dados atuais (2025+)
SELECT 
  r.id,
  r.data as data_ocorrencia,
  EXTRACT(YEAR FROM r.data)::integer as ano,
  EXTRACT(MONTH FROM r.data)::integer as mes,
  EXTRACT(DAY FROM r.data)::integer as dia,
  TO_CHAR(r.data, 'Day') as dia_semana,
  COALESCE(r.quantidade, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_filhote, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_adulto, 0)::numeric as quantidade_adultos,
  COALESCE(r.quantidade_soltura, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_obito, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_ferido, 0)::numeric as quantidade_feridos,
  e.id as especie_id,
  e.nome_popular,
  e.nome_cientifico,
  e.classe_taxonomica,
  e.ordem_taxonomica,
  e.estado_de_conservacao,
  e.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  r.origem_id,
  o.nome as origem_nome,
  r.destinacao_id,
  d.nome as destinacao_nome,
  r.desfecho_id,
  df.nome as desfecho_nome,
  df.tipo as desfecho_tipo,
  r.regiao_administrativa_id,
  ra.nome as regiao_administrativa_nome,
  r.atropelamento,
  r.latitude,
  r.longitude,
  'resgate' as tipo_registro
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
LEFT JOIN public.dim_origem o ON o.id = r.origem_id
LEFT JOIN public.dim_destinacao d ON d.id = r.destinacao_id
LEFT JOIN public.dim_desfecho df ON df.id = r.desfecho_id
LEFT JOIN public.dim_regiao_administrativa ra ON ra.id = r.regiao_administrativa_id
WHERE r.data >= '2025-01-01'

UNION ALL

-- Dados históricos (2020-2024)
SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer as ano,
  EXTRACT(MONTH FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer as mes,
  EXTRACT(DAY FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer as dia,
  TO_CHAR(COALESCE(h.data_ocorrencia, CURRENT_DATE), 'Day') as dia_semana,
  COALESCE(h.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(h.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  (COALESCE(h.quantidade_resgates, 0) - COALESCE(h.quantidade_filhotes, 0))::numeric as quantidade_adultos,
  COALESCE(h.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(h.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(h.quantidade_feridos, 0)::numeric as quantidade_feridos,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  false as exotica, -- Dados históricos não têm essa informação
  false as ameacada, -- Dados históricos não têm essa informação
  NULL::text as imagem_url,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::text as atropelamento,
  NULL::numeric as latitude,
  NULL::numeric as longitude,
  'historico' as tipo_registro
FROM (
  SELECT * FROM public.fat_resgates_diarios_2020
  UNION ALL SELECT * FROM public.fat_resgates_diarios_2021
  UNION ALL SELECT * FROM public.fat_resgates_diarios_2022
  UNION ALL SELECT * FROM public.fat_resgates_diarios_2023
  UNION ALL SELECT * FROM public.fat_resgates_diarios_2024
) h
WHERE EXTRACT(YEAR FROM COALESCE(h.data_ocorrencia, CURRENT_DATE)) >= 2020 
  AND EXTRACT(YEAR FROM COALESCE(h.data_ocorrencia, CURRENT_DATE)) <= 2024;

-- 2. VIEW: vw_resgates_mensal
-- Agregar por ano e mês com filtros
-- =====================================================
CREATE OR REPLACE VIEW public.vw_resgates_mensal AS
SELECT 
  ano,
  mes,
  COUNT(DISTINCT id) as total_registros,
  SUM(quantidade_resgates) as total_animais,
  COUNT(DISTINCT especie_id) as especies_distintas,
  COUNT(DISTINCT classe_taxonomica) as classes_distintas,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  SUM(quantidade_feridos) as total_feridos,
  SUM(quantidade_filhotes) as total_filhotes,
  SUM(quantidade_adultos) as total_adultos,
  -- Campos para filtros
  MAX(regiao_administrativa_nome) as regiao_administrativa_nome,
  MAX(classe_taxonomica) as classe_taxonomica,
  MAX(nome_popular) as especie_nome_popular,
  MAX(nome_cientifico) as especie_nome_cientifico,
  MAX(desfecho_nome) as desfecho_nome,
  MAX(tipo_registro) as tipo_registro
FROM public.vw_resgates_base
GROUP BY ano, mes;

-- 3. VIEW: vw_resgates_rank_especies
-- Ranking de espécies no período filtrado
-- =====================================================
CREATE OR REPLACE VIEW public.vw_resgates_rank_especies AS
SELECT 
  especie_id,
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates) as total_resgates,
  COUNT(DISTINCT id) as total_ocorrencias,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  SUM(quantidade_filhotes) as total_filhotes,
  SUM(quantidade_adultos) as total_adultos,
  -- Calcular percentual do total
  (SUM(quantidade_resgates) * 100.0 / NULLIF(
    (SELECT SUM(quantidade_resgates) FROM public.vw_resgates_base), 0
  ))::numeric(10,2) as percentual
FROM public.vw_resgates_base
WHERE especie_id IS NOT NULL
GROUP BY especie_id, nome_popular, nome_cientifico, classe_taxonomica;

-- 4. VIEW: vw_resgates_sazonalidade
-- Média histórica por mês (2020-2025)
-- =====================================================
CREATE OR REPLACE VIEW public.vw_resgates_sazonalidade AS
SELECT 
  mes,
  AVG(total_animais)::numeric(10,2) as media_historica,
  MIN(total_animais)::numeric(10,2) as minimo_historico,
  MAX(total_animais)::numeric(10,2) as maximo_historico,
  STDDEV(total_animais)::numeric(10,2) as desvio_padrao,
  COUNT(*) as anos_com_dados
FROM public.vw_resgates_mensal
WHERE ano >= 2020 AND ano <= 2025
GROUP BY mes
ORDER BY mes;

-- 5. VIEW: vw_resgates_comparativo_anos
-- Comparativo entre dois anos
-- =====================================================
CREATE OR REPLACE VIEW public.vw_resgates_comparativo_anos AS
SELECT 
  ano,
  mes,
  total_animais,
  total_registros,
  especies_distintas,
  total_solturas,
  total_obitos,
  -- Calcular taxa de soltura
  CASE 
    WHEN total_animais > 0 THEN (total_solturas * 100.0 / total_animais)::numeric(10,2)
    ELSE 0
  END as taxa_soltura
FROM public.vw_resgates_mensal
WHERE ano >= 2020 AND ano <= 2025;

-- Comentários
COMMENT ON VIEW public.vw_resgates_base IS 'View base unificada de resgates (atuais + históricos) com dados de espécies';
COMMENT ON VIEW public.vw_resgates_mensal IS 'Agregação mensal de resgates para análises temporais';
COMMENT ON VIEW public.vw_resgates_rank_especies IS 'Ranking de espécies mais resgatadas com percentuais';
COMMENT ON VIEW public.vw_resgates_sazonalidade IS 'Média histórica mensal para análise sazonal';
COMMENT ON VIEW public.vw_resgates_comparativo_anos IS 'Dados mensais por ano para comparações';

