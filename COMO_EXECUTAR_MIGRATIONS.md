# 🚀 Como Executar as Migrations de Estatísticas BPMA

## 📋 Pré-requisitos

- Acesso ao Supabase Dashboard
- Ou: Chave de serviço do Supabase (SUPABASE_SERVICE_ROLE_KEY)

---

## ✅ Opção 1: Via Supabase Dashboard (MAIS FÁCIL - Recomendado)

### Passo 1: Acessar o Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **oiwwptnqaunsyhpkwbrz**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar Migration 1 (Criar Tabelas)
1. Abra o arquivo: `supabase/migrations/20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql`
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. No SQL Editor do Supabase, **cole o conteúdo** (Ctrl+V)
4. Clique no botão **Run** (ou pressione Ctrl+Enter)
5. Aguarde a execução (deve levar alguns segundos)
6. Verifique se apareceu: ✅ "Success. No rows returned"

### Passo 3: Executar Migration 2 (Popular Dados)
1. Abra o arquivo: `supabase/migrations/20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql`
2. ⚠️ **ATENÇÃO**: Este arquivo é grande (4.1 MB)
3. **Copie TODO o conteúdo** do arquivo
4. No SQL Editor, **cole o conteúdo**
5. Clique em **Run**
6. ⏱️ **Aguarde** - pode levar 2-5 minutos para executar todos os INSERTs
7. Verifique se apareceu: ✅ "Success"

### Passo 4: Verificar se funcionou
Execute estas queries no SQL Editor:

```sql
-- Verificar dim_tempo (deve retornar 72)
SELECT COUNT(*) as total_tempos FROM dim_tempo;

-- Verificar indicadores (deve retornar ~234)
SELECT COUNT(*) as total_indicadores FROM dim_indicador_bpma;

-- Verificar dados de indicadores (deve retornar ~6.239)
SELECT COUNT(*) as total_indicadores_mensais FROM fact_indicador_mensal_bpma;

-- Verificar resgates (deve retornar ~3.520)
SELECT COUNT(*) as total_resgates FROM fact_resgate_fauna_especie_mensal;

-- Ver alguns exemplos
SELECT * FROM dim_tempo ORDER BY id LIMIT 5;
SELECT * FROM dim_indicador_bpma LIMIT 10;
SELECT * FROM fact_indicador_mensal_bpma LIMIT 10;
```

---

## ⚙️ Opção 2: Via Script TypeScript (Avançado)

### Passo 1: Obter a Chave de Serviço
1. No Supabase Dashboard, vá em **Settings** → **API**
2. Copie a **service_role key** (secret)
3. ⚠️ **NÃO compartilhe esta chave!**

### Passo 2: Executar o Script
Abra o PowerShell no diretório do projeto e execute:

```powershell
# Definir a chave de serviço
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-aqui"

# Executar o script
npm run migrate-estatisticas
```

**Nota**: O script pode ter limitações com arquivos muito grandes. Para a migration 2 (4.1 MB), é melhor usar o Dashboard.

---

## 🔍 Verificação Final

Após executar ambas as migrations, você deve ter:

| Tabela | Registros Esperados |
|--------|---------------------|
| `dim_tempo` | 72 (6 anos × 12 meses) |
| `dim_indicador_bpma` | ~234 indicadores |
| `fact_indicador_mensal_bpma` | ~6.239 registros |
| `fact_resgate_fauna_especie_mensal` | ~3.520 registros |

---

## ❌ Solução de Problemas

### Erro: "relation already exists"
- As tabelas já existem. Isso é normal se você executar novamente.
- As migrations usam `CREATE TABLE IF NOT EXISTS`, então é seguro.

### Erro: "duplicate key value"
- Alguns dados já foram inseridos. Isso é normal.
- As migrations usam `ON CONFLICT DO NOTHING` ou `ON CONFLICT DO UPDATE`.

### Migration 2 muito lenta
- É normal! O arquivo tem 4.1 MB e milhares de INSERTs.
- Aguarde alguns minutos. Não feche a janela.

### Erro de timeout
- Se a migration 2 der timeout, tente executar em partes menores.
- Ou use o script TypeScript que divide em lotes.

---

## 📝 Próximos Passos

Após executar as migrations:

1. ✅ As tabelas estarão disponíveis no Dashboard
2. ✅ Os dados estarão prontos para uso em gráficos
3. ✅ Você pode criar queries e visualizações
4. ✅ Integrar com o Dashboard da aplicação

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs no SQL Editor
2. Confirme que executou as migrations na ordem correta
3. Verifique se tem permissões no Supabase

