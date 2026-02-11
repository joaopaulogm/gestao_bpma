-- =====================================================
-- RLS: Permitir SELECT nas dimensões do Rádio Operador
-- =====================================================
-- dim_equipe, dim_local, dim_grupamento, dim_desfecho tinham RLS habilitado
-- mas SEM políticas, bloqueando qualquer leitura. Os joins da fat retornavam null.
-- dim_destinacao exigia has_privileged_role, que não inclui operador_radio/comando.
--
-- Solução: políticas SELECT para os mesmos roles que acessam fat_controle_ocorrencias:
-- operador_radio, admin, comando, secao_operacional, secao_pessoas
-- =====================================================

-- Helper: mesma condição usada nas fat tables do radio-operador
CREATE OR REPLACE FUNCTION public.radio_operador_can_read(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE (ur.user_id = _user_id
       OR ur.efetivo_id = (SELECT upl.efetivo_id FROM public.usuarios_por_login upl WHERE upl.auth_user_id = _user_id LIMIT 1))
      AND ur.role IN (
        'operador_radio'::app_role,
        'admin'::app_role,
        'comando'::app_role,
        'secao_operacional'::app_role,
        'secao_pessoas'::app_role
      )
      AND (ur.ativo = true OR ur.ativo IS NULL)
  );
END;
$$;

-- dim_equipe
DROP POLICY IF EXISTS "radio_operador_roles_select_dim_equipe" ON public.dim_equipe;
CREATE POLICY "radio_operador_roles_select_dim_equipe"
ON public.dim_equipe FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

-- dim_local
DROP POLICY IF EXISTS "radio_operador_roles_select_dim_local" ON public.dim_local;
CREATE POLICY "radio_operador_roles_select_dim_local"
ON public.dim_local FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

-- dim_grupamento
DROP POLICY IF EXISTS "radio_operador_roles_select_dim_grupamento" ON public.dim_grupamento;
CREATE POLICY "radio_operador_roles_select_dim_grupamento"
ON public.dim_grupamento FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

-- dim_desfecho
DROP POLICY IF EXISTS "radio_operador_roles_select_dim_desfecho" ON public.dim_desfecho;
CREATE POLICY "radio_operador_roles_select_dim_desfecho"
ON public.dim_desfecho FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

-- dim_destinacao: adicionar policy para radio_operador roles (mantém has_privileged_role para outras operações)
DROP POLICY IF EXISTS "radio_operador_roles_select_dim_destinacao" ON public.dim_destinacao;
CREATE POLICY "radio_operador_roles_select_dim_destinacao"
ON public.dim_destinacao FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));
