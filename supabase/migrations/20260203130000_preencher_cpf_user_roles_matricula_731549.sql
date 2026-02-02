-- =============================================================
-- Preencher CPF em user_roles para matrícula 731549 (731549X)
-- Diagnóstico mostrou: tem_dim_efetivo=true, tem_user_roles=true,
-- user_roles_cpf_preenchido=false, tem_usuarios_permitidos=false,
-- tem_usuarios_por_login=false.
-- =============================================================

UPDATE public.user_roles
SET cpf = 92995330168
WHERE regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g') = '731549'
  AND (cpf IS NULL OR cpf IS DISTINCT FROM 92995330168);

-- Para outros policiais no futuro: cadastre o CPF em usuarios_permitidos
-- (colunas "Matrícula" e "CPF") ou em usuarios_por_login (efetivo_id + cpf);
-- os triggers da migration 20260203110000 manterão user_roles.cpf em sync.
