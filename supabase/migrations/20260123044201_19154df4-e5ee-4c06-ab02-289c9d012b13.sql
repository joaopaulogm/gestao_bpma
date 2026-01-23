-- =====================================================
-- STORAGE: Bucket para fotos de perfil
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

-- =====================================================
-- TABELA: Notificações internas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_role_id UUID REFERENCES public.user_roles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  categoria TEXT, -- ferias, escala, afastamento, sistema
  lida BOOLEAN NOT NULL DEFAULT false,
  data_leitura TIMESTAMPTZ,
  dados_extras JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Users can view their own notifications"
ON public.notificacoes FOR SELECT
USING (
  user_role_id IN (
    SELECT id FROM public.user_roles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert notifications"
ON public.notificacoes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notificacoes FOR UPDATE
USING (
  user_role_id IN (
    SELECT id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_role_id ON public.notificacoes(user_role_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON public.notificacoes(created_at DESC);

-- =====================================================
-- USER_ROLES: Adicionar campo para foto de perfil
-- =====================================================
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- =====================================================
-- FUNÇÃO: Atualizar foto de perfil
-- =====================================================
CREATE OR REPLACE FUNCTION public.atualizar_foto_perfil(p_user_role_id UUID, p_foto_url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_roles
  SET foto_url = p_foto_url
  WHERE id = p_user_role_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_foto_perfil(UUID, TEXT) TO authenticated;

-- =====================================================
-- FUNÇÃO: Marcar notificação como lida
-- =====================================================
CREATE OR REPLACE FUNCTION public.marcar_notificacao_lida(p_notificacao_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notificacoes
  SET lida = true, data_leitura = now()
  WHERE id = p_notificacao_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.marcar_notificacao_lida(UUID) TO authenticated;

-- =====================================================
-- FUNÇÃO: Buscar notificações do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION public.buscar_notificacoes_usuario(p_user_id UUID, p_apenas_nao_lidas BOOLEAN DEFAULT false)
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  mensagem TEXT,
  tipo TEXT,
  categoria TEXT,
  lida BOOLEAN,
  data_leitura TIMESTAMPTZ,
  dados_extras JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.titulo,
    n.mensagem,
    n.tipo,
    n.categoria,
    n.lida,
    n.data_leitura,
    n.dados_extras,
    n.created_at
  FROM public.notificacoes n
  INNER JOIN public.user_roles ur ON ur.id = n.user_role_id
  WHERE ur.user_id = p_user_id
    AND (NOT p_apenas_nao_lidas OR n.lida = false)
  ORDER BY n.created_at DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_notificacoes_usuario(UUID, BOOLEAN) TO authenticated;

-- =====================================================
-- FUNÇÃO: Criar notificação
-- =====================================================
CREATE OR REPLACE FUNCTION public.criar_notificacao(
  p_user_role_id UUID,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_tipo TEXT DEFAULT 'info',
  p_categoria TEXT DEFAULT NULL,
  p_dados_extras JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notificacoes (user_role_id, titulo, mensagem, tipo, categoria, dados_extras)
  VALUES (p_user_role_id, p_titulo, p_mensagem, p_tipo, p_categoria, p_dados_extras)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_notificacao(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- =====================================================
-- FUNÇÃO: Recuperar senha (gerar token)
-- =====================================================
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.solicitar_recuperacao_senha(p_matricula TEXT, p_cpf TEXT)
RETURNS TABLE(
  sucesso BOOLEAN,
  mensagem TEXT,
  user_role_id UUID,
  email TEXT,
  nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role RECORD;
  v_token TEXT;
  v_matricula_limpa TEXT;
  v_cpf_limpo TEXT;
  v_cpf_bigint BIGINT;
BEGIN
  -- Limpar matrícula
  v_matricula_limpa := upper(regexp_replace(p_matricula, '[^0-9Xx]', '', 'g'));
  
  -- Limpar CPF e converter para BIGINT
  v_cpf_limpo := regexp_replace(p_cpf, '[^0-9]', '', 'g');
  BEGIN
    v_cpf_bigint := v_cpf_limpo::BIGINT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'CPF inválido'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END;

  -- Buscar usuário
  SELECT ur.id, ur.email, ur.nome, ur.nome_guerra
  INTO v_user_role
  FROM public.user_roles ur
  WHERE upper(regexp_replace(COALESCE(ur.matricula, ''), '[^0-9Xx]', '', 'g')) = v_matricula_limpa
    AND ur.cpf = v_cpf_bigint
    AND ur.ativo = true
  LIMIT 1;

  IF v_user_role.id IS NULL THEN
    RETURN QUERY SELECT false, 'Matrícula ou CPF não encontrados'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Gerar token aleatório
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Salvar token com expiração de 1 hora
  UPDATE public.user_roles
  SET reset_token = v_token,
      reset_token_expires = now() + interval '1 hour'
  WHERE id = v_user_role.id;

  RETURN QUERY SELECT 
    true, 
    v_token,
    v_user_role.id,
    v_user_role.email,
    COALESCE(v_user_role.nome_guerra, v_user_role.nome);
END;
$$;

GRANT EXECUTE ON FUNCTION public.solicitar_recuperacao_senha(TEXT, TEXT) TO anon, authenticated;

-- =====================================================
-- FUNÇÃO: Redefinir senha com token
-- =====================================================
CREATE OR REPLACE FUNCTION public.redefinir_senha_com_token(p_token TEXT, p_nova_senha TEXT)
RETURNS TABLE(sucesso BOOLEAN, mensagem TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_role_id UUID;
BEGIN
  -- Buscar usuário com token válido
  SELECT id INTO v_user_role_id
  FROM public.user_roles
  WHERE reset_token = p_token
    AND reset_token_expires > now()
  LIMIT 1;

  IF v_user_role_id IS NULL THEN
    RETURN QUERY SELECT false, 'Token inválido ou expirado'::TEXT;
    RETURN;
  END IF;

  -- Atualizar senha e limpar token
  UPDATE public.user_roles
  SET senha = extensions.crypt(p_nova_senha, extensions.gen_salt('bf', 8)),
      reset_token = NULL,
      reset_token_expires = NULL
  WHERE id = v_user_role_id;

  RETURN QUERY SELECT true, 'Senha redefinida com sucesso'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redefinir_senha_com_token(TEXT, TEXT) TO anon, authenticated;