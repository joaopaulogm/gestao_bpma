
-- Inserir dados de usuarios_permitidos em usuarios_por_login
-- login = primeiro_nome.ultimo_nome (minúsculo)
-- senha = CPF
-- nivel de acesso padrão = Operador (não existe coluna, usamos lotação como referência)

INSERT INTO public.usuarios_por_login (id, nome, login, senha, lotacao, data_inclusao)
SELECT 
  id,
  "Nome" as nome,
  LOWER(
    regexp_replace(SPLIT_PART("Nome", ' ', 1), '[^a-zA-Z]', '', 'g') || '.' || 
    regexp_replace(SPLIT_PART("Nome", ' ', array_length(string_to_array("Nome", ' '), 1)), '[^a-zA-Z]', '', 'g')
  ) as login,
  "CPF"::bigint as senha,
  'BPMA' as lotacao,
  criado_em::date as data_inclusao
FROM public.usuarios_permitidos
ON CONFLICT (id) DO NOTHING;
