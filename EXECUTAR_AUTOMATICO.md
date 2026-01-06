# 🚀 Executar Migrations Automaticamente

## ⚡ Método Rápido (2 Passos)

### Passo 1: Criar Função Helper (Uma vez só)

1. Acesse: https://supabase.com/dashboard → SQL Editor
2. Abra o arquivo: `scripts/criar-funcao-exec-sql.sql`
3. Copie e execute no SQL Editor
4. Isso cria a função `exec_sql` que permite executar SQL via API

### Passo 2: Executar Script Automático

```powershell
# 1. Obter a chave service_role no Dashboard: Settings → API → service_role key

# 2. Definir a variável de ambiente
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role-aqui"

# 3. Executar o script
npm run executar-migrations-auto
```

O script irá:
- ✅ Executar a Migration 1 (criar tabelas)
- ✅ Executar a Migration 2 (popular dados - 4.1 MB)
- ✅ Verificar os resultados automaticamente
- ✅ Mostrar progresso em tempo real

## 📋 Requisitos

- Node.js e npm instalados
- Chave `service_role` do Supabase (não a anon key!)
- Função `exec_sql` criada no banco (Passo 1)

## ⚠️ Importante

- A chave `service_role` tem acesso total ao banco - **NÃO compartilhe!**
- A Migration 2 é grande e pode levar 2-5 minutos
- O script mostra progresso em tempo real

## 🔍 Verificação Automática

Após executar, o script verifica automaticamente:
- ✅ `dim_tempo` - deve ter 72 registros
- ✅ `dim_indicador_bpma` - deve ter ~234 registros  
- ✅ `fact_indicador_mensal_bpma` - deve ter ~6.239 registros
- ✅ `fact_resgate_fauna_especie_mensal` - deve ter ~3.520 registros

## ❌ Se Der Erro

Se aparecer "function exec_sql não encontrada":
1. Execute o Passo 1 novamente
2. Verifique se a função foi criada: `SELECT * FROM pg_proc WHERE proname = 'exec_sql';`

Se der timeout:
- A Migration 2 é muito grande
- Execute manualmente no Dashboard (método mais confiável)

