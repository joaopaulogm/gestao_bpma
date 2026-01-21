-- =====================================================
-- MIGRAÇÃO: Criar tabelas para Crimes Comuns
-- Estrutura similar a crimes ambientais, mas adaptada para crimes comuns
-- =====================================================

-- 1. Criar tabela principal de registros de crimes comuns
-- NOTA: Nome da tabela conforme estrutura existente no Lovable: fat_crimes_comuns
CREATE TABLE IF NOT EXISTS public.fat_crimes_comuns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Informações Gerais
  data date NOT NULL,
  horario_acionamento time,
  horario_termino time,
  regiao_administrativa_id uuid REFERENCES public.dim_regiao_administrativa(id),
  tipo_area_id uuid REFERENCES public.dim_tipo_de_area(id),
  latitude text NOT NULL,
  longitude text NOT NULL,
  
  -- Classificação do Crime
  tipo_penal_id uuid REFERENCES public.dim_tipo_penal(id), -- Tipo penal (Furto, Roubo, etc.)
  natureza_crime text, -- Ex: Roubo, Furto, Vandalismo, Tráfico, etc.
  enquadramento_legal text, -- Artigo da lei penal
  ocorreu_apreensao boolean DEFAULT false,
  
  -- Detalhes da Ocorrência
  descricao_ocorrencia text,
  local_especifico text, -- Ex: Via pública, Residência, Comércio, etc.
  vitimas_envolvidas integer DEFAULT 0,
  suspeitos_envolvidos integer DEFAULT 0,
  
  -- Armas e Materiais
  arma_utilizada boolean DEFAULT false,
  tipo_arma text, -- Ex: Arma de fogo, Arma branca, etc.
  material_apreendido boolean DEFAULT false,
  descricao_material text,
  
  -- Veículos
  veiculo_envolvido boolean DEFAULT false,
  tipo_veiculo text, -- Ex: Automóvel, Motocicleta, etc.
  placa_veiculo text,
  
  -- Conclusão
  desfecho_id uuid REFERENCES public.dim_desfecho_crime_comum(id),
  procedimento_legal text, -- Ex: TCO-PMDF, TCO-PCDF, QT, etc.
  qtd_detidos_maior integer DEFAULT 0,
  qtd_detidos_menor integer DEFAULT 0,
  qtd_liberados_maior integer DEFAULT 0,
  qtd_liberados_menor integer DEFAULT 0,
  observacoes text
);

-- Comentários para documentação
COMMENT ON COLUMN public.fat_crimes_comuns.horario_acionamento IS 'Horário de acionamento da ocorrência no formato HH:MM (24h)';
COMMENT ON COLUMN public.fat_crimes_comuns.horario_termino IS 'Horário de término da ocorrência no formato HH:MM (24h)';
COMMENT ON TABLE public.fat_crimes_comuns IS 'Registros de crimes comuns (não ambientais)';

-- Habilitar RLS
ALTER TABLE public.fat_crimes_comuns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_crimes_comuns" ON public.fat_crimes_comuns
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_crimes_comuns" ON public.fat_crimes_comuns
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_crimes_comuns" ON public.fat_crimes_comuns
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_crimes_comuns" ON public.fat_crimes_comuns
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. Criar tabela de relacionamento para equipe de crimes comuns
CREATE TABLE IF NOT EXISTS public.fat_equipe_crime_comum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid REFERENCES public.fat_crimes_comuns(id) ON DELETE CASCADE,
  efetivo_id uuid REFERENCES public.dim_efetivo(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(registro_id, efetivo_id)
);

-- Habilitar RLS
ALTER TABLE public.fat_equipe_crime_comum ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_equipe_crime_comum" ON public.fat_equipe_crime_comum
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_equipe_crime_comum" ON public.fat_equipe_crime_comum
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_equipe_crime_comum" ON public.fat_equipe_crime_comum
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_equipe_crime_comum" ON public.fat_equipe_crime_comum
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. Criar tabela de relacionamento para bens apreendidos em crimes comuns
CREATE TABLE IF NOT EXISTS public.fat_ocorrencia_apreensao_crime_comum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ocorrencia uuid REFERENCES public.fat_crimes_comuns(id) ON DELETE CASCADE,
  id_item_apreendido uuid REFERENCES public.dim_itens_apreendidos(id),
  quantidade integer DEFAULT 1,
  descricao_complementar text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fat_ocorrencia_apreensao_crime_comum ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_ocorrencia_apreensao_crime_comum" ON public.fat_ocorrencia_apreensao_crime_comum
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_ocorrencia_apreensao_crime_comum" ON public.fat_ocorrencia_apreensao_crime_comum
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_ocorrencia_apreensao_crime_comum" ON public.fat_ocorrencia_apreensao_crime_comum
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_ocorrencia_apreensao_crime_comum" ON public.fat_ocorrencia_apreensao_crime_comum
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_data ON public.fat_crimes_comuns(data);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_regiao ON public.fat_crimes_comuns(regiao_administrativa_id);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_natureza ON public.fat_crimes_comuns(natureza_crime);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_tipo_penal ON public.fat_crimes_comuns(tipo_penal_id);
CREATE INDEX IF NOT EXISTS idx_fat_crimes_comuns_desfecho ON public.fat_crimes_comuns(desfecho_id);
CREATE INDEX IF NOT EXISTS idx_fat_equipe_crime_comum_registro ON public.fat_equipe_crime_comum(registro_id);
CREATE INDEX IF NOT EXISTS idx_fat_equipe_crime_comum_efetivo ON public.fat_equipe_crime_comum(efetivo_id);
CREATE INDEX IF NOT EXISTS idx_fat_apreensao_crime_comum_ocorrencia ON public.fat_ocorrencia_apreensao_crime_comum(id_ocorrencia);
