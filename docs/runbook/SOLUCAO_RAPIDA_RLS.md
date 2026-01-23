# Solução Rápida para Erro RLS - fat_registros_de_resgate

## ⚠️ ERRO ATUAL

```
Erro ao salvar registro: new row violates row-level security policy for table "fat_registros_de_resgate"
```

## 🔧 SOLUÇÃO IMEDIATA

Execute este SQL no Supabase Dashboard → SQL Editor:

```sql
-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Anyone can view fat_registros_de_resgate" ON public.fat_registros_de_resgate;
DROP POLICY IF EXISTS "Anyone can insert fat_registros_de_resgate" ON public.fat_registros_de_resgate;

-- Garantir que RLS está habilitado
ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;

-- Criar políticas SIMPLES que permitem tudo para autenticados
CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
ON public.fat_registros_de_resgate
FOR DELETE
TO authenticated
USING (true);
```

## ✅ Verificar se Funcionou

Após executar, teste novamente salvar um registro. Se ainda der erro, execute:

```sql
-- Verificar se as políticas foram criadas
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'fat_registros_de_resgate';
```

Deve retornar 4 políticas (SELECT, INSERT, UPDATE, DELETE).

## 🔍 Verificar Autenticação

Se o erro persistir, verifique se o usuário está autenticado:

1. No console do navegador (F12), execute:
   ```javascript
   // Verificar se há sessão ativa
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Sessão:', session);
   ```

2. Se não houver sessão, faça login novamente no aplicativo.

## 📝 Nota Importante

A diferença entre a migration anterior e esta é:
- **Anterior**: `WITH CHECK (auth.uid() IS NOT NULL)` - verifica se há uid
- **Nova**: `WITH CHECK (true)` - permite qualquer inserção de usuário autenticado

A nova abordagem é mais permissiva mas garante que funcione.
