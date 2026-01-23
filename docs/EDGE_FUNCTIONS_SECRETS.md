# Secrets e variáveis para Edge Functions (Supabase)

Configure estes secrets no **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**. Em desenvolvimento local, use `supabase functions serve --env-file .env` com um `.env` na pasta `supabase/` (não commitar).

## Obrigatórios (funções em uso)

| Secret | Função(ões) | Descrição |
|--------|-------------|-----------|
| `GOOGLE_MAPS_API_KEY` | get-google-maps-token | Chave da API Google Maps (Mapas e Google Earth) |
| `LOVABLE_API_KEY` | parse-rap, identify-species, process-os-folder, process-raps-folder | Chave da API Lovable AI (se a app usar Lovable) |
| `GOOGLE_CLIENT_ID` | process-os-folder, process-raps-folder, get-drive-image | OAuth Google: Client ID |
| `GOOGLE_CLIENT_SECRET` | process-os-folder, process-raps-folder, get-drive-image | OAuth Google: Client Secret |
| `GOOGLE_REFRESH_TOKEN` | process-os-folder, process-raps-folder, get-drive-image | OAuth Google: Refresh Token |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | sync-afastamentos-sheets | JSON da Service Account (Google Sheets) |

## Automáticos (Supabase)

Estes são definidos pelo Supabase e não precisam ser criados:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Opcionais

| Variável | Função | Descrição |
|----------|--------|-----------|
| `R_API_URL` | analyze-data | URL da API em R (análise de dados); se vazia, usa fallback em Deno |
| `ALLOWED_ORIGINS` | (futuro) | Origens CORS adicionais; hoje as funções usam lista fixa (lovable.dev, localhost, etc.) |

## Exemplo de `.env` local (supabase/.env)

```env
GOOGLE_MAPS_API_KEY=...
LOVABLE_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
# GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

**Nota:** `GOOGLE_SERVICE_ACCOUNT_JSON` é um JSON em uma única linha. No Dashboard, crie o secret com o valor completo do JSON.
