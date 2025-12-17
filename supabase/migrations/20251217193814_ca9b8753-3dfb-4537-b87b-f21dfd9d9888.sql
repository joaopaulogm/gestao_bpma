
-- Insert missing fauna records for species from dimension table
INSERT INTO fauna (nome_popular, nome_popular_slug, nome_cientifico, classe_taxonomica, ordem_taxonomica, estado_conservacao, tipo_fauna, grupo, id_dim_especie_fauna, bucket, imagens)
SELECT 
  d.nome_popular,
  lower(regexp_replace(translate(d.nome_popular || '-' || d.nome_cientifico, 'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ ', 'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn-'), '[^a-zA-Z0-9-]+', '-', 'g')),
  d.nome_cientifico,
  d.classe_taxonomica,
  d.ordem_taxonomica,
  d.estado_de_conservacao,
  d.tipo_de_fauna,
  CASE 
    WHEN d.classe_taxonomica = 'AVE' THEN 'aves'
    WHEN d.classe_taxonomica = 'MAMIFERO' THEN 'mamiferos'
    WHEN d.classe_taxonomica = 'REPTIL' THEN 'repteis'
    WHEN d.classe_taxonomica = 'PEIXE' THEN 'peixes'
    ELSE 'outros'
  END,
  d.id,
  'imagens-fauna',
  COALESCE(d.imagens, ARRAY[]::text[])
FROM dim_especies_fauna d
WHERE d.id NOT IN (SELECT id_dim_especie_fauna FROM fauna WHERE id_dim_especie_fauna IS NOT NULL);
