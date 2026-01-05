-- Inserir Jararaca Caiçaca (Bothrops moojeni) na tabela dim_especies_fauna
INSERT INTO public.dim_especies_fauna (
  id,
  nome_popular,
  nome_cientifico,
  nome_cientifico_slug,
  classe_taxonomica,
  ordem_taxonomica,
  familia_taxonomica,
  tipo_de_fauna,
  estado_de_conservacao,
  nomes_populares
) VALUES (
  gen_random_uuid(),
  'Jararaca Caiçaca',
  'Bothrops moojeni',
  'bothrops-moojeni',
  'REPTIL',
  'Squamata',
  'Viperidae',
  'Silvestre',
  'LC',
  '["Jararaca Caiçaca", "Jararaca", "Caiçaca", "Jararaca-do-Cerrado", "Caissaca"]'::jsonb
);