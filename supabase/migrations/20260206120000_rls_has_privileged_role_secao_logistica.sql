-- =====================================================
-- RLS: Incluir secao_logistica em has_privileged_role
-- A página /secao-logistica usa dim_frota, dim_tgrl e dim_frota_historico,
-- cujas políticas usam has_privileged_role(auth.uid()).
-- O role secao_logistica não estava na lista e bloqueava o acesso.
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_privileged_role(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Verificar se o usuário tem um dos roles privilegiados (por user_id ou por efetivo_id)
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE (ur.user_id = _user_id
       OR ur.efetivo_id = (SELECT upl.efetivo_id FROM public.usuarios_por_login upl WHERE upl.auth_user_id = _user_id LIMIT 1))
      AND ur.role IN (
        'admin'::app_role,
        'secao_operacional'::app_role,
        'secao_pessoas'::app_role,
        'secao_logistica'::app_role
      )
      AND (ur.ativo = true OR ur.ativo IS NULL)
  );
END;
$$;
