-- ============================================
-- Atividades de Prevenção: campos opcionais e remoção de registros incompletos
-- ============================================
-- 1) Permitir data e tipo_atividade_id nulos (formulário com todos os campos opcionais).
-- 2) Remover registros em que os dados do formulário (data, região, horários, missão,
--    grupamento ou equipe) não estão preenchidos.
-- ============================================

BEGIN;

-- 1) Tornar data e tipo_atividade_id opcionais (nullable)
ALTER TABLE public.fat_atividades_prevencao
  ALTER COLUMN data DROP NOT NULL;

-- tipo_atividade_id já é nullable (FK sem NOT NULL)

-- 2) Remover registros incompletos: sem data, região, horários, missão, grupamento ou sem equipe
--    (fat_equipe_atividades_prevencao tem ON DELETE CASCADE, então ao deletar a atividade a equipe é removida)
DELETE FROM public.fat_atividades_prevencao
WHERE data IS NULL
   OR regiao_administrativa_id IS NULL
   OR horario_inicio IS NULL
   OR horario_termino IS NULL
   OR TRIM(COALESCE(missao, '')) = ''
   OR grupamento_servico_id IS NULL
   OR id NOT IN (SELECT atividade_prevencao_id FROM public.fat_equipe_atividades_prevencao);

COMMIT;
