-- ============================================
-- FUNÇÕES PARA CÁLCULO DE ESTATÍSTICAS DO DASHBOARD
-- ============================================
-- Funções que retornam dados agregados para o dashboard

-- Função: Obter estatísticas gerais do dashboard
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
  SELECT 
    -- Total de registros
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
    ) +
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_crimes 
     WHERE (p_ano IS NULL OR EXTRACT(YEAR FROM data) = p_ano)
       AND (p_mes IS NULL OR EXTRACT(MONTH FROM data) = p_mes)
    ) as total_registros,
    
    -- Total de resgates
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
    ) as total_resgates,
    
    -- Total de crimes
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_crimes 
     WHERE (p_ano IS NULL OR EXTRACT(YEAR FROM data) = p_ano)
       AND (p_mes IS NULL OR EXTRACT(MONTH FROM data) = p_mes)
    ) as total_crimes,
    
    -- Total de apreensões
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_apreensoes 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
    ) as total_apreensoes,
    
    -- Total de atropelamentos
    (SELECT COUNT(DISTINCT registro_id) 
     FROM public.mv_estatisticas_atropelamentos 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
    ) as total_atropelamentos,
    
    -- Total de indivíduos resgatados
    (SELECT COALESCE(SUM(quantidade_resgates), 0) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
    ) as total_individuos_resgatados,
    
    -- Total de indivíduos apreendidos
    (SELECT COALESCE(SUM(quantidade_fauna), 0) 
     FROM public.mv_estatisticas_crimes 
     WHERE (p_ano IS NULL OR EXTRACT(YEAR FROM data) = p_ano)
       AND (p_mes IS NULL OR EXTRACT(MONTH FROM data) = p_mes)
       AND tipo_registro = 'fauna'
    ) as total_individuos_apreendidos,
    
    -- Espécies diferentes
    (SELECT COUNT(DISTINCT nome_popular) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
       AND nome_popular IS NOT NULL
    ) as especies_diferentes,
    
    -- Classes diferentes
    (SELECT COUNT(DISTINCT classe_taxonomica) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
       AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
       AND classe_taxonomica IS NOT NULL
    ) as classes_diferentes,
    
    -- Período início
    (SELECT MIN(data_ocorrencia) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
    ) as periodo_inicio,
    
    -- Período fim
    (SELECT MAX(data_ocorrencia) 
     FROM public.mv_estatisticas_resgates 
     WHERE (p_ano IS NULL OR ano = p_ano)
       AND (p_mes IS NULL OR mes = p_mes)
    ) as periodo_fim;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter série temporal de resgates
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
  SELECT 
    data_ocorrencia as data,
    ano,
    mes,
    COUNT(DISTINCT registro_id) as total_resgates,
    SUM(quantidade_resgates) as total_individuos,
    COUNT(DISTINCT nome_popular) FILTER (WHERE nome_popular IS NOT NULL) as especies_diferentes
  FROM public.mv_estatisticas_resgates
  WHERE ano BETWEEN p_ano_inicio AND p_ano_fim
    AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
  GROUP BY data_ocorrencia, ano, mes
  ORDER BY ano, mes, data_ocorrencia;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter top espécies resgatadas
CREATE OR REPLACE FUNCTION public.get_top_especies_resgatadas(
  p_limit INTEGER DEFAULT 10,
  p_ano INTEGER DEFAULT NULL,
  p_classe_taxonomica TEXT DEFAULT NULL
)
RETURNS TABLE (
  nome_popular TEXT,
  nome_cientifico TEXT,
  classe_taxonomica TEXT,
  total_resgatado BIGINT,
  total_ocorrencias BIGINT,
  primeira_ocorrencia DATE,
  ultima_ocorrencia DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nome_popular,
    nome_cientifico,
    classe_taxonomica,
    SUM(quantidade_resgates) as total_resgatado,
    COUNT(DISTINCT registro_id) as total_ocorrencias,
    MIN(data_ocorrencia) as primeira_ocorrencia,
    MAX(data_ocorrencia) as ultima_ocorrencia
  FROM public.mv_estatisticas_resgates
  WHERE (p_ano IS NULL OR ano = p_ano)
    AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
    AND nome_popular IS NOT NULL
  GROUP BY nome_popular, nome_cientifico, classe_taxonomica
  ORDER BY total_resgatado DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter distribuição por classe taxonômica
CREATE OR REPLACE FUNCTION public.get_distribuicao_classe(
  p_ano INTEGER DEFAULT NULL
)
RETURNS TABLE (
  classe_taxonomica TEXT,
  total_registros BIGINT,
  total_individuos BIGINT,
  total_solturas BIGINT,
  total_obitos BIGINT,
  especies_diferentes BIGINT,
  media_por_registro NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    classe_taxonomica,
    COUNT(DISTINCT registro_id) as total_registros,
    SUM(quantidade_resgates) as total_individuos,
    SUM(quantidade_solturas) as total_solturas,
    SUM(quantidade_obitos) as total_obitos,
    COUNT(DISTINCT nome_popular) as especies_diferentes,
    ROUND(AVG(quantidade_resgates), 2) as media_por_registro
  FROM public.mv_estatisticas_resgates
  WHERE (p_ano IS NULL OR ano = p_ano)
    AND classe_taxonomica IS NOT NULL
  GROUP BY classe_taxonomica
  ORDER BY total_individuos DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter estatísticas por região
CREATE OR REPLACE FUNCTION public.get_estatisticas_regiao(
  p_ano INTEGER DEFAULT NULL
)
RETURNS TABLE (
  regiao_id UUID,
  regiao_nome TEXT,
  total_registros BIGINT,
  total_individuos BIGINT,
  especies_diferentes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    regiao_id,
    regiao_nome,
    SUM(total_registros) as total_registros,
    SUM(total_individuos) as total_individuos,
    COUNT(DISTINCT especies_diferentes) as especies_diferentes
  FROM public.mv_estatisticas_regiao
  WHERE (p_ano IS NULL OR ano = p_ano)
  GROUP BY regiao_id, regiao_nome
  ORDER BY total_individuos DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter estatísticas de destinação
CREATE OR REPLACE FUNCTION public.get_estatisticas_destinacao(
  p_ano INTEGER DEFAULT NULL
)
RETURNS TABLE (
  destinacao_id UUID,
  destinacao_nome TEXT,
  total_registros BIGINT,
  total_individuos BIGINT,
  especies_diferentes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    destinacao_id,
    destinacao_nome,
    SUM(total_registros) as total_registros,
    SUM(total_individuos) as total_individuos,
    COUNT(DISTINCT especies_diferentes) as especies_diferentes
  FROM public.mv_estatisticas_destinacao
  WHERE (p_ano IS NULL OR ano = p_ano)
  GROUP BY destinacao_id, destinacao_nome
  ORDER BY total_individuos DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função: Obter estatísticas de atropelamentos
CREATE OR REPLACE FUNCTION public.get_estatisticas_atropelamentos(
  p_ano INTEGER DEFAULT NULL,
  p_classe_taxonomica TEXT DEFAULT NULL
)
RETURNS TABLE (
  classe_taxonomica TEXT,
  nome_popular TEXT,
  total_ocorrencias BIGINT,
  total_atropelados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    classe_taxonomica,
    nome_popular,
    COUNT(DISTINCT registro_id) as total_ocorrencias,
    SUM(quantidade_resgates) as total_atropelados
  FROM public.mv_estatisticas_resgates
  WHERE atropelamento = 'Sim'
    AND (p_ano IS NULL OR ano = p_ano)
    AND (p_classe_taxonomica IS NULL OR classe_taxonomica = p_classe_taxonomica)
  GROUP BY classe_taxonomica, nome_popular
  ORDER BY total_atropelados DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentários
COMMENT ON FUNCTION public.get_dashboard_statistics IS 'Retorna estatísticas gerais do dashboard com filtros opcionais';
COMMENT ON FUNCTION public.get_time_series_resgates IS 'Retorna série temporal de resgates para gráficos de linha';
COMMENT ON FUNCTION public.get_top_especies_resgatadas IS 'Retorna ranking das espécies mais resgatadas';
COMMENT ON FUNCTION public.get_distribuicao_classe IS 'Retorna distribuição de registros por classe taxonômica';
COMMENT ON FUNCTION public.get_estatisticas_regiao IS 'Retorna estatísticas agregadas por região administrativa';
COMMENT ON FUNCTION public.get_estatisticas_destinacao IS 'Retorna estatísticas agregadas por destinação';
COMMENT ON FUNCTION public.get_estatisticas_atropelamentos IS 'Retorna estatísticas de atropelamentos';

