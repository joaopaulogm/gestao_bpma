-- Criar tabela dimensão para áreas especialmente protegidas
CREATE TABLE IF NOT EXISTS public.dim_area_especialmente_protegida (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  competencia TEXT NOT NULL CHECK (competencia IN ('Federal', 'Distrital')),
  tipo TEXT, -- UC, APP, Reserva Legal, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dim_area_especialmente_protegida ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON public.dim_area_especialmente_protegida 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Permitir todas operações para admin" 
ON public.dim_area_especialmente_protegida 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Adicionar colunas na tabela fat_atividades_prevencao
ALTER TABLE public.fat_atividades_prevencao 
ADD COLUMN IF NOT EXISTS em_area_protegida BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS area_protegida_id UUID REFERENCES public.dim_area_especialmente_protegida(id);

-- Inserir as áreas UCs Federais no DF
INSERT INTO public.dim_area_especialmente_protegida (nome, competencia, tipo) VALUES
('Parque Nacional de Brasília', 'Federal', 'Parque Nacional'),
('Floresta Nacional de Brasília', 'Federal', 'Floresta Nacional'),
('Reserva Biológica da Contagem', 'Federal', 'Reserva Biológica'),
('Área de Proteção Ambiental do Planalto Central', 'Federal', 'APA'),
('Área de Proteção Ambiental da Bacia do Rio Descoberto', 'Federal', 'APA'),
('Área de Proteção Ambiental da Bacia do Rio São Bartolomeu', 'Federal', 'APA')
ON CONFLICT (nome) DO NOTHING;

-- Inserir as áreas UCs Distritais no DF
INSERT INTO public.dim_area_especialmente_protegida (nome, competencia, tipo) VALUES
('APP', 'Distrital', 'APP'),
('Reserva Legal', 'Distrital', 'Reserva Legal'),
('Parque Ecológico do Gama', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico e Vivencial Ponte Alta do Gama', 'Distrital', 'Parque Ecológico'),
('Parque Distrital do Gama', 'Distrital', 'Parque Distrital'),
('Reserva Biológica do Gama', 'Distrital', 'Reserva Biológica'),
('Parque Distrital Salto do Tororó', 'Distrital', 'Parque Distrital'),
('Reserva Biológica do Cerradão', 'Distrital', 'Reserva Biológica'),
('ARIE Paranoá Sul', 'Distrital', 'ARIE'),
('Floresta Distrital dos Pinheiros', 'Distrital', 'Floresta Distrital'),
('Parque Ecológico da Cachoeirinha', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico do Paranoá', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Sementes do Itapoã', 'Distrital', 'Parque Ecológico'),
('ARIE da Cachoeira do Pipiripau', 'Distrital', 'ARIE'),
('Estação Ecológica de Águas Emendadas', 'Distrital', 'Estação Ecológica'),
('Parque Ambiental Colégio Agrícola de Brasília', 'Distrital', 'Parque Ambiental'),
('Parque Distrital do Retirinho', 'Distrital', 'Parque Distrital'),
('Parque Distrital dos Pequizeiros', 'Distrital', 'Parque Distrital'),
('Parque Ecológico do DER', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico e Vivencial da Lagoa Joaquim de Medeiros', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Sobradinho II', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Sucupira', 'Distrital', 'Parque Ecológico'),
('Refúgio de Vida Silvestre Mestre D''Armas', 'Distrital', 'Refúgio de Vida Silvestre'),
('Refúgio de Vida Silvestre Vale do Amanhecer', 'Distrital', 'Refúgio de Vida Silvestre'),
('APA da Bacia do Rio São Bartolomeu', 'Distrital', 'APA'),
('Parque Ecológico de Santa Maria', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Tororó', 'Distrital', 'Parque Ecológico'),
('ARIE do Córrego Mato Grande', 'Distrital', 'ARIE'),
('Parque Distrital de São Sebastião', 'Distrital', 'Parque Distrital'),
('Parque Ecológico dos Jequitibás', 'Distrital', 'Parque Ecológico'),
('Monumento Natural da Pedra Fundamental', 'Distrital', 'Monumento Natural'),
('Parque de uso Múltiplo Centro de Lazer e Cultura Viva de Sobradinho', 'Distrital', 'Parque de Uso Múltiplo'),
('Parque Recreativo e Ecológico Canela de Ema', 'Distrital', 'Parque Recreativo'),
('ARIE do Torto', 'Distrital', 'ARIE'),
('Estação Ecológica do Jardim Botânico', 'Distrital', 'Estação Ecológica'),
('ARIE Bananal', 'Distrital', 'ARIE'),
('Parque Ecológico das Garças', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico do Lago Norte', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico da Vila Varjão', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Taquari', 'Distrital', 'Parque Ecológico'),
('Refúgio de Vida Silvestre Morro do Careca', 'Distrital', 'Refúgio de Vida Silvestre'),
('ARIE do Bosque', 'Distrital', 'ARIE'),
('ARIE Dom Bosco', 'Distrital', 'ARIE'),
('Monumento Natural Dom Bosco', 'Distrital', 'Monumento Natural'),
('Parque Distrital Bernardo Sayão', 'Distrital', 'Parque Distrital'),
('Parque Distrital das Copaíbas', 'Distrital', 'Parque Distrital'),
('Parque Ecológico do Anfiteatro Natural do Lago Sul', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Península Sul', 'Distrital', 'Parque Ecológico'),
('Refúgio de Vida Silvestre Garça Branca', 'Distrital', 'Refúgio de Vida Silvestre'),
('Refúgio de Vida Silvestre Canjerana', 'Distrital', 'Refúgio de Vida Silvestre'),
('APA das Bacias dos Córregos Gama e Cabeça de Veado', 'Distrital', 'APA'),
('Estação Ecológica Córrego da Onça', 'Distrital', 'Estação Ecológica'),
('Parque Ecológico Lauro Muller', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Luiz Cruls', 'Distrital', 'Parque Ecológico'),
('ARIE Cruls', 'Distrital', 'ARIE'),
('Parque Ecológico Asa Sul', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Burle Marx', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Enseada Norte', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Olhos d''Água', 'Distrital', 'Parque Ecológico'),
('APA do Lago Paranoá', 'Distrital', 'APA'),
('Parque Ecológico das Sucupiras', 'Distrital', 'Parque Ecológico'),
('Reserva Biológica do Guará', 'Distrital', 'Reserva Biológica'),
('Parque Ecológico Ezechias Heringer', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico dos Pioneiros', 'Distrital', 'Parque Ecológico'),
('ARIE do Riacho Fundo', 'Distrital', 'ARIE'),
('Parque Ecológico Águas Claras', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Areal', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Veredinha', 'Distrital', 'Parque Ecológico'),
('Reserva Biológica do Rio Descoberto', 'Distrital', 'Reserva Biológica'),
('APA de Cafuringa', 'Distrital', 'APA'),
('Parque Ecológico e Vivencial do Rio Descoberto', 'Distrital', 'Parque Ecológico'),
('Monumento Natural do Conjunto Espeleológico do Morro da Pedreira', 'Distrital', 'Monumento Natural'),
('Refúgio de Vida Silvestre da Mata Seca', 'Distrital', 'Refúgio de Vida Silvestre'),
('Parque Distrital Recanto das Emas', 'Distrital', 'Parque Distrital'),
('Parque Ecológico do Riacho Fundo', 'Distrital', 'Parque Ecológico'),
('ARIE da Granja do Ipê', 'Distrital', 'ARIE'),
('Parque Ecológico Três Meninas', 'Distrital', 'Parque Ecológico'),
('Refúgio da Vida Silvestre Gatumé', 'Distrital', 'Refúgio de Vida Silvestre'),
('ARIE do Parque JK', 'Distrital', 'ARIE'),
('ARIE da Vila Estrutural', 'Distrital', 'ARIE'),
('ARIE do Córrego Cabeceira do Valo', 'Distrital', 'ARIE'),
('Parque Distrital Boca da Mata', 'Distrital', 'Parque Distrital'),
('Parque Ecológico do Cortado', 'Distrital', 'Parque Ecológico'),
('Parque Ecológico Saburo Onoyama', 'Distrital', 'Parque Ecológico')
ON CONFLICT (nome) DO NOTHING;