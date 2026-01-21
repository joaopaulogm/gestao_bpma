-- Corrigir caracteres corrompidos em post_grad (º -> º)
UPDATE public.usuarios_por_login
SET post_grad = REPLACE(post_grad, '�', 'º')
WHERE post_grad LIKE '%�%';

-- Corrigir também em dim_efetivo se necessário
UPDATE public.dim_efetivo
SET posto_graduacao = REPLACE(posto_graduacao, '�', 'º')
WHERE posto_graduacao LIKE '%�%';

-- Corrigir nome_guerra e nome com caracteres corrompidos comuns
UPDATE public.usuarios_por_login
SET 
  nome = REPLACE(REPLACE(REPLACE(REPLACE(nome, '�', 'Ã'), 'ã', 'ã'), 'ç', 'ç'), 'é', 'é'),
  nome_guerra = REPLACE(REPLACE(REPLACE(REPLACE(nome_guerra, '�', 'Ã'), 'ã', 'ã'), 'ç', 'ç'), 'é', 'é')
WHERE nome LIKE '%�%' OR nome_guerra LIKE '%�%';