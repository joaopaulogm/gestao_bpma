-- Atualizar os valores existentes na dim_origem
UPDATE dim_origem SET nome = 'COPOM' WHERE nome = 'Resgate de Fauna';
UPDATE dim_origem SET nome = 'Ação Policial' WHERE nome = 'Apreensão';

-- Inserir novos valores
INSERT INTO dim_origem (nome) VALUES 
  ('Comunidade'),
  ('Outras instituições'),
  ('PMDF');

-- Adicionar coluna ocorreu_apreensao na tabela de crimes
ALTER TABLE fat_registros_de_crime 
ADD COLUMN IF NOT EXISTS ocorreu_apreensao boolean DEFAULT false;