-- Corrigir função: tabela user_roles não possui coluna updated_at
CREATE OR REPLACE FUNCTION public.atualizar_senha_user_roles(
  p_user_role_id UUID,
  p_nova_senha TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE user_roles
  SET senha = extensions.crypt(p_nova_senha, extensions.gen_salt('bf', 8))
  WHERE id = p_user_role_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_senha_user_roles(UUID, TEXT) TO anon, authenticated;