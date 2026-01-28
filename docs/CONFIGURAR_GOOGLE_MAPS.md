# Como Configurar Google Maps API

## Problema
Erro: "Esta página não carregou o Google Maps corretamente"

## Solução

### Passo 1: Obter/Criar Chave da API Google Maps

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto correto (ou crie um novo)
3. Vá em **APIs & Services** → **Library**
4. Procure e habilite as seguintes APIs:
   - ✅ **Maps JavaScript API** (obrigatória)
   - ✅ **Places API** (obrigatória - usada para geocodificação)
   - ✅ **Geocoding API** (recomendada)

### Passo 2: Criar Chave da API

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **API Key**
3. Copie a chave gerada
4. **IMPORTANTE**: Clique na chave criada para editá-la e configure:

   **Application restrictions:**
   - Selecione **HTTP referrers (web sites)**
   - Adicione os seguintes domínios:
     ```
     https://gestao-bpma.lovable.app/*
     https://*.lovable.app/*
     https://*.lovableproject.com/*
     https://lovable.dev/*
     http://localhost:*
     ```
   
   **API restrictions:**
   - Selecione **Restrict key**
   - Marque apenas:
     - Maps JavaScript API
     - Places API
     - Geocoding API

### Passo 3: Configurar no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Project Settings** → **Edge Functions** → **Secrets**
4. Clique em **Add new secret**
5. Configure:
   - **Name**: `GOOGLE_MAPS_API_KEY`
   - **Value**: Cole a chave da API que você copiou no Passo 2
6. Clique em **Save**

### Passo 4: Verificar Edge Function

A Edge Function `get-google-maps-token` já está configurada para aceitar o domínio `gestao-bpma.lovable.app`. Você pode verificar os logs:

1. No Supabase Dashboard, vá em **Edge Functions** → **get-google-maps-token**
2. Verifique os logs para ver se há erros

### Passo 5: Testar

1. Recarregue a página `https://gestao-bpma.lovable.app/mapa-localizacao`
2. O mapa deve carregar corretamente
3. Se ainda houver erro, verifique:
   - Console do navegador (F12) para ver mensagens de erro
   - Logs da Edge Function no Supabase Dashboard

## Troubleshooting

### Erro: "Google Maps API key not configured"
- Verifique se o secret `GOOGLE_MAPS_API_KEY` está configurado no Supabase Dashboard
- Aguarde alguns minutos após configurar (pode levar tempo para propagar)

### Erro: "This page didn't load Google Maps correctly"
- Verifique se os domínios estão autorizados no Google Cloud Console
- Verifique se as APIs estão habilitadas (Maps JavaScript API, Places API)
- Verifique se não há restrições de IP bloqueando o acesso

### Erro: "RefererNotAllowedMapError"
- Adicione o domínio exato na lista de HTTP referrers no Google Cloud Console
- Use o formato: `https://gestao-bpma.lovable.app/*` (com o `/*` no final)

### A chave funciona em localhost mas não em produção
- Verifique se o domínio de produção está na lista de HTTP referrers
- Domínios do Lovable precisam estar autorizados: `*.lovable.app` e `*.lovableproject.com`

## Verificação Rápida

Execute no console do navegador (F12) na página do mapa:

```javascript
// Verificar se a Edge Function retorna a chave
fetch('https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/get-google-maps-token', {
  headers: {
    'Authorization': 'Bearer SEU_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log)
```

Se retornar `{ token: "..." }`, a Edge Function está funcionando.
Se retornar erro, verifique o secret no Supabase Dashboard.
