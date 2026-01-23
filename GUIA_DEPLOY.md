# Guia de Deploy - Seção Pessoas com RLS e Edge Functions

Este guia fornece instruções passo a passo para:
1. Executar a migration SQL no Supabase Dashboard
2. Configurar os secrets da Edge Function
3. Fazer o deploy da Edge Function
4. Testar as funcionalidades

---

## 📋 Pré-requisitos

- Acesso ao Supabase Dashboard do seu projeto
- Credenciais do Supabase (URL, anon key, service_role key)
- Supabase CLI instalado (opcional, para deploy via CLI)

---

## 1️⃣ Executar a Migration SQL no Supabase Dashboard

### Passo 1.1: Acessar o SQL Editor
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 1.2: Criar Nova Query
1. Clique no botão **New Query** (ou use o atalho `Ctrl/Cmd + K`)
2. Dê um nome à query (ex: "RLS Seção Pessoas - Admin Only")

### Passo 1.3: Copiar e Colar a Migration
1. Abra o arquivo `supabase/migrations/20260106000000_rls_secao_pessoas_admin_only.sql`
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase

### Passo 1.4: Executar a Migration
1. Clique no botão **Run** (ou pressione `Ctrl/Cmd + Enter`)
2. Aguarde a execução completar
3. Verifique se não há erros na aba **Results**

### Passo 1.5: Verificar a Execução
Execute estas queries para verificar:

```sql
-- Verificar se a função is_admin foi criada
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';

-- Verificar se as colunas geradas foram criadas
SELECT column_name, data_type, is_generated
FROM information_schema.columns
WHERE table_name IN ('fat_restricoes', 'fat_licencas_medicas')
AND column_name = 'data_fim_norm';

-- Verificar se os índices únicos foram criados
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE 'idx_%_unique'
AND schemaname = 'public';

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'fat_abono', 'fat_ferias', 'fat_restricoes', 
  'fat_licencas_medicas', 'dim_equipes', 'fat_equipe_membros'
);
```

**✅ Se todas as queries retornarem resultados, a migration foi executada com sucesso!**

---

## 2️⃣ Configurar os Secrets da Edge Function

### Passo 2.1: Obter as Credenciais do Supabase
1. No Supabase Dashboard, vá em **Settings** → **API**
2. Anote os seguintes valores:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ **MANTENHA SECRETO!**)

### Passo 2.2: Acessar Edge Functions
1. No menu lateral, clique em **Edge Functions**
2. Se a função `admin-pessoas` ainda não existir, você precisará criá-la primeiro (veja seção 3)

### Passo 2.3: Configurar Secrets
1. Clique na função `admin-pessoas`
2. Vá na aba **Settings** (ou **Secrets**)
3. Clique em **Add Secret** ou **Manage Secrets**

### Passo 2.4: Adicionar os 3 Secrets
Adicione os seguintes secrets (um de cada vez):

| Nome do Secret | Valor | Descrição |
|----------------|-------|-----------|
| `SB_URL` | Sua Project URL | Ex: `https://xxxxx.supabase.co` |
| `SB_ANON_KEY` | Sua anon public key | Chave pública anon |
| `SB_SERVICE_ROLE_KEY` | Sua service_role key | ⚠️ Chave secreta (não compartilhe!) |

**Nota:** A Edge Function também aceita `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` como nomes alternativos.

### Passo 2.5: Verificar Secrets
1. Confirme que os 3 secrets estão listados
2. Verifique se os valores estão corretos (sem espaços extras)

---

## 3️⃣ Fazer o Deploy da Edge Function

Você tem duas opções: via Dashboard ou via CLI.

### Opção A: Deploy via Supabase Dashboard (Recomendado)

#### Passo 3.1: Criar a Edge Function
1. No menu lateral, clique em **Edge Functions**
2. Clique em **Create a new function**
3. Nome: `admin-pessoas`
4. Clique em **Create function**

#### Passo 3.2: Editar o Código
1. Clique na função `admin-pessoas`
2. Vá na aba **Code**
3. Abra o arquivo `supabase/functions/admin-pessoas/index.ts`
4. Copie **TODO** o conteúdo
5. Cole no editor do Dashboard
6. Clique em **Deploy** ou **Save**

### Opção B: Deploy via Supabase CLI

#### Passo 3.1: Instalar Supabase CLI (se necessário)
```bash
# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Ou via npm
npm install -g supabase
```

#### Passo 3.2: Fazer Login
```bash
supabase login
```

#### Passo 3.3: Linkar o Projeto
```bash
cd c:\Users\joaop\supabase\gestao_bpma
supabase link --project-ref seu-project-ref
```

**Para encontrar o project-ref:**
- No Dashboard, vá em **Settings** → **General**
- O **Reference ID** é o project-ref

#### Passo 3.4: Fazer Deploy
```bash
supabase functions deploy admin-pessoas
```

#### Passo 3.5: Configurar Secrets via CLI (alternativa)
```bash
supabase secrets set SB_URL="https://xxxxx.supabase.co"
supabase secrets set SB_ANON_KEY="sua-anon-key"
supabase secrets set SB_SERVICE_ROLE_KEY="sua-service-role-key"
```

---

## 4️⃣ Testar as Funcionalidades

### Teste 1: Verificar Acesso de Admin

#### 4.1.1: Testar SELECT (deve funcionar para admin)
1. Faça login no frontend como usuário admin
2. Acesse `/secao-pessoas/abono`
3. **Esperado:** Deve carregar os dados sem erros

#### 4.1.2: Testar SELECT (deve bloquear para não-admin)
1. Faça login como usuário **não-admin**
2. Acesse `/secao-pessoas/abono`
3. **Esperado:** Deve mostrar "Acesso restrito" ou erro de permissão

### Teste 2: Testar Edge Function Diretamente

#### 4.2.1: Obter Token de Autenticação
1. No frontend, abra o Console do navegador (F12)
2. Execute:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```
3. Copie o token

#### 4.2.2: Testar via cURL ou Postman
```bash
curl -X POST https://seu-projeto.supabase.co/functions/v1/admin-pessoas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "abono_upsert",
    "efetivo_id": "uuid-do-efetivo",
    "ano": 2026,
    "mes": 1,
    "observacao": "Teste"
  }'
```

**Esperado:** Resposta `{"ok": true, "data": {...}}`

#### 4.2.3: Testar com Usuário Não-Admin
1. Faça login como usuário não-admin
2. Tente a mesma requisição
3. **Esperado:** Resposta `{"ok": false, "error": "Access denied. Admin role required."}` com status 403

### Teste 3: Testar Operações no Frontend

#### 4.3.1: Testar Criar Abono
1. Acesse `/secao-pessoas/abono` como admin
2. Clique em "Novo Abono"
3. Preencha os campos e salve
4. **Esperado:** Abono criado com sucesso

#### 4.3.2: Testar Criar Férias
1. Acesse `/secao-pessoas/ferias` como admin
2. Crie uma nova férias
3. **Esperado:** Férias criada com sucesso

#### 4.3.3: Testar Criar Restrição
1. Acesse `/secao-pessoas/afastamento` como admin
2. Crie uma nova restrição
3. **Esperado:** Restrição criada com sucesso

#### 4.3.4: Testar Criar Licença Médica
1. Acesse `/secao-pessoas/licencas` como admin
2. Crie uma nova licença
3. **Esperado:** Licença criada com sucesso

#### 4.3.5: Testar Gerenciar Equipes
1. Acesse `/secao-pessoas/equipes` como admin
2. Crie uma nova equipe
3. Adicione membros à equipe
4. **Esperado:** Operações bem-sucedidas

#### 4.3.6: Testar Campanha
1. Acesse `/secao-pessoas/campanha` como admin
2. Adicione membros à campanha
3. Faça alterações na campanha
4. **Esperado:** Operações bem-sucedidas

### Teste 4: Verificar Logs da Edge Function

#### 4.4.1: Acessar Logs
1. No Dashboard, vá em **Edge Functions** → `admin-pessoas`
2. Clique na aba **Logs**
3. Execute algumas operações no frontend
4. Verifique se os logs aparecem corretamente

#### 4.4.2: Verificar Erros
- Se houver erros, verifique:
  - Secrets configurados corretamente?
  - Token de autenticação válido?
  - Usuário tem role de admin?

---

## 🔍 Troubleshooting

### Problema: Migration falha
**Solução:**
- Verifique se todas as tabelas existem
- Verifique se o tipo `app_role` existe (enum)
- Execute a migration em partes se necessário

### Problema: Edge Function retorna 500
**Solução:**
- Verifique se os secrets estão configurados
- Verifique os logs da Edge Function
- Confirme que as variáveis de ambiente estão corretas

### Problema: "Access denied" mesmo sendo admin
**Solução:**
- Verifique se o usuário tem `role = 'admin'` na tabela `user_roles`
- Verifique se a função `is_admin()` está funcionando:
  ```sql
  SELECT public.is_admin();
  ```

### Problema: Frontend não consegue chamar Edge Function
**Solução:**
- Verifique se `VITE_SUPABASE_URL` está configurado no `.env`
- Verifique se o token está sendo enviado no header Authorization
- Verifique o Console do navegador para erros CORS

### Problema: RLS bloqueia leituras
**Solução:**
- Verifique se o usuário está autenticado
- Verifique se o usuário tem role de admin
- Teste a função `is_admin()` diretamente no SQL

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Migration SQL executada com sucesso
- [ ] Função `is_admin()` criada e funcionando
- [ ] Colunas geradas `data_fim_norm` criadas
- [ ] Índices únicos criados
- [ ] RLS habilitado em todas as tabelas
- [ ] Policies criadas corretamente
- [ ] Edge Function `admin-pessoas` deployada
- [ ] Secrets configurados (SB_URL, SB_ANON_KEY, SB_SERVICE_ROLE_KEY)
- [ ] Admin consegue ler dados
- [ ] Não-admin recebe "Acesso restrito"
- [ ] Admin consegue criar/editar/deletar via Edge Function
- [ ] Não-admin não consegue criar/editar/deletar
- [ ] Logs da Edge Function funcionando
- [ ] Frontend integrado e funcionando

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Edge Function
2. Verifique o Console do navegador
3. Verifique os logs do Supabase (Database → Logs)
4. Consulte a documentação do Supabase: https://supabase.com/docs

---

**Última atualização:** 2026-01-06
