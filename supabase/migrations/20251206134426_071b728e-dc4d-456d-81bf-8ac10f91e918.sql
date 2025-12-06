-- Criar tabela dimensão para áreas protegidas
CREATE TABLE IF NOT EXISTS public.dim_area_protegida (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir valores para áreas protegidas
INSERT INTO public.dim_area_protegida (nome) VALUES
  ('Unidade de Conservação Federal'),
  ('Unidade de Conservação Distrital'),
  ('Área de Preservação Permanente (APP)'),
  ('Reserva Legal')
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.dim_area_protegida ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view dim_area_protegida" ON public.dim_area_protegida
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage dim_area_protegida" ON public.dim_area_protegida
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Criar tabela dimensão para itens apreendidos
CREATE TABLE IF NOT EXISTS public.dim_itens_apreendidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_crime_relacionado text,
  categoria text,
  item text,
  uso_ilicito text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dim_itens_apreendidos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view dim_itens_apreendidos" ON public.dim_itens_apreendidos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage dim_itens_apreendidos" ON public.dim_itens_apreendidos
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Inserir itens apreendidos
INSERT INTO public.dim_itens_apreendidos (tipo_crime_relacionado, categoria, item, uso_ilicito) VALUES
  ('Fauna', 'Armas de Fogo', 'Espingarda calibre 12/20/36', 'Caça ilegal'),
  ('Fauna', 'Armas de Fogo', 'Carabina .22', 'Caça de pequeno porte'),
  ('Fauna', 'Armas de Fogo', 'Rifle de repetição', 'Caça de médio porte'),
  ('Fauna', 'Armas de Fogo', 'Arma artesanal (soca/por fora)', 'Abate clandestino'),
  ('Fauna/Flora', 'Armas de Fogo', 'Pistola ou revólver', 'Coação ou uso em crimes conexos'),
  ('Fauna', 'Munições e Acessórios', 'Munição calibre 12', 'Abate de animais'),
  ('Fauna', 'Munições e Acessórios', 'Munição diversos calibres', 'Caça ilegal'),
  ('Fauna', 'Munições e Acessórios', 'Espoletas, pólvora e chumbo', 'Recarga de munição'),
  ('Fauna', 'Munições e Acessórios', 'Cartucheira', 'Suporte à caça'),
  ('Fauna/Flora', 'Armas Brancas', 'Facão', 'Abate ou corte vegetal'),
  ('Fauna', 'Armas Brancas', 'Faca de caça', 'Carnear animal'),
  ('Flora', 'Armas Brancas', 'Machado', 'Derrubada de árvores'),
  ('Flora', 'Armas Brancas', 'Podão', 'Corte de galhos protegidos'),
  ('Flora', 'Armas Brancas', 'Foice', 'Desmate'),
  ('Flora', 'Ferramentas de Extração Vegetal', 'Motosserra', 'Corte de árvores'),
  ('Flora', 'Ferramentas de Extração Vegetal', 'Motopoda', 'Corte de copa e galhos'),
  ('Flora', 'Ferramentas de Extração Vegetal', 'Serrote ou serra sabre', 'Corte de lenha'),
  ('Flora', 'Ferramentas de Extração Vegetal', 'Serra circular portátil', 'Beneficiamento clandestino'),
  ('Flora', 'Ferramentas de Extração Vegetal', 'Pé-de-cabra ou alavanca', 'Remoção de toras'),
  ('Flora', 'Maquinário Pesado', 'Trator agrícola', 'Abertura de área'),
  ('Flora', 'Maquinário Pesado', 'Trator de esteira', 'Supressão de vegetação'),
  ('Flora', 'Maquinário Pesado', 'Pá carregadeira', 'Carregamento de toras'),
  ('Flora', 'Maquinário Pesado', 'Escavadeira hidráulica', 'Desmatamento ou terraplanagem'),
  ('Flora', 'Maquinário Pesado', 'Caminhão madeireiro', 'Transporte irregular de madeira'),
  ('Fauna/Flora', 'Veículos', 'Automóvel', 'Transporte irregular'),
  ('Fauna', 'Veículos', 'Motocicleta', 'Acesso a trilhas para caça'),
  ('Flora', 'Veículos', 'Caminhonete', 'Transporte de toras ou carvão'),
  ('Fauna', 'Veículos', 'Quadriciclo', 'Patrulha clandestina de caça'),
  ('Fauna', 'Veículos', 'Embarcação', 'Pesca ilegal'),
  ('Fauna', 'Petrechos de Caça', 'Armadilha arapuca', 'Captura de aves'),
  ('Fauna', 'Petrechos de Caça', 'Armadilha coioteira', 'Captura de mamíferos'),
  ('Fauna', 'Petrechos de Caça', 'Laço de aço', 'Captura'),
  ('Fauna', 'Petrechos de Caça', 'Espinhel terrestre', 'Captura de carnívoros'),
  ('Fauna', 'Petrechos de Caça', 'Redes de captura', 'Captura ilegal'),
  ('Fauna', 'Petrechos de Pesca', 'Rede de emalhar', 'Pesca predatória'),
  ('Fauna', 'Petrechos de Pesca', 'Tarrafa', 'Coleta ilegal'),
  ('Fauna', 'Petrechos de Pesca', 'Espinhel', 'Pesca irregular'),
  ('Fauna', 'Petrechos de Pesca', 'Anzol de galho', 'Captura proibida'),
  ('Fauna', 'Petrechos de Pesca', 'Covo ou cacuri', 'Captura ilegal'),
  ('Fauna', 'Iluminação ou Atração', 'Lanternas potentes', 'Localização noturna de animais'),
  ('Fauna', 'Iluminação ou Atração', 'Faróis de longo alcance', 'Caça noturna'),
  ('Fauna', 'Iluminação ou Atração', 'Holofotes', 'Atração de fauna'),
  ('Fauna', 'Equipamentos Eletrônicos', 'Rádio comunicador', 'Coordenação de caça'),
  ('Flora', 'Equipamentos Eletrônicos', 'GPS', 'Marcação de áreas para exploração'),
  ('Fauna', 'Equipamentos Eletrônicos', 'Câmera de visão noturna', 'Caça ilegal'),
  ('Fauna/Flora', 'Equipamentos Eletrônicos', 'Drone', 'Rastreamento ilegal'),
  ('Garimpo', 'Garimpo', 'Detector de metais', 'Localização de minério'),
  ('Garimpo', 'Garimpo', 'Moto bomba', 'Lavagem ilegal'),
  ('Garimpo', 'Garimpo', 'Bateia', 'Extração manual'),
  ('Garimpo', 'Garimpo', 'Motores estacionários', 'Alimentação de bombas'),
  ('Garimpo', 'Garimpo', 'Mangotes ou mangueiras', 'Bombeamento'),
  ('Flora', 'Fogo e Coivara', 'Combustíveis', 'Incêndio intencional'),
  ('Flora', 'Fogo e Coivara', 'Isqueiros ou fósforos', 'Fogo criminoso'),
  ('Flora', 'Fogo e Coivara', 'Maçarico', 'Queima'),
  ('Fauna', 'Produtos do Crime', 'Animais vivos', 'Tráfico'),
  ('Fauna', 'Produtos do Crime', 'Carne de caça', 'Abate ilegal'),
  ('Fauna', 'Produtos do Crime', 'Ovos ou filhotes', 'Tráfico'),
  ('Flora', 'Produtos do Crime', 'Madeira serrada', 'Exploração ilegal'),
  ('Flora', 'Produtos do Crime', 'Toras', 'Crime florestal'),
  ('Flora', 'Produtos do Crime', 'Estacas ou moirões', 'Extração irregular'),
  ('Flora', 'Produtos do Crime', 'Carvão vegetal', 'Produção ilegal'),
  ('Flora/Fauna', 'Armazenamento ou Transporte', 'Sacos de ráfia', 'Transporte ilegal'),
  ('Fauna', 'Armazenamento ou Transporte', 'Gaiolas', 'Manutenção ilegal'),
  ('Fauna', 'Armazenamento ou Transporte', 'Caixas de madeira', 'Acondicionamento'),
  ('Flora', 'Documentação', 'DOF falsificado', 'Irregularidade documental'),
  ('Flora/Fauna', 'Documentação', 'Guias falsas', 'Irregularidade documental')
ON CONFLICT DO NOTHING;

-- Criar tabela fato de registros de crime
CREATE TABLE IF NOT EXISTS public.fat_registros_de_crime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Informações Gerais
  data date NOT NULL,
  regiao_administrativa_id uuid REFERENCES public.dim_regiao_administrativa(id),
  tipo_area_id uuid REFERENCES public.dim_tipo_de_area(id),
  area_protegida boolean DEFAULT false,
  areas_protegidas_ids uuid[] DEFAULT '{}',
  latitude text NOT NULL,
  longitude text NOT NULL,
  
  -- Classificação do Crime
  tipo_crime_id uuid,
  enquadramento_id uuid,
  ocorreu_apreensao boolean DEFAULT false,
  
  -- Campos específicos de Poluição
  tipo_poluicao text,
  descricao_poluicao text,
  material_visivel text,
  volume_aparente text,
  origem_aparente text,
  animal_afetado boolean,
  vegetacao_afetada boolean,
  alteracao_visual boolean,
  odor_forte boolean,
  mortandade_animais boolean,
  risco_imediato boolean,
  intensidade_percebida text,
  
  -- Campos específicos de Ordenamento Urbano
  tipo_intervencao text,
  estruturas_encontradas text,
  qtd_estruturas integer,
  dano_perceptivel text,
  maquinas_presentes boolean,
  material_apreendido_ord boolean,
  descricao_material_ord text,
  
  -- Campos específicos de Administração Ambiental
  tipo_impedimento text,
  descricao_adm_ambiental text,
  doc_irregular boolean,
  tipo_irregularidade_visual text,
  veiculo_relacionado boolean,
  material_apreendido_adm boolean,
  descricao_material_adm text,
  
  -- Conclusão
  desfecho_id uuid REFERENCES public.dim_desfecho(id),
  procedimento_legal text,
  qtd_detidos_maior integer DEFAULT 0,
  qtd_detidos_menor integer DEFAULT 0,
  qtd_liberados_maior integer DEFAULT 0,
  qtd_liberados_menor integer DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.fat_registros_de_crime ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_registros_de_crime" ON public.fat_registros_de_crime
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_registros_de_crime" ON public.fat_registros_de_crime
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_registros_de_crime" ON public.fat_registros_de_crime
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_registros_de_crime" ON public.fat_registros_de_crime
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Criar tabela de relacionamento para bens apreendidos
CREATE TABLE IF NOT EXISTS public.fat_ocorrencia_apreensao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ocorrencia uuid REFERENCES public.fat_registros_de_crime(id) ON DELETE CASCADE,
  id_item_apreendido uuid REFERENCES public.dim_itens_apreendidos(id),
  quantidade integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fat_ocorrencia_apreensao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Authenticated users can view fat_ocorrencia_apreensao" ON public.fat_ocorrencia_apreensao
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_ocorrencia_apreensao" ON public.fat_ocorrencia_apreensao
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_ocorrencia_apreensao" ON public.fat_ocorrencia_apreensao
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_ocorrencia_apreensao" ON public.fat_ocorrencia_apreensao
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Criar tabela de espécies de fauna apreendidas em crimes
CREATE TABLE IF NOT EXISTS public.fat_crime_fauna (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ocorrencia uuid REFERENCES public.fat_registros_de_crime(id) ON DELETE CASCADE,
  especie_id uuid REFERENCES public.dim_especies_fauna(id),
  estado_saude_id uuid REFERENCES public.dim_estado_saude(id),
  atropelamento boolean DEFAULT false,
  estagio_vida_id uuid REFERENCES public.dim_estagio_vida(id),
  quantidade_adulto integer DEFAULT 0,
  quantidade_filhote integer DEFAULT 0,
  quantidade_total integer DEFAULT 0,
  destinacao_id uuid REFERENCES public.dim_destinacao(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fat_crime_fauna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fat_crime_fauna" ON public.fat_crime_fauna
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_crime_fauna" ON public.fat_crime_fauna
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_crime_fauna" ON public.fat_crime_fauna
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fat_crime_fauna" ON public.fat_crime_fauna
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Criar tabela de espécies de flora apreendidas em crimes
CREATE TABLE IF NOT EXISTS public.fat_crime_flora (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ocorrencia uuid REFERENCES public.fat_registros_de_crime(id) ON DELETE CASCADE,
  especie_id uuid REFERENCES public.dim_especies_flora(id),
  condicao text,
  quantidade integer DEFAULT 0,
  destinacao text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fat_crime_flora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view fat_crime_flora" ON public.fat_crime_flora
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert fat_crime_flora" ON public.fat_crime_flora
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fat_crime_flora" ON public.fat_crime_flora
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);