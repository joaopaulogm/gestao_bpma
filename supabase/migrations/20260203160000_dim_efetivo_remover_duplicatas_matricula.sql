-- =============================================================
-- dim_efetivo: remover linhas com matrícula duplicada e registrar quem foi apagado
-- Critério: matrícula normalizada (apenas dígitos). Mantém uma linha por matrícula.
-- Linha mantida: a que possui vínculo em user_roles (login), senão a de menor id.
-- =============================================================

-- 1) Tabela de auditoria: quem foi removido e qual id foi mantido
CREATE TABLE IF NOT EXISTS public.audit_dim_efetivo_duplicatas_removidas (
  id_removido uuid PRIMARY KEY,
  matricula_original text,
  nome_original text,
  nome_guerra_original text,
  id_mantido uuid NOT NULL,
  matricula_mantida text,
  removido_em timestamptz DEFAULT now()
);

COMMENT ON TABLE public.audit_dim_efetivo_duplicatas_removidas IS
  'Registro das linhas de dim_efetivo removidas por duplicata de matrícula; id_mantido = linha que permaneceu.';

-- 2) Tabela temporária com duplicatas a remover (id_removido -> id_manter)
CREATE TEMP TABLE _dim_efetivo_ids_remover (
  id_removido uuid PRIMARY KEY,
  id_manter uuid NOT NULL,
  matricula_original text,
  nome_original text,
  nome_guerra_original text
);

INSERT INTO _dim_efetivo_ids_remover (id_removido, id_manter, matricula_original, nome_original, nome_guerra_original)
WITH matricula_norm AS (
  SELECT
    id,
    matricula,
    nome,
    nome_guerra,
    regexp_replace(COALESCE(trim(matricula), ''), '[^0-9]', '', 'g') AS mat_norm
  FROM public.dim_efetivo
  WHERE trim(COALESCE(matricula, '')) <> ''
),
duplicatas AS (
  SELECT mat_norm, COUNT(*) AS qtd
  FROM matricula_norm
  GROUP BY mat_norm
  HAVING COUNT(*) > 1
),
ranked AS (
  SELECT
    m.id,
    m.matricula,
    m.nome,
    m.nome_guerra,
    m.mat_norm,
    ROW_NUMBER() OVER (
      PARTITION BY m.mat_norm
      ORDER BY
        (SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = m.id LIMIT 1) DESC NULLS LAST,
        m.id
    ) AS rn
  FROM matricula_norm m
  INNER JOIN duplicatas d ON d.mat_norm = m.mat_norm
),
ids_manter AS (
  SELECT id AS id_manter, mat_norm FROM ranked WHERE rn = 1
),
ids_remover AS (
  SELECT r.id AS id_removido, i.id_manter, r.matricula, r.nome, r.nome_guerra
  FROM ranked r
  INNER JOIN ids_manter i ON i.mat_norm = r.mat_norm
  WHERE r.rn > 1
)
SELECT id_removido, id_manter, matricula, nome, nome_guerra FROM ids_remover;

-- 3) Registrar na auditoria (antes de qualquer delete)
INSERT INTO public.audit_dim_efetivo_duplicatas_removidas (
  id_removido,
  matricula_original,
  nome_original,
  nome_guerra_original,
  id_mantido,
  matricula_mantida
)
SELECT
  ir.id_removido,
  ir.matricula_original,
  ir.nome_original,
  ir.nome_guerra_original,
  ir.id_manter,
  (SELECT de.matricula FROM public.dim_efetivo de WHERE de.id = ir.id_manter LIMIT 1)
FROM _dim_efetivo_ids_remover ir;

-- 4) Redirecionar FKs para o id mantido
UPDATE public.user_roles ur
SET efetivo_id = ir.id_manter
FROM _dim_efetivo_ids_remover ir
WHERE ur.efetivo_id = ir.id_removido;

UPDATE public.usuarios_por_login upl
SET efetivo_id = ir.id_manter
FROM _dim_efetivo_ids_remover ir
WHERE upl.efetivo_id = ir.id_removido;

-- allowed_users (só se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'allowed_users') THEN
    UPDATE public.allowed_users au
    SET efetivo_id = ir.id_manter
    FROM _dim_efetivo_ids_remover ir
    WHERE au.efetivo_id = ir.id_removido;
  END IF;
END $$;

UPDATE public.fat_equipe_membros fem
SET efetivo_id = ir.id_manter
FROM _dim_efetivo_ids_remover ir
WHERE fem.efetivo_id = ir.id_removido;

UPDATE public.fat_campanha_membros fcm
SET efetivo_id = ir.id_manter
FROM _dim_efetivo_ids_remover ir
WHERE fcm.efetivo_id = ir.id_removido;

UPDATE public.fat_equipe_atividades_prevencao feap
SET efetivo_id = ir.id_manter
FROM _dim_efetivo_ids_remover ir
WHERE feap.efetivo_id = ir.id_removido;

-- dim_os (comandante_id, chefe_operacoes_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dim_os') THEN
    UPDATE public.dim_os d SET comandante_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE d.comandante_id = ir.id_removido;
    UPDATE public.dim_os d SET chefe_operacoes_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE d.chefe_operacoes_id = ir.id_removido;
  END IF;
END $$;

-- fat_os_efetivo, fat_equipe_crime_comum, fat_equipe_resgate, fat_equipe_crime, fat_abono (se existirem)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_os_efetivo') THEN
    UPDATE public.fat_os_efetivo foe SET efetivo_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE foe.efetivo_id = ir.id_removido;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_crime_comum') THEN
    UPDATE public.fat_equipe_crime_comum fecc SET efetivo_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE fecc.efetivo_id = ir.id_removido;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_resgate') THEN
    UPDATE public.fat_equipe_resgate fer SET efetivo_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE fer.efetivo_id = ir.id_removido;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_equipe_crime') THEN
    UPDATE public.fat_equipe_crime fec SET efetivo_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE fec.efetivo_id = ir.id_removido;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fat_abono') THEN
    UPDATE public.fat_abono fa SET efetivo_id = ir.id_manter FROM _dim_efetivo_ids_remover ir WHERE fa.efetivo_id = ir.id_removido;
  END IF;
END $$;

-- Resolver conflito em user_roles: após o update pode haver dois registros com mesmo efetivo_id.
-- Desativar o que veio do id_removido (manter o que já era do id_manter; um por efetivo_id, o de menor id).
UPDATE public.user_roles ur
SET ativo = false
WHERE ur.efetivo_id IN (SELECT id_manter FROM _dim_efetivo_ids_remover)
  AND ur.id NOT IN (
    SELECT ur2.id
    FROM (
      SELECT id, efetivo_id,
        ROW_NUMBER() OVER (PARTITION BY efetivo_id ORDER BY id) AS rn
      FROM public.user_roles
      WHERE efetivo_id IN (SELECT id_manter FROM _dim_efetivo_ids_remover)
    ) ur2
    WHERE ur2.rn = 1
  );

-- 5) Remover duplicatas de dim_efetivo
DELETE FROM public.dim_efetivo de
WHERE de.id IN (SELECT id_removido FROM _dim_efetivo_ids_remover);

-- 6) View para consulta: quem foi apagado
CREATE OR REPLACE VIEW public.v_audit_dim_efetivo_quem_foi_apagado AS
SELECT
  id_removido,
  matricula_original,
  nome_original,
  nome_guerra_original,
  id_mantido,
  matricula_mantida,
  removido_em
FROM public.audit_dim_efetivo_duplicatas_removidas
ORDER BY removido_em DESC;

COMMENT ON VIEW public.v_audit_dim_efetivo_quem_foi_apagado IS
  'Lista das linhas de dim_efetivo removidas por duplicata de matrícula; use para verificar quem foi apagado.';
