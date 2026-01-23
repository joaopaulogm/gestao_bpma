-- ============================================
-- VERIFICAR COBERTURA DE user_roles
-- ============================================
-- Este script verifica se todos os policiais de efetivo_roles
-- têm registros correspondentes em user_roles

-- Query para verificar cobertura completa
-- Execute esta query para ver o relatório detalhado

SELECT 
  'Relatório de Cobertura de user_roles' as titulo,
  (
    SELECT COUNT(DISTINCT efetivo_id) 
    FROM public.efetivo_roles
  ) as total_policiais_efetivo_roles,
  (
    SELECT COUNT(DISTINCT er.efetivo_id)
    FROM public.efetivo_roles er
    INNER JOIN public.usuarios_por_login upl ON upl.efetivo_id = er.efetivo_id
    INNER JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
    WHERE upl.ativo = true
      AND upl.auth_user_id IS NOT NULL
  ) as total_com_user_roles,
  (
    SELECT COUNT(DISTINCT er.efetivo_id)
    FROM public.efetivo_roles er
    LEFT JOIN public.usuarios_por_login upl ON upl.efetivo_id = er.efetivo_id AND upl.ativo = true
    LEFT JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
    WHERE ur.id IS NULL
      OR upl.auth_user_id IS NULL
  ) as total_sem_user_roles;

-- Listar policiais sem user_roles (detalhado)
SELECT 
  er.efetivo_id,
  er.role as role_efetivo,
  de.nome,
  de.matricula,
  de.posto_graduacao,
  upl.login,
  upl.auth_user_id,
  CASE 
    WHEN upl.auth_user_id IS NULL THEN 'Sem auth_user_id vinculado'
    WHEN ur.id IS NULL THEN 'Sem registro em user_roles'
    ELSE 'OK'
  END as status
FROM public.efetivo_roles er
INNER JOIN public.dim_efetivo de ON de.id = er.efetivo_id
LEFT JOIN public.usuarios_por_login upl ON upl.efetivo_id = er.efetivo_id AND upl.ativo = true
LEFT JOIN public.user_roles ur ON ur.user_id = upl.auth_user_id
WHERE ur.id IS NULL
  OR upl.auth_user_id IS NULL
ORDER BY de.nome;

-- Listar todos os user_roles criados (para verificação)
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  upl.login,
  upl.nome,
  upl.matricula,
  de.nome as nome_efetivo,
  er.role as role_efetivo
FROM public.user_roles ur
INNER JOIN public.usuarios_por_login upl ON upl.auth_user_id = ur.user_id
LEFT JOIN public.dim_efetivo de ON de.id = upl.efetivo_id
LEFT JOIN public.efetivo_roles er ON er.efetivo_id = upl.efetivo_id
ORDER BY upl.nome;
