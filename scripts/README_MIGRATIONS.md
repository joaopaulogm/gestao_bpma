# Executar Migrations de Estatísticas BPMA

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Execute as migrations na ordem:

### Migration 1: Criar Tabelas
- Abra o arquivo: `supabase/migrations/20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql`
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em **Run**

### Migration 2: Popular Dados
- Abra o arquivo: `supabase/migrations/20260105225747_popular_tabelas_estatisticas_bpma_adaptado.sql`
- **ATENÇÃO**: Este arquivo é grande (4.1 MB)
- Copie e cole no SQL Editor
- Clique em **Run**
- Pode levar alguns minutos para executar

## Opção 2: Via Script TypeScript

```bash
# Definir a chave de serviço
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"

# Executar script
npm run migrate-estatisticas
```

Ou adicione ao `package.json`:
```json
{
  "scripts": {
    "migrate-estatisticas": "tsx scripts/run-migration-estatisticas.ts"
  }
}
```

## Estrutura Criada

### Tabelas Dimensão (dim_*)
- `dim_tempo` - Tempo com ID composto (AAAAMM)
- `dim_indicador_bpma` - Indicadores categorizados

### Tabelas Fato (fact_*)
- `fact_indicador_mensal_bpma` - Indicadores mensais
- `fact_resgate_fauna_especie_mensal` - Resgates por espécie

## Dados Inseridos

- **6.239** registros de atendimentos/indicadores
- **3.520** registros de resgates por espécie
- Match automático com `dim_especies_fauna`

## Verificação

Após executar, verifique:

```sql
-- Verificar dim_tempo
SELECT COUNT(*) FROM dim_tempo; -- Deve retornar 72 (6 anos × 12 meses)

-- Verificar indicadores
SELECT COUNT(*) FROM dim_indicador_bpma; -- Deve retornar ~234

-- Verificar dados de indicadores
SELECT COUNT(*) FROM fact_indicador_mensal_bpma; -- Deve retornar ~6.239

-- Verificar resgates
SELECT COUNT(*) FROM fact_resgate_fauna_especie_mensal; -- Deve retornar ~3.520
```

