-- Adicionar novos campos para Crimes de Poluição na tabela fat_registros_de_crime
ALTER TABLE fat_registros_de_crime
ADD COLUMN IF NOT EXISTS tipo_poluicao text,
ADD COLUMN IF NOT EXISTS descricao_situacao_poluicao text,
ADD COLUMN IF NOT EXISTS material_visivel text,
ADD COLUMN IF NOT EXISTS volume_aparente text,
ADD COLUMN IF NOT EXISTS origem_aparente text,
ADD COLUMN IF NOT EXISTS animal_afetado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vegetacao_afetada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS alteracao_visual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS odor_forte boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mortandade_animais boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS risco_imediato text,
ADD COLUMN IF NOT EXISTS intensidade_percebida text;

-- Adicionar novos campos para Crimes Contra Ordenamento Urbano e Patrimônio Cultural
ALTER TABLE fat_registros_de_crime
ADD COLUMN IF NOT EXISTS tipo_intervencao_irregular text,
ADD COLUMN IF NOT EXISTS estruturas_encontradas text,
ADD COLUMN IF NOT EXISTS quantidade_estruturas integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dano_alteracao_perceptivel text,
ADD COLUMN IF NOT EXISTS maquinas_presentes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS material_apreendido_urbano boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS descricao_material_urbano text;

-- Adicionar novos campos para Crimes Contra Administração Ambiental
ALTER TABLE fat_registros_de_crime
ADD COLUMN IF NOT EXISTS tipo_impedimento_obstrucao text,
ADD COLUMN IF NOT EXISTS descricao_administracao text,
ADD COLUMN IF NOT EXISTS documento_indicio_visual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_indicio text,
ADD COLUMN IF NOT EXISTS material_apreendido_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS descricao_material_admin text,
ADD COLUMN IF NOT EXISTS veiculo_relacionado boolean DEFAULT false;

-- Criar tabela de relacionamento N:N para Bens Apreendidos
CREATE TABLE IF NOT EXISTS fat_ocorrencia_apreensao (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ocorrencia_id uuid NOT NULL REFERENCES fat_registros_de_crime(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES dim_itens_apreensao(id) ON DELETE CASCADE,
  quantidade integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ocorrencia_id, item_id)
);

-- Habilitar RLS
ALTER TABLE fat_ocorrencia_apreensao ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Authenticated users can view apreensoes"
ON fat_ocorrencia_apreensao FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert apreensoes"
ON fat_ocorrencia_apreensao FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update apreensoes"
ON fat_ocorrencia_apreensao FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete apreensoes"
ON fat_ocorrencia_apreensao FOR DELETE
USING (auth.uid() IS NOT NULL);