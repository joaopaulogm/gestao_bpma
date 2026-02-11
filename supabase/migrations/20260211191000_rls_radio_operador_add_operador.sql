-- =====================================================
-- RLS: Incluir role 'operador' e padronizar checagem
-- =====================================================
-- O role 'operador' deve ter acesso ao Rádio Operador (igual ao antigo radio_operador_data).
-- A fat table usava apenas ur.user_id = auth.uid(), mas usuários com login por matrícula
-- têm efetivo_id em user_roles. Padronizar para usar radio_operador_can_read em tudo.
-- =====================================================

-- 1) Atualizar radio_operador_can_read para incluir 'operador'
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
        'operador'::app_role,
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

-- 2) Fat tables: usar radio_operador_can_read (inclui operador + suporte a efetivo_id)
DROP POLICY IF EXISTS "Allowed roles can read fat_controle_resgate_2026" ON public.fat_controle_ocorrencias_resgate_2026;
CREATE POLICY "Allowed roles can read fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can read fat_controle_crimes_2026" ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE POLICY "Allowed roles can read fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR SELECT TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

-- 3) INSERT/UPDATE/DELETE: incluir operador nas fat tables
DROP POLICY IF EXISTS "Allowed roles can insert fat_controle_resgate_2026" ON public.fat_controle_ocorrencias_resgate_2026;
CREATE POLICY "Allowed roles can insert fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR INSERT TO authenticated
WITH CHECK (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can update fat_controle_resgate_2026" ON public.fat_controle_ocorrencias_resgate_2026;
CREATE POLICY "Allowed roles can update fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR UPDATE TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can delete fat_controle_resgate_2026" ON public.fat_controle_ocorrencias_resgate_2026;
CREATE POLICY "Allowed roles can delete fat_controle_resgate_2026"
ON public.fat_controle_ocorrencias_resgate_2026 FOR DELETE TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can insert fat_controle_crimes_2026" ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE POLICY "Allowed roles can insert fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR INSERT TO authenticated
WITH CHECK (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can update fat_controle_crimes_2026" ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE POLICY "Allowed roles can update fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR UPDATE TO authenticated
USING (public.radio_operador_can_read(auth.uid()));

DROP POLICY IF EXISTS "Allowed roles can delete fat_controle_crimes_2026" ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE POLICY "Allowed roles can delete fat_controle_crimes_2026"
ON public.fat_controle_ocorrencias_crime_ambientais_2026 FOR DELETE TO authenticated
USING (public.radio_operador_can_read(auth.uid()));
