-- Script de verificação da migration RLS Seção Pessoas
-- Execute este script no SQL Editor do Supabase para verificar se tudo foi aplicado corretamente

-- 1. Verificar se a função is_admin existe
SELECT 
  'Função is_admin' as verificação,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin' 
      AND pronamespace = 'public'::regnamespace
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status;

-- 2. Verificar colunas geradas
SELECT 
  'Coluna data_fim_norm em fat_restricoes' as verificação,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'fat_restricoes' 
      AND column_name = 'data_fim_norm'
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status
UNION ALL
SELECT 
  'Coluna data_fim_norm em fat_licencas_medicas' as verificação,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'fat_licencas_medicas' 
      AND column_name = 'data_fim_norm'
    ) THEN '✅ Existe'
    ELSE '❌ Não encontrada'
  END as status;

-- 3. Verificar índices únicos
SELECT 
  'Índices únicos' as verificação,
  COUNT(*) || ' índices encontrados' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_fat_abono_unique',
  'idx_fat_equipe_membros_unique',
  'idx_fat_campanha_membros_unique',
  'idx_fat_restricoes_unique',
  'idx_fat_licencas_medicas_unique'
);

-- 4. Verificar RLS habilitado
SELECT 
  tablename as tabela,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Desabilitado'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'fat_abono', 
  'fat_ferias', 
  'fat_restricoes', 
  'fat_licencas_medicas', 
  'dim_equipes', 
  'fat_equipe_membros',
  'dim_equipes_campanha',
  'fat_campanha_config',
  'fat_campanha_membros',
  'fat_campanha_alteracoes'
)
ORDER BY tablename;

-- 5. Verificar policies SELECT
SELECT 
  schemaname || '.' || tablename as tabela,
  policyname as policy,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ SELECT Policy'
    WHEN cmd = 'ALL' THEN '✅ WRITE Policy'
    ELSE '⚠️ ' || cmd
  END as tipo
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'fat_abono', 
  'fat_ferias', 
  'fat_restricoes', 
  'fat_licencas_medicas', 
  'dim_equipes', 
  'fat_equipe_membros',
  'dim_equipes_campanha',
  'fat_campanha_config',
  'fat_campanha_membros',
  'fat_campanha_alteracoes',
  'user_roles'
)
ORDER BY tablename, policyname;

-- 6. Testar função is_admin (execute como usuário autenticado)
-- Descomente e execute com um usuário logado:
-- SELECT public.is_admin() as sou_admin;

-- 7. Verificar estrutura completa
SELECT 
  'RESUMO' as verificação,
  'Verifique os resultados acima' as status;
