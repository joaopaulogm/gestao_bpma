-- Garantir que dim_desfecho_crime_ambientais existe e está populada para evitar
-- violação de FK fat_registros_de_crime_desfecho_id_fkey ao registrar crimes ambientais.
-- O formulário de Crimes Ambientais usa apenas desfechos desta tabela.

-- Criar tabela se não existir (mesma estrutura usada pelo formulário)
CREATE TABLE IF NOT EXISTS public.dim_desfecho_crime_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'crime',
  created_at timestamptz DEFAULT now()
);

-- Garantir índice único para evitar duplicatas por nome (pode já existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'dim_desfecho_crime_ambientais_nome_key') THEN
    CREATE UNIQUE INDEX dim_desfecho_crime_ambientais_nome_key ON public.dim_desfecho_crime_ambientais (nome);
  END IF;
END $$;

-- Inserir desfechos usados pelo formulário (Conclusão da Ocorrência); ignorar se já existir
INSERT INTO public.dim_desfecho_crime_ambientais (nome, tipo)
SELECT v.nome, v.tipo FROM (VALUES
  ('Flagrante', 'crime'),
  ('Em Apuração pela PCDF', 'crime'),
  ('Em Monitoramento pela PMDF', 'crime'),
  ('Averiguado e Nada Constatado', 'crime'),
  ('Resolvido no Local', 'crime')
) AS v(nome, tipo)
WHERE NOT EXISTS (SELECT 1 FROM public.dim_desfecho_crime_ambientais d WHERE d.nome = v.nome);

-- RLS: leitura para autenticados (formulário precisa listar)
ALTER TABLE public.dim_desfecho_crime_ambientais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can select dim_desfecho_crime_ambientais" ON public.dim_desfecho_crime_ambientais;
CREATE POLICY "Authenticated users can select dim_desfecho_crime_ambientais"
  ON public.dim_desfecho_crime_ambientais FOR SELECT TO authenticated USING (true);
GRANT SELECT ON public.dim_desfecho_crime_ambientais TO authenticated;

COMMENT ON TABLE public.dim_desfecho_crime_ambientais IS 'Desfechos para conclusão de ocorrências de crimes ambientais (FK de fat_registros_de_crimes_ambientais.desfecho_id)';
