# Relatório de Auditoria — gestao_bpma

**Data:** 23/01/2026  
**Escopo:** Código (TS/TSX), Supabase (tabelas, migrations, types), rotas, Edge Functions, scripts, APIs, dependências e ficheiros órfãos.

---

## Resumo executivo

| Categoria          | Crítico | Alto | Médio | Baixo |
|--------------------|---------|------|-------|-------|
| Segurança          | 2       | 0    | 0     | 1     |
| Edge Functions     | 4       | 3    | 2     | 1     |
| Scripts            | 1       | 2    | 3     | 2     |
| Código / Rotas     | 1       | 2    | 2     | 1     |
| Base de dados      | 1       | 1    | 0     | 1     |

**Build:** compila com sucesso. Avisos: `browserslist` desatualizado; chunks >500KB (xlsx, jspdf-autotable, DashboardAtropelamentos).

---

## 1. SEGURANÇA

### 1.1 [CRÍTICO] Chave `service_role` em código

| Ficheiro | Linha | Descrição |
|----------|-------|-----------|
| `scripts/executar-migrations-auto.ts` | 10 | Fallback `process.env.SUPABASE_SERVICE_ROLE_KEY \|\| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` — chave em texto plano. |

**Solução:** Remover o fallback. Usar apenas `process.env.SUPABASE_SERVICE_ROLE_KEY` e terminar com erro se não estiver definida (como em `run-migration-estatisticas.ts`).

---

### 1.2 [CRÍTICO] URL Supabase hardcoded

| Ficheiro | Linha | Descrição |
|----------|-------|-----------|
| `scripts/executar-migrations-auto.ts` | 9 | `SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co"` |
| `scripts/run-migration-estatisticas.ts` | 5 | Idem |
| `src/lib/adminPessoasApi.ts` | 6 | `import.meta.env.VITE_SUPABASE_URL \|\| 'https://...'` — fallback fixo |

**Solução:** Usar `process.env.SUPABASE_URL` ou `import.meta.env.VITE_SUPABASE_URL` sem fallback para URLs de produção. Em scripts, exigir variável de ambiente.

---

### 1.3 [BAIXO] Uso de `(supabase as any).rpc()` e `supabase as any`

Vários ficheiros (`Login.tsx`, `Perfil.tsx`, `NotificationsPopover.tsx`, `dashboardStatisticsService.ts`) usam `(supabase as any).rpc(...)`, o que contorna a tipagem e pode esconder erros.

**Solução:** Incluir as RPC em `supabase/types` (ou no client tipado) e remover `as any`.

---

## 2. EDGE FUNCTIONS — causas de falha e correções

### 2.1 [CRÍTICO] `get-google-maps-token` / `get-mapbox-token`

**Problema:** Dependem de variáveis de ambiente que provavelmente não estão definidas no projeto Supabase:

- `get-google-maps-token`: `GOOGLE_MAPS_API_KEY`
- `get-mapbox-token`: `MAPBOX_PUBLIC_TOKEN`

**Solução:**

1. Supabase Dashboard → Project Settings → Edge Functions → Secrets: definir `GOOGLE_MAPS_API_KEY` e `MAPBOX_PUBLIC_TOKEN`.
2. Ou, em desenvolvimento, usar `.env` / `supabase/.env` e `supabase functions serve` com `--env-file`.

---

### 2.2 [CRÍTICO] `parse-rap` / `identify-species` / `process-os-folder` / `process-raps-folder`

**Problema:** Dependem de `LOVABLE_API_KEY` e, nos que usam Google Drive/Sheets, de credenciais Google:

- `parse-rap`, `identify-species`: `LOVABLE_API_KEY` (Lovable AI).
- `process-os-folder`: `LOVABLE_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.
- `process-raps-folder`: `LOVABLE_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.
- `sync-afastamentos-sheets`: `GOOGLE_SERVICE_ACCOUNT_JSON`.

**Solução:**

1. Definir os secrets no Supabase (Edge Function secrets / variáveis).
2. `LOVABLE_API_KEY`: obter no dashboard Lovable e configurar; se a app não for Lovable, substituir por outro provedor de IA e adaptar o código.
3. Google: OAuth (client/secret/refresh) ou Service Account (JSON) conforme a função.

---

### 2.3 [CRÍTICO] `sync-species` — tabelas inexistentes

**Problema:** A função usa:

- `from('fauna')` com `id, nome_popular, id_dim_especie_fauna`
- `from('flora')` com `id, nome_popular, id_dim_especie_flora`

Não existem tabelas `fauna` e `flora` nas migrations. Existem `dim_especies_fauna`, `dim_especies_flora`, `fat_crime_fauna`, `fat_crime_flora`, etc.

**Solução:** Reescrever `sync-species` para ler/atualizar a partir de `dim_especies_fauna` e `dim_especies_flora` (e, se aplicável, `fat_registros_de_resgate` / vistas que exponham `nome_popular` e `id_dim_especie_*`), em vez de `fauna` e `flora`.

---

### 2.4 [ALTO] `auto-images` — filtro `.or().or()` incorreto

**Problema:** Em `auto-images/index.ts` (aprox. 222–227):

```ts
.or(hasNoImagesFilter)
.or('imagens_status.is.null,imagens_status.eq.pendente')
.not('imagens_status', 'in', '("nao_encontrado","erro")')
```

Em PostgREST, o segundo `.or()` substitui o primeiro. Acaba a aplicar só a condição de `imagens_status`; a de “sem imagens” deixa de ser aplicada, podendo processar espécies que já têm imagens.

**Solução:** Unificar numa única expressão `or` ou usar `and` com duas `or` bem construídas. Exemplo de intenção:

- “(imagens is null OR imagens = '[]' OR imagens = '{}') AND (imagens_status is null OR imagens_status = 'pendente')”

Ajustar a string do `.or()` ou a cadeia de filtros para refletir essa lógica (conforme a API do Supabase/PostgREST).

---

### 2.5 [ALTO] `analyze-data` — nunca invocada + fallback `processDataInDeno` com schema errado

**Problema:**

1. Nenhum ficheiro no `src` chama `analyze-data`. A função está órfã.
2. O fallback `processDataInDeno` assume em `fat_registros_de_resgate` colunas como `origem`, `classe_taxonomica`, `destinacao`, `desfecho_apreensao`, `nome_popular`, `quantidade`, `atropelamento`. O modelo real usa FKs (`origem_id`, `especie_id`, `destinacao_id`, etc.) e nomes diferentes.

**Solução:**

1. Se a análise for usada: passar a invocar `analyze-data` a partir do front (ex. dashboard) e documentar o contrato (body, filtros ano/mês).
2. Reescrever `processDataInDeno` para usar `fat_registros_de_resgate` com os joins necessários (ex. `dim_origem`, `dim_especies_fauna`, `dim_destinacao`, `dim_desfecho_*`) e os nomes de colunas corretos.
3. Se a R API (`R_API_URL`) for descontinuada, remover ou tornar opcional e confiar só no fallback corrigido.

---

### 2.6 [ALTO] `get-drive-image` — órfã

**Problema:** Nenhum componente ou serviço no `src` invoca `get-drive-image`. Requer `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.

**Solução:** Se for necessária: integrar nas telas que precisam de imagens do Drive (ex. espécies, RAP) e configurar as variáveis. Caso contrário: remover ou desativar a função.

---

### 2.7 [MÉDIO] `buscar-imagens-especies` — parâmetro `search` em Storage

**Problema:** Usa `supabase.storage.from(bucket).list('', { limit: 100, search: searchTerm })`. A API do Storage pode não expor `search` em todas as versões/ambientes.

**Solução:** Confirmar na documentação e no `@supabase/supabase-js`/`@supabase/storage-js` da versão em uso. Se `search` não existir: listar com `limit`/`offset` e filtrar por `file.name` no JavaScript.

---

### 2.8 [MÉDIO] `refresh-dashboard-views` — só por cron; RPC `refresh_pending_views`

**Problema:** A função não é chamada pelo front; depende de cron (Supabase ou externo). Se `refresh_pending_views` não existir ou falhar, a função retorna 500.

**Solução:**

1. Garantir que a migration que cria `refresh_pending_views` está aplicada.
2. Documentar e configurar o cron (ex. Supabase pg_cron ou GitHub Actions).
3. Opcional: botão no dashboard “Atualizar vistas” que chama esta Edge Function para uso sob demanda.

---

### 2.9 [MÉDIO] `admin-pessoas` — `getUser(token)`

**Problema:** Usa `anonClient.auth.getUser(token)`. Em `@supabase/supabase-js` v2, `getUser(jwt?)` aceita JWT. Se a API mudar ou o token for inválido, a verificação de admin falha.

**Solução:** Manter e testar com JWT real. Se houver mudança de API, trocar para `getUser({ jwt: token })` ou o que a versão instalada exigir. A coluna `user_roles.user_id` está alinhada com `auth.uid()`.

---

### 2.10 [BAIXO] CORS e origens

Várias funções limitam origens a `lovable.dev`, `lovable.app`, `localhost`. Se a app for publicada noutro domínio, pode haver bloqueio.

**Solução:** Usar variável de ambiente (ex. `ALLOWED_ORIGINS`) ou incluir os domínios de produção na lista e evitar `*` em produção.

---

## 3. SCRIPTS — motivos de falha e correções

### 3.1 [CRÍTICO] `scripts/executar-migrations-auto.ts`

- Chave `service_role` em fallback (ver 1.1).
- Depende de `exec_sql`; se não existir, o script avisa mas a execução fica incompleta.
- Supabase URL hardcoded (ver 1.2).

**Solução:** Remover fallback da chave; ler `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` de `process.env`; garantir que `scripts/criar-funcao-exec-sql.sql` (ou equivalente) foi aplicado antes.

---

### 3.2 [ALTO] `scripts/run-migration-estatisticas.ts`

- Usa `supabase.rpc('exec_sql', { sql_query })` e, em fallback, `fetch` para `/rest/v1/rpc/exec_sql` e depois tenta `from('_migrations')` como “teste” — esse fluxo não executa o SQL das migrations.
- Split por `;` pode quebrar SQL em strings ou blocos `$$`.

**Solução:** Executar as migrations via Supabase CLI (`supabase db push`) ou pelo SQL Editor do Dashboard. Se for manter script: usar um parser de SQL mais robusto ou ficheiros já partidos (um comando por ficheiro) e documentar que `exec_sql` é obrigatório.

---

### 3.3 [ALTO] `scripts/analyze_excel.py`

- Caminho fixo: `excel_path = r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx'`.
- Depende de `pandas` e `openpyxl`; não há `requirements.txt` em `scripts/`.

**Solução:** Receber o caminho por argumento (`sys.argv`) ou variável de ambiente. Criar `scripts/requirements.txt` com `pandas`, `openpyxl` e documentar `pip install -r requirements.txt`.

---

### 3.4 [MÉDIO] Scripts Python (`analyze_excel*.py`, `process_excel_to_supabase.py`, `generate_sql*.py`, `corrigir_duplicatas*.py`, etc.)

- Dependem de `pandas`, `openpyxl`, possivelmente `requests` ou cliente Supabase; não há `requirements.txt` único para scripts.
- Caminhos e IDs de projeto podem estar fixos.

**Solução:** `scripts/requirements.txt`; usar `argparse` ou `os.environ` para paths, URLs e chaves; `README` em `scripts/` com exemplos de uso.

---

### 3.5 [MÉDIO] Scripts TS em `scripts/` (`criar-funcao-e-executar.ts`, `verificar-e-executar.ts`, `executar-sincronizacao-user-roles.ts`)

- Dependem de `SUPABASE_SERVICE_ROLE_KEY` e, em alguns, de `SUPABASE_URL`.
- Podem depender de `exec_sql` ou de funções RPC que precisam existir no projeto.

**Solução:** Documentar variáveis obrigatórias; garantir que as migrations e RPCs usadas existem; preferir `tsx scripts/...` e um `package.json` com scripts tipados.

---

### 3.6 [MÉDIO] `src/scripts/` (`sync-inaturalist-images.ts`, `run-migration-repteis.ts`, `remove-anilius-scytale.ts`, `remove-liophis-typhlus.ts`)

- Dependem de `@supabase/supabase-js` e variáveis de ambiente.
- Podem referir tabelas/colunas que mudaram.

**Solução:** Revisar imports e chamadas ao Supabase; ajustar para o schema atual; documentar em `src/scripts/README-*.md` ou no README principal.

---

### 3.7 [BAIXO] `scripts/README_MIGRATIONS.md`

- Menciona `run-migration-estatisticas` e ficheiros de migration; parte do conteúdo pode estar desatualizada face aos scripts e à estrutura de pastas.

**Solução:** Atualizar o README com os nomes corretos dos ficheiros, da `exec_sql` e da forma recomendada de rodar (CLI vs SQL Editor vs script).

---

## 4. CÓDIGO E ROTAS

### 4.1 [CRÍTICO] Rota duplicada em `App.tsx`

- Linha 126:  
  `path="/secao-operacional/registros-unificados"` → `<Navigate to="/secao-operacional/registros" replace />`
- Linha 136:  
  `path="/secao-operacional/registros-unificados"` → `<RegistrosUnificados />`

A primeira definição prevalece; a rota que renderiza `RegistrosUnificados` não é usada.

**Solução:** Remover a rota da linha 136. Manter apenas o redirect em 126 (ou, se a intenção for mostrar `RegistrosUnificados` em `/registros-unificados`, remover o redirect e manter só o componente).

---

### 4.2 [ALTO] `Registros` vs `RegistrosUnificados`

- `App.tsx` não declara `/registros` nem `/secao-operacional/registros-resgates` como rota que renderiza a página antiga `Registros`; `Registros` é importado mas a rota única de registros é `RegistrosUnificados` em `/secao-operacional/registros`. Possível código morto.

**Solução:** Se `Registros` não for usado em nenhuma rota, remover o import e a referência. Caso contrário, definir a rota explícita.

---

### 4.3 [ALTO] Chunks grandes no build

- `xlsx`, `jspdf.plugin.autotable`, `DashboardAtropelamentos` geram chunks >500KB.

**Solução:**  
- `import()` dinâmico para `xlsx` e `jspdf`/autotable onde forem usados.  
- Para `DashboardAtropelamentos`, considerar lazy load (já em lazy de páginas) e divisão de subcomponentes ou de bibliotecas de gráficos.  
- Ajustar `build.rollupOptions.output.manualChunks` no `vite.config.ts` se necessário.

---

### 4.4 [MÉDIO] `Dashboard.tsx` vs `Index.tsx` e dashboards

- Há `DashboardOperacional`, `DashboardPublico`, `Index` e possivelmente `Dashboard`; alguma sobreposição ou nomes confusos.

**Solução:** Mapear quais são as páginas efetivamente usadas nas rotas e renomear ou remover as não usadas para evitar confusão.

---

### 4.5 [MÉDIO] Uso de `supabase as any` e RPCs não tipadas

Já referido em 1.3. Afeta manutenção e refatoração.

**Solução:** Atualizar `supabase/types` (ou o client) com as RPCs e remover `as any`.

---

### 4.6 [BAIXO] `browserslist` desatualizado

Aviso: “browsers data (caniuse-lite) is 16 months old”.

**Solução:** `npx update-browserslist-db@latest` ou atualizar `caniuse-lite`/`browserslist` no projeto.

---

## 5. BASE DE DADOS

### 5.1 [CRÍTICO] Tabelas `fauna` e `flora` usadas em `sync-species`

Não existem tabelas `fauna` e `flora` no schema (apenas `dim_especies_fauna`, `dim_especies_flora`, `fat_crime_fauna`, `fat_crime_flora`). A Edge Function `sync-species` quebra ao ser invocada.

**Solução:** Como em 2.3: alterar `sync-species` para usar `dim_especies_fauna` e `dim_especies_flora` (e lógica de negócio compatível).

---

### 5.2 [ALTO] `analyze-data` e schema de `fat_registros_de_resgate`

O fallback `processDataInDeno` assume colunas que não existem nessa forma em `fat_registros_de_resgate`.

**Solução:** Como em 2.5: adaptar `processDataInDeno` ao schema real e aos joins necessários.

---

### 5.3 [BAIXO] `admin-pessoas` e `onConflict` em `fat_restricoes` / `fat_licencas_medicas`

- `fat_restricoes`: `onConflict: "efetivo_id,ano,tipo_restricao,data_inicio,data_fim_norm"`.
- `fat_licencas_medicas`: `onConflict: "efetivo_id,data_inicio,data_fim_norm"`.

`data_fim_norm` é coluna gerada. O upsert que insere `data_fim_norm` explicitamente pode conflitar com a definição `GENERATED`. Migrations mais recentes (ex. `20260121022049`) removem `data_fim_norm` dos inserts; `admin-pessoas` não envia `data_fim_norm` no corpo, apenas no `onConflict`, o que é aceitável. Vale confirmar em corrida de testes que o upsert funciona.

**Solução:** Testes de integração para `restricao_upsert` e `licenca_upsert`; se alguma migration tiver recriado `data_fim_norm` como não gerada, alinhar `admin-pessoas` com a definição atual.

---

## 6. DEPENDÊNCIAS E CONFIG

### 6.1 [MÉDIO] `package.json` — scripts que dependem de `exec_sql`

- `migrate-estatisticas`, `executar-migrations-auto`, `sincronizar-user-roles` podem depender de `exec_sql` ou de RPCs que nem todos os projetos têm.

**Solução:** Na documentação, indicar que é necessário aplicar antes as migrations que criam `exec_sql` e as funções usadas. Opcional: verificar existência de `exec_sql` no arranque do script e falhar com mensagem clara.

---

### 6.2 [MÉDIO] Dependências só em `devDependencies` ou em `dependencies`

- `@playwright/test` em `dependencies`; costuma ser `devDependency` se os testes não rodam em produção.

**Solução:** Mover `@playwright/test` para `devDependencies` se não for usado em runtime.

---

## 7. FICHEIROS E DOCS

### 7.1 [MÉDIO] Documentos de instrução temporários

- Vários `.md` na raiz: `APLICAR_CORRECOES_SUPABASE.md`, `EXECUTAR_AGORA.md`, `EXECUTAR_AUTOMATICO.md`, `EXECUTAR_MIGRATION2_PARTES.md`, `EXECUTAR_SINCRONIZACAO_USER_ROLES.md`, `FIX_TYPESCRIPT_ERRORS.md`, `INSTRUCOES_*.md`, `CORRECAO_RLS.md`, `SOLUCAO_RAPIDA_RLS.md`, etc.

**Solução:** Consolidar em `docs/` ou num único “Runbook / Ops” e eliminar duplicados. Manter na raiz só o que for essencial (ex. `README.md`, `CHANGELOG`, `SECURITY`).

---

### 7.2 [BAIXO] `test-edge-function.js` na raiz

- Ficheiro de teste manual; pode conter URLs ou chaves.

**Solução:** Mover para `scripts/` ou `tests/` e garantir que não está em repositório com segredos. Adicionar a `.gitignore` se for apenas local.

---

## 8. PLANO DE AÇÃO (prioridade)

### Fase 1 — Segurança e quebras (1–2 dias)

1. **Remover chave e URL hardcoded em `scripts/executar-migrations-auto.ts`** (1.1, 1.2).
2. **Remover fallback de URL em `adminPessoasApi.ts`** e usar só `VITE_SUPABASE_URL` (1.2).
3. **Corrigir rota duplicada em `App.tsx`** (4.1): remover a rota duplicada de `registros-unificados`.

### Fase 2 — Edge Functions (2–3 dias)

4. **Configurar secrets no Supabase** para:  
   `GOOGLE_MAPS_API_KEY`, `MAPBOX_PUBLIC_TOKEN`, `LOVABLE_API_KEY`, credenciais Google (OAuth e/ou Service Account), conforme as funções em uso (2.1, 2.2).
5. **Reescrever `sync-species`** para usar `dim_especies_fauna` e `dim_especies_flora` em vez de `fauna` e `flora` (2.3, 5.1).
6. **Corrigir filtro em `auto-images`** (2.4): unificar `.or()` / `.and()` conforme o schema e a intenção.
7. **Decidir sobre `analyze-data` e `get-drive-image`** (2.5, 2.6): integrar e corrigir `processDataInDeno` e o schema, ou desativar/remover.

### Fase 3 — Scripts (1–2 dias)

8. **`scripts/requirements.txt`** para Python e uso em `analyze_excel*.py` e afins (3.2, 3.3, 3.4).
9. **Parametrizar caminhos e config** em `analyze_excel.py` e noutros scripts (3.3, 3.4).
10. **Revisar `run-migration-estatisticas.ts` e `executar-migrations-auto.ts`**: dependência de `exec_sql`, divisão de SQL e documentação (3.1, 3.2, 6.1).

### Fase 4 — Código e DB (1–2 dias)

11. **Tipar RPCs e remover `(supabase as any).rpc`** (1.3, 4.5).
12. **Remover ou rotear `Registros`** se estiver morto (4.2).
13. **Reduzir chunks do build** com dynamic import e, se fizer sentido, `manualChunks` (4.3).
14. **Atualizar `browserslist`** (4.6).

### Fase 5 — Limpeza e docs (0,5–1 dia)

15. **Reorganizar `.md` de instruções** em `docs/` ou runbook único (7.1).
16. **Mover/ignorar `test-edge-function.js`** (7.2).
17. **Documentar** no README ou em `docs/`: secrets das Edge Functions, variáveis de scripts, e forma recomendada de correr migrations e scripts de sync/estatísticas.

---

## 9. CHECKLIST RÁPIDO — Edge Functions

| Função                    | Invocada no front? | Env / Secrets em falta provável      | Outros problemas                    |
|---------------------------|--------------------|--------------------------------------|-------------------------------------|
| get-google-maps-token     | Sim                | GOOGLE_MAPS_API_KEY                  | —                                   |
| get-mapbox-token          | Sim                | MAPBOX_PUBLIC_TOKEN                  | —                                   |
| auto-images               | Sim                | —                                    | Filtro .or().or() (2.4)             |
| parse-rap                 | Sim                | LOVABLE_API_KEY                      | —                                   |
| identify-species          | Sim                | LOVABLE_API_KEY                      | —                                   |
| process-os-folder         | Sim                | LOVABLE_API_KEY, Google OAuth        | —                                   |
| process-raps-folder       | Sim                | LOVABLE_API_KEY, Google OAuth        | —                                   |
| sync-afastamentos-sheets  | Sim                | GOOGLE_SERVICE_ACCOUNT_JSON          | —                                   |
| sync-species              | Sim (syncService)  | —                                    | Tabelas fauna/flora inexistentes    |
| buscar-imagens-especies   | Sim                | —                                    | Verificar suporte a `search` (2.7)  |
| admin-pessoas             | Sim (adminPessoasApi) | —                                  | —                                   |
| refresh-dashboard-views   | Não (cron)         | —                                    | Depende de `refresh_pending_views`  |
| analyze-data              | Não                | R_API_URL (opcional)                 | processDataInDeno com schema errado |
| get-drive-image           | Não                | Google OAuth                         | Órfã                                |

---

## 10. CHECKLIST RÁPIDO — Scripts

| Script                           | Dependências principais        | Problemas típicos                          |
|----------------------------------|--------------------------------|--------------------------------------------|
| executar-migrations-auto.ts      | exec_sql, SUPABASE_*           | Chave/URL hardcoded, exec_sql              |
| run-migration-estatisticas.ts    | exec_sql, SUPABASE_*           | Lógica de execução e fallback frágeis      |
| analyze_excel.py                 | pandas, openpyxl               | Caminho fixo, sem requirements             |
| process_excel_to_supabase.py     | pandas, openpyxl, supabase?    | Idem                                       |
| generate_sql*.py                 | —                              | Possíveis paths/IDs fixos                  |
| executar-sincronizacao-user-roles.ts | SUPABASE_*, RPCs           | Depende de RPCs e roles no DB              |
| sync-inaturalist-images.ts (src/scripts) | @supabase/supabase-js, env | Schema e env podem ter mudado              |

---

*Fim do relatório. Para aplicar as correções, siga o plano de ação por fases e use os números das secções e dos itens como referência.*
