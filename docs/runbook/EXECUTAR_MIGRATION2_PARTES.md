# ✅ Executar Migration 2 em Partes

A Migration 2 foi dividida em **4 partes menores** que podem ser executadas no SQL Editor.

## 📍 Localização

Arquivos em: `supabase/migrations/migration2_partes/`

## 🚀 Como Executar

### No Supabase Dashboard SQL Editor:

1. **Parte 1**: Execute `PARTE_1_DE_4.sql`
   - Tamanho: ~67 KB
   - Aguarde a conclusão

2. **Parte 2**: Execute `PARTE_2_DE_4.sql`
   - Tamanho: ~60 KB
   - Aguarde a conclusão

3. **Parte 3**: Execute `PARTE_3_DE_4.sql`
   - Tamanho: ~65 KB
   - Aguarde a conclusão

4. **Parte 4**: Execute `PARTE_4_DE_4.sql`
   - Tamanho: ~8 KB
   - Aguarde a conclusão

## ⚠️ Importante

- Execute as partes **na ordem** (1, 2, 3, 4)
- Aguarde cada parte terminar antes de executar a próxima
- Cada parte pode levar 30-60 segundos

## ✅ Verificação Final

Após executar todas as 4 partes:

```sql
SELECT COUNT(*) FROM fact_indicador_mensal_bpma; -- Deve retornar ~6.239
SELECT COUNT(*) FROM fact_resgate_fauna_especie_mensal; -- Deve retornar ~3.520
```

## 📊 O que foi otimizado

- **Antes**: 1 arquivo de 4.1 MB (muito grande)
- **Depois**: 4 arquivos de 60-67 KB cada (executáveis no SQL Editor)
- **Método**: INSERTs agrupados em batches para melhor performance

