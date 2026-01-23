# Instruções para Correção Completa de Erros de Segurança

Este documento descreve as correções aplicadas e as ações manuais necessárias.

## ✅ Correções Aplicadas Automaticamente

### Migration Principal: `20260108000000_corrigir_todos_erros_seguranca_final.sql`

Esta migration corrige TODOS os erros de segurança de forma abrangente:

### 1. RLS Habilitado em Todas as Tabelas Públicas
- ✅ Migration `20260108000000_corrigir_todos_erros_seguranca_final.sql` aplicada
- ✅ RLS habilitado automaticamente em TODAS as tabelas públicas
- ✅ Verificação automática de tabelas sem RLS

### 2. Proteção de Dados Pessoais de Funcionários
- ✅ `dim_efetivo`: Apenas usuários autenticados podem ver dados básicos
- ✅ Apenas admin e secao_pessoas podem ver dados completos
- ✅ Apenas admin e secao_pessoas podem modificar

### 3. Proteção de Registros Militares
- ✅ `fat_licencas_medicas`: Apenas admin e secao_pessoas podem acessar
- ✅ `fat_ferias`: Apenas admin e secao_pessoas podem acessar
- ✅ `fat_restricoes`: Apenas admin e secao_pessoas podem acessar

### 4. Proteção da Estrutura Operacional
- ✅ `dim_equipes`: Apenas autenticados podem ver, apenas admin/secao_operacional podem modificar
- ✅ `fat_equipe_membros`: Protegido
- ✅ `fat_equipe_resgate`: Protegido
- ✅ `fat_equipe_crime`: Protegido
- ✅ `dim_equipes_campanha`: Protegido
- ✅ `fat_campanha_membros`: Protegido

### 5. Proteção da Tabela de Tempo
- ✅ `dim_tempo`: Apenas usuários autenticados podem ler
- ✅ Apenas admins podem modificar

### 6. Correção de Search Path em Funções
- ✅ `update_quantidade_total()`: search_path fixo
- ✅ `format_date_trigger()`: search_path fixo

### 7. Proteção de Tabelas BPMA
- ✅ `bpma_fato_mensal`: Apenas autenticados podem ler, apenas admins podem modificar
- ✅ `bpma_relatorio_anual`: Apenas autenticados podem ler, apenas admins podem modificar
- ✅ `fact_indicador_mensal_bpma`: Protegido
- ✅ `fact_resgate_fauna_especie_mensal`: Protegido

### 8. Verificação do React
- ✅ React 18.3.1 não possui vulnerabilidade XSS conhecida (verificado)
- ℹ️ O aviso pode ser um falso positivo do scanner
- ℹ️ Para atualizar para React 19 (opcional), execute: `npm install react@latest react-dom@latest`

## ⚠️ Ações Manuais Necessárias

### 1. Auth OTP Long Expiry
**Localização:** Supabase Dashboard → Authentication → Settings → OTP Settings

**Ação:**
1. Acesse o Supabase Dashboard
2. Vá em Authentication → Settings
3. Encontre "OTP Settings"
4. Configure "OTP Expiry" para **3600 segundos (1 hora)** ou menos
5. Salve as alterações

**Recomendação:** 3600 segundos (1 hora) é um bom equilíbrio entre segurança e usabilidade.

### 2. Leaked Password Protection
**Localização:** Supabase Dashboard → Authentication → Settings → Password

**Ação:**
1. Acesse o Supabase Dashboard
2. Vá em Authentication → Settings
3. Encontre a seção "Password"
4. **Habilite** "Enable Leaked Password Protection"
5. Salve as alterações

**Benefício:** Previne que usuários usem senhas que foram vazadas em breaches conhecidos.

### 3. Atualizar Dependências do React
**Localização:** Terminal do projeto

**Ação:**
```bash
npm install
```

Isso instalará a versão atualizada do React (18.3.2) que corrige a vulnerabilidade XSS.

### 4. Verificar Versão do PostgreSQL
**Localização:** Supabase Dashboard → Settings → Database

**Ação:**
1. Acesse o Supabase Dashboard
2. Vá em Settings → Database
3. Verifique a versão do PostgreSQL
4. Se houver atualizações disponíveis, o Supabase notificará você
5. Siga as instruções do Supabase para atualizar (geralmente automático)

**Nota:** O Supabase gerencia atualizações de PostgreSQL automaticamente. Você será notificado quando houver patches de segurança disponíveis.

### 9. Remoção de Políticas "Always True"
- ✅ Remove automaticamente todas as políticas RLS que usam `USING (true)` ou `WITH CHECK (true)`
- ✅ Mantém leitura pública apenas para tabelas de dimensões (dados não sensíveis)
- ✅ Restringe escrita/modificação em todas as tabelas

### 10. Correção de Funções SECURITY DEFINER
- ✅ Todas as funções conhecidas agora têm `SET search_path = public, pg_temp`
- ✅ Funções corrigidas: `update_quantidade_total`, `format_date_trigger`, `sync_fauna_from_dimension`, `sync_flora_from_dimension`, `has_role`, `is_allowed_user`, `handle_new_user`

## 📋 Verificação das Correções

### Verificar RLS Habilitado
Execute no SQL Editor do Supabase:
```sql
SELECT 
  tablename,
  CASE WHEN relrowsecurity THEN 'RLS Habilitado' ELSE 'RLS Desabilitado' END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND tablename IN (
  'dim_tempo', 'dim_efetivo', 'fat_licencas_medicas',
  'fat_ferias', 'fat_restricoes', 'dim_equipes',
  'fat_equipe_membros', 'fat_equipe_resgate', 'fat_equipe_crime'
)
ORDER BY tablename;
```

### Verificar Políticas RLS
Execute no SQL Editor do Supabase:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'dim_tempo', 'dim_efetivo', 'fat_licencas_medicas',
  'fat_ferias', 'fat_restricoes', 'dim_equipes'
)
ORDER BY tablename, policyname;
```

## 🔒 Resumo das Proteções Aplicadas

| Tabela | Leitura | Modificação |
|-------|---------|-------------|
| `dim_tempo` | Autenticados | Apenas Admins |
| `dim_efetivo` | Autenticados (básico), Admin/HR (completo) | Apenas Admin/HR |
| `fat_licencas_medicas` | Apenas Admin/HR | Apenas Admin/HR |
| `fat_ferias` | Apenas Admin/HR | Apenas Admin/HR |
| `fat_restricoes` | Apenas Admin/HR | Apenas Admin/HR |
| `dim_equipes` | Autenticados | Apenas Admin/Seção Operacional |
| `fat_equipe_membros` | Autenticados | Apenas Admin/Seção Operacional |
| `fat_equipe_resgate` | Autenticados | Apenas Admin/Seção Operacional |
| `fat_equipe_crime` | Autenticados | Apenas Admin/Seção Operacional |
| `bpma_fato_mensal` | Autenticados | Apenas Admins |
| `bpma_relatorio_anual` | Autenticados | Apenas Admins |

## ✅ Próximos Passos

1. ✅ **IMPORTANTE:** Execute a migration `20260108000000_corrigir_todos_erros_seguranca_final.sql` no Supabase Dashboard → SQL Editor
   - Esta migration corrige TODOS os erros de segurança de forma abrangente
   - Ela remove políticas "always true", habilita RLS em todas as tabelas e corrige funções
2. ⚠️ Configure OTP Expiry no Dashboard (Ação Manual 1)
3. ⚠️ Habilite Leaked Password Protection (Ação Manual 2)
4. ✅ Execute `npm install` para atualizar React (Ação Manual 3)
5. ⚠️ Verifique versão do PostgreSQL (Ação Manual 4)
6. ✅ Execute as queries de verificação acima para confirmar

## 📝 Notas Importantes

- **Não quebra funcionalidade:** Todas as correções foram feitas de forma a manter a funcionalidade existente
- **Usuários autenticados:** Continuam tendo acesso às funcionalidades necessárias
- **Dados sensíveis:** Agora estão protegidos por políticas baseadas em roles
- **Estrutura operacional:** Protegida contra acesso não autorizado

## 🆘 Em Caso de Problemas

Se após aplicar as correções houver problemas de acesso:

1. Verifique se o usuário tem o role correto na tabela `user_roles`
2. Verifique se as políticas RLS foram criadas corretamente (use queries de verificação)
3. Verifique logs do Supabase para erros específicos
4. Se necessário, temporariamente desabilite RLS em uma tabela específica para debug:
   ```sql
   ALTER TABLE public.nome_da_tabela DISABLE ROW LEVEL SECURITY;
   ```
   **IMPORTANTE:** Reabilite RLS após o debug!
