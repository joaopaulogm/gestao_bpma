# 🗑️ Limpar Arquivos Redundantes

## 📋 Situação

Na pasta `supabase/migrations/migration2_partes/` existem dois conjuntos de arquivos:

1. ✅ **`_DE_4`** (4 arquivos) - **VERSÃO CORRETA E EXECUTADA**
   - `PARTE_1_DE_4.sql` ✅
   - `PARTE_2_DE_4.sql` ✅
   - `PARTE_3_DE_4.sql` ✅
   - `PARTE_4_DE_4.sql` ✅

2. ❌ **`_DE_20`** (20 arquivos) - **VERSÃO ANTIGA, REDUNDANTE**
   - `PARTE_1_DE_20.sql` até `PARTE_20_DE_20.sql`
   - Estes arquivos foram criados na primeira tentativa
   - Foram substituídos pela versão otimizada de 4 partes

## ✅ O que fazer

**Os arquivos `_DE_20` podem ser deletados** - eles não são necessários pois:

- ✅ Você já executou as 4 partes (`_DE_4`) com sucesso
- ✅ Os dados já estão no banco
- ❌ Os arquivos `_DE_20` são redundantes e ocupam espaço (~4 MB)

## 🗑️ Como deletar

### Opção 1: Manualmente
1. Abra a pasta: `supabase/migrations/migration2_partes/`
2. Selecione todos os arquivos `*_DE_20.sql`
3. Delete (Shift + Delete para deletar permanentemente)

### Opção 2: Via PowerShell
```powershell
cd C:\Users\joaop\supabase\gestao_bpma\supabase\migrations\migration2_partes
Remove-Item *_DE_20.sql
```

## 📊 Arquivos que devem permanecer

Mantenha apenas:
- ✅ `PARTE_1_DE_4.sql`
- ✅ `PARTE_2_DE_4.sql`
- ✅ `PARTE_3_DE_4.sql`
- ✅ `PARTE_4_DE_4.sql`

---

**Resumo**: Os arquivos `_DE_20` são da primeira tentativa e não precisam ser executados. Você pode deletá-los com segurança.

