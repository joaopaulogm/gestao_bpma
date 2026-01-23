-- Habilitar extensão pgcrypto para funções de hash bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recriar função atualizar_senha_user_roles com pgcrypto habilitado
CREATE OR REPLACE FUNCTION public.atualizar_senha_user_roles(
  p_user_role_id UUID,
  p_nova_senha TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_roles
  SET senha = crypt(p_nova_senha, gen_salt('bf', 8)),
      updated_at = NOW()
  WHERE id = p_user_role_id;
  
  RETURN FOUND;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.atualizar_senha_user_roles(UUID, TEXT) TO anon, authenticated;