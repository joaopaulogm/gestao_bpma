-- Inserir novos desfechos de resgate
INSERT INTO dim_desfecho_resgates (nome, tipo) VALUES 
  ('Ninho', 'resgate'),
  ('Óbito', 'resgate'),
  ('Sem Contato (Solicitante)', 'resgate'),
  ('Vida Livre', 'resgate'),
  ('Desistência (Solicitante)', 'resgate')
ON CONFLICT DO NOTHING;