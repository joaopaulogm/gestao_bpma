-- =============================================================
-- Copiar para dim_efetivo as colunas e as LINHAS de dados de
-- usuarios_permitidos, usuarios_por_login e user_roles.
-- Referência: matrícula (normalizada: só números).
-- dim_efetivo já tem: id, antiguidade, posto_graduacao, quadro, quadro_sigla,
-- nome_guerra, nome, matricula, sexo, lotacao, created_at, ativo.
-- =============================================================

-- 1) Adicionar colunas novas em dim_efetivo (ignorar as que já existem)

ALTER TABLE public.dim_efetivo
  ADD COLUMN IF NOT EXISTS cpf bigint,
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS data_inclusao date,
  ADD COLUMN IF NOT EXISTS idade integer,
  ADD COLUMN IF NOT EXISTS contato text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS telefone_2 text,
  ADD COLUMN IF NOT EXISTS email_2 text,
  ADD COLUMN IF NOT EXISTS porte_arma text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS logradouro text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS uf text,
  ADD COLUMN IF NOT EXISTS equipe text,
  ADD COLUMN IF NOT EXISTS escala text,
  ADD COLUMN IF NOT EXISTS grupamento text;

-- 2) Inserir LINHAS em dim_efetivo a partir de usuarios_permitidos (matrícula que ainda não existe)
INSERT INTO public.dim_efetivo (
  matricula, nome, nome_guerra, posto_graduacao, quadro, quadro_sigla, sexo, lotacao,
  cpf, data_nascimento, email, email_2, telefone, telefone_2
)
SELECT DISTINCT ON (regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g'))
  trim(up."Matrícula"),
  COALESCE(trim(up."Nome"), ''),
  COALESCE(trim(up."Nome Guerra"), trim(up."Nome"), ''),
  COALESCE(trim(up."Post_Grad"), ''),
  COALESCE(trim(up."Quadro"), ''),
  COALESCE(LEFT(trim(up."Quadro"), 2), ''),
  COALESCE(trim(up."Sexo"), ''),
  COALESCE(trim(up."Lotação"), 'BPMA'),
  up."CPF",
  (up."Data Nascimento")::date,
  up."Email 1",
  up."Email 2",
  up."Telefone 1",
  up."Telefone 2"
FROM public.usuarios_permitidos up
WHERE trim(COALESCE(up."Matrícula", '')) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.dim_efetivo de
    WHERE regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g')
        = regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g')
  )
ORDER BY regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g'), up.id;

-- 3) Inserir LINHAS em dim_efetivo a partir de usuarios_por_login (matrícula que ainda não existe)
INSERT INTO public.dim_efetivo (
  matricula, nome, nome_guerra, posto_graduacao, quadro, quadro_sigla, sexo, lotacao,
  cpf, data_nascimento, data_inclusao, idade, contato, email, porte_arma
)
SELECT DISTINCT ON (regexp_replace(COALESCE(trim(upl.matricula), ''), '[^0-9]', '', 'g'))
  trim(upl.matricula),
  COALESCE(trim(upl.nome), ''),
  COALESCE(trim(upl.nome_guerra), trim(upl.nome), ''),
  COALESCE(trim(upl.post_grad), ''),
  COALESCE(trim(upl.quadro), ''),
  COALESCE(LEFT(trim(upl.quadro), 2), ''),
  COALESCE(trim(upl.sexo), ''),
  COALESCE(trim(upl.lotacao), 'BPMA'),
  upl.cpf,
  (upl.data_nascimento)::date,
  (upl.data_inclusao)::date,
  upl.idade::integer,
  upl.contato,
  upl.email,
  upl.porte_arma
FROM public.usuarios_por_login upl
WHERE trim(COALESCE(upl.matricula, '')) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.dim_efetivo de
    WHERE regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g')
        = regexp_replace(COALESCE(trim(upl.matricula), ''), '[^0-9]', '', 'g')
  )
ORDER BY regexp_replace(COALESCE(trim(upl.matricula), ''), '[^0-9]', '', 'g'), upl.id;

-- 4) Inserir LINHAS em dim_efetivo a partir de user_roles (matrícula que ainda não existe)
INSERT INTO public.dim_efetivo (
  matricula, nome, nome_guerra, posto_graduacao, quadro, quadro_sigla, sexo, lotacao,
  cpf, data_nascimento, data_inclusao, idade, contato, email, telefone, porte_arma,
  bairro, cep, cidade, complemento, logradouro, numero, uf, equipe, escala, grupamento
)
SELECT DISTINCT ON (regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g'))
  trim(ur.matricula),
  COALESCE(trim(ur.nome), ''),
  COALESCE(trim(ur.nome_guerra), trim(ur.nome), ''),
  COALESCE(trim(ur.post_grad), ''),
  COALESCE(trim(ur.quadro), ''),
  COALESCE(LEFT(trim(ur.quadro), 2), ''),
  COALESCE(trim(ur.sexo), ''),
  COALESCE(trim(ur.lotacao), 'BPMA'),
  ur.cpf,
  (ur.data_nascimento)::date,
  (ur.data_inclusao)::date,
  ur.idade,
  ur.contato,
  ur.email,
  ur.telefone,
  ur.porte_arma,
  ur.bairro,
  ur.cep,
  ur.cidade,
  ur.complemento,
  ur.logradouro,
  ur.numero,
  ur.uf,
  ur.equipe,
  ur.escala,
  ur.grupamento
FROM public.user_roles ur
WHERE trim(COALESCE(ur.matricula, '')) <> ''
  AND ur.efetivo_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.dim_efetivo de
    WHERE regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g')
        = regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g')
  )
ORDER BY regexp_replace(COALESCE(trim(ur.matricula), ''), '[^0-9]', '', 'g'), ur.id;

-- 5) Preencher colunas em dim_efetivo a partir de usuarios_permitidos (match por matrícula normalizada)

UPDATE public.dim_efetivo de
SET
  cpf = COALESCE(de.cpf, up."CPF"),
  data_nascimento = COALESCE(de.data_nascimento, (up."Data Nascimento")::date),
  email = COALESCE(de.email, up."Email 1"),
  email_2 = COALESCE(de.email_2, up."Email 2"),
  telefone = COALESCE(de.telefone, up."Telefone 1"),
  telefone_2 = COALESCE(de.telefone_2, up."Telefone 2")
FROM public.usuarios_permitidos up
WHERE regexp_replace(COALESCE(trim(de.matricula), ''), '[^0-9]', '', 'g')
    = regexp_replace(COALESCE(trim(up."Matrícula"), ''), '[^0-9]', '', 'g');

-- 6) Preencher dim_efetivo a partir de usuarios_por_login (match por efetivo_id)

UPDATE public.dim_efetivo de
SET
  cpf = COALESCE(de.cpf, upl.cpf),
  data_nascimento = COALESCE(de.data_nascimento, (upl.data_nascimento)::date),
  data_inclusao = COALESCE(de.data_inclusao, (upl.data_inclusao)::date),
  idade = COALESCE(de.idade, upl.idade::integer),
  contato = COALESCE(de.contato, upl.contato),
  email = COALESCE(de.email, upl.email),
  porte_arma = COALESCE(de.porte_arma, upl.porte_arma)
FROM public.usuarios_por_login upl
WHERE upl.efetivo_id = de.id;

-- 7) Preencher dim_efetivo a partir de user_roles (match por efetivo_id)

UPDATE public.dim_efetivo de
SET
  cpf = COALESCE(de.cpf, ur.cpf),
  data_nascimento = COALESCE(de.data_nascimento, (ur.data_nascimento)::date),
  data_inclusao = COALESCE(de.data_inclusao, (ur.data_inclusao)::date),
  idade = COALESCE(de.idade, ur.idade),
  contato = COALESCE(de.contato, ur.contato),
  email = COALESCE(de.email, ur.email),
  telefone = COALESCE(de.telefone, ur.telefone),
  porte_arma = COALESCE(de.porte_arma, ur.porte_arma),
  bairro = COALESCE(de.bairro, ur.bairro),
  cep = COALESCE(de.cep, ur.cep),
  cidade = COALESCE(de.cidade, ur.cidade),
  complemento = COALESCE(de.complemento, ur.complemento),
  logradouro = COALESCE(de.logradouro, ur.logradouro),
  numero = COALESCE(de.numero, ur.numero),
  uf = COALESCE(de.uf, ur.uf),
  equipe = COALESCE(de.equipe, ur.equipe),
  escala = COALESCE(de.escala, ur.escala),
  grupamento = COALESCE(de.grupamento, ur.grupamento)
FROM public.user_roles ur
WHERE ur.efetivo_id = de.id;

COMMENT ON COLUMN public.dim_efetivo.cpf IS 'CPF (origem: usuarios_permitidos, usuarios_por_login, user_roles)';
COMMENT ON COLUMN public.dim_efetivo.email IS 'E-mail principal (origem: usuarios_permitidos, usuarios_por_login, user_roles)';
COMMENT ON COLUMN public.dim_efetivo.telefone IS 'Telefone principal (origem: usuarios_permitidos, user_roles)';
