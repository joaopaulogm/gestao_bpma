-- Tabela de dimensão: grupamento/serviço da equipe (Identificação de Equipe)
-- Usada em: resgate, crimes ambientais, crimes comuns, atividades de prevenção

CREATE TABLE IF NOT EXISTS public.dim_grupamento_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem smallint NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.dim_grupamento_servico IS 'Grupamento ou serviço da equipe (RP Ambiental, GOC, Lacustre, GTA, PREALG, Oficial de Dia, Voluntário).';

-- Inserir os 7 tipos (id gerado por gen_random_uuid())
INSERT INTO public.dim_grupamento_servico (nome, ordem) VALUES
  ('RP Ambiental', 1),
  ('GOC', 2),
  ('Lacustre', 3),
  ('GTA', 4),
  ('PREALG', 5),
  ('Oficial de Dia', 6),
  ('Voluntário', 7)
ON CONFLICT (nome) DO NOTHING;

-- Coluna em fat_registros_de_resgate (registro de fauna / resgate)
ALTER TABLE public.fat_registros_de_resgate
  ADD COLUMN IF NOT EXISTS grupamento_servico_id uuid REFERENCES public.dim_grupamento_servico(id);

COMMENT ON COLUMN public.fat_registros_de_resgate.grupamento_servico_id IS 'Grupamento/serviço da equipe que atendeu o resgate.';

-- Coluna em fat_registros_de_crimes_ambientais
ALTER TABLE public.fat_registros_de_crimes_ambientais
  ADD COLUMN IF NOT EXISTS grupamento_servico_id uuid REFERENCES public.dim_grupamento_servico(id);

COMMENT ON COLUMN public.fat_registros_de_crimes_ambientais.grupamento_servico_id IS 'Grupamento/serviço da equipe que atendeu a ocorrência.';

-- Coluna em fat_crimes_comuns
ALTER TABLE public.fat_crimes_comuns
  ADD COLUMN IF NOT EXISTS grupamento_servico_id uuid REFERENCES public.dim_grupamento_servico(id);

COMMENT ON COLUMN public.fat_crimes_comuns.grupamento_servico_id IS 'Grupamento/serviço da equipe que atendeu a ocorrência.';

-- Coluna em fat_atividades_prevencao
ALTER TABLE public.fat_atividades_prevencao
  ADD COLUMN IF NOT EXISTS grupamento_servico_id uuid REFERENCES public.dim_grupamento_servico(id);

COMMENT ON COLUMN public.fat_atividades_prevencao.grupamento_servico_id IS 'Grupamento/serviço da equipe que realizou a atividade.';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fat_registros_de_resgate_grupamento_servico_id
  ON public.fat_registros_de_resgate(grupamento_servico_id);
CREATE INDEX IF NOT EXISTS idx_fat_registros_de_crimes_ambientais_grupamento_servico_id
  ON public.fat_registros_de_crimes_ambientais(grupamento_servico_id);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_grupamento_servico_id
  ON public.fat_crimes_comuns(grupamento_servico_id);
CREATE INDEX IF NOT EXISTS idx_fat_atividades_prevencao_grupamento_servico_id
  ON public.fat_atividades_prevencao(grupamento_servico_id);
