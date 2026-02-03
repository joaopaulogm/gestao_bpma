-- =============================================================
-- LOGIN primeiro acesso: GRANT + função com EXISTS + diagnóstico
-- Garante execução por anon e lógica mais robusta.
-- =============================================================

-- Garantir permissão de execução para anon (login público)
GRANT EXECUTE ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) TO authenticated;

-- Reescrever verificar_primeiro_acesso usando EXISTS (evita problemas de JOIN)
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
  -- Normalizar matrícula: só dígitos (731549X -> 731549)
  v_matricula_limpa := regexp_replace(trim(COALESCE(p_matricula, '')), '[^0-9]', '', 'g');
  v_cpf_limpo := regexp_replace(trim(COALESCE(p_cpf, '')), '[^0-9]', '', 'g');
  IF length(v_cpf_limpo) < 11 THEN
    v_cpf_limpo := lpad(v_cpf_limpo, 11, '0');
  ELSIF length(v_cpf_limpo) > 11 THEN
    v_cpf_limpo := right(v_cpf_limpo, 11);
  END IF;
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
  WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
    AND (ur.ativo IS NULL OR ur.ativo = true)
    AND (
      ur.cpf = v_cpf_bigint
      OR EXISTS (
        SELECT 1 FROM public.usuarios_permitidos up
        WHERE regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g') = v_matricula_limpa
          AND (
            up."CPF" = v_cpf_bigint
            OR lpad(regexp_replace(COALESCE(up."CPF"::TEXT, ''), '[^0-9]', '', 'g'), 11, '0') = lpad(v_cpf_limpo, 11, '0')
          )
      )
      OR EXISTS (
        SELECT 1 FROM public.usuarios_por_login upl
        WHERE upl.efetivo_id = ur.efetivo_id
          AND (
            upl.cpf = v_cpf_bigint
            OR regexp_replace(COALESCE(upl.cpf::TEXT, ''), '[^0-9]', '', 'g') = v_cpf_limpo
          )
      )
    )
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) IS
  'Primeiro acesso: matrícula (só números; X ignorado) + CPF 11 dígitos. Busca em user_roles + usuarios_permitidos + usuarios_por_login.';

-- Função de diagnóstico: executar no SQL Editor para ver por que o login falha
-- Ex.: SELECT * FROM public.diagnostico_primeiro_acesso('731549X', '92995330168');
CREATE OR REPLACE FUNCTION public.diagnostico_primeiro_acesso(
  p_matricula TEXT,
  p_cpf TEXT
)
RETURNS TABLE (
  matricula_normalizada TEXT,
  cpf_bigint BIGINT,
  tem_dim_efetivo BOOLEAN,
  tem_user_roles BOOLEAN,
  user_roles_cpf_preenchido BOOLEAN,
  tem_usuarios_permitidos BOOLEAN,
  tem_usuarios_por_login BOOLEAN,
  mensagem TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_limpa TEXT;
  v_cpf_bigint BIGINT;
  v_tem_de BOOLEAN;
  v_tem_ur BOOLEAN;
  v_ur_cpf BOOLEAN;
  v_tem_up BOOLEAN;
  v_tem_upl BOOLEAN;
  v_msg TEXT;
BEGIN
  v_matricula_limpa := regexp_replace(trim(COALESCE(p_matricula, '')), '[^0-9]', '', 'g');
  BEGIN
    v_cpf_bigint := regexp_replace(trim(COALESCE(p_cpf, '')), '[^0-9]', '', 'g')::BIGINT;
  EXCEPTION WHEN OTHERS THEN
    v_cpf_bigint := 0;
  END;

  SELECT EXISTS (
    SELECT 1 FROM public.dim_efetivo de
    WHERE regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
  ) INTO v_tem_de;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
  ) INTO v_tem_ur;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
      AND ur.cpf = v_cpf_bigint
  ) INTO v_ur_cpf;

  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_permitidos up
    WHERE regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g') = v_matricula_limpa
      AND (up."CPF" = v_cpf_bigint OR lpad(regexp_replace(COALESCE(up."CPF"::TEXT, ''), '[^0-9]', '', 'g'), 11, '0') = lpad(regexp_replace(COALESCE(p_cpf, ''), '[^0-9]', '', 'g'), 11, '0'))
  ) INTO v_tem_up;

  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_por_login upl
    INNER JOIN public.user_roles ur ON ur.efetivo_id = upl.efetivo_id
    WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
      AND (upl.cpf = v_cpf_bigint OR upl.cpf::TEXT = regexp_replace(COALESCE(p_cpf, ''), '[^0-9]', '', 'g'))
  ) INTO v_tem_upl;

  v_msg := CASE
    WHEN NOT v_tem_de THEN 'Policial não está em dim_efetivo. Cadastre a matrícula em dim_efetivo.'
    WHEN NOT v_tem_ur THEN 'Não há linha em user_roles para essa matrícula. Rode a migration que insere user_roles a partir de dim_efetivo.'
    WHEN NOT v_ur_cpf AND NOT v_tem_up AND NOT v_tem_upl THEN 'CPF não confere em user_roles, usuarios_permitidos nem usuarios_por_login. Cadastre o CPF em usuarios_permitidos (Matrícula + CPF) ou usuarios_por_login (efetivo_id + cpf).'
    WHEN v_tem_ur AND (v_ur_cpf OR v_tem_up OR v_tem_upl) THEN 'Dados encontrados. O login deveria funcionar; se não, verifique RLS ou permissões da função.'
    ELSE 'Verifique os dados nas tabelas dim_efetivo, user_roles, usuarios_permitidos, usuarios_por_login.'
  END;

  matricula_normalizada := v_matricula_limpa;
  cpf_bigint := v_cpf_bigint;
  tem_dim_efetivo := v_tem_de;
  tem_user_roles := v_tem_ur;
  user_roles_cpf_preenchido := v_ur_cpf;
  tem_usuarios_permitidos := v_tem_up;
  tem_usuarios_por_login := v_tem_upl;
  mensagem := v_msg;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.diagnostico_primeiro_acesso(TEXT, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.diagnostico_primeiro_acesso(TEXT, TEXT) IS
  'Diagnóstico do primeiro acesso: mostra em quais tabelas a matrícula/CPF foram encontrados. Executar no SQL Editor.';
