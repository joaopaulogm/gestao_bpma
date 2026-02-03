-- RLS para dim_grupamento_servico: permitir leitura para usuários autenticados
-- (tabela de referência para dropdown "Grupamento ou Serviço" nos formulários)

ALTER TABLE public.dim_grupamento_servico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select dim_grupamento_servico" ON public.dim_grupamento_servico;
CREATE POLICY "Authenticated users can select dim_grupamento_servico"
  ON public.dim_grupamento_servico
  FOR SELECT
  TO authenticated
  USING (true);
