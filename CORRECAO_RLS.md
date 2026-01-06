# Correção de Erro RLS - fat_registros_de_resgate

## Erro Encontrado

```
Erro ao salvar registro: new row violates row-level security policy for table "fat_registros_de_resgate"
```

## Causa

As políticas de Row Level Security (RLS) não estão permitindo inserções na tabela `fat_registros_de_resgate` para usuários autenticados.

## Solução

Foi criada uma migration de correção: `20260105140000_corrigir_politicas_rls_fat_registros_de_resgate.sql`

### Passos para Aplicar a Correção:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Navegue até SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Ou acesse diretamente: https://supabase.com/dashboard/project/[seu-projeto-id]/sql

3. **Execute a Migration de Correção**

   Copie e cole o conteúdo do arquivo `supabase/migrations/20260105140000_corrigir_politicas_rls_fat_registros_de_resgate.sql` e execute.

   Ou execute diretamente este SQL:

   ```sql
   -- Remover políticas antigas se existirem
   DROP POLICY IF EXISTS "Authenticated users can insert fat_registros_de_resgate" 
   ON public.fat_registros_de_resgate;
   
   DROP POLICY IF EXISTS "Authenticated users can view fat_registros_de_resgate" 
   ON public.fat_registros_de_resgate;
   
   DROP POLICY IF EXISTS "Authenticated users can update fat_registros_de_resgate" 
   ON public.fat_registros_de_resgate;
   
   DROP POLICY IF EXISTS "Authenticated users can delete fat_registros_de_resgate" 
   ON public.fat_registros_de_resgate;
   
   -- Garantir que RLS está habilitado
   ALTER TABLE public.fat_registros_de_resgate ENABLE ROW LEVEL SECURITY;
   
   -- Criar políticas corretas
   CREATE POLICY "Authenticated users can view fat_registros_de_resgate"
   ON public.fat_registros_de_resgate
   FOR SELECT
   TO authenticated
   USING (auth.uid() IS NOT NULL);
   
   CREATE POLICY "Authenticated users can insert fat_registros_de_resgate"
   ON public.fat_registros_de_resgate
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() IS NOT NULL);
   
   CREATE POLICY "Authenticated users can update fat_registros_de_resgate"
   ON public.fat_registros_de_resgate
   FOR UPDATE
   TO authenticated
   USING (auth.uid() IS NOT NULL)
   WITH CHECK (auth.uid() IS NOT NULL);
   
   CREATE POLICY "Authenticated users can delete fat_registros_de_resgate"
   ON public.fat_registros_de_resgate
   FOR DELETE
   TO authenticated
   USING (auth.uid() IS NOT NULL);
   ```

4. **Verificar se Funcionou**
   - Tente salvar um registro novamente
   - O erro não deve mais aparecer

## Alternativa: Aplicar via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
supabase db push
```

Isso aplicará todas as migrations pendentes, incluindo a correção.

## Verificação

Após aplicar a correção, você pode verificar se as políticas foram criadas:

```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'fat_registros_de_resgate';
```

Deve retornar 4 políticas (SELECT, INSERT, UPDATE, DELETE).

## Nota Importante

Certifique-se de que você está **autenticado** no aplicativo antes de tentar salvar registros. As políticas RLS exigem que o usuário esteja autenticado (`auth.uid() IS NOT NULL`).
