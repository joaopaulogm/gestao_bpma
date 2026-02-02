-- =============================================================
-- CORRIGIR verificar_primeiro_acesso: aceitar CPF de user_roles
-- OU de usuarios_permitidos/usuarios_por_login (matrícula normalizada)
-- Assim o primeiro acesso funciona mesmo quando user_roles.cpf
-- não foi preenchido na migração (ex.: matrícula com X vs sem X).
-- =============================================================

CREATE OR REPLACE FUNCTION public.verificar_primeiro_acesso(
  p_matricula TEXT,
  p_cpf TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  efetivo_id UUID,
  nome TEXT,
  nome_guerra TEXT,
  matricula TEXT,
  cpf BIGINT,
  email TEXT,
  post_grad TEXT,
  quadro TEXT,
  lotacao TEXT,
  role TEXT,
  ativo BOOLEAN,
  senha TEXT,
  vinculado_em TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_limpa TEXT;
  v_cpf_limpo TEXT;
  v_cpf_bigint BIGINT;
BEGIN
  -- Matrícula: apenas números (aceita "731549X" → "731549")
  v_matricula_limpa := regexp_replace(p_matricula, '[^0-9]', '', 'g');

  -- CPF: apenas números e converter para BIGINT
  v_cpf_limpo := regexp_replace(p_cpf, '[^0-9]', '', 'g');
  BEGIN
    v_cpf_bigint := v_cpf_limpo::BIGINT;
  EXCEPTION WHEN OTHERS THEN
    v_cpf_bigint := 0;
  END;

  RETURN QUERY
  SELECT
    ur.id,
    ur.user_id,
    ur.efetivo_id,
    ur.nome,
    ur.nome_guerra,
    ur.matricula,
    ur.cpf,
    ur.email,
    ur.post_grad,
    ur.quadro,
    ur.lotacao,
    ur.role::TEXT,
    ur.ativo,
    ur.senha,
    ur.vinculado_em
  FROM public.user_roles ur
  LEFT JOIN public.usuarios_permitidos up
    ON regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g') = v_matricula_limpa
   AND (up."CPF"::BIGINT = v_cpf_bigint OR lpad(regexp_replace(COALESCE(up."CPF"::TEXT, ''), '[^0-9]', '', 'g'), 11, '0') = lpad(v_cpf_limpo, 11, '0'))
  LEFT JOIN public.usuarios_por_login upl
    ON upl.efetivo_id = ur.efetivo_id
   AND (upl.cpf = v_cpf_bigint OR regexp_replace(COALESCE(upl.cpf::TEXT, ''), '[^0-9]', '', 'g') = v_cpf_limpo)
  WHERE regexp_replace(COALESCE(ur.matricula, ''), '[^0-9]', '', 'g') = v_matricula_limpa
    AND (
      ur.cpf = v_cpf_bigint
      OR (up."Matrícula" IS NOT NULL AND (up."CPF" IS NOT NULL))
      OR upl.id IS NOT NULL
    )
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) IS
  'Valida primeiro acesso: matrícula (números, X removido) + CPF (11 dígitos). Aceita CPF em user_roles, usuarios_permitidos ou usuarios_por_login.';
