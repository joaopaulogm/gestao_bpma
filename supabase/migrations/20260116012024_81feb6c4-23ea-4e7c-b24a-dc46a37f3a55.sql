-- =====================================================
-- CORREÇÃO COMPLETA DE SEGURANÇA - TODAS AS TABELAS
-- =====================================================

-- 1. fat_licencas_medicas - Dados médicos (só admin e RH)
DROP POLICY IF EXISTS "Licencas medicas visiveis para autenticados" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "fat_licencas_medicas_admin_full" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "fat_licencas_medicas_rh_read" ON public.fat_licencas_medicas;

CREATE POLICY "fat_licencas_medicas_admin_full"
ON public.fat_licencas_medicas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role));

-- 2. usuarios_por_login - Credenciais (só admin)
ALTER TABLE IF EXISTS public.usuarios_por_login ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_por_login_admin_only" ON public.usuarios_por_login;
DROP POLICY IF EXISTS "usuarios_por_login_self_read" ON public.usuarios_por_login;

CREATE POLICY "usuarios_por_login_admin_only"
ON public.usuarios_por_login
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "usuarios_por_login_self_read"
ON public.usuarios_por_login
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- 3. fat_ferias - Férias (só admin e RH)
DROP POLICY IF EXISTS "fat_ferias_admin_rh" ON public.fat_ferias;
DROP POLICY IF EXISTS "Ferias visiveis para autenticados" ON public.fat_ferias;

CREATE POLICY "fat_ferias_admin_rh"
ON public.fat_ferias
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role));

-- 4. fat_ferias_parcelas - Parcelas de férias (só admin e RH)
DROP POLICY IF EXISTS "fat_ferias_parcelas_admin_rh" ON public.fat_ferias_parcelas;
DROP POLICY IF EXISTS "Authenticated users can view vacation installments" ON public.fat_ferias_parcelas;

CREATE POLICY "fat_ferias_parcelas_admin_rh"
ON public.fat_ferias_parcelas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role));

-- 5. fat_equipe_membros - Composição de equipes (só admin e operacional)
DROP POLICY IF EXISTS "fat_equipe_membros_restricted" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "Membros de equipe visiveis para autenticados" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "Authenticated users can view team members" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "Authenticated users can delete team members" ON public.fat_equipe_membros;

CREATE POLICY "fat_equipe_membros_restricted"
ON public.fat_equipe_membros
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'secao_operacional'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'secao_operacional'::app_role)
);

-- 6. dim_efetivo - Dados pessoais (restrito)
DROP POLICY IF EXISTS "dim_efetivo_restricted" ON public.dim_efetivo;
DROP POLICY IF EXISTS "Efetivo visivel para autenticados" ON public.dim_efetivo;
DROP POLICY IF EXISTS "Authenticated users can view personnel" ON public.dim_efetivo;

-- Permitir leitura para autenticados (necessário para funcionalidade)
-- mas escrita só para admin/RH
CREATE POLICY "dim_efetivo_read_authenticated"
ON public.dim_efetivo
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "dim_efetivo_write_admin_rh"
ON public.dim_efetivo
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'secao_pessoas'::app_role));

-- 7. usuarios_permitidos - Contatos (só admin)
ALTER TABLE IF EXISTS public.usuarios_permitidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_permitidos_admin" ON public.usuarios_permitidos;
DROP POLICY IF EXISTS "usuarios_permitidos_self" ON public.usuarios_permitidos;
DROP POLICY IF EXISTS "Allow users to view own data" ON public.usuarios_permitidos;

CREATE POLICY "usuarios_permitidos_admin"
ON public.usuarios_permitidos
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Corrigir TODAS as views com SECURITY DEFINER restantes
DROP VIEW IF EXISTS public.vw_anos_disponiveis CASCADE;
CREATE VIEW public.vw_anos_disponiveis
WITH (security_invoker = true)
AS
SELECT DISTINCT 
  EXTRACT(YEAR FROM data)::integer as ano
FROM public.fat_resgates_diarios_2025
WHERE data IS NOT NULL
UNION
SELECT DISTINCT ano
FROM public.dim_tempo
ORDER BY ano DESC;

GRANT SELECT ON public.vw_anos_disponiveis TO authenticated;

-- Recriar outras views se existirem
DROP VIEW IF EXISTS public.vw_distribuicao_classe_historico CASCADE;
DROP VIEW IF EXISTS public.vw_distribuicao_conservacao_historico CASCADE;
DROP VIEW IF EXISTS public.vw_kpis_anuais_historico CASCADE;
DROP VIEW IF EXISTS public.vw_ranking_especies_historico CASCADE;
DROP VIEW IF EXISTS public.vw_serie_mensal_historico CASCADE;

-- vw_distribuicao_classe_historico
CREATE VIEW public.vw_distribuicao_classe_historico
WITH (security_invoker = true)
AS
SELECT 
  dt.ano,
  ef.classe_taxonomica,
  SUM(fr.quantidade) as total
FROM public.fact_resgate_fauna_especie_mensal fr
JOIN public.dim_tempo dt ON fr.tempo_id = dt.id
LEFT JOIN public.dim_especies_fauna ef ON fr.id_especie_fauna = ef.id
GROUP BY dt.ano, ef.classe_taxonomica;

GRANT SELECT ON public.vw_distribuicao_classe_historico TO authenticated;

-- vw_kpis_anuais_historico
CREATE VIEW public.vw_kpis_anuais_historico
WITH (security_invoker = true)
AS
SELECT 
  ano,
  SUM(resgates) as total_resgates,
  SUM(solturas) as total_solturas,
  SUM(obitos) as total_obitos,
  SUM(atropelamentos) as total_atropelamentos
FROM public.fact_resumo_mensal_historico
GROUP BY ano;

GRANT SELECT ON public.vw_kpis_anuais_historico TO authenticated;

-- vw_ranking_especies_historico
CREATE VIEW public.vw_ranking_especies_historico
WITH (security_invoker = true)
AS
SELECT 
  dt.ano,
  fr.nome_cientifico,
  fr.nome_popular,
  SUM(fr.quantidade) as total
FROM public.fact_resgate_fauna_especie_mensal fr
JOIN public.dim_tempo dt ON fr.tempo_id = dt.id
GROUP BY dt.ano, fr.nome_cientifico, fr.nome_popular
ORDER BY total DESC;

GRANT SELECT ON public.vw_ranking_especies_historico TO authenticated;

-- vw_serie_mensal_historico
CREATE VIEW public.vw_serie_mensal_historico
WITH (security_invoker = true)
AS
SELECT 
  ano,
  mes,
  resgates,
  solturas,
  obitos,
  atropelamentos,
  filhotes,
  feridos
FROM public.fact_resumo_mensal_historico
ORDER BY ano, mes;

GRANT SELECT ON public.vw_serie_mensal_historico TO authenticated;