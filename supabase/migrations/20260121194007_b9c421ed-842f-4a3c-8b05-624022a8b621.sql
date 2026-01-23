-- Adicionar colunas faltantes na tabela fat_crimes_comuns
ALTER TABLE public.fat_crimes_comuns 
ADD COLUMN IF NOT EXISTS natureza_crime TEXT,
ADD COLUMN IF NOT EXISTS enquadramento_legal TEXT,
ADD COLUMN IF NOT EXISTS ocorreu_apreensao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS descricao_ocorrencia TEXT,
ADD COLUMN IF NOT EXISTS local_especifico TEXT,
ADD COLUMN IF NOT EXISTS vitimas_envolvidas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspeitos_envolvidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS arma_utilizada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_arma TEXT,
ADD COLUMN IF NOT EXISTS material_apreendido BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS descricao_material TEXT,
ADD COLUMN IF NOT EXISTS veiculo_envolvido BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_veiculo TEXT,
ADD COLUMN IF NOT EXISTS placa_veiculo TEXT,
ADD COLUMN IF NOT EXISTS procedimento_legal TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.fat_crimes_comuns.natureza_crime IS 'Natureza do crime (ex: Roubo, Furto, Vandalismo)';
COMMENT ON COLUMN public.fat_crimes_comuns.enquadramento_legal IS 'Enquadramento legal/artigo aplicável';
COMMENT ON COLUMN public.fat_crimes_comuns.ocorreu_apreensao IS 'Se ocorreu apreensão de bens';
COMMENT ON COLUMN public.fat_crimes_comuns.descricao_ocorrencia IS 'Descrição detalhada da ocorrência';
COMMENT ON COLUMN public.fat_crimes_comuns.local_especifico IS 'Descrição específica do local';
COMMENT ON COLUMN public.fat_crimes_comuns.vitimas_envolvidas IS 'Quantidade de vítimas envolvidas';
COMMENT ON COLUMN public.fat_crimes_comuns.suspeitos_envolvidos IS 'Quantidade de suspeitos envolvidos';
COMMENT ON COLUMN public.fat_crimes_comuns.arma_utilizada IS 'Se houve uso de arma';
COMMENT ON COLUMN public.fat_crimes_comuns.tipo_arma IS 'Tipo de arma utilizada';
COMMENT ON COLUMN public.fat_crimes_comuns.material_apreendido IS 'Se houve material apreendido';
COMMENT ON COLUMN public.fat_crimes_comuns.descricao_material IS 'Descrição do material apreendido';
COMMENT ON COLUMN public.fat_crimes_comuns.veiculo_envolvido IS 'Se houve veículo envolvido';
COMMENT ON COLUMN public.fat_crimes_comuns.tipo_veiculo IS 'Tipo do veículo envolvido';
COMMENT ON COLUMN public.fat_crimes_comuns.placa_veiculo IS 'Placa do veículo envolvido';
COMMENT ON COLUMN public.fat_crimes_comuns.procedimento_legal IS 'Procedimento legal adotado';

-- Criar tabela para bens apreendidos em crimes comuns (se não existir)
CREATE TABLE IF NOT EXISTS public.fat_ocorrencia_apreensao_crime_comum (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_ocorrencia UUID REFERENCES public.fat_crimes_comuns(id) ON DELETE CASCADE,
  id_item_apreendido UUID REFERENCES public.dim_itens_apreensao(id),
  quantidade INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para equipe de crimes comuns (se não existir)
CREATE TABLE IF NOT EXISTS public.fat_equipe_crime_comum (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_id UUID NOT NULL REFERENCES public.fat_crimes_comuns(id) ON DELETE CASCADE,
  efetivo_id UUID NOT NULL REFERENCES public.dim_efetivo(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.fat_ocorrencia_apreensao_crime_comum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fat_equipe_crime_comum ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para fat_ocorrencia_apreensao_crime_comum
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON public.fat_ocorrencia_apreensao_crime_comum 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" 
ON public.fat_ocorrencia_apreensao_crime_comum 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" 
ON public.fat_ocorrencia_apreensao_crime_comum 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Permitir exclusão para usuários autenticados" 
ON public.fat_ocorrencia_apreensao_crime_comum 
FOR DELETE 
TO authenticated
USING (true);

-- Políticas de acesso para fat_equipe_crime_comum
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON public.fat_equipe_crime_comum 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" 
ON public.fat_equipe_crime_comum 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" 
ON public.fat_equipe_crime_comum 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Permitir exclusão para usuários autenticados" 
ON public.fat_equipe_crime_comum 
FOR DELETE 
TO authenticated
USING (true);