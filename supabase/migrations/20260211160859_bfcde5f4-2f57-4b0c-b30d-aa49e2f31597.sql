
-- Fix: reassign "Nada CONSTATADO" references to "NADA CONSTATADO" then delete duplicate
UPDATE public.fat_controle_ocorrencias_resgate_2026
SET desfecho_id = 'e0de3932-a6c7-4927-ab1e-a9d0f5e47db7'
WHERE desfecho_id = '04865a0c-0b93-4a58-97b4-f6770d767a29';

UPDATE public.fat_controle_ocorrencias_crime_ambientais_2026
SET desfecho_id = 'e0de3932-a6c7-4927-ab1e-a9d0f5e47db7'
WHERE desfecho_id = '04865a0c-0b93-4a58-97b4-f6770d767a29';

DELETE FROM public.dim_desfecho WHERE id = '04865a0c-0b93-4a58-97b4-f6770d767a29';

-- Seed missing desfechos
INSERT INTO public.dim_desfecho (id, nome) VALUES
  (gen_random_uuid(), 'TCO (PMDF)'),
  (gen_random_uuid(), 'TCO (PCDF)'),
  (gen_random_uuid(), 'RESOLVIDO NO LOCAL'),
  (gen_random_uuid(), 'EM APURAÇÃO')
ON CONFLICT (nome) DO NOTHING;

-- Seed missing destinacoes
INSERT INTO public.dim_destinacao (id, nome) VALUES
  (gen_random_uuid(), 'CETAS (APREENSÃO)'),
  (gen_random_uuid(), 'BPMA (APREENSÃO)'),
  (gen_random_uuid(), 'PCDF (APREENSÃO)'),
  (gen_random_uuid(), 'LIBERADO NO LOCAL')
ON CONFLICT (nome) DO NOTHING;

-- Sync dim_regiao_administrativa -> dim_local
INSERT INTO public.dim_local (id, nome)
SELECT gen_random_uuid(), ra.nome
FROM public.dim_regiao_administrativa ra
WHERE NOT EXISTS (SELECT 1 FROM public.dim_local dl WHERE dl.nome = ra.nome)
ON CONFLICT (nome) DO NOTHING;

-- Duration trigger for resgate
CREATE OR REPLACE FUNCTION public.calc_duracoes_resgate()
RETURNS TRIGGER AS $$
DECLARE
  h1 time; h2 time; h3 time; h4 time;
  diff1 interval; diff2 interval;
BEGIN
  IF NEW.hora_cadastro_ocorrencia IS NOT NULL AND NEW.hora_recebido_copom_central IS NOT NULL THEN
    h1 := NEW.hora_cadastro_ocorrencia::time;
    h2 := NEW.hora_recebido_copom_central::time;
    IF h2 >= h1 THEN diff1 := h2 - h1;
    ELSE diff1 := (h2 + interval '24 hours') - h1;
    END IF;
    NEW.duracao_cadastro_190_encaminhamento_copom := diff1;
  ELSE
    NEW.duracao_cadastro_190_encaminhamento_copom := NULL;
  END IF;

  IF NEW.hora_despacho_ro IS NOT NULL AND NEW.hora_finalizacao_ocorrencia IS NOT NULL THEN
    h3 := NEW.hora_despacho_ro::time;
    h4 := NEW.hora_finalizacao_ocorrencia::time;
    IF h4 >= h3 THEN diff2 := h4 - h3;
    ELSE diff2 := (h4 + interval '24 hours') - h3;
    END IF;
    NEW.duracao_despacho_finalizacao := diff2;
  ELSE
    NEW.duracao_despacho_finalizacao := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_calc_duracoes_resgate ON public.fat_controle_ocorrencias_resgate_2026;
CREATE TRIGGER trg_calc_duracoes_resgate
  BEFORE INSERT OR UPDATE ON public.fat_controle_ocorrencias_resgate_2026
  FOR EACH ROW EXECUTE FUNCTION public.calc_duracoes_resgate();

-- Duration trigger for crimes
CREATE OR REPLACE FUNCTION public.calc_duracoes_crime()
RETURNS TRIGGER AS $$
DECLARE
  h1 time; h2 time; h3 time; h4 time;
  diff1 interval; diff2 interval;
BEGIN
  IF NEW.hora_cadastro_ocorrencia IS NOT NULL AND NEW.hora_recebido_copom_central IS NOT NULL THEN
    h1 := NEW.hora_cadastro_ocorrencia::time;
    h2 := NEW.hora_recebido_copom_central::time;
    IF h2 >= h1 THEN diff1 := h2 - h1;
    ELSE diff1 := (h2 + interval '24 hours') - h1;
    END IF;
    NEW.duracao_cadastro_190_encaminhamento_copom := diff1;
  ELSE
    NEW.duracao_cadastro_190_encaminhamento_copom := NULL;
  END IF;

  IF NEW.hora_despacho_ro IS NOT NULL AND NEW.hora_finalizacao_ocorrencia IS NOT NULL THEN
    h3 := NEW.hora_despacho_ro::time;
    h4 := NEW.hora_finalizacao_ocorrencia::time;
    IF h4 >= h3 THEN diff2 := h4 - h3;
    ELSE diff2 := (h4 + interval '24 hours') - h3;
    END IF;
    NEW.duracao_despacho_finalizacao := diff2;
  ELSE
    NEW.duracao_despacho_finalizacao := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_calc_duracoes_crime ON public.fat_controle_ocorrencias_crime_ambientais_2026;
CREATE TRIGGER trg_calc_duracoes_crime
  BEFORE INSERT OR UPDATE ON public.fat_controle_ocorrencias_crime_ambientais_2026
  FOR EACH ROW EXECUTE FUNCTION public.calc_duracoes_crime();

-- Unique constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_local_nome_key') THEN
    ALTER TABLE public.dim_local ADD CONSTRAINT dim_local_nome_key UNIQUE (nome);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_equipe_nome_key') THEN
    ALTER TABLE public.dim_equipe ADD CONSTRAINT dim_equipe_nome_key UNIQUE (nome);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_grupamento_nome_key') THEN
    ALTER TABLE public.dim_grupamento ADD CONSTRAINT dim_grupamento_nome_key UNIQUE (nome);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_desfecho_nome_key') THEN
    ALTER TABLE public.dim_desfecho ADD CONSTRAINT dim_desfecho_nome_key UNIQUE (nome);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_destinacao_nome_key') THEN
    ALTER TABLE public.dim_destinacao ADD CONSTRAINT dim_destinacao_nome_key UNIQUE (nome);
  END IF;
END $$;
