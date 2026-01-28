-- ============================================
-- ADICIONAR CAMPOS AO FORMULÁRIO DE ATIVIDADES DE PREVENÇÃO
-- ============================================
-- Esta migration adiciona os novos campos necessários:
-- - horario_inicio (time)
-- - horario_termino (time)
-- - missao (text)
-- - numero_os (text) - formato 2026.00707.0000XXX
-- ============================================

BEGIN;

-- Adicionar colunas à tabela fat_atividades_prevencao
ALTER TABLE public.fat_atividades_prevencao
ADD COLUMN IF NOT EXISTS horario_inicio time,
ADD COLUMN IF NOT EXISTS horario_termino time,
ADD COLUMN IF NOT EXISTS missao text,
ADD COLUMN IF NOT EXISTS numero_os text;

-- Criar tabela para equipe de atividades de prevenção (similar a fat_equipe_resgate)
CREATE TABLE IF NOT EXISTS public.fat_equipe_atividades_prevencao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_prevencao_id uuid NOT NULL REFERENCES public.fat_atividades_prevencao(id) ON DELETE CASCADE,
  efetivo_id uuid NOT NULL REFERENCES public.dim_efetivo(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(atividade_prevencao_id, efetivo_id)
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_fat_equipe_atividades_prevencao_atividade 
ON public.fat_equipe_atividades_prevencao(atividade_prevencao_id);

CREATE INDEX IF NOT EXISTS idx_fat_equipe_atividades_prevencao_efetivo 
ON public.fat_equipe_atividades_prevencao(efetivo_id);

-- Habilitar RLS
ALTER TABLE public.fat_equipe_atividades_prevencao ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem visualizar
DROP POLICY IF EXISTS "Authenticated users can view fat_equipe_atividades_prevencao" ON public.fat_equipe_atividades_prevencao;
CREATE POLICY "Authenticated users can view fat_equipe_atividades_prevencao"
ON public.fat_equipe_atividades_prevencao
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Política RLS: usuários autenticados podem inserir
DROP POLICY IF EXISTS "Authenticated users can insert fat_equipe_atividades_prevencao" ON public.fat_equipe_atividades_prevencao;
CREATE POLICY "Authenticated users can insert fat_equipe_atividades_prevencao"
ON public.fat_equipe_atividades_prevencao
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Política RLS: usuários autenticados podem atualizar
DROP POLICY IF EXISTS "Authenticated users can update fat_equipe_atividades_prevencao" ON public.fat_equipe_atividades_prevencao;
CREATE POLICY "Authenticated users can update fat_equipe_atividades_prevencao"
ON public.fat_equipe_atividades_prevencao
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Política RLS: usuários autenticados podem deletar
DROP POLICY IF EXISTS "Authenticated users can delete fat_equipe_atividades_prevencao" ON public.fat_equipe_atividades_prevencao;
CREATE POLICY "Authenticated users can delete fat_equipe_atividades_prevencao"
ON public.fat_equipe_atividades_prevencao
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

COMMIT;
