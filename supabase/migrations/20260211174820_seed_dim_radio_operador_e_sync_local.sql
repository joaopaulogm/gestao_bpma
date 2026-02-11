-- Seeds para dimensões do Rádio Operador (UPSERT por nome)
-- dim_equipe
INSERT INTO public.dim_equipe (id, nome) VALUES
  (gen_random_uuid(), 'ALFA'),
  (gen_random_uuid(), 'BRAVO'),
  (gen_random_uuid(), 'CHARLIE'),
  (gen_random_uuid(), 'DELTA')
ON CONFLICT (nome) DO NOTHING;

-- dim_grupamento
INSERT INTO public.dim_grupamento (id, nome) VALUES
  (gen_random_uuid(), 'RP AMBIENTAL'),
  (gen_random_uuid(), 'SVG'),
  (gen_random_uuid(), 'GOC'),
  (gen_random_uuid(), 'GTA'),
  (gen_random_uuid(), 'LACUSTRE'),
  (gen_random_uuid(), 'NÃO HOUVE')
ON CONFLICT (nome) DO NOTHING;

-- dim_desfecho (Resgate + Crimes)
INSERT INTO public.dim_desfecho (id, nome) VALUES
  (gen_random_uuid(), 'RESGATADO'),
  (gen_random_uuid(), 'EXÓTICO'),
  (gen_random_uuid(), 'EVADIDO'),
  (gen_random_uuid(), 'VIDA LIVRE'),
  (gen_random_uuid(), 'ÓBITO'),
  (gen_random_uuid(), 'SEM CONTATO'),
  (gen_random_uuid(), 'NINHO'),
  (gen_random_uuid(), 'INACESSÍVEL'),
  (gen_random_uuid(), 'OUTRO ÓRGÃO'),
  (gen_random_uuid(), 'NADA CONSTATADO'),
  (gen_random_uuid(), 'TCO (PMDF)'),
  (gen_random_uuid(), 'TCO (PCDF)'),
  (gen_random_uuid(), 'PRISÃO FLAGRANTE (PCDF)'),
  (gen_random_uuid(), 'RESOLVIDO NO LOCAL'),
  (gen_random_uuid(), 'EM APURAÇÃO')
ON CONFLICT (nome) DO NOTHING;

-- dim_destinacao (Resgate + Crimes)
INSERT INTO public.dim_destinacao (id, nome) VALUES
  (gen_random_uuid(), 'CETAS'),
  (gen_random_uuid(), 'HFAUS'),
  (gen_random_uuid(), 'HVET/UnB'),
  (gen_random_uuid(), 'CEAPA'),
  (gen_random_uuid(), 'SOLTURA'),
  (gen_random_uuid(), 'SEM DESTINAÇÃO'),
  (gen_random_uuid(), 'CETAS (APREENSÃO)'),
  (gen_random_uuid(), 'BPMA (APREENSÃO)'),
  (gen_random_uuid(), 'PCDF (APREENSÃO)'),
  (gen_random_uuid(), 'LIBERADO NO LOCAL')
ON CONFLICT (nome) DO NOTHING;

-- Sync dim_regiao_administrativa -> dim_local (garantir que RAs existam em dim_local)
INSERT INTO public.dim_local (id, nome)
SELECT gen_random_uuid(), ra.nome
FROM public.dim_regiao_administrativa ra
WHERE NOT EXISTS (SELECT 1 FROM public.dim_local dl WHERE dl.nome = ra.nome);

-- Garantir constraints únicas para ON CONFLICT
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_local_nome_key') THEN
    ALTER TABLE public.dim_local ADD CONSTRAINT dim_local_nome_key UNIQUE (nome);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_equipe_nome_key') THEN
    ALTER TABLE public.dim_equipe ADD CONSTRAINT dim_equipe_nome_key UNIQUE (nome);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_grupamento_nome_key') THEN
    ALTER TABLE public.dim_grupamento ADD CONSTRAINT dim_grupamento_nome_key UNIQUE (nome);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_desfecho_nome_key') THEN
    ALTER TABLE public.dim_desfecho ADD CONSTRAINT dim_desfecho_nome_key UNIQUE (nome);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dim_destinacao_nome_key') THEN
    ALTER TABLE public.dim_destinacao ADD CONSTRAINT dim_destinacao_nome_key UNIQUE (nome);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
