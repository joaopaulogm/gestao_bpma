-- Adicionar campos de endereço e contato na tabela user_roles
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS logradouro TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS complemento TEXT,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS uf TEXT,
ADD COLUMN IF NOT EXISTS grupamento TEXT,
ADD COLUMN IF NOT EXISTS escala TEXT,
ADD COLUMN IF NOT EXISTS equipe TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at_trigger
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_roles_updated_at();

-- Função RPC para atualizar dados do perfil (apenas campos permitidos)
CREATE OR REPLACE FUNCTION public.atualizar_perfil_usuario(
  p_user_role_id UUID,
  p_nome TEXT DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_cep TEXT DEFAULT NULL,
  p_logradouro TEXT DEFAULT NULL,
  p_numero TEXT DEFAULT NULL,
  p_complemento TEXT DEFAULT NULL,
  p_bairro TEXT DEFAULT NULL,
  p_cidade TEXT DEFAULT NULL,
  p_uf TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_roles
  SET 
    nome = COALESCE(p_nome, nome),
    telefone = COALESCE(p_telefone, telefone),
    email = COALESCE(p_email, email),
    cep = COALESCE(p_cep, cep),
    logradouro = COALESCE(p_logradouro, logradouro),
    numero = COALESCE(p_numero, numero),
    complemento = COALESCE(p_complemento, complemento),
    bairro = COALESCE(p_bairro, bairro),
    cidade = COALESCE(p_cidade, cidade),
    uf = COALESCE(p_uf, uf)
  WHERE id = p_user_role_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.atualizar_perfil_usuario(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Função para buscar dados completos do perfil
CREATE OR REPLACE FUNCTION public.buscar_perfil_usuario(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  efetivo_id UUID,
  nome TEXT,
  nome_guerra TEXT,
  matricula TEXT,
  cpf BIGINT,
  email TEXT,
  data_nascimento DATE,
  idade INTEGER,
  sexo TEXT,
  contato TEXT,
  telefone TEXT,
  post_grad TEXT,
  quadro TEXT,
  lotacao TEXT,
  porte_arma TEXT,
  grupamento TEXT,
  escala TEXT,
  equipe TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  role TEXT,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    ur.data_nascimento,
    ur.idade,
    ur.sexo,
    ur.contato,
    ur.telefone,
    ur.post_grad,
    ur.quadro,
    ur.lotacao,
    ur.porte_arma,
    ur.grupamento,
    ur.escala,
    ur.equipe,
    ur.cep,
    ur.logradouro,
    ur.numero,
    ur.complemento,
    ur.bairro,
    ur.cidade,
    ur.uf,
    ur.role::TEXT,
    ur.ativo,
    ur.created_at,
    ur.updated_at
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_perfil_usuario(UUID) TO authenticated;