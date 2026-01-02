-- ============================================
-- VIEWS MATERIALIZADAS PARA DASHBOARD E RELATÓRIOS
-- ============================================
-- Estas views agregam dados de todas as tabelas fat para análise
-- e são atualizadas automaticamente via triggers

-- 1. VIEW: Estatísticas Gerais de Resgates (com dados históricos)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_resgates AS
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
  COALESCE(h.data_ocorrencia, 
    CASE 
      WHEN h."Ano" IS NOT NULL AND h."Mês" IS NOT NULL THEN
        -- Criar data aproximada se não houver data_ocorrencia
        MAKE_DATE(h."Ano"::integer, 
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
          END, 1)
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
  AND h."Ano" <= 2024 -- Incluir TODOS os dados de 2020 a 2024

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mv_resgates_ano ON public.mv_estatisticas_resgates(ano);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_mes ON public.mv_estatisticas_resgates(mes);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_classe ON public.mv_estatisticas_resgates(classe_taxonomica);
CREATE INDEX IF NOT EXISTS idx_mv_resgates_data ON public.mv_estatisticas_resgates(data_ocorrencia);

-- 2. VIEW: Estatísticas de Crimes Ambientais
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_crimes AS
SELECT 
  EXTRACT(YEAR FROM c.data) as ano,
  EXTRACT(MONTH FROM c.data) as mes,
  c.data,
  c.tipo_registro,
  c.tipo_crime_id,
  c.enquadramento_id,
  c.ocorreu_apreensao,
  c.regiao_administrativa_id,
  c.tipo_area_id,
  
  -- Fauna
  c.especie_fauna_id,
  c.nome_popular_fauna,
  c.nome_cientifico_fauna,
  c.classe_taxonomica,
  c.quantidade_total as quantidade_fauna,
  c.quantidade_adulto as quantidade_adulto_fauna,
  c.quantidade_filhote as quantidade_filhote_fauna,
  c.quantidade_total_obito as quantidade_obito_fauna,
  
  -- Flora
  c.especie_flora_id,
  c.nome_popular_flora,
  c.quantidade_flora,
  
  -- Apreensões
  (SELECT COUNT(*) FROM public.fat_ocorrencia_apreensao oa WHERE oa.id_ocorrencia = c.id) as total_itens_apreendidos,
  
  c.id as registro_id,
  'crime' as tipo_registro_geral
FROM public.fat_registros_de_crime c;

CREATE INDEX IF NOT EXISTS idx_mv_crimes_ano ON public.mv_estatisticas_crimes(ano);
CREATE INDEX IF NOT EXISTS idx_mv_crimes_tipo ON public.mv_estatisticas_crimes(tipo_registro);
CREATE INDEX IF NOT EXISTS idx_mv_crimes_data ON public.mv_estatisticas_crimes(data);

-- 3. VIEW: Estatísticas de Apreensões (itens)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_apreensoes AS
SELECT 
  EXTRACT(YEAR FROM c.data) as ano,
  EXTRACT(MONTH FROM c.data) as mes,
  c.data,
  c.regiao_administrativa_id,
  oa.id_item_apreendido,
  ia."Categoria" as categoria_item,
  ia."Item" as nome_item,
  oa.quantidade,
  c.id as registro_id
FROM public.fat_ocorrencia_apreensao oa
INNER JOIN public.fat_registros_de_crime c ON c.id = oa.id_ocorrencia
LEFT JOIN public.dim_itens_apreensao ia ON ia.id = oa.id_item_apreendido;

CREATE INDEX IF NOT EXISTS idx_mv_apreensoes_ano ON public.mv_estatisticas_apreensoes(ano);
CREATE INDEX IF NOT EXISTS idx_mv_apreensoes_categoria ON public.mv_estatisticas_apreensoes(categoria_item);

-- 4. VIEW: Estatísticas Agregadas por Período
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_mv_periodo_ano_mes ON public.mv_estatisticas_periodo(ano, mes);

-- 5. VIEW: Top Espécies Resgatadas
-- ============================================
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

-- 6. VIEW: Distribuição por Classe Taxonômica
-- ============================================
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

-- 7. VIEW: Estatísticas por Região Administrativa
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_regiao AS
SELECT 
  ra.id as regiao_id,
  ra.nome as regiao_nome,
  EXTRACT(YEAR FROM r.data) as ano,
  COUNT(DISTINCT r.id) as total_registros,
  SUM(COALESCE(r.quantidade, 0)) as total_individuos,
  COUNT(DISTINCT r.especie_id) as especies_diferentes
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_regiao_administrativa ra ON ra.id = r.regiao_administrativa_id
WHERE r.regiao_administrativa_id IS NOT NULL
GROUP BY ra.id, ra.nome, EXTRACT(YEAR FROM r.data);

CREATE INDEX IF NOT EXISTS idx_mv_regiao_ano ON public.mv_estatisticas_regiao(ano);

-- 8. VIEW: Estatísticas de Destinação
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_destinacao AS
SELECT 
  d.id as destinacao_id,
  d.nome as destinacao_nome,
  EXTRACT(YEAR FROM r.data) as ano,
  COUNT(DISTINCT r.id) as total_registros,
  SUM(COALESCE(r.quantidade, 0)) as total_individuos,
  COUNT(DISTINCT r.especie_id) as especies_diferentes
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_destinacao d ON d.id = r.destinacao_id
WHERE r.destinacao_id IS NOT NULL
GROUP BY d.id, d.nome, EXTRACT(YEAR FROM r.data);

-- 9. VIEW: Estatísticas de Atropelamentos
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_atropelamentos AS
SELECT 
  EXTRACT(YEAR FROM r.data) as ano,
  EXTRACT(MONTH FROM r.data) as mes,
  e.classe_taxonomica,
  e.nome_popular,
  COUNT(DISTINCT r.id) as total_ocorrencias,
  SUM(COALESCE(r.quantidade, 0)) as total_atropelados
FROM public.fat_registros_de_resgate r
LEFT JOIN public.dim_especies_fauna e ON e.id = r.especie_id
WHERE r.atropelamento = 'Sim'
GROUP BY EXTRACT(YEAR FROM r.data), EXTRACT(MONTH FROM r.data), e.classe_taxonomica, e.nome_popular;

-- 10. VIEW: Estatísticas de Equipes
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_estatisticas_equipes AS
SELECT 
  ef.id as efetivo_id,
  ef.nome_guerra,
  ef.posto_graduacao,
  COUNT(DISTINCT er.registro_id) as total_resgates_participados,
  COUNT(DISTINCT ec.registro_id) as total_crimes_participados,
  COUNT(DISTINCT er.registro_id) + COUNT(DISTINCT ec.registro_id) as total_ocorrencias_participadas
FROM public.dim_efetivo ef
LEFT JOIN public.fat_equipe_resgate er ON er.efetivo_id = ef.id
LEFT JOIN public.fat_equipe_crime ec ON ec.efetivo_id = ef.id
GROUP BY ef.id, ef.nome_guerra, ef.posto_graduacao;

-- Comentários
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_resgates IS 'Agrega dados de resgates atuais e históricos (2020-2024)';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_crimes IS 'Estatísticas agregadas de crimes ambientais';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_apreensoes IS 'Estatísticas de itens apreendidos';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_periodo IS 'Estatísticas agregadas por período (ano/mês)';
COMMENT ON MATERIALIZED VIEW public.mv_top_especies_resgatadas IS 'Ranking das espécies mais resgatadas';
COMMENT ON MATERIALIZED VIEW public.mv_distribuicao_classe IS 'Distribuição de registros por classe taxonômica';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_regiao IS 'Estatísticas por região administrativa';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_destinacao IS 'Estatísticas por destinação';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_atropelamentos IS 'Estatísticas de atropelamentos';
COMMENT ON MATERIALIZED VIEW public.mv_estatisticas_equipes IS 'Estatísticas de participação de equipes';

