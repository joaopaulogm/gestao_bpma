# ⚡ Executar Migrations AGORA (2 Passos Simples)

## Passo 1: Criar Função Helper (1 minuto)

1. Acesse: https://supabase.com/dashboard → SQL Editor
2. Abra o arquivo: `scripts/criar-funcao-exec-sql.sql`
3. Copie TODO o conteúdo e cole no SQL Editor
4. Clique em **Run**
5. Deve aparecer: ✅ "Success"

## Passo 2: Executar Migrations Automaticamente

Depois que a função foi criada, execute:

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc2MjYzNCwiZXhwIjoyMDU2MzM4NjM0fQ.X2JGeeM9J8ejHSN8gqFT5XsSX3EhXhV-9JVGhHuO7kc"
npm run executar-migrations-auto
```

**OU** execute as migrations manualmente no Dashboard (mais confiável para arquivos grandes):

### Migration 1: Criar Tabelas
- Arquivo: `supabase/migrations/20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql`
- Copie, cole e execute no SQL Editor

### Migration 2: Popular Dados  
- Arquivo: `supabase/migrations/20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql`
- ⚠️ Arquivo grande (4.1 MB) - pode levar 2-5 minutos
- Copie, cole e execute no SQL Editor

## ✅ Verificação

Após executar, verifique:

```sql
SELECT COUNT(*) FROM dim_tempo; -- Deve retornar 72
SELECT COUNT(*) FROM dim_indicador_bpma; -- Deve retornar ~234
SELECT COUNT(*) FROM fact_indicador_mensal_bpma; -- Deve retornar ~6.239
SELECT COUNT(*) FROM fact_resgate_fauna_especie_mensal; -- Deve retornar ~3.520
```

