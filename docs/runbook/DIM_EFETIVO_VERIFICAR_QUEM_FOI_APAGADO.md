# Verificar quem foi apagado em dim_efetivo (duplicatas por matrícula)

A migration `20260203160000_dim_efetivo_remover_duplicatas_matricula.sql` remove de `dim_efetivo` as linhas com **matrícula duplicada** (matrícula normalizada = apenas dígitos) e registra quem foi removido.

## Como verificar quem foi apagado

### 1. Pela view (recomendado)

No Supabase SQL Editor ou em qualquer cliente SQL:

```sql
SELECT * FROM public.v_audit_dim_efetivo_quem_foi_apagado;
```

Colunas:
- **id_removido** – UUID da linha que foi apagada de `dim_efetivo`
- **matricula_original** – matrícula da linha apagada
- **nome_original**, **nome_guerra_original** – nome da linha apagada
- **id_mantido** – UUID da linha que permaneceu (uma por matrícula)
- **matricula_mantida** – matrícula da linha mantida
- **removido_em** – data/hora da remoção

### 2. Direto na tabela de auditoria

```sql
SELECT * FROM public.audit_dim_efetivo_duplicatas_removidas ORDER BY removido_em DESC;
```

### 3. Contar quantos foram removidos

```sql
SELECT COUNT(*) AS total_removidos FROM public.audit_dim_efetivo_duplicatas_removidas;
```

## Regra da migration

- **Duplicata:** mesma matrícula normalizada (só números) em mais de uma linha.
- **Linha mantida:** por grupo de matrícula, fica a linha que tem vínculo em `user_roles` (login); se nenhuma tiver, fica a de menor `id`.
- **FKs:** todas as referências (`user_roles`, `usuarios_por_login`, `fat_equipe_membros`, etc.) são atualizadas para apontar para o `id_mantido` antes do `DELETE`.

## Se a migration falhar por UNIQUE

Se existir tabela com `UNIQUE(efetivo_id, ...)` (ex.: `fat_abono(efetivo_id, mes, ano)`), ao redirecionar dois efetivos para o mesmo `id_manter` pode dar violação de unique. Nesse caso será preciso tratar duplicatas nessas tabelas (ex.: manter um registro e remover o outro) e rodar a migration de novo ou aplicar o restante manualmente.
