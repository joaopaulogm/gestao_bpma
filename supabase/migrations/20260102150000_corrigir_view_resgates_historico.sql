-- ============================================
-- CORRIGIR VIEW DE RESGATES PARA INCLUIR TODOS OS DADOS HISTÓRICOS
-- ============================================
-- Esta migration recria a view para garantir que todos os dados de 2020-2024 sejam incluídos

-- Dropar a view existente
DROP MATERIALIZED VIEW IF EXISTS public.mv_estatisticas_resgates CASCADE;

-- Recriar a view corrigida
CREATE MATERIALIZED VIEW public.mv_estatisticas_resgates AS
-- Dados atuais de resgates (apenas de 2025 em diante)
SELECT 
  EXTRACT(YEAR FROM r.data)::integer as ano,
  EXTRACT(MONTH FROM r.data)::integer as mes,
  r.data as data_ocorrencia,
  e.nome_popular,
  e.nome_cientifico,
  e.classe_taxonomica,
  e.ordem_taxonomica,
  e.estado_de_conservacao,
  e.tipo_de_fauna,
  COALESCE(r.quantidade, 0)::numeric as quantidade_resgates,
  0::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhote, 0)::numeric as quantidade_filhotes,
  0::numeric as quantidade_obitos,
  0::numeric as quantidade_feridos,
  COALESCE(r.quantidade_adulto, 0)::numeric as quantidade_adultos,
  r.id::text as registro_id,
  r.origem_id,
  r.destinacao_id,
  r.estado_saude_id,
  r.estagio_vida_id,
  r.atropelamento,
  r.regiao_administrativa_id,
  'resgate' as tipo_registro
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
WHERE r.data >= '2025-01-01' -- Apenas dados atuais de 2025 em diante

UNION ALL

-- Dados históricos (2020-2024) - TODOS os dados da tabela histórica
SELECT 
  h."Ano"::integer as ano,
  CASE 
    WHEN h."Mês" = 'Janeiro' THEN 1
    WHEN h."Mês" = 'Fevereiro' THEN 2
    WHEN h."Mês" = 'Março' THEN 3
    WHEN h."Mês" = 'Abril' THEN 4
    WHEN h."Mês" = 'Maio' THEN 5
    WHEN h."Mês" = 'Junho' THEN 6
    WHEN h."Mês" = 'Julho' THEN 7
    WHEN h."Mês" = 'Agosto' THEN 8
    WHEN h."Mês" = 'Setembro' THEN 9
    WHEN h."Mês" = 'Outubro' THEN 10
    WHEN h."Mês" = 'Novembro' THEN 11
    WHEN h."Mês" = 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(
    h.data_ocorrencia, 
    CASE 
      WHEN h."Ano" IS NOT NULL AND h."Mês" IS NOT NULL THEN
        -- Criar data aproximada se não houver data_ocorrencia
        MAKE_DATE(
          h."Ano"::integer, 
          CASE h."Mês"
            WHEN 'Janeiro' THEN 1
            WHEN 'Fevereiro' THEN 2
            WHEN 'Março' THEN 3
            WHEN 'Abril' THEN 4
            WHEN 'Maio' THEN 5
            WHEN 'Junho' THEN 6
            WHEN 'Julho' THEN 7
            WHEN 'Agosto' THEN 8
            WHEN 'Setembro' THEN 9
            WHEN 'Outubro' THEN 10
            WHEN 'Novembro' THEN 11
            WHEN 'Dezembro' THEN 12
            ELSE 1
          END, 
          1
        )
      ELSE NULL
    END
  ) as data_ocorrencia,
  h.nome_popular,
  h.nome_cientifico,
  h.classe_taxonomica,
  h.ordem_taxonomica,
  h.estado_de_conservacao,
  h.tipo_de_fauna,
  COALESCE(h.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(h.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(h.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(h.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(h.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  h.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2020a2024 h
WHERE h."Ano" IS NOT NULL 
  AND h."Ano" >= 2020 
  AND h."Ano" <= 2024; -- Incluir TODOS os dados de 2020 a 2024

-- Recriar índices
CREATE INDEX idx_mv_resgates_ano ON public.mv_estatisticas_resgates(ano);
CREATE INDEX idx_mv_resgates_mes ON public.mv_estatisticas_resgates(mes);
CREATE INDEX idx_mv_resgates_classe ON public.mv_estatisticas_resgates(classe_taxonomica);
CREATE INDEX idx_mv_resgates_data ON public.mv_estatisticas_resgates(data_ocorrencia);

-- Recriar views dependentes que foram dropadas pelo CASCADE
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_periodo AS
SELECT 
  ano,
  mes,
  COUNT(DISTINCT registro_id) as total_registros,
  SUM(quantidade_resgates) as total_resgates,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  SUM(quantidade_feridos) as total_feridos,
  SUM(quantidade_filhotes) as total_filhotes,
  SUM(quantidade_adultos) as total_adultos,
  COUNT(DISTINCT classe_taxonomica) as classes_diferentes,
  COUNT(DISTINCT nome_popular) as especies_diferentes
FROM public.mv_estatisticas_resgates
GROUP BY ano, mes;

CREATE INDEX idx_mv_periodo_ano_mes ON public.mv_estatisticas_periodo(ano, mes);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_top_especies_resgatadas AS
SELECT 
  nome_popular,
  nome_cientifico,
  classe_taxonomica,
  SUM(quantidade_resgates) as total_resgatado,
  COUNT(DISTINCT registro_id) as total_ocorrencias,
  MIN(data_ocorrencia) as primeira_ocorrencia,
  MAX(data_ocorrencia) as ultima_ocorrencia
FROM public.mv_estatisticas_resgates
WHERE nome_popular IS NOT NULL
GROUP BY nome_popular, nome_cientifico, classe_taxonomica
ORDER BY total_resgatado DESC;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_distribuicao_classe AS
SELECT 
  classe_taxonomica,
  COUNT(DISTINCT registro_id) as total_registros,
  SUM(quantidade_resgates) as total_individuos,
  SUM(quantidade_solturas) as total_solturas,
  SUM(quantidade_obitos) as total_obitos,
  COUNT(DISTINCT nome_popular) as especies_diferentes,
  ROUND(AVG(quantidade_resgates), 2) as media_por_registro
FROM public.mv_estatisticas_resgates
WHERE classe_taxonomica IS NOT NULL
GROUP BY classe_taxonomica
ORDER BY total_individuos DESC;

-- Comentário
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_resgates IS 'Agrega dados de resgates atuais (2025+) e históricos (2020-2024)';

