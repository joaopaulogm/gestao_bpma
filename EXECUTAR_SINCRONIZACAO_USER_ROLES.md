# 🚀 Executar Sincronização de user_roles

## ⚡ Método Recomendado: Supabase Dashboard

### Passo 1: Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**

### Passo 2: Executar a Migration

1. Abra o arquivo: `supabase/migrations/20260125000005_forcar_sincronizacao_completa_user_roles.sql`
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. No SQL Editor do Supabase, **cole o conteúdo** (Ctrl+V)
4. Clique no botão **Run** (ou pressione Ctrl+Enter)
5. Aguarde a execução (pode levar alguns segundos)
6. Verifique se apareceu: ✅ "Success" ou mensagens de NOTICE

### Passo 3: Verificar Resultados

Após executar, execute estas queries para ver os resultados:

```sql
-- Ver relatório completo da sincronização
SELECT * FROM public.forcar_sincronizacao_user_roles();
```

Isso retornará:
- `usuarios_processados`: Total de usuários processados
- `roles_criados`: Quantos roles foram criados
- `roles_atualizados`: Quantos roles foram atualizados
- `usuarios_sem_auth_user_id`: Quantos não têm auth_user_id
- `usuarios_sem_efetivo_id`: Quantos não têm vínculo com dim_efetivo
- `usuarios_sem_matricula`: Quantos não têm matrícula
- `detalhes_erros`: JSON com detalhes de cada problema

### Passo 4: Ver Usuários que Precisam de auth_user_id

```sql
-- Listar usuários que precisam fazer login
SELECT * FROM public.listar_usuarios_sem_auth_user_id();
```

### Passo 5: Verificar Cobertura Final

```sql
-- Verificar se todos os policiais têm user_roles
SELECT * FROM public.verificar_cobertura_user_roles();
```

## 📊 O que a Migration Faz

1. ✅ Vincula `usuarios_por_login` com `dim_efetivo` através da matrícula
2. ✅ Cria função `forcar_sincronizacao_user_roles()` para sincronizar todos os usuários
3. ✅ Cria função `listar_usuarios_sem_auth_user_id()` para listar usuários que precisam fazer login
4. ✅ **Executa automaticamente** a sincronização ao rodar a migration
5. ✅ Mostra relatório detalhado com estatísticas

## ⚠️ Importante

- A migration executa automaticamente a sincronização quando é aplicada
- Você verá mensagens NOTICE no console mostrando o progresso
- Usuários sem `auth_user_id` precisarão fazer login pelo menos uma vez
- O trigger automático manterá a sincronização para novos usuários

## 🔄 Executar Novamente (se necessário)

Se precisar executar a sincronização novamente:

```sql
SELECT * FROM public.forcar_sincronizacao_user_roles();
```

## ❌ Troubleshooting

### Erro: "permission denied"
**Solução**: Certifique-se de estar usando uma conta com permissões de admin no Supabase.

### Erro: "function already exists"
**Solução**: Isso é normal - a migration usa `CREATE OR REPLACE`, então está tudo certo.

### Não aparecem mensagens NOTICE
**Solução**: As mensagens aparecem no console do Supabase. Verifique a aba "Messages" ou "Logs" no Dashboard.
