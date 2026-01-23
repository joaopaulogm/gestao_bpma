-- =====================================================
-- MIGRATION: Criar função normalize_text
-- =====================================================

-- 1. Habilitar extensão unaccent (se não existir)
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;

-- 2. Função normalize_text para padronizar comparações de nomes
CREATE OR REPLACE FUNCTION public.normalize_text(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    regexp_replace(
      regexp_replace(
        upper(
          trim(
            public.unaccent(coalesce(input_text, ''))
          )
        ),
        '[^A-Z0-9 ]', '', 'g'
      ),
      '\s+', ' ', 'g'
    );
$$;