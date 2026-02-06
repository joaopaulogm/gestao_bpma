# Carregar tabelas fato e dimensão do Rádio Operador

As duas abas (Resgates de Fauna e Crimes Ambientais) têm tabelas fato e dimensão criadas. Os dados **não** são carregados automaticamente: é preciso rodar a função após a sincronização.

## Tabelas criadas

### Dimensões (compartilhadas)
- `dim_equipe_radio` – equipes (ALFA, BRAVO, CHARLIE, …)
- `dim_fauna_tipo_radio` – tipo de fauna (SARUÊ, ARARA, AVE, …)
- `dim_desfecho_resgate_radio` – desfecho (RESGATADO, EVADIDO, VIDA LIVRE, …)
- `dim_destinacao_radio` – destinação (SEM DESTINAÇÃO, HFAUS, SOLTURA, …)

### Fato
- `fat_ocorrencias_resgate_fauna_2026` – linhas da aba **Resgates de Fauna** (data em ano, mês, dia)
- `fat_ocorrencias_crimes_ambientais_2026` – linhas da aba **Crimes Ambientais**

## Importar a partir do ficheiro local (xlsx ou CSV)

Se quiser carregar a partir do ficheiro **2026 - CONTROLE DE OCORRÊNCIAS - BPMA.xlsx** (ou do CSV) em vez da planilha Google:

1. Aplicar a migration que cria a função de importação: `20260207130000_radio_operador_import_sheet_function.sql`.
2. No projeto, com `.env` com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (ou `VITE_SUPABASE_*`), executar:

   ```bash
   npm run seed-radio-operador
   ```
   ou, com caminho explícito:

   ```bash
   npx tsx scripts/seed_radio_operador_from_xlsx.ts "public/2026 - CONTROLE DE OCORRÊNCIAS - BPMA.xlsx"
   ```

   O script lê cada aba do xlsx (linha 1 = cabeçalho, linhas 2+ = dados) e insere em `radio_operador_data`, substituindo os dados dessa aba.
3. Em seguida, executar `SELECT * FROM public.popula_fat_radio_operador();` para popular as tabelas fato e dimensão.

## Passos para ter dados nas fatos/dimensões

1. **Sincronizar a planilha** (Google) **ou importar do xlsx/CSV** (acima)  
   Na página `/radio-operador`, clicar em **“Atualizar agora”** (ou chamar a Edge Function `sync-radio-operador`). Isso preenche `radio_operador_data` com as duas abas.

2. **Popular as tabelas fato e dimensão**  
   No SQL Editor do Supabase (ou via `psql`), executar:

   ```sql
   SELECT * FROM public.popula_fat_radio_operador();
   ```

   A função:
   - limpa as duas tabelas fato;
   - lê todas as linhas de dados de `radio_operador_data` (onde `row_index > 1` e sem `_headers`);
   - preenche as dimensões (equipe, fauna, desfecho, destinação) com `ON CONFLICT DO NOTHING`;
   - insere em `fat_ocorrencias_resgate_fauna_2026` para a aba “Resgates de Fauna”;
   - insere em `fat_ocorrencias_crimes_ambientais_2026` para a aba “Crimes Ambientais”.

   O retorno é uma linha com: `inserted_resgates`, `inserted_crimes`, `dim_equipe`, `dim_fauna`, `dim_desfecho`, `dim_destinacao`.

## Quando executar

- Depois da primeira sincronização.
- Sempre que quiser “replicar” o conteúdo de `radio_operador_data` para as tabelas fato/dimensão (a função faz `TRUNCATE` nas fatos e repopula).

A página `/radio-operador` continua a ler de `radio_operador_data` para exibir os cards. Se no futuro a página passar a usar as fatos, basta alterar as queries para `fat_ocorrencias_resgate_fauna_2026` e `fat_ocorrencias_crimes_ambientais_2026`.
