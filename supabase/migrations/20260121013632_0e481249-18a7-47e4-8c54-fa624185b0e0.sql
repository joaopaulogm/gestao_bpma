
-- =====================================================
-- STAGING TABLES FOR SYNC FROM GOOGLE SHEETS
-- =====================================================

-- 1. Staging table for Dispensas Médicas (01 | D. MÉDICAS 2026)
CREATE TABLE IF NOT EXISTS public.stg_dm_2026 (
  source_sheet TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  matricula TEXT,
  posto_graduacao TEXT,
  nome_completo TEXT,
  tipo TEXT,
  data_inicio DATE,
  data_fim DATE,
  dias INTEGER,
  cid TEXT,
  observacao TEXT,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_sheet, source_row_number)
);

-- 2. Staging table for Abono (03 | ABONO 2026)
CREATE TABLE IF NOT EXISTS public.stg_abono_2026 (
  source_sheet TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  matricula TEXT,
  posto_graduacao TEXT,
  nome_completo TEXT,
  mes INTEGER,
  ano INTEGER DEFAULT 2026,
  observacao TEXT,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_sheet, source_row_number)
);

-- 3. Staging table for Restrições (06 | RESTRIÇÕES 2025)
CREATE TABLE IF NOT EXISTS public.stg_restricoes_2025 (
  source_sheet TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  matricula TEXT,
  posto_graduacao TEXT,
  nome_completo TEXT,
  tipo_restricao TEXT,
  data_inicio DATE,
  data_fim DATE,
  observacao TEXT,
  ano INTEGER DEFAULT 2025,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source_sheet, source_row_number)
);

-- 4. Sync run logs table
CREATE TABLE IF NOT EXISTS public.sync_run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  detalhes JSONB,
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_stg_dm_2026_matricula ON public.stg_dm_2026(matricula);
CREATE INDEX IF NOT EXISTS idx_stg_abono_2026_matricula ON public.stg_abono_2026(matricula);
CREATE INDEX IF NOT EXISTS idx_stg_restricoes_2025_matricula ON public.stg_restricoes_2025(matricula);
CREATE INDEX IF NOT EXISTS idx_sync_run_logs_started_at ON public.sync_run_logs(started_at DESC);

-- Add unique constraints on final tables if they don't exist
-- For fat_licencas_medicas: unique on (efetivo_id, data_inicio, tipo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fat_licencas_medicas_unique_entry'
  ) THEN
    ALTER TABLE public.fat_licencas_medicas 
    ADD CONSTRAINT fat_licencas_medicas_unique_entry 
    UNIQUE (efetivo_id, data_inicio, tipo);
  END IF;
EXCEPTION WHEN others THEN
  -- Constraint might already exist or there are duplicates
  NULL;
END $$;

-- For fat_abono: unique on (efetivo_id, ano, mes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fat_abono_unique_entry'
  ) THEN
    ALTER TABLE public.fat_abono 
    ADD CONSTRAINT fat_abono_unique_entry 
    UNIQUE (efetivo_id, ano, mes);
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- For fat_restricoes: unique on (efetivo_id, data_inicio, tipo_restricao)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fat_restricoes_unique_entry'
  ) THEN
    ALTER TABLE public.fat_restricoes 
    ADD CONSTRAINT fat_restricoes_unique_entry 
    UNIQUE (efetivo_id, data_inicio, tipo_restricao);
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.stg_dm_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stg_abono_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stg_restricoes_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_run_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for authenticated users (read-only for staging, full for logs)
CREATE POLICY "Authenticated users can read stg_dm_2026" 
  ON public.stg_dm_2026 FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read stg_abono_2026" 
  ON public.stg_abono_2026 FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read stg_restricoes_2025" 
  ON public.stg_restricoes_2025 FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sync_run_logs" 
  ON public.sync_run_logs FOR SELECT TO authenticated USING (true);
