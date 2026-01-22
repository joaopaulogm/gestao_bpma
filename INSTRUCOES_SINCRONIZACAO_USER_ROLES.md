# Instruções para Sincronização de user_roles

## Problema
A tabela `user_roles` no Supabase ainda não tem todos os usuários criados.

## Solução

### Passo 1: Executar as Migrations no Supabase Dashboard

Execute as seguintes migrations na ordem:

1. `20260125000002_vincular_usuarios_por_login_efetivo_roles.sql`
2. `20260125000003_sincronizar_user_roles_com_efetivo_roles.sql`
3. `20260125000005_forcar_sincronizacao_completa_user_roles.sql` ⭐ **IMPORTANTE**

### Passo 2: Executar Sincronização Forçada

Após executar as migrations, execute esta query no Supabase SQL Editor:

```sql
SELECT * FROM public.forcar_sincronizacao_user_roles();
```

Esta função irá:
- Processar **TODOS** os usuários ativos em `usuarios_por_login`
- Criar/atualizar registros em `user_roles` para todos que têm `auth_user_id`
- Reportar quais usuários não podem ser sincronizados e por quê

### Passo 3: Verificar Resultados

#### 3.1. Ver Relatório Completo

```sql
SELECT * FROM public.forcar_sincronizacao_user_roles();
```

Retorna:
- `usuarios_processados`: Total de usuários processados
- `roles_criados`: Quantos roles foram criados
- `roles_atualizados`: Quantos roles foram atualizados
- `usuarios_sem_auth_user_id`: Quantos não têm `auth_user_id` (precisam fazer login)
- `usuarios_sem_efetivo_id`: Quantos não têm vínculo com `dim_efetivo`
- `usuarios_sem_matricula`: Quantos não têm matrícula
- `detalhes_erros`: JSON com detalhes de cada problema

#### 3.2. Ver Usuários que Precisam de auth_user_id

```sql
SELECT * FROM public.listar_usuarios_sem_auth_user_id();
```

Esta query lista todos os usuários que:
- Estão ativos
- Não têm `auth_user_id` vinculado
- Precisam fazer login pelo menos uma vez para ter a conta criada

#### 3.3. Verificar Cobertura Final

```sql
SELECT * FROM public.verificar_cobertura_user_roles();
```

Retorna:
- `total_efetivo_roles`: Total de policiais em `efetivo_roles`
- `total_com_user_roles`: Quantos têm `user_roles` criado
- `total_sem_user_roles`: Quantos ainda não têm
- `policiais_sem_user_roles`: JSON com lista detalhada dos que faltam

#### 3.4. Ver Todos os user_roles Criados

```sql
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  ur.created_at,
  upl.login,
  upl.nome,
  upl.matricula,
  de.nome as nome_efetivo,
  er.role as role_efetivo
FROM public.user_roles ur
INNER JOIN public.usuarios_por_login upl ON upl.auth_user_id = ur.user_id
LEFT JOIN public.dim_efetivo de ON de.id = upl.efetivo_id
LEFT JOIN public.efetivo_roles er ON er.efetivo_id = upl.efetivo_id
ORDER BY upl.nome;
```

## Por que alguns usuários não aparecem em user_roles?

### Motivo 1: Não têm `auth_user_id`
**Solução**: O usuário precisa fazer login pelo menos uma vez. Quando faz login:
- O sistema cria a conta em `auth.users`
- O `auth_user_id` é vinculado em `usuarios_por_login`
- O trigger automático cria o registro em `user_roles`

### Motivo 2: Não têm matrícula ou matrícula incorreta
**Solução**: Verificar e corrigir a matrícula em `usuarios_por_login` para que possa ser vinculada com `dim_efetivo`.

### Motivo 3: Não estão em `dim_efetivo`
**Solução**: O policial precisa estar cadastrado em `dim_efetivo` com a matrícula correta.

## Sincronização Automática

Após executar as migrations, um **trigger automático** está ativo que:
- Sincroniza automaticamente quando `auth_user_id` é vinculado
- Sincroniza quando `efetivo_id` é atualizado
- Mantém `user_roles` sempre atualizado

## Executar Novamente

Se precisar executar a sincronização novamente (por exemplo, após novos usuários fazerem login):

```sql
SELECT * FROM public.forcar_sincronizacao_user_roles();
```

Ou usar a função original:

```sql
SELECT * FROM public.sync_user_roles_from_efetivo();
```

## Troubleshooting

### Erro: "permission denied for table user_roles"
**Solução**: Execute as queries como superuser ou com role que tenha permissão de admin.

### Erro: "role does not exist"
**Solução**: Verifique se o enum `app_role` tem todos os valores necessários:
- admin
- user
- operador
- secao_operacional
- secao_pessoas
- secao_logistica
- publico

### Usuários não aparecem mesmo após login
**Solução**: 
1. Verifique se o trigger está ativo: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_sync_user_role_on_auth_link';`
2. Execute manualmente: `SELECT * FROM public.forcar_sincronizacao_user_roles();`
