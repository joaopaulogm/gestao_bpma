-- Reset senha do usuário 7329539 para permitir primeiro acesso novamente
UPDATE public.user_roles 
SET senha = NULL 
WHERE id = '38f11286-55af-463a-955a-df37958c5396';