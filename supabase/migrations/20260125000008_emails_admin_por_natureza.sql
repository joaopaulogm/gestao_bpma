-- ============================================
-- EMAILS ADMINISTRADORES POR NATUREZA
-- ============================================
-- Esta migration garante que emails específicos sejam sempre administradores
-- independentemente do que está em efetivo_roles

-- 1. Criar função auxiliar para verificar se um email é admin por natureza
CREATE OR REPLACE FUNCTION public.is_admin_email(p_email text)
RETURNS boolean AS $$
BEGIN
  RETURN LOWER(TRIM(p_email)) IN (
    'soi.bpma@gmail.com',
    'joaopaulogm@gmail.com'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Atualizar função get_role_by_auth_user_id para verificar emails admin primeiro
CREATE OR REPLACE FUNCTION public.get_role_by_auth_user_id(
  p_auth_user_id uuid
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Primeiro, verificar se o email do usuário é admin por natureza
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_auth_user_id;
  
  -- Se o email é admin por natureza, retornar 'admin' imediatamente
  IF v_email IS NOT NULL AND public.is_admin_email(v_email) THEN
    RETURN 'admin'::app_role;
  END IF;
  
  -- Buscar efetivo_id através de usuarios_por_login usando auth_user_id
  SELECT efetivo_id INTO v_efetivo_id
  FROM public.usuarios_por_login
  WHERE auth_user_id = p_auth_user_id
    AND ativo = true;
  
  -- Se não encontrou usuário, retornar null
  IF v_efetivo_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Buscar role em efetivo_roles
  SELECT role INTO v_role
  FROM public.efetivo_roles
  WHERE efetivo_id = v_efetivo_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secao_operacional' THEN 2
      WHEN 'secao_pessoas' THEN 3
      WHEN 'secao_logistica' THEN 4
      WHEN 'operador' THEN 5
      ELSE 6
    END
  LIMIT 1;
  
  -- Retornar role encontrado ou 'operador' como padrão
  RETURN COALESCE(v_role, 'operador'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar função get_role_by_login_senha para verificar email também
CREATE OR REPLACE FUNCTION public.get_role_by_login_senha(
  p_login text,
  p_senha bigint
)
RETURNS app_role AS $$
DECLARE
  v_email text;
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Buscar email e efetivo_id através de usuarios_por_login
  SELECT email, efetivo_id INTO v_email, v_efetivo_id
  FROM public.usuarios_por_login
  WHERE login = LOWER(TRIM(p_login))
    AND senha = p_senha
    AND ativo = true;
  
  -- Se não encontrou usuário, retornar null
  IF v_efetivo_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Se o email é admin por natureza, retornar 'admin' imediatamente
  IF v_email IS NOT NULL AND public.is_admin_email(v_email) THEN
    RETURN 'admin'::app_role;
  END IF;
  
  -- Buscar role em efetivo_roles
  SELECT role INTO v_role
  FROM public.efetivo_roles
  WHERE efetivo_id = v_efetivo_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secao_operacional' THEN 2
      WHEN 'secao_pessoas' THEN 3
      WHEN 'secao_logistica' THEN 4
      WHEN 'operador' THEN 5
      ELSE 6
    END
  LIMIT 1;
  
  -- Retornar role encontrado ou 'operador' como padrão
  RETURN COALESCE(v_role, 'operador'::app_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar trigger sync_user_role_on_auth_link para verificar emails admin
CREATE OR REPLACE FUNCTION public.sync_user_role_on_auth_link()
RETURNS TRIGGER AS $$
DECLARE
  v_efetivo_id uuid;
  v_role app_role;
  v_email text;
BEGIN
  -- Se auth_user_id foi definido e não era NULL antes
  IF NEW.auth_user_id IS NOT NULL AND (OLD.auth_user_id IS NULL OR OLD.auth_user_id != NEW.auth_user_id) THEN
    -- Buscar email do auth.users
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = NEW.auth_user_id;
    
    -- Se o email é admin por natureza, usar 'admin' diretamente
    IF v_email IS NOT NULL AND public.is_admin_email(v_email) THEN
      -- Verificar se já existe um role para este user_id
      IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.auth_user_id) THEN
        -- Se já existe e não é admin, atualizar
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.auth_user_id AND role = 'admin') THEN
          DELETE FROM public.user_roles WHERE user_id = NEW.auth_user_id;
          INSERT INTO public.user_roles (user_id, role) VALUES (NEW.auth_user_id, 'admin');
        END IF;
      ELSE
        -- Inserir novo role como admin
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.auth_user_id, 'admin');
      END IF;
      RETURN NEW;
    END IF;
    
    -- Buscar efetivo_id
    v_efetivo_id := NEW.efetivo_id;
    
    -- Se não tem efetivo_id, tentar buscar pela matrícula
    IF v_efetivo_id IS NULL AND NEW.matricula IS NOT NULL THEN
      SELECT id INTO v_efetivo_id
      FROM public.dim_efetivo
      WHERE matricula = NEW.matricula
      LIMIT 1;
      
      -- Atualizar efetivo_id se encontrou
      IF v_efetivo_id IS NOT NULL THEN
        UPDATE public.usuarios_por_login
        SET efetivo_id = v_efetivo_id
        WHERE id = NEW.id;
      END IF;
    END IF;
    
    -- Se tem efetivo_id, buscar role e criar user_roles
    IF v_efetivo_id IS NOT NULL THEN
      SELECT role INTO v_role
      FROM public.efetivo_roles
      WHERE efetivo_id = v_efetivo_id
      ORDER BY 
        CASE role
          WHEN 'admin' THEN 1
          WHEN 'secao_operacional' THEN 2
          WHEN 'secao_pessoas' THEN 3
          WHEN 'secao_logistica' THEN 4
          WHEN 'operador' THEN 5
          ELSE 6
        END
      LIMIT 1;
      
      -- Se não encontrou role, usar 'operador' como padrão
      IF v_role IS NULL THEN
        v_role := 'operador'::app_role;
      END IF;
      
      -- Verificar se já existe um role para este user_id
      IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.auth_user_id) THEN
        -- Se já existe e é diferente, atualizar
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.auth_user_id AND role = v_role) THEN
          DELETE FROM public.user_roles WHERE user_id = NEW.auth_user_id;
          INSERT INTO public.user_roles (user_id, role) VALUES (NEW.auth_user_id, v_role);
        END IF;
      ELSE
        -- Inserir novo role
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.auth_user_id, v_role);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Garantir que usuários com esses emails tenham role 'admin' em user_roles
DO $$
DECLARE
  v_record record;
  v_count bigint;
BEGIN
  -- Para cada email admin, garantir que tenha role 'admin'
  FOR v_record IN 
    SELECT DISTINCT au.id as auth_user_id, au.email
    FROM auth.users au
    WHERE public.is_admin_email(au.email)
  LOOP
    -- Verificar se já existe
    SELECT COUNT(*) INTO v_count
    FROM public.user_roles
    WHERE user_id = v_record.auth_user_id;
    
    IF v_count = 0 THEN
      -- Criar role admin
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (v_record.auth_user_id, 'admin');
      RAISE NOTICE 'Criado role admin para: %', v_record.email;
    ELSIF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id AND role = 'admin') THEN
      -- Atualizar para admin
      DELETE FROM public.user_roles WHERE user_id = v_record.auth_user_id;
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (v_record.auth_user_id, 'admin');
      RAISE NOTICE 'Atualizado role para admin: %', v_record.email;
    END IF;
  END LOOP;
END $$;

-- 6. Comentários
COMMENT ON FUNCTION public.is_admin_email IS 'Verifica se um email é administrador por natureza';
COMMENT ON FUNCTION public.get_role_by_auth_user_id IS 'Busca role do usuário baseado em auth_user_id, verificando primeiro se é admin por natureza';
COMMENT ON FUNCTION public.get_role_by_login_senha IS 'Busca role do usuário baseado em login e senha, verificando primeiro se é admin por natureza';
