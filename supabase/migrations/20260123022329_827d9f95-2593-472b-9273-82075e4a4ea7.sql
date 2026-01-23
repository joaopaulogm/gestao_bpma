-- Recriar RPC (precisa dropar antes porque o tipo de retorno mudou)
DROP FUNCTION IF EXISTS public.get_usuario_by_login_senha(text, text);

CREATE FUNCTION public.get_usuario_by_login_senha(
  p_login text,
  p_senha text
)
RETURNS TABLE (
  id uuid,
  auth_user_id uuid,
  efetivo_id uuid,
  nome text,
  login text,
  email text,
  matricula text,
  cpf bigint,
  senha text,
  ativo boolean,
  nome_guerra text,
  post_grad text,
  quadro text,
  lotacao text,
  data_nascimento date,
  contato text,
  vinculado_em timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_login text;
  v_senha text;
BEGIN
  v_login := lower(trim(coalesce(p_login, '')));
  v_senha := regexp_replace(coalesce(p_senha, ''), '[^0-9]', '', 'g');

  RETURN QUERY
  WITH base AS (
    SELECT
      upl.id,
      upl.auth_user_id,
      upl.efetivo_id,
      upl.nome,
      upl.login,
      upl.email,
      upl.matricula,
      upl.cpf,
      upl.senha::text AS senha,
      upl.ativo,
      upl.nome_guerra,
      upl.post_grad,
      upl.quadro,
      upl.lotacao,
      upl.data_nascimento,
      upl.contato,
      upl.vinculado_em,
      lpad(regexp_replace(coalesce(upl.senha::text, ''), '[^0-9]', '', 'g'), 11, '0') AS senha_11,
      lpad(regexp_replace(coalesce(upl.cpf::text, ''),   '[^0-9]', '', 'g'), 11, '0') AS cpf_11,
      regexp_replace(coalesce(upl.matricula, ''), '[^0-9]', '', 'g') AS matricula_num
    FROM public.usuarios_por_login upl
    WHERE coalesce(upl.ativo, true) = true
      AND (lower(upl.login) = v_login OR upl.matricula = v_login)
    LIMIT 1
  )
  SELECT
    id, auth_user_id, efetivo_id, nome, login, email, matricula, cpf, senha, ativo,
    nome_guerra, post_grad, quadro, lotacao, data_nascimento, contato, vinculado_em
  FROM base
  WHERE (
    v_senha = regexp_replace(coalesce(base.senha, ''), '[^0-9]', '', 'g')
    OR v_senha = base.senha_11
    OR v_senha = regexp_replace(coalesce(base.cpf::text, ''), '[^0-9]', '', 'g')
    OR v_senha = base.cpf_11
    OR v_senha = base.matricula_num
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_usuario_by_login_senha(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_usuario_by_login_senha(text, text) TO authenticated;

COMMENT ON FUNCTION public.get_usuario_by_login_senha(text, text)
IS 'Valida login (primeiro_nome.ultimo_nome ou matricula) + senha (CPF 11 dígitos ou matricula) no primeiro acesso, via SECURITY DEFINER.';