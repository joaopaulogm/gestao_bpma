-- Primeiro, adicionar UNIQUE constraint em dim_enquadramento.id_enquadramento
ALTER TABLE public.dim_enquadramento 
ADD CONSTRAINT dim_enquadramento_id_unique UNIQUE (id_enquadramento);

-- Criar tabela fat_registros_de_crime para crimes ambientais
CREATE TABLE public.fat_registros_de_crime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Informações Gerais
  data DATE NOT NULL,
  regiao_administrativa_id UUID REFERENCES public.dim_regiao_administrativa(id),
  tipo_area_id UUID REFERENCES public.dim_tipo_de_area(id),
  latitude_ocorrencia TEXT,
  longitude_ocorrencia TEXT,
  
  -- Classificação do Crime
  tipo_crime_id UUID REFERENCES public.dim_tipo_de_crime(id_tipo_de_crime),
  enquadramento_id UUID REFERENCES public.dim_enquadramento(id_enquadramento),
  
  -- Dados da Espécie (para exportação direta ao Power BI)
  tipo_registro TEXT NOT NULL, -- 'fauna' ou 'flora'
  
  -- Fauna
  especie_fauna_id UUID REFERENCES public.dim_especies_fauna(id),
  nome_popular_fauna TEXT,
  nome_cientifico_fauna TEXT,
  classe_taxonomica TEXT,
  ordem_taxonomica TEXT,
  tipo_fauna TEXT,
  estado_conservacao_fauna TEXT,
  estado_saude_id UUID REFERENCES public.dim_estado_saude(id),
  estagio_vida_id UUID REFERENCES public.dim_estagio_vida(id),
  atropelamento TEXT,
  quantidade_adulto INTEGER DEFAULT 0,
  quantidade_filhote INTEGER DEFAULT 0,
  quantidade_total INTEGER DEFAULT 0,
  destinacao_fauna TEXT,
  -- Óbito
  estagio_vida_obito_id UUID REFERENCES public.dim_estagio_vida(id),
  quantidade_adulto_obito INTEGER DEFAULT 0,
  quantidade_filhote_obito INTEGER DEFAULT 0,
  quantidade_total_obito INTEGER DEFAULT 0,
  
  -- Flora
  especie_flora_id UUID REFERENCES public.dim_especies_flora(id),
  nome_popular_flora TEXT,
  nome_cientifico_flora TEXT,
  classe_flora TEXT,
  ordem_flora TEXT,
  familia_flora TEXT,
  estado_conservacao_flora TEXT,
  tipo_planta TEXT,
  madeira_lei TEXT,
  imune_corte TEXT,
  condicao_flora TEXT,
  quantidade_flora INTEGER DEFAULT 1,
  destinacao_flora TEXT,
  numero_termo_entrega TEXT,
  
  -- Desfecho
  desfecho TEXT,
  procedimento_legal TEXT,
  quantidade_detidos_maior_idade INTEGER DEFAULT 0,
  quantidade_detidos_menor_idade INTEGER DEFAULT 0,
  quantidade_liberados_maior_idade INTEGER DEFAULT 0,
  quantidade_liberados_menor_idade INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.fat_registros_de_crime ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fat_registros_de_crime (apenas autenticados)
CREATE POLICY "Authenticated users can view registros_crime"
ON public.fat_registros_de_crime
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert registros_crime"
ON public.fat_registros_de_crime
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update registros_crime"
ON public.fat_registros_de_crime
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete registros_crime"
ON public.fat_registros_de_crime
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Adicionar coluna tipo_area_id à tabela fat_registros_de_resgate
ALTER TABLE public.fat_registros_de_resgate 
ADD COLUMN IF NOT EXISTS tipo_area_id UUID REFERENCES public.dim_tipo_de_area(id);

-- Criar índices para melhor performance
CREATE INDEX idx_fat_registros_crime_data ON public.fat_registros_de_crime(data);
CREATE INDEX idx_fat_registros_crime_tipo_registro ON public.fat_registros_de_crime(tipo_registro);
CREATE INDEX idx_fat_registros_crime_tipo_crime ON public.fat_registros_de_crime(tipo_crime_id);
CREATE INDEX idx_fat_registros_crime_regiao ON public.fat_registros_de_crime(regiao_administrativa_id);