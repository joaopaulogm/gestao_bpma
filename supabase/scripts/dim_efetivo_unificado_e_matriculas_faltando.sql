-- =============================================================================
-- 1) dim_efetivo unificado: colunas não repetidas + ids das tabelas relacionadas
--    (efetivo_roles, usuarios_permitidos, user_roles) por matrícula e id.
-- =============================================================================
-- Base: dim_efetivo. Colunas das outras tabelas que já existem em dim_efetivo
-- (matricula, nome, nome_guerra, posto_graduacao, etc.) NÃO são repetidas.
-- São adicionados apenas: ids e dados específicos (role, user_id, etc.).
-- =============================================================================

CREATE OR REPLACE VIEW public.v_dim_efetivo_unificado AS
SELECT
  -- dim_efetivo (fonte única para dados do efetivo; colunas não repetidas)
  de.id AS dim_efetivo_id,
  de.matricula,
  de.nome,
  de.nome_guerra,
  de.posto_graduacao,
  de.lotacao,
  de.quadro,
  de.quadro_sigla,
  de.sexo,
  de.ativo,
  de.cpf,
  de.email,
  de.email_2,
  de.data_nascimento,
  de.idade,
  de.contato,
  de.telefone,
  de.telefone_2,
  de.logradouro,
  de.numero,
  de.complemento,
  de.bairro,
  de.cep,
  de.cidade,
  de.uf,
  de.equipe,
  de.escala,
  de.grupamento,
  de.porte_arma,
  de.antiguidade,
  de.data_inclusao,
  de.created_at,
  -- efetivo_roles: ids (pode haver mais de um role por efetivo)
  (SELECT array_agg(er.id ORDER BY er.id) FROM public.efetivo_roles er WHERE er.efetivo_id = de.id) AS efetivo_roles_ids,
  (SELECT array_agg(er.role ORDER BY er.id) FROM public.efetivo_roles er WHERE er.efetivo_id = de.id) AS efetivo_roles_roles,
  -- user_roles: id e dados específicos (1 linha por efetivo na prática)
  (SELECT ur.id FROM public.user_roles ur WHERE ur.efetivo_id = de.id LIMIT 1) AS user_roles_id,
  (SELECT ur.role FROM public.user_roles ur WHERE ur.efetivo_id = de.id LIMIT 1) AS user_roles_role,
  (SELECT ur.user_id FROM public.user_roles ur WHERE ur.efetivo_id = de.id LIMIT 1) AS user_roles_user_id,
  (SELECT ur.login FROM public.user_roles ur WHERE ur.efetivo_id = de.id LIMIT 1) AS user_roles_login,
  -- usuarios_permitidos: ids por matrícula (pode haver mais de um por matrícula)
  (SELECT array_agg(up.id ORDER BY up.id) FROM public.usuarios_permitidos up WHERE TRIM(COALESCE(up."Matrícula", '')) = TRIM(de.matricula)) AS usuarios_permitidos_ids
FROM public.dim_efetivo de;

COMMENT ON VIEW public.v_dim_efetivo_unificado IS
  'dim_efetivo com colunas únicas (sem repetir campos de efetivo_roles/user_roles/usuarios_permitidos) e ids dessas tabelas por matrícula e id.';

-- =============================================================================
-- 2) Matrículas de efetivo_roles que estão FALTANDO em dim_efetivo
--    (registros em efetivo_roles cujo efetivo_id não existe mais em dim_efetivo)
-- =============================================================================

CREATE OR REPLACE VIEW public.v_efetivo_roles_matriculas_faltando_dim_efetivo AS
SELECT
  er.id AS efetivo_roles_id,
  er.efetivo_id AS efetivo_roles_efetivo_id,
  er.role AS efetivo_roles_role,
  er.created_at AS efetivo_roles_created_at,
  'efetivo_id não existe em dim_efetivo' AS motivo
FROM public.efetivo_roles er
LEFT JOIN public.dim_efetivo de ON de.id = er.efetivo_id
WHERE de.id IS NULL;

COMMENT ON VIEW public.v_efetivo_roles_matriculas_faltando_dim_efetivo IS
  'Registros de efetivo_roles cujo efetivo_id não existe em dim_efetivo (órfãos). Como efetivo_roles não tem coluna matrícula, o vínculo é por efetivo_id; aqui listamos os efetivo_id que faltam em dim_efetivo.';

-- =============================================================================
-- 3) (Inverso) Matrículas de dim_efetivo que NÃO estão em efetivo_roles
--    (útil para saber quem ainda não tem role configurado)
-- =============================================================================

CREATE OR REPLACE VIEW public.v_dim_efetivo_sem_efetivo_roles AS
SELECT
  de.id AS dim_efetivo_id,
  de.matricula,
  de.nome,
  de.nome_guerra,
  de.posto_graduacao,
  de.lotacao
FROM public.dim_efetivo de
LEFT JOIN public.efetivo_roles er ON er.efetivo_id = de.id
WHERE er.id IS NULL;

COMMENT ON VIEW public.v_dim_efetivo_sem_efetivo_roles IS
  'Matrículas de dim_efetivo que não possuem nenhum registro em efetivo_roles.';

-- =============================================================================
-- Consultas de uso rápido
-- =============================================================================

-- Listar todas as linhas da vista unificada (colunas não repetidas + ids):
-- SELECT * FROM public.v_dim_efetivo_unificado ORDER BY matricula;

-- Listar registros de efetivo_roles cujo efetivo_id NÃO existe em dim_efetivo:
-- SELECT * FROM public.v_efetivo_roles_matriculas_faltando_dim_efetivo;

-- Listar matrículas de dim_efetivo que não estão em efetivo_roles:
-- SELECT * FROM public.v_dim_efetivo_sem_efetivo_roles ORDER BY matricula;
