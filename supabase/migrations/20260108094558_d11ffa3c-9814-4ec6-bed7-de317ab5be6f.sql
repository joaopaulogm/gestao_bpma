
-- Alterar coluna matricula para text (pois existem matrículas com letras como "0021759X")
ALTER TABLE public.usuarios_por_login ALTER COLUMN matricula TYPE text USING matricula::text;

-- 1. Corrigir caracteres corrompidos em usuarios_permitidos
UPDATE public.usuarios_permitidos SET "Nome" = 'EMERSON ROBERTO ARAÚJO MELÃO' WHERE id = '3b0a1632-320e-4206-b3e0-458180d5e5d9';

UPDATE public.usuarios_permitidos SET "Post_Grad" = '1º TEN' WHERE "Post_Grad" LIKE '%1%TEN%';
UPDATE public.usuarios_permitidos SET "Post_Grad" = '2º TEN' WHERE "Post_Grad" LIKE '%2%TEN%';

-- 2. Atualizar usuarios_por_login com dados de usuarios_permitidos
UPDATE public.usuarios_por_login upl
SET 
  nome = up."Nome",
  cpf = up."CPF"::bigint,
  email = up."Email 1",
  matricula = up."Matrícula",
  nome_guerra = up."Nome Guerra",
  post_grad = up."Post_Grad",
  quadro = up."Quadro",
  sexo = up."Sexo",
  contato = up."Telefone 1",
  data_nascimento = up."Data Nascimento"::date
FROM public.usuarios_permitidos up
WHERE upl.id = up.id;
