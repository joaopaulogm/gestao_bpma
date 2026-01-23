-- ============================================
-- VERIFICAR USUÁRIOS COM auth_user_id E CRIAR user_roles
-- ============================================
-- Esta migration verifica quais usuários já têm auth_user_id
-- e cria os registros em user_roles para eles

-- 1. Ver quantos usuários têm auth_user_id
SELECT 
  'Usuários com auth_user_id' as tipo,
  COUNT(*) as total
FROM public.usuarios_por_login
WHERE ativo = true
  AND auth_user_id IS NOT NULL

UNION ALL

SELECT 
  'Usuários sem auth_user_id' as tipo,
  COUNT(*) as total
FROM public.usuarios_por_login
WHERE ativo = true
  AND auth_user_id IS NULL;

-- 2. Listar usuários que JÁ TÊM auth_user_id e seus roles esperados
SELECT 
  upl.id,
  upl.login,
  upl.nome,
  upl.matricula,
  upl.auth_user_id,
  upl.efetivo_id,
  de.nome as nome_efetivo,
  er.role as role_efetivo,
  ur.role as role_user_roles,
  CASE 
    WHEN ur.id IS NULL THEN 'Precisa criar user_roles'
    WHEN ur.role != er.role THEN 'Role diferente - precisa atualizar'
    ELSE 'OK'
  END as status
FROM public.usuarios_por_login upl
LEFT JOIN public.dim_efetivo de ON de.id = upl.efetivo_id
LEFT JOIN LATERAL (
  SELECT role
  FROM public.efetivo_roles
  WHERE efetivo_id = upl.efetivo_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'secao_operacional' THEN 2
      WHEN 'secao_pessoas' THEN 3
      WHEN 'secao_logistica' THEN 4
      WHEN 'operador' THEN 5
      ELSE 6
    END
  LIMIT 1
) er ON true
LEFT JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
WHERE upl.ativo = true
  AND upl.auth_user_id IS NOT NULL
ORDER BY upl.nome;

-- 3. Criar/atualizar user_roles para usuários que JÁ TÊM auth_user_id
DO $$
DECLARE
  v_record record;
  v_role app_role;
  v_criados bigint := 0;
  v_atualizados bigint := 0;
  v_total bigint := 0;
BEGIN
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
    ORDER BY upl.nome
  LOOP
    v_total := v_total + 1;
    
    -- Se não tem efetivo_id, pular
    IF v_record.efetivo_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Buscar role em efetivo_roles
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
    
    -- Verificar se já existe um role para este user_id
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id) THEN
      -- Se já existe e é diferente, atualizar
      IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id AND role = v_role) THEN
        DELETE FROM public.user_roles WHERE user_id = v_record.auth_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, v_role);
        v_atualizados := v_atualizados + 1;
        RAISE NOTICE 'Atualizado: % (%) - role: %', v_record.nome, v_record.login, v_role;
      END IF;
    ELSE
      -- Inserir novo role
      BEGIN
        INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, v_role);
        v_criados := v_criados + 1;
        RAISE NOTICE 'Criado: % (%) - role: %', v_record.nome, v_record.login, v_role;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar role para % (%): %', v_record.nome, v_record.login, SQLERRM;
      END;
    END IF;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Sincronização concluída:';
  RAISE NOTICE '  Total de usuários com auth_user_id: %', v_total;
  RAISE NOTICE '  Roles criados: %', v_criados;
  RAISE NOTICE '  Roles atualizados: %', v_atualizados;
  RAISE NOTICE '========================================';
END $$;

-- 4. Verificar resultado final
SELECT 
  'Total de user_roles criados' as tipo,
  COUNT(*) as total
FROM public.user_roles

UNION ALL

SELECT 
  'Usuários com auth_user_id sem user_roles' as tipo,
  COUNT(*) as total
FROM public.usuarios_por_login upl
WHERE upl.ativo = true
  AND upl.auth_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = upl.auth_user_id
  );
