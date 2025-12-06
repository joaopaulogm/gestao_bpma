-- Renomear coluna Aplicacao para Tipo_de_Crime
ALTER TABLE public.dim_itens_apreensao 
RENAME COLUMN "Aplicacao" TO "Tipo de Crime";

-- Renomear coluna Categoria para Bem Apreendido  
ALTER TABLE public.dim_itens_apreensao 
RENAME COLUMN "Categoria" TO "Bem Apreendido";