-- ============================================
-- FORÇAR ADMIN PARA EMAILS ESPECÍFICOS
-- ============================================
-- Esta migration garante que emails específicos tenham acesso admin
-- e corrige qualquer problema de sincronização

-- 1. Garantir que a função is_admin_email existe e está correta
CREATE OR REPLACE FUNCTION public.is_admin_email(p_email text)
RETURNS boolean AS $$
BEGIN
  RETURN LOWER(TRIM(COALESCE(p_email, ''))) IN (
    'soi.bpma@gmail.com',
    'joaopaulogm@gmail.com'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Forçar criação/atualização de user_roles para emails admin
DO $$
DECLARE
  v_record record;
  v_count bigint;
BEGIN
  -- Para cada email admin em auth.users, garantir role 'admin'
  FOR v_record IN 
    SELECT DISTINCT au.id as auth_user_id, au.email
    FROM auth.users au
    WHERE public.is_admin_email(au.email)
  LOOP
    RAISE NOTICE 'Processando email admin: % (auth_user_id: %)', v_record.email, v_record.auth_user_id;
    
    -- Verificar se já existe
    SELECT COUNT(*) INTO v_count
    FROM public.user_roles
    WHERE user_id = v_record.auth_user_id;
    
    IF v_count = 0 THEN
      -- Criar role admin
      BEGIN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (v_record.auth_user_id, 'admin');
        RAISE NOTICE '✓ Criado role admin para: %', v_record.email;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar role para %: %', v_record.email, SQLERRM;
      END;
    ELSIF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id AND role = 'admin') THEN
      -- Atualizar para admin (remover outros roles e criar admin)
      BEGIN
        DELETE FROM public.user_roles WHERE user_id = v_record.auth_user_id;
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (v_record.auth_user_id, 'admin');
        RAISE NOTICE '✓ Atualizado role para admin: %', v_record.email;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao atualizar role para %: %', v_record.email, SQLERRM;
      END;
    ELSE
      RAISE NOTICE '✓ Role admin já existe para: %', v_record.email;
    END IF;
  END LOOP;
  
  -- Verificar se há emails admin sem auth_user_id em usuarios_por_login
  FOR v_record IN 
    SELECT DISTINCT upl.id, upl.email, upl.login, upl.nome
    FROM public.usuarios_por_login upl
    WHERE public.is_admin_email(upl.email)
      AND upl.ativo = true
  LOOP
    RAISE NOTICE 'Email admin encontrado em usuarios_por_login: % (login: %)', v_record.email, v_record.login;
    
    -- Tentar vincular com auth.users pelo email
    UPDATE public.usuarios_por_login upl
    SET auth_user_id = au.id,
        vinculado_em = COALESCE(upl.vinculado_em, NOW())
    FROM auth.users au
    WHERE upl.id = v_record.id
      AND LOWER(TRIM(au.email)) = LOWER(TRIM(v_record.email))
      AND upl.auth_user_id IS NULL;
    
    -- Se conseguiu vincular, criar user_roles
    IF EXISTS (SELECT 1 FROM public.usuarios_por_login WHERE id = v_record.id AND auth_user_id IS NOT NULL) THEN
      SELECT auth_user_id INTO v_record.auth_user_id
      FROM public.usuarios_por_login
      WHERE id = v_record.id;
      
      IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_record.auth_user_id AND role = 'admin') THEN
        DELETE FROM public.user_roles WHERE user_id = v_record.auth_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, 'admin');
        RAISE NOTICE '✓ Vinculado e criado role admin para: %', v_record.email;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 3. Verificar status final
SELECT 
  'Emails admin em auth.users' as tipo,
  COUNT(*) as total
FROM auth.users
WHERE public.is_admin_email(email)

UNION ALL

SELECT 
  'Emails admin com user_roles admin' as tipo,
  COUNT(*) as total
FROM auth.users au
INNER JOIN public.user_roles ur ON ur.user_id = au.id
WHERE public.is_admin_email(au.email)
  AND ur.role = 'admin'

UNION ALL

SELECT 
  'Emails admin SEM user_roles admin' as tipo,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id AND ur.role = 'admin'
WHERE public.is_admin_email(au.email)
  AND ur.id IS NULL;

-- 4. Listar detalhes dos emails admin
SELECT 
  au.email,
  au.id as auth_user_id,
  ur.role as role_atual,
  upl.login,
  upl.nome,
  CASE 
    WHEN ur.role = 'admin' THEN '✓ OK'
    WHEN ur.id IS NULL THEN '✗ SEM ROLE'
    ELSE '✗ ROLE ERRADO: ' || ur.role
  END as status
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.usuarios_por_login upl ON upl.auth_user_id = au.id
WHERE public.is_admin_email(au.email)
ORDER BY au.email;

-- 5. Comentário
COMMENT ON FUNCTION public.is_admin_email IS 'Verifica se um email é administrador por natureza (soi.bpma@gmail.com, joaopaulogm@gmail.com)';
