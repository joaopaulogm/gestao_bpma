-- Criar tabela dim_itens_apreensao
CREATE TABLE IF NOT EXISTS public.dim_itens_apreensao (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  "Categoria" text NOT NULL,
  "Item" text NOT NULL,
  "Uso Ilicito" text NOT NULL,
  "Aplicacao" text NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.dim_itens_apreensao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view dim_itens_apreensao" 
ON public.dim_itens_apreensao 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage dim_itens_apreensao" 
ON public.dim_itens_apreensao 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Inserir dados do Excel
INSERT INTO public.dim_itens_apreensao ("Categoria", "Item", "Uso Ilicito", "Aplicacao") VALUES
('Armas de Fogo', 'Espingarda calibre 12 20 36', 'Caça ilegal', 'Crime Contra a Fauna'),
('Armas de Fogo', 'Carabina .22', 'Caça de pequeno porte', 'Crime Contra a Fauna'),
('Armas de Fogo', 'Rifle de repetição', 'Caça de médio porte', 'Crime Contra a Fauna'),
('Armas de Fogo', 'Arma artesanal soca por fora', 'Abate clandestino', 'Crime Contra a Fauna'),
('Armas de Fogo', 'Pistola ou revólver', 'Coação ou uso em crimes conexos', 'Crimes contra a administração ambiental'),
('Munições e Acessórios', 'Munição calibre 12', 'Abate de animais', 'Crime Contra a Fauna'),
('Munições e Acessórios', 'Munição diversos calibres', 'Caça ilegal', 'Crime Contra a Fauna'),
('Munições e Acessórios', 'Espoletas pólvora e chumbo', 'Recarga de munição', 'Crime Contra a Fauna'),
('Munições e Acessórios', 'Cartucheira', 'Suporte à caça', 'Crime Contra a Fauna'),
('Armas Brancas', 'Facão', 'Abate vegetal ou animal', 'Crime Contra a Flora'),
('Armas Brancas', 'Faca de caça', 'Carnear animal', 'Crime Contra a Fauna'),
('Armas Brancas', 'Machado', 'Derrubada de árvores', 'Crime Contra a Flora'),
('Armas Brancas', 'Podão', 'Corte de galhos protegidos', 'Crime Contra a Flora'),
('Armas Brancas', 'Foice', 'Desmate', 'Crime Contra a Flora'),
('Ferramentas de Extração Vegetal', 'Motosserra', 'Corte de árvores', 'Crime Contra a Flora'),
('Ferramentas de Extração Vegetal', 'Motopoda', 'Corte de copa e galhos', 'Crime Contra a Flora'),
('Ferramentas de Extração Vegetal', 'Serrote ou Serra sabre', 'Corte de lenha', 'Crime Contra a Flora'),
('Ferramentas de Extração Vegetal', 'Serra circular portátil', 'Beneficiamento clandestino', 'Crime Contra a Flora'),
('Ferramentas de Extração Vegetal', 'Pé de cabra ou Alavanca', 'Remoção de toras', 'Crime Contra a Flora'),
('Maquinário Pesado', 'Trator agrícola', 'Abertura de área', 'Crime Contra a Flora'),
('Maquinário Pesado', 'Trator de esteira', 'Supressão de vegetação', 'Crime Contra a Flora'),
('Maquinário Pesado', 'Pá carregadeira', 'Carregamento de toras', 'Crime Contra a Flora'),
('Maquinário Pesado', 'Escavadeira hidráulica', 'Desmatamento ou terraplanagem', 'Crime Contra a Flora'),
('Maquinário Pesado', 'Caminhão madeireiro', 'Transporte irregular de madeira', 'Crime Contra a Flora'),
('Veículos', 'Automóvel', 'Transporte irregular', 'Crimes contra a administração ambiental'),
('Veículos', 'Motocicleta', 'Acesso a trilhas para caça', 'Crime Contra a Fauna'),
('Veículos', 'Caminhonete', 'Transporte de toras ou carvão', 'Crime Contra a Flora'),
('Veículos', 'Quadriciclo', 'Patrulha clandestina de caça', 'Crime Contra a Fauna'),
('Veículos', 'Embarcação', 'Pesca ilegal', 'Crime Contra a Fauna'),
('Petrechos de Caça', 'Armadilha arapuca', 'Captura de aves', 'Crime Contra a Fauna'),
('Petrechos de Caça', 'Armadilha coioteira', 'Captura de mamíferos', 'Crime Contra a Fauna'),
('Petrechos de Caça', 'Laço de aço', 'Captura', 'Crime Contra a Fauna'),
('Petrechos de Caça', 'Espinhel terrestre', 'Captura de carnívoros', 'Crime Contra a Fauna'),
('Petrechos de Caça', 'Redes de captura', 'Captura ilegal', 'Crime Contra a Fauna'),
('Petrechos de Pesca', 'Rede de emalhar', 'Pesca predatória', 'Crime Contra a Fauna'),
('Petrechos de Pesca', 'Tarrafa', 'Coleta ilegal', 'Crime Contra a Fauna'),
('Petrechos de Pesca', 'Espinhel', 'Pesca irregular', 'Crime Contra a Fauna'),
('Petrechos de Pesca', 'Anzol de galho', 'Captura proibida', 'Crime Contra a Fauna'),
('Petrechos de Pesca', 'Covo ou Cacuri', 'Captura ilegal', 'Crime Contra a Fauna'),
('Iluminação ou Atração', 'Lanternas potentes', 'Localização noturna de animais', 'Crime Contra a Fauna'),
('Iluminação ou Atração', 'Faróis de longo alcance', 'Caça noturna', 'Crime Contra a Fauna'),
('Iluminação ou Atração', 'Holofotes', 'Atração de fauna', 'Crime Contra a Fauna'),
('Equipamentos Eletrônicos', 'Rádio comunicador', 'Coordenação de caça', 'Crime Contra a Fauna'),
('Equipamentos Eletrônicos', 'GPS', 'Marcação de áreas para exploração', 'Crime Contra a Flora'),
('Equipamentos Eletrônicos', 'Câmera de visão noturna', 'Caça ilegal', 'Crime Contra a Fauna'),
('Equipamentos Eletrônicos', 'Drone', 'Rastreamento ilegal', 'Crimes contra a administração ambiental'),
('Garimpo', 'Detector de metais', 'Localização de minério', 'Crimes de poluição e outros crimes ambientais'),
('Garimpo', 'Moto bomba', 'Lavagem ilegal', 'Crimes de poluição e outros crimes ambientais'),
('Garimpo', 'Bateia', 'Extração manual', 'Crimes de poluição e outros crimes ambientais'),
('Garimpo', 'Motores estacionários', 'Alimentação de bombas', 'Crimes de poluição e outros crimes ambientais'),
('Garimpo', 'Mangotes ou mangueiras', 'Bombeamento', 'Crimes de poluição e outros crimes ambientais'),
('Fogo e Coivara', 'Combustíveis', 'Incêndio intencional', 'Crimes de poluição e outros crimes ambientais'),
('Fogo e Coivara', 'Isqueiros ou fósforos', 'Fogo criminoso', 'Crimes de poluição e outros crimes ambientais'),
('Fogo e Coivara', 'Maçarico', 'Queima', 'Crimes de poluição e outros crimes ambientais'),
('Produtos do Crime', 'Animais vivos', 'Tráfico', 'Crime Contra a Fauna'),
('Produtos do Crime', 'Carne de caça', 'Abate ilegal', 'Crime Contra a Fauna'),
('Produtos do Crime', 'Ovos ou filhotes', 'Tráfico', 'Crime Contra a Fauna'),
('Produtos do Crime', 'Madeira serrada', 'Exploração ilegal', 'Crime Contra a Flora'),
('Produtos do Crime', 'Toras', 'Crime florestal', 'Crime Contra a Flora'),
('Produtos do Crime', 'Estacas ou moirões', 'Extração irregular', 'Crime Contra a Flora'),
('Produtos do Crime', 'Carvão vegetal', 'Produção ilegal', 'Crime Contra a Flora'),
('Armazenamento ou Transporte', 'Sacos de ráfia', 'Transporte ilegal', 'Crimes contra a administração ambiental'),
('Armazenamento ou Transporte', 'Gaiolas', 'Manutenção ilegal', 'Crime Contra a Fauna'),
('Armazenamento ou Transporte', 'Caixas de madeira', 'Acondicionamento', 'Crime Contra a Fauna'),
('Documentação', 'DOF falsificado', 'Irregularidade documental', 'Crimes contra a administração ambiental'),
('Documentação', 'Guias falsas', 'Irregularidade documental', 'Crimes contra a administração ambiental');

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS public.dim_itens_apreendidos;