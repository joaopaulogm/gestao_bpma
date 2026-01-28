# Script de Importação de Férias 2026

## Pré-requisitos

1. **Instalar dependências:**
   ```bash
   pip install pandas openpyxl python-dotenv requests
   ```

2. **Configurar variáveis de ambiente no arquivo `.env`:**
   ```
   VITE_SUPABASE_URL=https://oiwwptnqaunsyhpkwbrz.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
   ```

   **Importante:** Para scripts de importação, é recomendado usar `SUPABASE_SERVICE_ROLE_KEY` que tem acesso completo ao banco, ignorando RLS. Você pode encontrar essa chave no painel do Supabase em Settings > API > service_role key.

3. **Arquivo Excel:**
   - Caminho: `G:\Meu Drive\JP\app BPMA\AFASTAMENTOS BPMA [2026] (1).xlsx`
   - Aba: `02 | FÉRIAS 2026 PRAÇAS`

## Como executar

```bash
python scripts/importar_ferias_2026.py
```

## O que o script faz

1. Lê o arquivo Excel da aba especificada
2. Encontra automaticamente a linha de cabeçalho
3. Para cada linha com matrícula válida:
   - Busca o `efetivo_id` no banco pela matrícula
   - Extrai dados das 3 parcelas de férias (dias, datas, status de lançamento)
   - Extrai o número do processo SEI
   - Insere/atualiza em `fat_ferias`
   - Insere/atualiza parcelas em `fat_ferias_parcelas`

## Estrutura das colunas no Excel

- **Coluna Q (16)**: Matrícula
- **Coluna Y (24)**: Número do processo SEI
- **1ª Parcela**: Z (dias), AA (início), AB (término), AC (livro), AD (SGPOL), AE (Campanha)
- **2ª Parcela**: AF (dias), AG (início), AH (término), AI (livro), AJ (SGPOL), AK (Campanha)
- **3ª Parcela**: AL (dias), AM (início), AN (término), AO (livro), AP (SGPOL), AQ (Campanha)

## Troubleshooting

### Matrículas não encontradas
- Verifique se as matrículas no Excel correspondem às do banco
- O script tenta diferentes formatos (com e sem zeros à esquerda)
- Verifique se a chave `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente

### Erro de encoding
- O script foi ajustado para evitar caracteres especiais que causam problemas no Windows

### Tabela vazia retornada
- Verifique se a chave `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Verifique se há dados na tabela `dim_efetivo` no Supabase
