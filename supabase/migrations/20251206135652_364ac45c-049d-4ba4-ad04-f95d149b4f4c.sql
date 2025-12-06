-- Adicionar Flagrante aos desfechos se não existir
INSERT INTO public.dim_desfecho (nome, tipo) 
SELECT 'Flagrante', 'crime'
WHERE NOT EXISTS (SELECT 1 FROM public.dim_desfecho WHERE nome = 'Flagrante');

-- Atualizar tipo para os desfechos de crime
UPDATE public.dim_desfecho SET tipo = 'crime' WHERE nome IN (
  'Em Apuração pela PCDF',
  'Em Monitoramento pela PMDF', 
  'Averiguado e Nada Constatado',
  'Resolvido no Local',
  'Flagrante'
);