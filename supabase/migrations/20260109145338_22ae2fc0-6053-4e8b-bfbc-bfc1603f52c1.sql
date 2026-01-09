-- Criar tabela de resgates diários 2025 com estrutura igual às tabelas 2020-2024
-- Esta tabela armazena os dados detalhados por espécie e por dia

CREATE TABLE IF NOT EXISTS public.fat_resgates_diarios_2025_especies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_ocorrencia date,
  nome_popular text,
  nome_cientifico text,
  classe_taxonomica text,
  ordem_taxonomica text,
  tipo_de_fauna text DEFAULT 'Silvestre',
  estado_de_conservacao text,
  quantidade_resgates numeric DEFAULT 0,
  quantidade_solturas numeric DEFAULT 0,
  quantidade_obitos numeric DEFAULT 0,
  quantidade_feridos numeric DEFAULT 0,
  quantidade_filhotes numeric DEFAULT 0,
  mes text,
  criado_em timestamp with time zone DEFAULT now(),
  especie_id uuid REFERENCES dim_especies_fauna(id)
);

-- Habilitar RLS
ALTER TABLE public.fat_resgates_diarios_2025_especies ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Dados de resgates 2025 são públicos para leitura"
ON public.fat_resgates_diarios_2025_especies
FOR SELECT
USING (true);

-- Política para usuários autenticados gerenciarem
CREATE POLICY "Authenticated users can manage fat_resgates_diarios_2025_especies"
ON public.fat_resgates_diarios_2025_especies
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Criar índices para performance
CREATE INDEX idx_fat_resgates_2025_especies_data ON public.fat_resgates_diarios_2025_especies(data_ocorrencia);
CREATE INDEX idx_fat_resgates_2025_especies_mes ON public.fat_resgates_diarios_2025_especies(mes);
CREATE INDEX idx_fat_resgates_2025_especies_especie ON public.fat_resgates_diarios_2025_especies(especie_id);