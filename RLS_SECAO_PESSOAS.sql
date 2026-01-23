-- Migration: RLS para Seção Pessoas - Admin Only + Edge Function Writes
-- Data: 2026-01-06
-- Descrição: Implementa RLS com acesso SELECT apenas para admins e WRITE apenas via service_role (Edge Functions)

-- 1. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  );
$$;

-- 2. Adicionar colunas geradas para suportar UPSERT em restricoes e licencas
-- fat_restricoes: adicionar coluna gerada data_fim_norm
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fat_restricoes' 
    AND column_name = 'data_fim_norm'
  ) THEN
    ALTER TABLE public.fat_restricoes
    ADD COLUMN data_fim_norm date GENERATED ALWAYS AS (COALESCE(data_fim, data_inicio)) STORED;
  END IF;
END $$;

-- fat_licencas_medicas: adicionar coluna gerada data_fim_norm
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'fat_licencas_medicas' 
    AND column_name = 'data_fim_norm'
  ) THEN
    ALTER TABLE public.fat_licencas_medicas
    ADD COLUMN data_fim_norm date GENERATED ALWAYS AS (COALESCE(data_fim, data_inicio)) STORED;
  END IF;
END $$;

-- 3. Criar índices únicos para suportar UPSERT
-- fat_abono: unique (efetivo_id, ano, mes)
DROP INDEX IF EXISTS idx_fat_abono_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fat_abono_unique 
ON public.fat_abono (efetivo_id, ano, mes);

-- fat_equipe_membros: unique (equipe_id, efetivo_id)
DROP INDEX IF EXISTS idx_fat_equipe_membros_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fat_equipe_membros_unique 
ON public.fat_equipe_membros (equipe_id, efetivo_id);

-- fat_campanha_membros: unique (equipe_id, efetivo_id, ano, unidade)
DROP INDEX IF EXISTS idx_fat_campanha_membros_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fat_campanha_membros_unique 
ON public.fat_campanha_membros (equipe_id, efetivo_id, ano, unidade);

-- fat_restricoes: unique (efetivo_id, ano, tipo_restricao, data_inicio, data_fim_norm)
DROP INDEX IF EXISTS idx_fat_restricoes_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fat_restricoes_unique 
ON public.fat_restricoes (efetivo_id, ano, tipo_restricao, data_inicio, data_fim_norm);

-- fat_licencas_medicas: unique (efetivo_id, data_inicio, data_fim_norm)
DROP INDEX IF EXISTS idx_fat_licencas_medicas_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fat_licencas_medicas_unique 
ON public.fat_licencas_medicas (efetivo_id, data_inicio, data_fim_norm);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE public.fat_abono ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_ferias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_restricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_licencas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_equipe_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_equipes_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_campanha_alteracoes ENABLE ROW LEVEL SECURITY;

-- 5. Remover policies existentes (se houver) e criar novas
-- fat_abono
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_abono;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_abono;
CREATE POLICY "SELECT: admin only" ON public.fat_abono
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_abono
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_ferias
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_ferias;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_ferias;
CREATE POLICY "SELECT: admin only" ON public.fat_ferias
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_ferias
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_restricoes
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_restricoes;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_restricoes;
CREATE POLICY "SELECT: admin only" ON public.fat_restricoes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_restricoes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_licencas_medicas
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_licencas_medicas;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_licencas_medicas;
CREATE POLICY "SELECT: admin only" ON public.fat_licencas_medicas
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_licencas_medicas
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- dim_equipes
DROP POLICY IF EXISTS "SELECT: admin only" ON public.dim_equipes;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.dim_equipes;
CREATE POLICY "SELECT: admin only" ON public.dim_equipes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.dim_equipes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_equipe_membros
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_equipe_membros;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_equipe_membros;
CREATE POLICY "SELECT: admin only" ON public.fat_equipe_membros
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_equipe_membros
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- dim_equipes_campanha
DROP POLICY IF EXISTS "SELECT: admin only" ON public.dim_equipes_campanha;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.dim_equipes_campanha;
CREATE POLICY "SELECT: admin only" ON public.dim_equipes_campanha
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.dim_equipes_campanha
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_campanha_config
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_campanha_config;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_campanha_config;
CREATE POLICY "SELECT: admin only" ON public.fat_campanha_config
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_campanha_config
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_campanha_membros
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_campanha_membros;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_campanha_membros;
CREATE POLICY "SELECT: admin only" ON public.fat_campanha_membros
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_campanha_membros
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- fat_campanha_alteracoes
DROP POLICY IF EXISTS "SELECT: admin only" ON public.fat_campanha_alteracoes;
DROP POLICY IF EXISTS "WRITE: service_role only" ON public.fat_campanha_alteracoes;
CREATE POLICY "SELECT: admin only" ON public.fat_campanha_alteracoes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "WRITE: service_role only" ON public.fat_campanha_alteracoes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 6. Policy para user_roles: permitir authenticated ler somente sua própria linha
DROP POLICY IF EXISTS "SELECT: own row only" ON public.user_roles;
CREATE POLICY "SELECT: own row only" ON public.user_roles
  FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Nota: user_roles não precisa de WRITE policy pois será gerenciada apenas por admins via Edge Function ou diretamente no Supabase Dashboard

