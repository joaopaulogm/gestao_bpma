# Como Aplicar as Correções de Segurança no Supabase

## ⚠️ IMPORTANTE: Aplicar Migration no Supabase

As correções de código já foram commitadas, mas **você precisa aplicar a migration no banco de dados** para que as correções tenham efeito.

## Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `oiwwptnqaunsyhpkwbrz` (ou o nome do seu projeto)

### 2. Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Ou acesse diretamente: https://supabase.com/dashboard/project/[seu-projeto-id]/sql

### 3. Executar a Migration

1. Clique em **"New query"** (Nova consulta)
2. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20260105150000_corrigir_vulnerabilidades_seguranca.sql
   ```
3. Clique em **"Run"** (Executar) ou pressione `Ctrl+Enter`

### 4. Verificar se Funcionou

Após executar, você deve ver uma mensagem de sucesso. Para verificar se as políticas foram criadas:

```sql
-- Verificar políticas de dim_efetivo
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'dim_efetivo';

-- Verificar políticas de fat_licencas_medicas
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'fat_licencas_medicas';
```

Deve retornar políticas com nomes como:
- "Authenticated users can view dim_efetivo"
- "Authenticated users can view fat_licencas_medicas"

## Alternativa: Usar Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Aplicar todas as migrations pendentes
supabase db push

# Ou aplicar uma migration específica
supabase migration up 20260105150000_corrigir_vulnerabilidades_seguranca
```

## O que a Migration Faz

1. ✅ Remove políticas públicas permissivas de `dim_efetivo`
2. ✅ Remove políticas públicas permissivas de `fat_licencas_medicas`
3. ✅ Remove políticas públicas permissivas de `fat_ferias` e `fat_restricoes`
4. ✅ Cria políticas restritivas apenas para usuários autenticados
5. ✅ Corrige funções SECURITY DEFINER com `SET search_path = public`
6. ✅ Verifica tabelas com RLS sem políticas

## Verificação Final

Após aplicar a migration, execute um novo scan de segurança no Lovable. Os erros críticos devem estar resolvidos:

- ❌ ~~Employee Personal Data Could Be Stolen by Anyone~~ → ✅ CORRIGIDO
- ❌ ~~Employee Medical Records Could Be Accessed by HR Staff~~ → ✅ CORRIGIDO
- ❌ ~~Staging Table Allows Anyone to Insert User Data~~ → ✅ VERIFICADO (não existe)

## Problemas Comuns

### Erro: "policy already exists"
- **Solução**: A migration verifica se as políticas existem antes de criar. Se der erro, pode ser que já existam políticas com nomes diferentes. Execute:
  ```sql
  DROP POLICY IF EXISTS "Anyone can view dim_efetivo" ON public.dim_efetivo;
  ```
  E depois execute a migration novamente.

### Erro: "permission denied"
- **Solução**: Certifique-se de estar usando uma conta com permissões de administrador no Supabase.

## Próximos Passos (Opcionais)

1. **Habilitar Leaked Password Protection**:
   - Supabase Dashboard → Authentication → Settings
   - Habilitar "Leaked Password Protection"

2. **Atualizar React** (se quiser corrigir o warning):
   ```bash
   npm update react react-dom
   ```

3. **Verificar Buckets de Storage**:
   - Supabase Dashboard → Storage
   - Verificar políticas de acesso de cada bucket
