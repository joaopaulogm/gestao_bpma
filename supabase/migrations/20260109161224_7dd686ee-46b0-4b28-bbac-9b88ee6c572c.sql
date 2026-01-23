-- 1. Corrigir o registro de 1400 canários que era apreensão, não resgate
-- Deletar o registro incorreto da tabela de resgates 2025
DELETE FROM fat_resgates_diarios_2025_especies 
WHERE id = '9c9126e1-e518-47f8-bb14-863c84ea9ddd';

-- 2. Criar tabela para registrar recordes de apreensão
CREATE TABLE IF NOT EXISTS public.fact_recordes_apreensao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_ocorrencia DATE NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  especie_nome_popular TEXT NOT NULL,
  especie_nome_cientifico TEXT,
  quantidade INTEGER NOT NULL,
  tipo_crime TEXT DEFAULT 'Tráfico de animais',
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fact_recordes_apreensao ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (dados estatísticos)
CREATE POLICY "Recordes de apreensão são públicos" 
ON public.fact_recordes_apreensao 
FOR SELECT 
USING (true);

-- Política de inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir recordes" 
ON public.fact_recordes_apreensao 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Inserir o recorde de apreensão de 2025
INSERT INTO public.fact_recordes_apreensao (data_ocorrencia, ano, mes, especie_nome_popular, especie_nome_cientifico, quantidade, tipo_crime, descricao)
VALUES ('2025-02-14', 2025, 2, 'Canário da Terra', 'Sicalis flaveola', 1400, 'Tráfico de animais', 'Maior apreensão de uma única espécie em um único dia - Operação de combate ao tráfico');

-- 4. Inserir recordes históricos baseados em grandes quantidades (possivelmente apreensões)
-- Agosto 2021 - 110 canários
INSERT INTO public.fact_recordes_apreensao (data_ocorrencia, ano, mes, especie_nome_popular, especie_nome_cientifico, quantidade, tipo_crime, descricao)
VALUES ('2021-08-06', 2021, 8, 'Canário da Terra', 'Sicalis flaveola', 110, 'Tráfico de animais', 'Grande apreensão de aves em operação');

-- Dezembro 2022 - 104 canários  
INSERT INTO public.fact_recordes_apreensao (data_ocorrencia, ano, mes, especie_nome_popular, especie_nome_cientifico, quantidade, tipo_crime, descricao)
VALUES ('2022-12-11', 2022, 12, 'Canário da Terra', 'Sicalis flaveola', 104, 'Tráfico de animais', 'Grande apreensão de aves em operação');

-- Criar índices para performance
CREATE INDEX idx_recordes_apreensao_ano ON public.fact_recordes_apreensao(ano);
CREATE INDEX idx_recordes_apreensao_especie ON public.fact_recordes_apreensao(especie_nome_popular);