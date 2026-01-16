-- Recriar views restantes com security_invoker

-- 1. vw_resgates_basicos_union
DROP VIEW IF EXISTS public.vw_resumo_anual_resgates CASCADE;
DROP VIEW IF EXISTS public.vw_resumo_especies_historico CASCADE;
DROP VIEW IF EXISTS public.vw_resgates_basicos_union CASCADE;

CREATE VIEW public.vw_resgates_basicos_union
WITH (security_invoker = true)
AS
SELECT 2020 AS ano,
    fat_resgates_diarios_2020.data_ocorrencia AS data,
    fat_resgates_diarios_2020.mes AS mes_texto,
    fat_resgates_diarios_2020.nome_popular AS nome_popular_raw,
    normalize_text(fat_resgates_diarios_2020.nome_popular) AS nome_popular_norm,
    fat_resgates_diarios_2020.nome_cientifico,
    fat_resgates_diarios_2020.classe_taxonomica,
    COALESCE(fat_resgates_diarios_2020.quantidade_resgates, 0::numeric)::integer AS total_resgates,
    COALESCE(fat_resgates_diarios_2020.quantidade_solturas, 0::numeric)::integer AS total_solturas,
    COALESCE(fat_resgates_diarios_2020.quantidade_obitos, 0::numeric)::integer AS total_obitos,
    COALESCE(fat_resgates_diarios_2020.quantidade_feridos, 0::numeric)::integer AS total_feridos,
    COALESCE(fat_resgates_diarios_2020.quantidade_filhotes, 0::numeric)::integer AS total_filhotes,
    fat_resgates_diarios_2020.especie_id
FROM fat_resgates_diarios_2020
UNION ALL
SELECT 2021 AS ano,
    fat_resgates_diarios_2021.data_ocorrencia AS data,
    fat_resgates_diarios_2021.mes AS mes_texto,
    fat_resgates_diarios_2021.nome_popular AS nome_popular_raw,
    normalize_text(fat_resgates_diarios_2021.nome_popular) AS nome_popular_norm,
    fat_resgates_diarios_2021.nome_cientifico,
    fat_resgates_diarios_2021.classe_taxonomica,
    COALESCE(fat_resgates_diarios_2021.quantidade_resgates, 0::numeric)::integer AS total_resgates,
    COALESCE(fat_resgates_diarios_2021.quantidade_solturas, 0::numeric)::integer AS total_solturas,
    COALESCE(fat_resgates_diarios_2021.quantidade_obitos, 0::numeric)::integer AS total_obitos,
    COALESCE(fat_resgates_diarios_2021.quantidade_feridos, 0::numeric)::integer AS total_feridos,
    COALESCE(fat_resgates_diarios_2021.quantidade_filhotes, 0::numeric)::integer AS total_filhotes,
    fat_resgates_diarios_2021.especie_id
FROM fat_resgates_diarios_2021
UNION ALL
SELECT 2022 AS ano,
    fat_resgates_diarios_2022.data_ocorrencia AS data,
    fat_resgates_diarios_2022.mes AS mes_texto,
    fat_resgates_diarios_2022.nome_popular AS nome_popular_raw,
    normalize_text(fat_resgates_diarios_2022.nome_popular) AS nome_popular_norm,
    fat_resgates_diarios_2022.nome_cientifico,
    fat_resgates_diarios_2022.classe_taxonomica,
    COALESCE(fat_resgates_diarios_2022.quantidade_resgates, 0::numeric)::integer AS total_resgates,
    COALESCE(fat_resgates_diarios_2022.quantidade_solturas, 0::numeric)::integer AS total_solturas,
    COALESCE(fat_resgates_diarios_2022.quantidade_obitos, 0::numeric)::integer AS total_obitos,
    COALESCE(fat_resgates_diarios_2022.quantidade_feridos, 0::numeric)::integer AS total_feridos,
    COALESCE(fat_resgates_diarios_2022.quantidade_filhotes, 0::numeric)::integer AS total_filhotes,
    fat_resgates_diarios_2022.especie_id
FROM fat_resgates_diarios_2022
UNION ALL
SELECT 2023 AS ano,
    fat_resgates_diarios_2023.data_ocorrencia AS data,
    fat_resgates_diarios_2023.mes AS mes_texto,
    fat_resgates_diarios_2023.nome_popular AS nome_popular_raw,
    normalize_text(fat_resgates_diarios_2023.nome_popular) AS nome_popular_norm,
    fat_resgates_diarios_2023.nome_cientifico,
    fat_resgates_diarios_2023.classe_taxonomica,
    COALESCE(fat_resgates_diarios_2023.quantidade_resgates, 0::numeric)::integer AS total_resgates,
    COALESCE(fat_resgates_diarios_2023.quantidade_solturas, 0::numeric)::integer AS total_solturas,
    COALESCE(fat_resgates_diarios_2023.quantidade_obitos, 0::numeric)::integer AS total_obitos,
    COALESCE(fat_resgates_diarios_2023.quantidade_feridos, 0::numeric)::integer AS total_feridos,
    COALESCE(fat_resgates_diarios_2023.quantidade_filhotes, 0::numeric)::integer AS total_filhotes,
    fat_resgates_diarios_2023.especie_id
FROM fat_resgates_diarios_2023
UNION ALL
SELECT 2024 AS ano,
    fat_resgates_diarios_2024.data_ocorrencia AS data,
    fat_resgates_diarios_2024.mes AS mes_texto,
    fat_resgates_diarios_2024.nome_popular AS nome_popular_raw,
    normalize_text(fat_resgates_diarios_2024.nome_popular) AS nome_popular_norm,
    fat_resgates_diarios_2024.nome_cientifico,
    fat_resgates_diarios_2024.classe_taxonomica,
    COALESCE(fat_resgates_diarios_2024.quantidade_resgates, 0::numeric)::integer AS total_resgates,
    COALESCE(fat_resgates_diarios_2024.quantidade_solturas, 0::numeric)::integer AS total_solturas,
    COALESCE(fat_resgates_diarios_2024.quantidade_obitos, 0::numeric)::integer AS total_obitos,
    COALESCE(fat_resgates_diarios_2024.quantidade_feridos, 0::numeric)::integer AS total_feridos,
    COALESCE(fat_resgates_diarios_2024.quantidade_filhotes, 0::numeric)::integer AS total_filhotes,
    fat_resgates_diarios_2024.especie_id
FROM fat_resgates_diarios_2024;

GRANT SELECT ON public.vw_resgates_basicos_union TO authenticated;

-- 2. vw_resgates_historicos
DROP VIEW IF EXISTS public.vw_resgates_historicos CASCADE;

CREATE VIEW public.vw_resgates_historicos
WITH (security_invoker = true)
AS
SELECT 2020 AS ano, id, data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, criado_em, especie_id FROM fat_resgates_diarios_2020
UNION ALL
SELECT 2021, id, data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, criado_em, especie_id FROM fat_resgates_diarios_2021
UNION ALL
SELECT 2022, id, data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, criado_em, especie_id FROM fat_resgates_diarios_2022
UNION ALL
SELECT 2023, id, data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, criado_em, especie_id FROM fat_resgates_diarios_2023
UNION ALL
SELECT 2024, id, data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, criado_em, especie_id FROM fat_resgates_diarios_2024;

GRANT SELECT ON public.vw_resgates_historicos TO authenticated;

-- 3. vw_resumo_anual_resgates
CREATE VIEW public.vw_resumo_anual_resgates
WITH (security_invoker = true)
AS
SELECT ano, classe_taxonomica, tipo_de_fauna, count(DISTINCT nome_cientifico) AS especies_unicas, sum(quantidade_resgates) AS total_resgates, sum(quantidade_solturas) AS total_solturas, sum(quantidade_obitos) AS total_obitos, sum(quantidade_feridos) AS total_feridos, sum(quantidade_filhotes) AS total_filhotes
FROM vw_resgates_historicos
GROUP BY ano, classe_taxonomica, tipo_de_fauna
ORDER BY ano, classe_taxonomica;

GRANT SELECT ON public.vw_resumo_anual_resgates TO authenticated;

-- 4. vw_resumo_especies_historico
CREATE VIEW public.vw_resumo_especies_historico
WITH (security_invoker = true)
AS
SELECT nome_cientifico, nome_popular, classe_taxonomica, tipo_de_fauna, estado_de_conservacao, sum(quantidade_resgates) AS total_resgates, sum(quantidade_solturas) AS total_solturas, sum(quantidade_obitos) AS total_obitos, sum(quantidade_feridos) AS total_feridos, sum(quantidade_filhotes) AS total_filhotes, count(*) AS num_ocorrencias
FROM vw_resgates_historicos
GROUP BY nome_cientifico, nome_popular, classe_taxonomica, tipo_de_fauna, estado_de_conservacao;

GRANT SELECT ON public.vw_resumo_especies_historico TO authenticated;

-- Políticas para tabelas staging (usar DROP/CREATE em vez de IF NOT EXISTS)
DROP POLICY IF EXISTS "stg_dm_xlsx_admin_only" ON public.stg_dm_xlsx;
CREATE POLICY "stg_dm_xlsx_admin_only"
ON public.stg_dm_xlsx
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "stg_ferias_2026_pracas_admin_only" ON public.stg_ferias_2026_pracas;
CREATE POLICY "stg_ferias_2026_pracas_admin_only"
ON public.stg_ferias_2026_pracas
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());