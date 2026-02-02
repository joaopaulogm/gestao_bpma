-- =============================================================
-- LOGIN: Sincronizar CPF em user_roles e corrigir verificar_primeiro_acesso
-- Garante que matrícula 731549X + CPF 92995330168 (e demais) funcionem.
-- Conexões: dim_efetivo (matricula) -> user_roles (efetivo_id, matricula, cpf);
--           usuarios_permitidos (Matrícula, CPF) -> user_roles por matrícula normalizada;
--           usuarios_por_login (efetivo_id, cpf) -> user_roles por efetivo_id.
-- =============================================================

-- 1) Garantir que todo dim_efetivo tenha uma linha em user_roles (se faltar)
INSERT INTO public.user_roles (
  user_id,
  efetivo_id,
  role,
  matricula,
  nome,
  nome_guerra,
  ativo
)
SELECT
  NULL::uuid,
  de.id,
  COALESCE(er.role, 'operador'::app_role),
  de.matricula,
  de.nome,
  de.nome_guerra,
  COALESCE(de.ativo, true)
FROM public.dim_efetivo de
LEFT JOIN public.efetivo_roles er ON er.efetivo_id = de.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = de.id
);

-- 2) Sincronizar CPF em user_roles a partir de usuarios_permitidos (matrícula normalizada)
UPDATE public.user_roles ur
SET cpf = up."CPF"
FROM public.usuarios_permitidos up
WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g')
    = regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g')
  AND up."CPF" IS NOT NULL
  AND (ur.cpf IS NULL OR ur.cpf IS DISTINCT FROM up."CPF");

-- 3) Sincronizar CPF em user_roles a partir de usuarios_por_login (por efetivo_id)
UPDATE public.user_roles ur
SET cpf = upl.cpf
FROM public.usuarios_por_login upl
WHERE ur.efetivo_id = upl.efetivo_id
  AND upl.efetivo_id IS NOT NULL
  AND upl.cpf IS NOT NULL
  AND (ur.cpf IS NULL OR ur.cpf IS DISTINCT FROM upl.cpf);

-- 4) Função verificar_primeiro_acesso: matrícula normalizada (só números) + CPF (user_roles, usuarios_permitidos ou usuarios_por_login)
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
  LEFT JOIN public.usuarios_permitidos up
    ON regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g') = v_matricula_limpa
   AND (
     up."CPF" = v_cpf_bigint
     OR (up."CPF"::TEXT IS NOT NULL AND lpad(regexp_replace(up."CPF"::TEXT, '[^0-9]', '', 'g'), 11, '0') = lpad(v_cpf_limpo, 11, '0'))
   )
  LEFT JOIN public.usuarios_por_login upl
    ON upl.efetivo_id = ur.efetivo_id
   AND (
     upl.cpf = v_cpf_bigint
     OR (upl.cpf::TEXT IS NOT NULL AND regexp_replace(upl.cpf::TEXT, '[^0-9]', '', 'g') = v_cpf_limpo)
   )
  WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g') = v_matricula_limpa
    AND (ur.ativo IS NULL OR ur.ativo = true)
    AND (
      ur.cpf = v_cpf_bigint
      OR (up."Matrícula" IS NOT NULL)
      OR (upl.id IS NOT NULL)
    )
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.verificar_primeiro_acesso(TEXT, TEXT) IS
  'Primeiro acesso: matrícula (números; X ignorado) + CPF 11 dígitos. Busca em user_roles, usuarios_permitidos e usuarios_por_login.';

-- 5) Trigger: manter user_roles.cpf em sync quando usuarios_permitidos for atualizado
CREATE OR REPLACE FUNCTION public.sync_user_roles_cpf_from_permitidos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles ur
  SET cpf = COALESCE(NEW."CPF", ur.cpf)
  WHERE regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g')
      = regexp_replace(COALESCE(trim(NEW."Matrícula"), ''), '[^0-9]', '', 'g');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_roles_cpf_permitidos ON public.usuarios_permitidos;
CREATE TRIGGER trg_sync_user_roles_cpf_permitidos
  AFTER INSERT OR UPDATE OF "Matrícula", "CPF"
  ON public.usuarios_permitidos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_cpf_from_permitidos();

-- 6) Trigger: manter user_roles.cpf em sync quando usuarios_por_login for atualizado
CREATE OR REPLACE FUNCTION public.sync_user_roles_cpf_from_por_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.efetivo_id IS NOT NULL AND NEW.cpf IS NOT NULL THEN
    UPDATE public.user_roles
    SET cpf = NEW.cpf
    WHERE efetivo_id = NEW.efetivo_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_roles_cpf_por_login ON public.usuarios_por_login;
CREATE TRIGGER trg_sync_user_roles_cpf_por_login
  AFTER INSERT OR UPDATE OF efetivo_id, cpf
  ON public.usuarios_por_login
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_cpf_from_por_login();
