-- ============================================
-- VIEWS PARA DASHBOARD AVANÇADO
-- ============================================
-- Views para melhorar performance e permitir análises avançadas
-- Sem remover ou alterar views existentes

-- 1. VIEW: vw_resgates_base
-- ============================================
-- Join da fato com dim_especies_fauna para trazer dados completos
CREATE OR REPLACE VIEW public.vw_resgates_base AS
-- Dados atuais (2025+)
SELECT 
  r.id,
  r.data as data_ocorrencia,
  EXTRACT(YEAR FROM r.data)::integer as ano,
  EXTRACT(MONTH FROM r.data)::integer as mes,
  EXTRACT(DAY FROM r.data)::integer as dia,
  TO_CHAR(r.data, 'Day') as dia_semana,
  r.quantidade,
  r.quantidade_total,
  r.quantidade_adulto,
  r.quantidade_filhote,
  r.atropelamento,
  r.latitude,
  r.longitude,
  -- Dimensões
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
  ra.id as regiao_administrativa_id,
  ra.nome as regiao_administrativa_nome,
  o.id as origem_id,
  o.nome as origem_nome,
  d.id as destinacao_id,
  d.nome as destinacao_nome,
  es.id as estado_saude_id,
  es.nome as estado_saude_nome,
  ev.id as estagio_vida_id,
  ev.nome as estagio_vida_nome,
  df.id as desfecho_id,
  df.nome as desfecho_nome,
  df.tipo as desfecho_tipo,
  'resgate' as tipo_registro
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
LEFT JOIN public.dim_regiao_administrativa ra ON ra.id = r.regiao_administrativa_id
LEFT JOIN public.dim_origem o ON o.id = r.origem_id
LEFT JOIN public.dim_destinacao d ON d.id = r.destinacao_id
LEFT JOIN public.dim_estado_saude es ON es.id = r.estado_saude_id
LEFT JOIN public.dim_estagio_vida ev ON ev.id = r.estagio_vida_id
LEFT JOIN public.dim_desfecho df ON df.id = r.desfecho_id
WHERE r.data >= '2025-01-01'

UNION ALL

-- Dados históricos (2020-2024) - de todas as tabelas fat_resgates_diarios_*
SELECT 
  h.id,
  COALESCE(h.data_ocorrencia, 
    CASE 
      WHEN h."Ano" IS NOT NULL AND h."Mês" IS NOT NULL THEN
        MAKE_DATE(
          h."Ano"::integer,
          CASE h."Mês"
            WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
            WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
            WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
            WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
            ELSE 1
          END,
          1
        )
      ELSE NULL
    END
  ) as data_ocorrencia,
  COALESCE(h."Ano", EXTRACT(YEAR FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer) as ano,
  CASE 
    WHEN h."Mês" = 'Janeiro' THEN 1 WHEN h."Mês" = 'Fevereiro' THEN 2
    WHEN h."Mês" = 'Março' THEN 3 WHEN h."Mês" = 'Abril' THEN 4
    WHEN h."Mês" = 'Maio' THEN 5 WHEN h."Mês" = 'Junho' THEN 6
    WHEN h."Mês" = 'Julho' THEN 7 WHEN h."Mês" = 'Agosto' THEN 8
    WHEN h."Mês" = 'Setembro' THEN 9 WHEN h."Mês" = 'Outubro' THEN 10
    WHEN h."Mês" = 'Novembro' THEN 11 WHEN h."Mês" = 'Dezembro' THEN 12
    ELSE EXTRACT(MONTH FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer
  END as mes,
  EXTRACT(DAY FROM COALESCE(h.data_ocorrencia, CURRENT_DATE))::integer as dia,
  TO_CHAR(COALESCE(h.data_ocorrencia, CURRENT_DATE), 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  -- Dimensões
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  NULL::boolean as exotica,
  NULL::boolean as ameacada,
  NULL::text as imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2020a2024 h

UNION ALL

-- Dados de fat_resgates_diarios_2020 a 2025
SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  -- Dimensões
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2020 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id

UNION ALL

SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2021 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id

UNION ALL

SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2022 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id

UNION ALL

SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2023 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id

UNION ALL

SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2024 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id

UNION ALL

SELECT 
  h.id,
  h.data_ocorrencia,
  EXTRACT(YEAR FROM h.data_ocorrencia)::integer as ano,
  EXTRACT(MONTH FROM h.data_ocorrencia)::integer as mes,
  EXTRACT(DAY FROM h.data_ocorrencia)::integer as dia,
  TO_CHAR(h.data_ocorrencia, 'Day') as dia_semana,
  h.quantidade_resgates as quantidade,
  h.quantidade_resgates as quantidade_total,
  (h.quantidade_resgates - COALESCE(h.quantidade_filhotes, 0)) as quantidade_adulto,
  COALESCE(h.quantidade_filhotes, 0) as quantidade_filhote,
  NULL::text as atropelamento,
  NULL::text as latitude,
  NULL::text as longitude,
  h.especie_id,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(e.exotica, false) as exotica,
  COALESCE(e.ameacada, false) as ameacada,
  e.imagem_url,
  NULL::uuid as regiao_administrativa_id,
  NULL::text as regiao_administrativa_nome,
  NULL::uuid as origem_id,
  'Resgate de Fauna'::text as origem_nome,
  NULL::uuid as destinacao_id,
  NULL::text as destinacao_nome,
  NULL::uuid as estado_saude_id,
  NULL::text as estado_saude_nome,
  NULL::uuid as estagio_vida_id,
  NULL::text as estagio_vida_nome,
  NULL::uuid as desfecho_id,
  NULL::text as desfecho_nome,
  NULL::text as desfecho_tipo,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2025 h
LEFT JOIN public.dim_especies_fauna e ON e.id = h.especie_id;

-- 2. VIEW: vw_resgates_mensal
-- ============================================
-- Agregação mensal com filtros por RA, classe, espécie, desfecho, tipo_registro
CREATE OR REPLACE VIEW public.vw_resgates_mensal AS
SELECT 
  ano,
  mes,
  regiao_administrativa_nome,
  classe_taxonomica,
  especie_id,
  nome_popular,
  nome_cientifico,
  desfecho_nome,
  tipo_registro,
  COUNT(*) as total_registros,
  SUM(quantidade_total) as total_animais,
  COUNT(DISTINCT especie_id) as especies_distintas,
  SUM(CASE WHEN desfecho_nome ILIKE '%soltura%' THEN quantidade_total ELSE 0 END) as total_solturas,
  SUM(CASE WHEN desfecho_nome ILIKE '%óbito%' OR desfecho_nome ILIKE '%obito%' THEN quantidade_total ELSE 0 END) as total_obitos,
  SUM(quantidade_adulto) as total_adultos,
  SUM(quantidade_filhote) as total_filhotes
FROM public.vw_resgates_base
GROUP BY 
  ano, mes, regiao_administrativa_nome, classe_taxonomica, 
  especie_id, nome_popular, nome_cientifico, desfecho_nome, tipo_registro;

-- 3. VIEW: vw_resgates_rank_especies
-- ============================================
-- Ranking de espécies com percentual
CREATE OR REPLACE VIEW public.vw_resgates_rank_especies AS
WITH total_geral AS (
  SELECT SUM(quantidade_total) as total
  FROM public.vw_resgates_base
)
SELECT 
  especie_id,
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  COUNT(*) as total_resgates,
  SUM(quantidade_total) as total_animais,
  ROUND(
    (SUM(quantidade_total)::numeric / NULLIF((SELECT total FROM total_geral), 0)::numeric) * 100,
    2
  ) as percentual
FROM public.vw_resgates_base
WHERE especie_id IS NOT NULL
GROUP BY especie_id, nome_popular, nome_cientifico, classe_taxonomica
ORDER BY total_animais DESC;

-- Comentários
COMMENT ON VIEW public.vw_resgates_base IS 'View base unificada de todos os resgates (atuais e históricos) com joins completos';
COMMENT ON VIEW public.vw_resgates_mensal IS 'Agregação mensal de resgates para análises temporais';
COMMENT ON VIEW public.vw_resgates_rank_especies IS 'Ranking de espécies mais resgatadas com percentuais';

