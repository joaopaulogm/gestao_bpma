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
| `GOOGLE_SERVICE_ACCOUNT_JSON` | sync-afastamentos-sheets, **sync-radio-operador** | JSON da Service Account (Google Sheets) |

## Automáticos (Supabase)

Estes são definidos pelo Supabase e não precisam ser criados:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## sync-radio-operador (Controle de Ocorrências)

| Secret/Env | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Sim | JSON da Service Account com acesso à planilha Google Sheets |
| `SPREADSHEET_ID` | Não | ID da planilha (padrão: 16xtQDV3bppeJS_32RkXot4TyxaVPCA2nVqUXP8RyEfl) |
| `RESGATE_GID` | Não | gid da aba Resgate (padrão: 0) |
| `CRIMES_GID` | Não | gid da aba Crimes Ambientais (padrão: 646142210) |

**Como obter a Service Account:** Google Cloud Console → APIs & Services → Credentials → Create Service Account → Download JSON. Compartilhe a planilha com o e-mail da service account (ex: `xxx@projeto.iam.gserviceaccount.com`).

## Opcionais

| Variável | Função | Descrição |
|----------|--------|-----------|
| `R_API_URL` | analyze-data | URL da API em R (análise de dados); se vazia, usa fallback em Deno |
| `ALLOWED_ORIGINS` | (futuro) | Origens CORS adicionais; hoje as funções usam lista fixa (lovable.dev, localhost, etc.) |

## Como configurar Google OAuth

### Arquivos de credenciais

Você possui dois arquivos JSON com credenciais do Google OAuth:

1. **`credentials.json`** - Projeto "buscaespecies" (configurado para Supabase)
   - Use este arquivo para configurar o OAuth no Supabase Dashboard
   - Contém `client_id` e `client_secret` necessários

2. **`chave secreta auth plataform.json`** - Projeto "bpma-480620"
   - Credenciais alternativas (se necessário)

### Extrair valores dos arquivos JSON

Do arquivo `credentials.json`:
- **GOOGLE_CLIENT_ID**: `web.client_id` → `26282009322-6l59ltfic13fipnbpqk4tlv7elfa8r8e.apps.googleusercontent.com`
- **GOOGLE_CLIENT_SECRET**: `web.client_secret` → `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`

Do arquivo `chave secreta auth plataform.json`:
- **GOOGLE_CLIENT_ID** (alternativo): `web.client_id` → `1040541360632-hu7plf69ckngfrqhsiq2uc8ocjbj9gja.apps.googleusercontent.com`
- **GOOGLE_CLIENT_SECRET** (alternativo): `web.client_secret` → `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`

### Configurar no Supabase Dashboard

1. Acesse: **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Adicione os seguintes secrets:
   - **GOOGLE_CLIENT_ID**: Use o valor de `web.client_id` do `credentials.json`
   - **GOOGLE_CLIENT_SECRET**: Use o valor de `web.client_secret` do `credentials.json`
   - **GOOGLE_REFRESH_TOKEN**: Obtenha este token após autorizar a aplicação (veja abaixo)

### Obter GOOGLE_REFRESH_TOKEN

O refresh token é obtido após o primeiro fluxo OAuth. Você pode:

1. Usar uma ferramenta como [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Ou executar um script de autenticação que gera o refresh token
3. Ou usar a Edge Function `get-drive-image` que pode gerar o token na primeira execução

### Configurar OAuth no Google Cloud Console

Certifique-se de que no Google Cloud Console (projeto "buscaespecies"):
- **Redirect URIs** incluem: `https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback`
- **JavaScript origins** incluem: `https://oiwwptnqaunsyhpkwbrz.supabase.co`

## Exemplo de `.env` local (supabase/.env)

```env
GOOGLE_MAPS_API_KEY=...
LOVABLE_API_KEY=...
GOOGLE_CLIENT_ID=26282009322-6l59ltfic13fipnbpqk4tlv7elfa8r8e.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REFRESH_TOKEN=...
# GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

**Nota:** `GOOGLE_SERVICE_ACCOUNT_JSON` é um JSON em uma única linha. No Dashboard, crie o secret com o valor completo do JSON.

**⚠️ IMPORTANTE:** Nunca commite os arquivos `credentials.json` ou `chave secreta auth plataform.json` no repositório. Eles estão no `.gitignore`.
