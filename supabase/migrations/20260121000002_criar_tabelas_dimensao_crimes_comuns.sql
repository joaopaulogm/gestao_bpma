-- =====================================================
-- MIGRAÇÃO: Criar tabelas de dimensão para Crimes Comuns
-- Tabelas: dim_tipo_penal e dim_desfecho_crime_comum
-- =====================================================

-- 1. Criar tabela de dimensão para tipos penais
CREATE TABLE IF NOT EXISTS public.dim_tipo_penal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  codigo text, -- Código do artigo (ex: "Art. 155")
  descricao text,
  created_at timestamp with time zone DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.dim_tipo_penal IS 'Tipos penais para crimes comuns';
COMMENT ON COLUMN public.dim_tipo_penal.codigo IS 'Código do artigo da lei penal (ex: Art. 155, Art. 157)';

-- Habilitar RLS
ALTER TABLE public.dim_tipo_penal ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view dim_tipo_penal" ON public.dim_tipo_penal
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert dim_tipo_penal" ON public.dim_tipo_penal
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dim_tipo_penal" ON public.dim_tipo_penal
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dim_tipo_penal" ON public.dim_tipo_penal
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 2. Criar tabela de dimensão para desfechos de crimes comuns
CREATE TABLE IF NOT EXISTS public.dim_desfecho_crime_comum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  created_at timestamp with time zone DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.dim_desfecho_crime_comum IS 'Desfechos possíveis para crimes comuns';

-- Habilitar RLS
ALTER TABLE public.dim_desfecho_crime_comum ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view dim_desfecho_crime_comum" ON public.dim_desfecho_crime_comum
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert dim_desfecho_crime_comum" ON public.dim_desfecho_crime_comum
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dim_desfecho_crime_comum" ON public.dim_desfecho_crime_comum
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dim_desfecho_crime_comum" ON public.dim_desfecho_crime_comum
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. Popular tabela dim_desfecho_crime_comum com valores padrão
INSERT INTO public.dim_desfecho_crime_comum (nome, descricao) VALUES
  ('Em Apuração pela PCDF', 'Crime em apuração pela Polícia Civil do Distrito Federal'),
  ('Em Monitoramento pela PMDF', 'Crime em monitoramento pela Polícia Militar do Distrito Federal'),
  ('Averiguado e Nada Constatado', 'Averiguação realizada sem constatação de crime'),
  ('Resolvido no Local', 'Situação resolvida no local da ocorrência'),
  ('TCO-PMDF', 'Termo Circunstanciado de Ocorrência - PMDF'),
  ('TCO-PCDF', 'Termo Circunstanciado de Ocorrência - PCDF'),
  ('Boletim de Ocorrência', 'BO registrado'),
  ('Flagrante', 'Flagrante delito'),
  ('Inquérito Policial', 'IP instaurado')
ON CONFLICT (nome) DO NOTHING;

-- 4. Popular tabela dim_tipo_penal com alguns tipos comuns
INSERT INTO public.dim_tipo_penal (nome, codigo, descricao) VALUES
  ('Furto', 'Art. 155', 'Furto simples'),
  ('Roubo', 'Art. 157', 'Roubo simples'),
  ('Tráfico de Drogas', 'Art. 33', 'Tráfico de substâncias entorpecentes'),
  ('Porte Ilegal de Arma', 'Art. 14', 'Porte ilegal de arma de fogo'),
  ('Vandalismo', 'Art. 163', 'Dano ao patrimônio'),
  ('Ameaça', 'Art. 147', 'Ameaça de violência'),
  ('Lesão Corporal', 'Art. 129', 'Lesão corporal dolosa'),
  ('Homicídio', 'Art. 121', 'Homicídio simples'),
  ('Estelionato', 'Art. 171', 'Estelionato'),
  ('Receptação', 'Art. 180', 'Receptação de coisa alheia móvel')
ON CONFLICT (nome) DO NOTHING;
