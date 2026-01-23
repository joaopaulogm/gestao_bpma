-- ============================================
-- SINCRONIZAR user_roles COM efetivo_roles
-- ============================================
-- Esta migration sincroniza user_roles com efetivo_roles
-- Criando/atualizando registros em user_roles baseado nos roles de efetivo_roles
-- para todos os usuários que têm auth_user_id vinculado

-- 1. Garantir que usuarios_por_login está vinculado com dim_efetivo
-- (Atualizar vínculos que ainda não foram feitos)
UPDATE public.usuarios_por_login upl
SET efetivo_id = de.id
FROM public.dim_efetivo de
WHERE upl.matricula = de.matricula
  AND upl.efetivo_id IS NULL
  AND upl.matricula IS NOT NULL;

-- 2. Criar função para sincronizar user_roles com efetivo_roles
CREATE OR REPLACE FUNCTION public.sync_user_roles_from_efetivo()
RETURNS TABLE(
  usuarios_processados bigint,
  roles_criados bigint,
  roles_atualizados bigint,
  usuarios_sem_auth_user_id bigint,
  usuarios_sem_efetivo_id bigint
) AS $$
DECLARE
  v_usuarios_processados bigint := 0;
  v_roles_criados bigint := 0;
  v_roles_atualizados bigint := 0;
  v_usuarios_sem_auth_user_id bigint := 0;
  v_usuarios_sem_efetivo_id bigint := 0;
  v_record record;
  v_role app_role;
  v_email text;
BEGIN
  -- Processar cada usuário em usuarios_por_login que tenha auth_user_id
  FOR v_record IN 
    SELECT 
      upl.id,
      upl.auth_user_id,
      upl.efetivo_id,
      upl.login,
      upl.nome
    FROM public.usuarios_por_login upl
    WHERE upl.ativo = true
      AND upl.auth_user_id IS NOT NULL
  LOOP
    v_usuarios_processados := v_usuarios_processados + 1;
    
    -- Verificar se tem efetivo_id
    IF v_record.efetivo_id IS NULL THEN
      v_usuarios_sem_efetivo_id := v_usuarios_sem_efetivo_id + 1;
      CONTINUE;
    END IF;
    
    -- Verificar se o email do usuário é admin por natureza (se função existir)
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = v_record.auth_user_id;
    
    -- Se o email é admin por natureza, usar 'admin' diretamente
    IF v_email IS NOT NULL AND EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'is_admin_email'
    ) AND public.is_admin_email(v_email) THEN
      v_role := 'admin'::app_role;
    ELSE
      -- Buscar role em efetivo_roles (prioridade: admin > secao_operacional > secao_pessoas > secao_logistica > operador)
      SELECT role INTO v_role
      FROM public.efetivo_roles
      WHERE efetivo_id = v_record.efetivo_id
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
    END IF;
    
    -- Verificar se já existe um role para este user_id
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id) THEN
      -- Se já existe, verificar se o role é diferente
      IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id AND role = v_role) THEN
        -- Remover roles antigos e inserir o novo
        DELETE FROM public.user_roles WHERE user_id = v_record.auth_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, v_role);
        v_roles_atualizados := v_roles_atualizados + 1;
      END IF;
    ELSE
      -- Inserir novo role
      INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, v_role);
      v_roles_criados := v_roles_criados + 1;
    END IF;
  END LOOP;
  
  -- Contar usuários sem auth_user_id
  SELECT COUNT(*) INTO v_usuarios_sem_auth_user_id
  FROM public.usuarios_por_login
  WHERE ativo = true
    AND auth_user_id IS NULL;
  
  RETURN QUERY SELECT 
    v_usuarios_processados,
    v_roles_criados,
    v_roles_atualizados,
    v_usuarios_sem_auth_user_id,
    v_usuarios_sem_efetivo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Executar a sincronização inicial
SELECT * FROM public.sync_user_roles_from_efetivo();

-- 4. Criar função para verificar se todos os policiais de efetivo_roles estão em user_roles
CREATE OR REPLACE FUNCTION public.verificar_cobertura_user_roles()
RETURNS TABLE(
  total_efetivo_roles bigint,
  total_com_user_roles bigint,
  total_sem_user_roles bigint,
  policiais_sem_user_roles jsonb
) AS $$
DECLARE
  v_total_efetivo_roles bigint;
  v_total_com_user_roles bigint;
  v_total_sem_user_roles bigint;
  v_policiais_sem_user_roles jsonb;
BEGIN
  -- Contar total de efetivo_roles
  SELECT COUNT(DISTINCT efetivo_id) INTO v_total_efetivo_roles
  FROM public.efetivo_roles;
  
  -- Contar quantos têm user_roles (através de usuarios_por_login -> auth_user_id -> user_roles)
  SELECT COUNT(DISTINCT er.efetivo_id) INTO v_total_com_user_roles
  FROM public.efetivo_roles er
  INNER JOIN public.usuarios_por_login upl ON upl.efetivo_id = er.efetivo_id
  INNER JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
  WHERE upl.ativo = true
    AND upl.auth_user_id IS NOT NULL;
  
  -- Calcular quantos não têm
  v_total_sem_user_roles := v_total_efetivo_roles - v_total_com_user_roles;
  
  -- Listar policiais sem user_roles
  SELECT jsonb_agg(
    jsonb_build_object(
      'efetivo_id', er.efetivo_id,
      'role', er.role,
      'nome', de.nome,
      'matricula', de.matricula,
      'tem_auth_user_id', CASE WHEN upl.auth_user_id IS NOT NULL THEN true ELSE false END,
      'login', upl.login
    )
  ) INTO v_policiais_sem_user_roles
  FROM public.efetivo_roles er
  INNER JOIN public.dim_efetivo de ON de.id = er.efetivo_id
  LEFT JOIN public.usuarios_por_login upl ON upl.efetivo_id = er.efetivo_id AND upl.ativo = true
  LEFT JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
  WHERE ur.id IS NULL
    OR upl.auth_user_id IS NULL;
  
  RETURN QUERY SELECT 
    v_total_efetivo_roles,
    v_total_com_user_roles,
    v_total_sem_user_roles,
    COALESCE(v_policiais_sem_user_roles, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger para sincronizar automaticamente quando auth_user_id é vinculado
CREATE OR REPLACE FUNCTION public.sync_user_role_on_auth_link()
RETURNS TRIGGER AS $$
DECLARE
  v_efetivo_id uuid;
  v_role app_role;
BEGIN
  -- Se auth_user_id foi definido e não era NULL antes
  IF NEW.auth_user_id IS NOT NULL AND (OLD.auth_user_id IS NULL OR OLD.auth_user_id != NEW.auth_user_id) THEN
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

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_user_role_on_auth_link ON public.usuarios_por_login;
CREATE TRIGGER trigger_sync_user_role_on_auth_link
  AFTER INSERT OR UPDATE OF auth_user_id, efetivo_id ON public.usuarios_por_login
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_on_auth_link();

-- 6. Comentários
COMMENT ON FUNCTION public.sync_user_roles_from_efetivo IS 'Sincroniza user_roles com efetivo_roles para todos os usuários que têm auth_user_id';
COMMENT ON FUNCTION public.verificar_cobertura_user_roles IS 'Verifica se todos os policiais de efetivo_roles têm registros correspondentes em user_roles';
COMMENT ON FUNCTION public.sync_user_role_on_auth_link IS 'Sincroniza automaticamente user_roles quando auth_user_id é vinculado em usuarios_por_login';

-- 7. Executar verificação final
-- Esta query retornará um relatório mostrando quantos policiais estão cobertos
SELECT * FROM public.verificar_cobertura_user_roles();
