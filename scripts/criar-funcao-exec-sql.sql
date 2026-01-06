-- Função helper para executar SQL dinamicamente
-- Execute este arquivo PRIMEIRO no Supabase Dashboard SQL Editor
-- Isso permitirá que o script TypeScript execute as migrations automaticamente

CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Dar permissão para service_role executar
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

