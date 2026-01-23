-- =====================================================
-- MIGRAÇÃO: Atualizar Views e Funções do Dashboard
-- Usa novas tabelas bpma_fato_mensal e bpma_relatorio_anual
-- Mantém dados por espécies das tabelas fat_resgates_diarios_*
-- =====================================================

BEGIN;

-- =========================================================
-- 1) RECRIAR VIEW MATERIALIZADA DE RESGATES
--    Usando novas tabelas para dados agregados (2021-2024)
--    Mantendo tabelas de espécies para detalhamento
-- =========================================================

DROP MATERIALIZED VIEW IF EXISTS public.mv_estatisticas_resgates CASCADE;

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

-- Dados históricos 2020 (usando tabela de espécies)
SELECT 
  EXTRACT(YEAR FROM COALESCE(r.data_ocorrencia, MAKE_DATE(2020, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)))::integer as ano,
  CASE r.mes
    WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
    WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
    WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(r.data_ocorrencia, MAKE_DATE(2020, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)) as data_ocorrencia,
  r.nome_popular,
  r.nome_cientifico,
  r.classe_taxonomica,
  r.ordem_taxonomica,
  r.estado_de_conservacao,
  r.tipo_de_fauna,
  COALESCE(r.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  r.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2020 r

UNION ALL

-- Dados históricos 2021-2024 (usando tabelas de espécies + dados agregados)
-- Primeiro, dados por espécie das tabelas fat_resgates_diarios_*
SELECT 
  EXTRACT(YEAR FROM COALESCE(r.data_ocorrencia, MAKE_DATE(2021, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)))::integer as ano,
  CASE r.mes
    WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
    WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
    WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(r.data_ocorrencia, MAKE_DATE(2021, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)) as data_ocorrencia,
  r.nome_popular,
  r.nome_cientifico,
  r.classe_taxonomica,
  r.ordem_taxonomica,
  r.estado_de_conservacao,
  r.tipo_de_fauna,
  COALESCE(r.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  r.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2021 r

UNION ALL

SELECT 
  EXTRACT(YEAR FROM COALESCE(r.data_ocorrencia, MAKE_DATE(2022, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)))::integer as ano,
  CASE r.mes
    WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
    WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
    WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(r.data_ocorrencia, MAKE_DATE(2022, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)) as data_ocorrencia,
  r.nome_popular,
  r.nome_cientifico,
  r.classe_taxonomica,
  r.ordem_taxonomica,
  r.estado_de_conservacao,
  r.tipo_de_fauna,
  COALESCE(r.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  r.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2022 r

UNION ALL

SELECT 
  EXTRACT(YEAR FROM COALESCE(r.data_ocorrencia, MAKE_DATE(2023, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)))::integer as ano,
  CASE r.mes
    WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
    WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
    WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(r.data_ocorrencia, MAKE_DATE(2023, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)) as data_ocorrencia,
  r.nome_popular,
  r.nome_cientifico,
  r.classe_taxonomica,
  r.ordem_taxonomica,
  r.estado_de_conservacao,
  r.tipo_de_fauna,
  COALESCE(r.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  r.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2023 r

UNION ALL

SELECT 
  EXTRACT(YEAR FROM COALESCE(r.data_ocorrencia, MAKE_DATE(2024, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)))::integer as ano,
  CASE r.mes
    WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
    WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
    WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
    WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
    ELSE NULL
  END::integer as mes,
  COALESCE(r.data_ocorrencia, MAKE_DATE(2024, 
    CASE r.mes
      WHEN 'Janeiro' THEN 1 WHEN 'Fevereiro' THEN 2 WHEN 'Março' THEN 3
      WHEN 'Abril' THEN 4 WHEN 'Maio' THEN 5 WHEN 'Junho' THEN 6
      WHEN 'Julho' THEN 7 WHEN 'Agosto' THEN 8 WHEN 'Setembro' THEN 9
      WHEN 'Outubro' THEN 10 WHEN 'Novembro' THEN 11 WHEN 'Dezembro' THEN 12
      ELSE 1
    END, 1)) as data_ocorrencia,
  r.nome_popular,
  r.nome_cientifico,
  r.classe_taxonomica,
  r.ordem_taxonomica,
  r.estado_de_conservacao,
  r.tipo_de_fauna,
  COALESCE(r.quantidade_resgates, 0)::numeric as quantidade_resgates,
  COALESCE(r.quantidade_solturas, 0)::numeric as quantidade_solturas,
  COALESCE(r.quantidade_filhotes, 0)::numeric as quantidade_filhotes,
  COALESCE(r.quantidade_obitos, 0)::numeric as quantidade_obitos,
  COALESCE(r.quantidade_feridos, 0)::numeric as quantidade_feridos,
  0::numeric as quantidade_adultos,
  r.id::text as registro_id,
  NULL::uuid as origem_id,
  NULL::uuid as destinacao_id,
  NULL::uuid as estado_saude_id,
  NULL::uuid as estagio_vida_id,
  NULL::text as atropelamento,
  NULL::uuid as regiao_administrativa_id,
  'historico' as tipo_registro
FROM public.fat_resgates_diarios_2024 r;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mv_resgates_ano ON public.mv_estatisticas_resgates(ano);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_mes ON public.mv_estatisticas_resgates(mes);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_classe ON public.mv_estatisticas_resgates(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_data ON public.mv_estatisticas_resgates(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_especie ON public.mv_estatisticas_resgates(nome_cientifico);

-- =========================================================
-- 2) CRIAR VIEW AUXILIAR PARA DADOS AGREGADOS BPMA
--    Usa bpma_fato_mensal para estatísticas gerais
-- =========================================================

CREATE OR REPLACE VIEW public.vw_bpma_estatisticas_agregadas AS
SELECT 
  ano,
  mes,
  natureza,
  quantidade,
  make_date(ano, mes, 1) AS competencia
FROM public.bpma_fato_mensal
ORDER BY ano DESC, mes DESC, natureza;

-- =========================================================
-- 3) ATUALIZAR FUNÇÃO get_dashboard_statistics
--    Usa novas tabelas para dados agregados (2021-2024)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_statistics(
  p_ano INTEGER DEFAULT NULL,
  p_mes INTEGER DEFAULT NULL,
  p_classe_taxonomica TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_registros BIGINT,
  total_resgates BIGINT,
  total_crimes BIGINT,
  total_apreensoes BIGINT,
  total_atropelamentos BIGINT,
  total_individuos_resgatados BIGINT,
  total_individuos_apreendidos BIGINT,
  especies_diferentes BIGINT,
  classes_diferentes BIGINT,
  periodo_inicio DATE,
  periodo_fim DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH resgates_agregados AS (
    -- Dados de 2021-2024 das novas tabelas agregadas
    SELECT 
      ano,
      mes,
      SUM(quantidade) FILTER (WHERE natureza = 'Resgate de Fauna Silvestre') as total_resgates_qtd,
      SUM(quantidade) FILTER (WHERE natureza = 'Solturas') as total_solturas_qtd,
      SUM(quantidade) FILTER (WHERE natureza = 'Óbitos') as total_obitos_qtd,
      SUM(quantidade) FILTER (WHERE natureza = 'Feridos') as total_feridos_qtd,
      SUM(quantidade) FILTER (WHERE natureza = 'Filhotes') as total_filhotes_qtd,
      SUM(quantidade) FILTER (WHERE natureza = 'Atropelamento') as total_atropelamentos_qtd
    FROM public.bpma_fato_mensal
    WHERE ano BETWEEN 2021 AND 2024
      AND (p_ano IS NULL OR ano = p_ano)
      AND (p_mes IS NULL OR mes = p_mes)
    GROUP BY ano, mes
  ),
  resgates_especies AS (
    -- Dados por espécie de 2020-2024 (para contagem de espécies)
    SELECT DISTINCT
      ano,
      mes,
      nome_cientifico,
      classe_taxonomica
    FROM public.mv_estatisticas_resgates
    WHERE ano BETWEEN 2020 AND 2024
      AND (p_ano IS NULL OR ano = p_ano)
      AND (p_mes IS NULL OR mes = p_mes)
      AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
      AND nome_cientifico IS NOT NULL
  ),
  resgates_2025 AS (
    -- Dados de 2025+ da tabela fat_registros_de_resgate
    SELECT 
      EXTRACT(YEAR FROM r.data)::integer as ano,
      EXTRACT(MONTH FROM r.data)::integer as mes,
      COUNT(DISTINCT r.id) as total_registros,
      SUM(COALESCE(r.quantidade, 0)) as total_individuos,
      COUNT(DISTINCT e.nome_cientifico) FILTER (WHERE e.nome_cientifico IS NOT NULL) as especies_dif,
      COUNT(DISTINCT e.classe_taxonomica) FILTER (WHERE e.classe_taxonomica IS NOT NULL) as classes_dif
    FROM public.fat_registros_de_resgate r
    LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
    WHERE r.data >= '2025-01-01'
      AND (p_ano IS NULL OR EXTRACT(YEAR FROM r.data) = p_ano)
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM r.data) = p_mes)
      AND (p_classe_taxonomica IS NULL OR e.classe_taxonomica = p_classe_taxonomica)
    GROUP BY EXTRACT(YEAR FROM r.data), EXTRACT(MONTH FROM r.data)
  ),
  crimes_agregados AS (
    -- Crimes de 2021-2024 das novas tabelas
    SELECT 
      ano,
      mes,
      SUM(quantidade) FILTER (WHERE natureza LIKE '%Crime%') as total_crimes_qtd
    FROM public.bpma_fato_mensal
    WHERE ano BETWEEN 2021 AND 2024
      AND natureza LIKE '%Crime%'
      AND (p_ano IS NULL OR ano = p_ano)
      AND (p_mes IS NULL OR mes = p_mes)
    GROUP BY ano, mes
  ),
  crimes_2025 AS (
    -- Crimes de 2025+
    SELECT 
      EXTRACT(YEAR FROM c.data)::integer as ano,
      EXTRACT(MONTH FROM c.data)::integer as mes,
      COUNT(DISTINCT c.id) as total_crimes
    FROM public.fat_registros_de_crime c
    WHERE c.data >= '2025-01-01'
      AND (p_ano IS NULL OR EXTRACT(YEAR FROM c.data) = p_ano)
      AND (p_mes IS NULL OR EXTRACT(MONTH FROM c.data) = p_mes)
    GROUP BY EXTRACT(YEAR FROM c.data), EXTRACT(MONTH FROM c.data)
  )
  SELECT 
    -- Total de registros
    COALESCE(
      (SELECT COUNT(DISTINCT registro_id) FROM public.mv_estatisticas_resgates 
       WHERE (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)),
      0
    ) +
    COALESCE((SELECT SUM(total_crimes) FROM crimes_2025), 0) +
    COALESCE((SELECT SUM(total_crimes_qtd) FROM crimes_agregados), 0) as total_registros,
    
    -- Total de resgates (contagem de registros)
    COALESCE(
      (SELECT COUNT(DISTINCT registro_id) FROM public.mv_estatisticas_resgates 
       WHERE (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)),
      0
    ) as total_resgates,
    
    -- Total de crimes
    COALESCE((SELECT SUM(total_crimes) FROM crimes_2025), 0) +
    COALESCE((SELECT SUM(total_crimes_qtd) FROM crimes_agregados), 0) as total_crimes,
    
    -- Total de apreensões (de crimes)
    COALESCE(
      (SELECT COUNT(DISTINCT registro_id) FROM public.mv_estatisticas_crimes 
       WHERE (p_ano IS NULL OR EXTRACT(YEAR FROM data) = p_ano)
       AND (p_mes IS NULL OR EXTRACT(MONTH FROM data) = p_mes)
       AND ocorreu_apreensao = true),
      0
    ) as total_apreensoes,
    
    -- Total de atropelamentos
    COALESCE((SELECT SUM(total_atropelamentos_qtd) FROM resgates_agregados), 0) +
    COALESCE(
      (SELECT COUNT(DISTINCT registro_id) FROM public.mv_estatisticas_resgates 
       WHERE atropelamento = 'Sim'
       AND (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)),
      0
    ) as total_atropelamentos,
    
    -- Total de indivíduos resgatados
    COALESCE((SELECT SUM(total_resgates_qtd) FROM resgates_agregados), 0) +
    COALESCE((SELECT SUM(total_individuos) FROM resgates_2025), 0) +
    COALESCE(
      (SELECT SUM(quantidade_resgates) FROM public.mv_estatisticas_resgates 
       WHERE ano = 2020
       AND (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)),
      0
    ) as total_individuos_resgatados,
    
    -- Total de indivíduos apreendidos
    COALESCE(
      (SELECT SUM(quantidade_fauna) FROM public.mv_estatisticas_crimes 
       WHERE (p_ano IS NULL OR EXTRACT(YEAR FROM data) = p_ano)
       AND (p_mes IS NULL OR EXTRACT(MONTH FROM data) = p_mes)
       AND tipo_registro = 'fauna'),
      0
    ) as total_individuos_apreendidos,
    
    -- Espécies diferentes
    COALESCE((SELECT COUNT(DISTINCT nome_cientifico) FROM resgates_especies), 0) +
    COALESCE((SELECT SUM(especies_dif) FROM resgates_2025), 0) as especies_diferentes,
    
    -- Classes diferentes
    COALESCE((SELECT COUNT(DISTINCT classe_taxonomica) FROM resgates_especies), 0) +
    COALESCE((SELECT SUM(classes_dif) FROM resgates_2025), 0) as classes_diferentes,
    
    -- Período início
    (SELECT MIN(data_ocorrencia) FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)) as periodo_inicio,
    
    -- Período fim
    (SELECT MAX(data_ocorrencia) FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano) AND (p_mes IS NULL OR mes = p_mes)) as periodo_fim;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================
-- 4) ATUALIZAR FUNÇÃO get_time_series_resgates
--    Usa bpma_fato_mensal para dados agregados (2021-2024)
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_time_series_resgates(
  p_ano_inicio INTEGER DEFAULT 2020,
  p_ano_fim INTEGER DEFAULT 2025,
  p_classe_taxonomica TEXT DEFAULT NULL
)
RETURNS TABLE (
  data DATE,
  ano INTEGER,
  mes INTEGER,
  total_resgates BIGINT,
  total_individuos BIGINT,
  especies_diferentes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH dados_agregados AS (
    -- Dados de 2021-2024 das novas tabelas
    SELECT 
      ano,
      mes,
      SUM(quantidade) FILTER (WHERE natureza = 'Resgate de Fauna Silvestre') as total_individuos,
      make_date(ano, mes, 1) as data
    FROM public.bpma_fato_mensal
    WHERE ano BETWEEN 2021 AND 2024
      AND ano BETWEEN p_ano_inicio AND p_ano_fim
      AND (p_classe_taxonomica IS NULL) -- Dados agregados não têm classe
    GROUP BY ano, mes
  ),
  dados_especies AS (
    -- Dados por espécie de 2020 e 2021-2024 (para contagem de espécies)
    SELECT 
      ano,
      mes,
      data_ocorrencia as data,
      COUNT(DISTINCT registro_id) as total_resgates,
      SUM(quantidade_resgates) as total_individuos,
      COUNT(DISTINCT nome_cientifico) FILTER (WHERE nome_cientifico IS NOT NULL) as especies_diferentes
    FROM public.mv_estatisticas_resgates
    WHERE ano BETWEEN p_ano_inicio AND p_ano_fim
      AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
    GROUP BY ano, mes, data_ocorrencia
  ),
  dados_2025 AS (
    -- Dados de 2025+
    SELECT 
      r.data as data,
      EXTRACT(YEAR FROM r.data)::integer as ano,
      EXTRACT(MONTH FROM r.data)::integer as mes,
      COUNT(DISTINCT r.id) as total_resgates,
      SUM(COALESCE(r.quantidade, 0)) as total_individuos,
      COUNT(DISTINCT e.nome_cientifico) FILTER (WHERE e.nome_cientifico IS NOT NULL) as especies_diferentes
    FROM public.fat_registros_de_resgate r
    LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
    WHERE r.data >= '2025-01-01'
      AND EXTRACT(YEAR FROM r.data) BETWEEN p_ano_inicio AND p_ano_fim
      AND (p_classe_taxonomica IS NULL OR e.classe_taxonomica = p_classe_taxonomica)
    GROUP BY r.data, EXTRACT(YEAR FROM r.data), EXTRACT(MONTH FROM r.data)
  )
  SELECT 
    COALESCE(d.data, da.data) as data,
    COALESCE(d.ano, da.ano) as ano,
    COALESCE(d.mes, da.mes) as mes,
    COALESCE(d.total_resgates, 0) as total_resgates,
    COALESCE(d.total_individuos, da.total_individuos, 0) as total_individuos,
    COALESCE(d.especies_diferentes, 0) as especies_diferentes
  FROM dados_especies d
  FULL OUTER JOIN dados_agregados da ON d.ano = da.ano AND d.mes = da.mes
  WHERE (d.ano IS NOT NULL OR da.ano IS NOT NULL)
  
  UNION ALL
  
  SELECT 
    data,
    ano,
    mes,
    total_resgates,
    total_individuos,
    especies_diferentes
  FROM dados_2025
  
  ORDER BY ano, mes, data;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================
-- 5) ATUALIZAR OUTRAS FUNÇÕES (mantém lógica, apenas otimiza)
-- =========================================================

-- Função get_top_especies_resgatadas - usa mv_estatisticas_resgates (já atualizada)
-- Função get_distribuicao_classe - usa mv_estatisticas_resgates (já atualizada)
-- Função get_estatisticas_regiao - mantém lógica atual
-- Função get_estatisticas_destinacao - mantém lógica atual
-- Função get_estatisticas_atropelamentos - usa mv_estatisticas_resgates (já atualizada)

-- =========================================================
-- 6) CRIAR VIEW PARA ESTATÍSTICAS MENSAIS AGREGADAS
--    Facilita consultas do dashboard
-- =========================================================

CREATE OR REPLACE VIEW public.vw_estatisticas_mensais_bpma AS
SELECT 
  ano,
  mes,
  SUM(quantidade) FILTER (WHERE natureza = 'Resgate de Fauna Silvestre') as total_resgates,
  SUM(quantidade) FILTER (WHERE natureza = 'Solturas') as total_solturas,
  SUM(quantidade) FILTER (WHERE natureza = 'Óbitos') as total_obitos,
  SUM(quantidade) FILTER (WHERE natureza = 'Feridos') as total_feridos,
  SUM(quantidade) FILTER (WHERE natureza = 'Filhotes') as total_filhotes,
  SUM(quantidade) FILTER (WHERE natureza = 'Atropelamento') as total_atropelamentos,
  SUM(quantidade) FILTER (WHERE natureza LIKE '%Crime%') as total_crimes,
  SUM(quantidade) FILTER (WHERE natureza = 'Atendimentos registrados') as total_atendimentos
FROM public.bpma_fato_mensal
WHERE ano BETWEEN 2021 AND 2024
GROUP BY ano, mes
ORDER BY ano DESC, mes DESC;

-- =========================================================
-- 7) ATUALIZAR VIEW MATERIALIZADA DE PERÍODO
-- =========================================================

DROP MATERIALIZED VIEW IF EXISTS public.mv_estatisticas_periodo CASCADE;

CREATE MATERIALIZED VIEW public.mv_estatisticas_periodo AS
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

CREATE INDEX IF NOT EXISTS idx_mv_periodo_ano_mes ON public.mv_estatisticas_periodo(ano, mes);

-- =========================================================
-- 8) COMENTÁRIOS E DOCUMENTAÇÃO
-- =========================================================

COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_resgates IS 
  'Agrega dados de resgates: 2020 e 2021-2024 por espécie (fat_resgates_diarios_*), 2025+ (fat_registros_de_resgate). Usa bpma_fato_mensal para dados agregados quando necessário.';

COMMENT ON VIEW public.vw_bpma_estatisticas_agregadas IS 
  'View auxiliar para acessar dados agregados da tabela bpma_fato_mensal';

COMMENT ON VIEW public.vw_estatisticas_mensais_bpma IS 
  'View agregada mensal usando bpma_fato_mensal para facilitar consultas do dashboard';

COMMENT ON FUNCTION public.get_dashboard_statistics IS 
  'Retorna estatísticas gerais usando novas tabelas bpma_fato_mensal para dados agregados (2021-2024) e mantém dados por espécie';

COMMENT ON FUNCTION public.get_time_series_resgates IS 
  'Retorna série temporal usando bpma_fato_mensal para dados agregados (2021-2024) e mantém dados por espécie';

COMMIT;
