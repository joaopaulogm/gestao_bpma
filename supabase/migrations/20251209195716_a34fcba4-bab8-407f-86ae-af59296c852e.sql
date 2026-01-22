-- Criar tabela de usuários permitidos (policiais que podem se cadastrar)
CREATE TABLE public.allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  efetivo_id UUID REFERENCES public.dim_efetivo(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem e gerenciarem
CREATE POLICY "Admins can manage allowed_users"
ON public.allowed_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para verificação de email durante login (função security definer)
CREATE OR REPLACE FUNCTION public.is_allowed_user(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_users WHERE LOWER(email) = LOWER(check_email)
  )
$$;

-- Trigger para criar role automaticamente quando novo usuário faz signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role;
BEGIN
  -- Primeiro, verificar se é email admin por natureza
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_email') AND public.is_admin_email(NEW.email) THEN
    v_role := 'admin'::app_role;
  ELSIF EXISTS (SELECT 1 FROM public.allowed_users WHERE LOWER(email) = LOWER(NEW.email)) THEN
    -- Verificar se o email está na lista de permitidos
    v_role := 'operador'::app_role;
  ELSE
    -- Se não está em nenhuma lista, não criar role
    RETURN NEW;
  END IF;
  
  -- Criar role para o novo usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id) DO UPDATE SET role = v_role;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();