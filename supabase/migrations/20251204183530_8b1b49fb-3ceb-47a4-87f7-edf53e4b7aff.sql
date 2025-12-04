-- Remover constraint antiga e adicionar nova com 'crime'
ALTER TABLE public.dim_desfecho DROP CONSTRAINT dim_desfecho_tipo_check;

ALTER TABLE public.dim_desfecho ADD CONSTRAINT dim_desfecho_tipo_check 
  CHECK (tipo = ANY (ARRAY['resgate'::text, 'apreensao'::text, 'crime'::text]));

-- Inserir desfechos para crimes ambientais
INSERT INTO public.dim_desfecho (nome, tipo) VALUES
  ('Em Apuração pela PCDF', 'crime'),
  ('Em Monitoramento pela PMDF', 'crime'),
  ('Averiguado e Nada Constatado', 'crime'),
  ('Resolvido no Local', 'crime'),
  ('TCO PCDF', 'apreensao')
ON CONFLICT DO NOTHING;