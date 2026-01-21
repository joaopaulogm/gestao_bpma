
-- ============================================
-- CORREÇÃO DAS VIEWS - SECURITY INVOKER
-- ============================================

-- Recriar todas as views com security_invoker = true

-- vw_anos_disponiveis
DROP VIEW IF EXISTS public.vw_anos_disponiveis;
CREATE VIEW public.vw_anos_disponiveis WITH (security_invoker = true) AS
SELECT DISTINCT vw_resgates_basicos_union.ano,
    'historico'::text AS fonte,
    true AS tem_resgate,
    false AS tem_crime_ambiental
FROM vw_resgates_basicos_union
UNION
SELECT (EXTRACT(year FROM fat_registros_de_resgate.data))::integer AS ano,
    'formulario'::text AS fonte,
    true AS tem_resgate,
    true AS tem_crime_ambiental
FROM fat_registros_de_resgate
WHERE (fat_registros_de_resgate.data >= '2026-01-01'::date)
GROUP BY (EXTRACT(year FROM fat_registros_de_resgate.data))
ORDER BY 1 DESC;

-- vw_distribuicao_classe_historico
DROP VIEW IF EXISTS public.vw_distribuicao_classe_historico;
CREATE VIEW public.vw_distribuicao_classe_historico WITH (security_invoker = true) AS
SELECT vw_resgates_basicos_union.ano,
    vw_resgates_basicos_union.classe_taxonomica,
    sum(vw_resgates_basicos_union.total_resgates) AS total_resgates,
    sum(vw_resgates_basicos_union.total_solturas) AS total_solturas
FROM vw_resgates_basicos_union
GROUP BY vw_resgates_basicos_union.ano, vw_resgates_basicos_union.classe_taxonomica;

-- vw_distribuicao_conservacao_historico
DROP VIEW IF EXISTS public.vw_distribuicao_conservacao_historico;
CREATE VIEW public.vw_distribuicao_conservacao_historico WITH (security_invoker = true) AS
SELECT vw_resgates_historicos.ano,
    vw_resgates_historicos.estado_de_conservacao,
    count(DISTINCT vw_resgates_historicos.nome_cientifico) AS especies_unicas,
    sum(vw_resgates_historicos.quantidade_resgates) AS total_resgates
FROM vw_resgates_historicos
GROUP BY vw_resgates_historicos.ano, vw_resgates_historicos.estado_de_conservacao
ORDER BY vw_resgates_historicos.ano, vw_resgates_historicos.estado_de_conservacao;

-- vw_kpis_anuais_historico
DROP VIEW IF EXISTS public.vw_kpis_anuais_historico;
CREATE VIEW public.vw_kpis_anuais_historico WITH (security_invoker = true) AS
SELECT vw_resgates_basicos_union.ano,
    sum(vw_resgates_basicos_union.total_resgates) AS total_animais_resgatados,
    sum(vw_resgates_basicos_union.total_solturas) AS total_solturas,
    sum(vw_resgates_basicos_union.total_obitos) AS total_obitos,
    sum(vw_resgates_basicos_union.total_feridos) AS total_feridos,
    sum(vw_resgates_basicos_union.total_filhotes) AS total_filhotes,
    count(*) AS total_ocorrencias,
    count(DISTINCT vw_resgates_basicos_union.especie_id) FILTER (WHERE vw_resgates_basicos_union.especie_id IS NOT NULL) AS riqueza_especies,
    round(((sum(vw_resgates_basicos_union.total_obitos)::numeric / NULLIF(sum(vw_resgates_basicos_union.total_resgates), 0)::numeric) * 100::numeric), 2) AS taxa_mortalidade,
    round(((sum(vw_resgates_basicos_union.total_solturas)::numeric / NULLIF(sum(vw_resgates_basicos_union.total_resgates), 0)::numeric) * 100::numeric), 2) AS taxa_soltura
FROM vw_resgates_basicos_union
GROUP BY vw_resgates_basicos_union.ano;

-- vw_ranking_especies_historico
DROP VIEW IF EXISTS public.vw_ranking_especies_historico;
CREATE VIEW public.vw_ranking_especies_historico WITH (security_invoker = true) AS
SELECT vw_resgates_basicos_union.ano,
    vw_resgates_basicos_union.especie_id,
    vw_resgates_basicos_union.nome_popular_norm,
    vw_resgates_basicos_union.nome_cientifico,
    vw_resgates_basicos_union.classe_taxonomica,
    sum(vw_resgates_basicos_union.total_resgates) AS total_resgates
FROM vw_resgates_basicos_union
GROUP BY vw_resgates_basicos_union.ano, vw_resgates_basicos_union.especie_id, 
    vw_resgates_basicos_union.nome_popular_norm, vw_resgates_basicos_union.nome_cientifico, 
    vw_resgates_basicos_union.classe_taxonomica;

-- vw_serie_mensal_historico
DROP VIEW IF EXISTS public.vw_serie_mensal_historico;
CREATE VIEW public.vw_serie_mensal_historico WITH (security_invoker = true) AS
SELECT vw_resgates_basicos_union.ano,
    EXTRACT(month FROM vw_resgates_basicos_union.data)::integer AS mes,
    sum(vw_resgates_basicos_union.total_resgates) AS total_resgates,
    sum(vw_resgates_basicos_union.total_solturas) AS total_solturas,
    sum(vw_resgates_basicos_union.total_obitos) AS total_obitos
FROM vw_resgates_basicos_union
GROUP BY vw_resgates_basicos_union.ano, (EXTRACT(month FROM vw_resgates_basicos_union.data));

-- Conceder permissões
GRANT SELECT ON public.vw_anos_disponiveis TO authenticated;
GRANT SELECT ON public.vw_distribuicao_classe_historico TO authenticated;
GRANT SELECT ON public.vw_distribuicao_conservacao_historico TO authenticated;
GRANT SELECT ON public.vw_kpis_anuais_historico TO authenticated;
GRANT SELECT ON public.vw_ranking_especies_historico TO authenticated;
GRANT SELECT ON public.vw_serie_mensal_historico TO authenticated;
