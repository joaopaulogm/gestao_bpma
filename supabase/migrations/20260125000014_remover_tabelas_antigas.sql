-- ============================================
-- REMOVER TABELAS ANTIGAS (APÓS CONSOLIDAÇÃO)
-- ============================================
-- Esta migration remove as tabelas antigas após confirmar
-- que a consolidação em user_roles está funcionando
-- 
-- ATENÇÃO: Execute apenas após testar completamente a nova estrutura!

-- 1. Remover triggers que dependem das tabelas antigas
DROP TRIGGER IF EXISTS trigger_sync_user_role_on_auth_link ON public.usuarios_por_login;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover funções que dependem das tabelas antigas
DROP FUNCTION IF EXISTS public.sync_user_role_on_auth_link() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_roles_from_efetivo() CASCADE;
DROP FUNCTION IF EXISTS public.verificar_cobertura_user_roles() CASCADE;
DROP FUNCTION IF EXISTS public.forcar_sincronizacao_user_roles() CASCADE;
DROP FUNCTION IF EXISTS public.listar_usuarios_sem_auth_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.debug_buscar_usuario(text) CASCADE;

-- 3. Remover views que dependem das tabelas antigas
DROP VIEW IF EXISTS public.vw_usuarios_com_roles CASCADE;

-- 4. Remover tabelas antigas (comentadas por segurança - descomente após testar)
-- DROP TABLE IF EXISTS public.efetivo_roles CASCADE;
-- DROP TABLE IF EXISTS public.usuarios_por_login CASCADE;
-- DROP TABLE IF EXISTS public.usuarios_permitidos CASCADE;

-- 5. Criar view atualizada usando nova estrutura
CREATE OR REPLACE VIEW public.vw_usuarios_com_roles AS
SELECT 
  ur.id,
  ur.user_id,
  ur.efetivo_id,
  ur.login,
  ur.nome,
  ur.nome_guerra,
  ur.matricula,
  ur.email,
  ur.cpf,
  ur.role,
  ur.ativo,
  ur.post_grad,
  ur.quadro,
  ur.lotacao,
  ur.data_nascimento,
  ur.contato,
  ur.vinculado_em,
  de.posto_graduacao,
  de.quadro as quadro_efetivo,
  de.antiguidade
FROM public.user_roles ur
LEFT JOIN public.dim_efetivo de ON ur.efetivo_id = de.id
WHERE ur.ativo = true OR ur.ativo IS NULL;

-- 6. Comentários
COMMENT ON VIEW public.vw_usuarios_com_roles IS 'View consolidada de usuários com roles usando nova estrutura (user_roles)';

-- NOTA: As tabelas antigas estão comentadas para segurança.
-- Descomente as linhas do DROP TABLE apenas após confirmar que tudo está funcionando.
