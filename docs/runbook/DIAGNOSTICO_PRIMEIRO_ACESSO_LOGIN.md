# Diagnóstico: Primeiro acesso (matrícula + CPF)

Quando o login com **1º Acesso** retorna *"Matrícula ou CPF incorretos"*, use o diagnóstico abaixo no Supabase para identificar o que falta.

## 1. Aplicar a migration

Se ainda não aplicou, execute no **SQL Editor** do Supabase (nessa ordem):

1. `supabase/migrations/20260203110000_login_sync_cpf_e_verificar_primeiro_acesso.sql`
2. `supabase/migrations/20260203120000_login_primeiro_acesso_fix_e_diagnostico.sql`

## 2. Rodar o diagnóstico

No **SQL Editor** do Supabase, execute (troque pelos valores que está usando no login):

```sql
SELECT * FROM public.diagnostico_primeiro_acesso('731549X', '92995330168');
```

O resultado mostra:

| Coluna | Significado |
|--------|-------------|
| `matricula_normalizada` | Matrícula só com números (ex.: 731549) |
| `cpf_bigint` | CPF em número |
| `tem_dim_efetivo` | Existe policial em `dim_efetivo` com essa matrícula? |
| `tem_user_roles` | Existe linha em `user_roles` para essa matrícula? |
| `user_roles_cpf_preenchido` | O CPF está preenchido em `user_roles`? |
| `tem_usuarios_permitidos` | Existe em `usuarios_permitidos` (Matrícula + CPF)? |
| `tem_usuarios_por_login` | Existe em `usuarios_por_login` (efetivo + CPF)? |
| `mensagem` | Orientações do que corrigir |

## 3. O que corrigir conforme o diagnóstico

- **Policial não está em dim_efetivo**  
  Inclua a matrícula (ex.: 731549X) em `dim_efetivo`. Depois rode de novo a migration que insere em `user_roles` a partir de `dim_efetivo` (ou a migration completa 20260203110000).

- **Não há linha em user_roles**  
  Rode a migration `20260203110000_login_sync_cpf_e_verificar_primeiro_acesso.sql` (passo 1) para criar as linhas em `user_roles` a partir de `dim_efetivo`.

- **CPF não confere em nenhuma tabela**  
  Cadastre o CPF em uma das opções:
  - **usuarios_permitidos**: uma linha com `"Matrícula"` = '731549X' (ou '731549') e `"CPF"` = 92995330168.
  - **usuarios_por_login**: uma linha com `efetivo_id` = id do policial em `dim_efetivo` e `cpf` = 92995330168.

Depois de corrigir, rode de novo o `diagnostico_primeiro_acesso` e teste o 1º Acesso na aplicação.
