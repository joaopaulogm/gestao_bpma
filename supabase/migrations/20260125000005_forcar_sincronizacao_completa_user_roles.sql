-- ============================================
-- FORÇAR SINCRONIZAÇÃO COMPLETA DE user_roles
-- ============================================
-- Esta migration força a sincronização de todos os usuários
-- e identifica quais não podem ser sincronizados

-- 1. Garantir que todos os vínculos estão feitos
UPDATE public.usuarios_por_login upl
SET efetivo_id = de.id
FROM public.dim_efetivo de
WHERE upl.matricula = de.matricula
  AND upl.efetivo_id IS NULL
  AND upl.matricula IS NOT NULL
  AND upl.ativo = true;

-- 2. Criar função melhorada que força sincronização e reporta problemas
CREATE OR REPLACE FUNCTION public.forcar_sincronizacao_user_roles()
RETURNS TABLE(
  usuarios_processados bigint,
  roles_criados bigint,
  roles_atualizados bigint,
  usuarios_sem_auth_user_id bigint,
  usuarios_sem_efetivo_id bigint,
  usuarios_sem_matricula bigint,
  detalhes_erros jsonb
) AS $$
DECLARE
  v_usuarios_processados bigint := 0;
  v_roles_criados bigint := 0;
  v_roles_atualizados bigint := 0;
  v_usuarios_sem_auth_user_id bigint := 0;
  v_usuarios_sem_efetivo_id bigint := 0;
  v_usuarios_sem_matricula bigint := 0;
  v_record record;
  v_role app_role;
  v_erros jsonb := '[]'::jsonb;
  v_erro_obj jsonb;
BEGIN
  -- Processar TODOS os usuários ativos em usuarios_por_login
  FOR v_record IN 
    SELECT 
      upl.id,
      upl.auth_user_id,
      upl.efetivo_id,
      upl.login,
      upl.nome,
      upl.matricula,
      upl.ativo
    FROM public.usuarios_por_login upl
    WHERE upl.ativo = true
    ORDER BY upl.nome
  LOOP
    v_usuarios_processados := v_usuarios_processados + 1;
    
    -- Verificar se tem auth_user_id
    IF v_record.auth_user_id IS NULL THEN
      v_usuarios_sem_auth_user_id := v_usuarios_sem_auth_user_id + 1;
      v_erro_obj := jsonb_build_object(
        'tipo', 'sem_auth_user_id',
        'login', v_record.login,
        'nome', v_record.nome,
        'matricula', v_record.matricula,
        'mensagem', 'Usuário não tem auth_user_id vinculado. É necessário fazer login primeiro ou vincular manualmente.'
      );
      v_erros := v_erros || v_erro_obj;
      CONTINUE;
    END IF;
    
    -- Verificar se tem matrícula
    IF v_record.matricula IS NULL OR v_record.matricula = '' THEN
      v_usuarios_sem_matricula := v_usuarios_sem_matricula + 1;
      v_erro_obj := jsonb_build_object(
        'tipo', 'sem_matricula',
        'login', v_record.login,
        'nome', v_record.nome,
        'auth_user_id', v_record.auth_user_id,
        'mensagem', 'Usuário não tem matrícula. Não é possível vincular com dim_efetivo.'
      );
      v_erros := v_erros || v_erro_obj;
      CONTINUE;
    END IF;
    
    -- Verificar se tem efetivo_id
    IF v_record.efetivo_id IS NULL THEN
      -- Tentar buscar pela matrícula
      SELECT id INTO v_record.efetivo_id
      FROM public.dim_efetivo
      WHERE matricula = v_record.matricula
      LIMIT 1;
      
      -- Se encontrou, atualizar
      IF v_record.efetivo_id IS NOT NULL THEN
        UPDATE public.usuarios_por_login
        SET efetivo_id = v_record.efetivo_id
        WHERE id = v_record.id;
      ELSE
        v_usuarios_sem_efetivo_id := v_usuarios_sem_efetivo_id + 1;
        v_erro_obj := jsonb_build_object(
          'tipo', 'sem_efetivo_id',
          'login', v_record.login,
          'nome', v_record.nome,
          'matricula', v_record.matricula,
          'auth_user_id', v_record.auth_user_id,
          'mensagem', 'Matrícula não encontrada em dim_efetivo. Verifique se a matrícula está correta.'
        );
        v_erros := v_erros || v_erro_obj;
        CONTINUE;
      END IF;
    END IF;
    
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
      BEGIN
        INSERT INTO public.user_roles (user_id, role) VALUES (v_record.auth_user_id, v_role);
        v_roles_criados := v_roles_criados + 1;
      EXCEPTION WHEN OTHERS THEN
        v_erro_obj := jsonb_build_object(
          'tipo', 'erro_insercao',
          'login', v_record.login,
          'nome', v_record.nome,
          'auth_user_id', v_record.auth_user_id,
          'role', v_role,
          'mensagem', SQLERRM
        );
        v_erros := v_erros || v_erro_obj;
      END;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    v_usuarios_processados,
    v_roles_criados,
    v_roles_atualizados,
    v_usuarios_sem_auth_user_id,
    v_usuarios_sem_efetivo_id,
    v_usuarios_sem_matricula,
    v_erros;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para listar usuários que precisam de auth_user_id
CREATE OR REPLACE FUNCTION public.listar_usuarios_sem_auth_user_id()
RETURNS TABLE(
  id uuid,
  login text,
  nome text,
  matricula text,
  email text,
  cpf bigint,
  efetivo_id uuid,
  nome_efetivo text,
  role_efetivo app_role,
  precisa_criar_auth boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    upl.id,
    upl.login,
    upl.nome,
    upl.matricula,
    upl.email,
    upl.cpf,
    upl.efetivo_id,
    de.nome as nome_efetivo,
    er.role as role_efetivo,
    CASE 
      WHEN upl.email IS NOT NULL AND upl.email != '' THEN true
      ELSE false
    END as precisa_criar_auth
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
  WHERE upl.ativo = true
    AND upl.auth_user_id IS NULL
  ORDER BY upl.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Executar sincronização forçada
-- Esta função será executada automaticamente quando a migration rodar
DO $$
DECLARE
  v_result record;
BEGIN
  SELECT * INTO v_result FROM public.forcar_sincronizacao_user_roles();
  
  RAISE NOTICE 'Sincronização concluída:';
  RAISE NOTICE '  Usuários processados: %', v_result.usuarios_processados;
  RAISE NOTICE '  Roles criados: %', v_result.roles_criados;
  RAISE NOTICE '  Roles atualizados: %', v_result.roles_atualizados;
  RAISE NOTICE '  Usuários sem auth_user_id: %', v_result.usuarios_sem_auth_user_id;
  RAISE NOTICE '  Usuários sem efetivo_id: %', v_result.usuarios_sem_efetivo_id;
  RAISE NOTICE '  Usuários sem matrícula: %', v_result.usuarios_sem_matricula;
  
  IF jsonb_array_length(v_result.detalhes_erros) > 0 THEN
    RAISE NOTICE '  Detalhes dos erros: %', v_result.detalhes_erros;
  END IF;
END $$;

-- 5. Comentários
COMMENT ON FUNCTION public.forcar_sincronizacao_user_roles IS 'Força sincronização completa de user_roles e reporta todos os problemas encontrados';
COMMENT ON FUNCTION public.listar_usuarios_sem_auth_user_id IS 'Lista todos os usuários que não têm auth_user_id e precisam fazer login ou ter conta criada';

-- 6. Instruções para verificação
-- Execute estas queries após a migration:
-- 
-- Ver relatório completo da sincronização:
-- SELECT * FROM public.forcar_sincronizacao_user_roles();
--
-- Ver usuários que precisam de auth_user_id:
-- SELECT * FROM public.listar_usuarios_sem_auth_user_id();
--
-- Verificar cobertura final:
-- SELECT * FROM public.verificar_cobertura_user_roles();
