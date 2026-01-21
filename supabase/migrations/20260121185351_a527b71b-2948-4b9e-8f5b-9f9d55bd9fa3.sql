-- Adicionar coluna ativo em usuarios_por_login (se não existir)
ALTER TABLE public.usuarios_por_login ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Sincronizar dados faltantes de usuarios_permitidos para usuarios_por_login
INSERT INTO public.usuarios_por_login (
  id, nome, email, matricula, nome_guerra, post_grad, quadro, sexo, contato, 
  data_nascimento, cpf, login, senha, lotacao
)
SELECT 
  up.id,
  up."Nome" as nome,
  up."Email 1" as email,
  up."Matrícula" as matricula,
  up."Nome Guerra" as nome_guerra,
  up."Post_Grad" as post_grad,
  up."Quadro" as quadro,
  up."Sexo" as sexo,
  up."Telefone 1" as contato,
  up."Data Nascimento"::date as data_nascimento,
  up."CPF"::bigint as cpf,
  LOWER(
    regexp_replace(SPLIT_PART(up."Nome", ' ', 1), '[^a-zA-Z]', '', 'g') || '.' || 
    regexp_replace(SPLIT_PART(up."Nome", ' ', array_length(string_to_array(up."Nome", ' '), 1)), '[^a-zA-Z]', '', 'g')
  ) as login,
  up."CPF"::bigint as senha,
  up."Lotação" as lotacao
FROM public.usuarios_permitidos up
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios_por_login upl WHERE upl.id = up.id
);

-- Atualizar dados existentes com informações de usuarios_permitidos (preenchendo NULLs)
UPDATE public.usuarios_por_login upl
SET 
  nome = COALESCE(upl.nome, up."Nome"),
  email = COALESCE(upl.email, up."Email 1"),
  matricula = COALESCE(upl.matricula, up."Matrícula"),
  nome_guerra = COALESCE(upl.nome_guerra, up."Nome Guerra"),
  post_grad = COALESCE(upl.post_grad, up."Post_Grad"),
  quadro = COALESCE(upl.quadro, up."Quadro"),
  sexo = COALESCE(upl.sexo, up."Sexo"),
  contato = COALESCE(upl.contato, up."Telefone 1"),
  data_nascimento = COALESCE(upl.data_nascimento, up."Data Nascimento"::date),
  cpf = COALESCE(upl.cpf, up."CPF"::bigint),
  senha = COALESCE(upl.senha, up."CPF"::bigint),
  lotacao = COALESCE(upl.lotacao, up."Lotação"),
  ativo = true
FROM public.usuarios_permitidos up
WHERE upl.id = up.id;