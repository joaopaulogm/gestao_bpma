# Configurar OAuth Google para vincular conta (Login e Perfil)

Para o botão **"Vincular Conta Google"** funcionar (na tela de login após criar senha e na página **Perfil**), é preciso configurar o Google OAuth e o Supabase.

---

## 1. Google Cloud Console

Projeto: use o mesmo onde está o **Client ID** e **Client Secret** (ex.: `buscaespecies` ou o configurado no Supabase).

### Credenciais → OAuth 2.0 → Cliente OAuth

- **Tipo:** Aplicativo da Web

### URIs de redirecionamento autorizados

Inclua **exatamente**:

```
https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback
```

- Use `https`
- Sem barra no final
- Projeto Supabase: `oiwwptnqaunsyhpkwbrz`

### Origens JavaScript autorizadas

Inclua as origens da sua aplicação, por exemplo:

```
https://gestao-bpma.lovable.app
https://lovable.dev
https://preview--gestao-bpma.lovable.app
http://localhost:5173
http://localhost:8080
http://localhost:8081
```

---

## 2. Supabase Dashboard

### 2.1 Authentication → Providers → Google

- **Enable Sign in with Google:** ligado
- **Client ID:** o mesmo do cliente OAuth no Google Cloud
- **Client Secret:** o mesmo do cliente OAuth no Google Cloud

O Client ID e o Secret devem ser do **mesmo** cliente OAuth em que você colocou o redirect `https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback`.

### 2.2 Authentication → URL Configuration → Redirect URLs

Inclua as URLs para onde o Supabase redireciona após o login com Google:

```
https://gestao-bpma.lovable.app/login
https://gestao-bpma.lovable.app/perfil
https://gestao-bpma.lovable.app/inicio
http://localhost:5173/login
http://localhost:5173/perfil
http://localhost:5173/inicio
```

Ajuste se usar outros domínios ou portas.

---

## 3. Após atualizar Client ID e Client Secret

Se você **alterou o Client ID e/ou o Client Secret** (no Google Cloud ou no Supabase), confira:

1. **Supabase Dashboard → Authentication → Providers → Google**
   - Cole o novo **Client ID** e o novo **Client Secret** (os mesmos do cliente OAuth no Google Cloud).
   - Clique em **Save**.

2. **Google Cloud Console** (no mesmo cliente OAuth)
   - **URIs de redirecionamento:** deve ter `https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback`.
   - **Origens JavaScript:** inclua `https://gestao-bpma.lovable.app` (e `http://localhost:5173` se for testar em local).

3. **Supabase → Authentication → URL Configuration → Redirect URLs**
   - Garanta que existam: `https://gestao-bpma.lovable.app/login`, `.../perfil`, `.../inicio`.

4. **Testar de novo**
   - Feche a aba do app, abra de novo (ou use aba anônima).
   - Opcional: F12 → Application → Local Storage → limpar o site.
   - Tente **Vincular Conta Google** de novo.

**Não é preciso alterar código:** o Client ID e o Secret do **Supabase Auth (Google)** vêm só do Dashboard. O app usa `signInWithOAuth({ provider: 'google' })` e o Supabase usa o que está em **Providers → Google**.

---

## 4. Erros comuns e mensagens no app

O app tenta traduzir erros para algo mais claro:

| Erro / Situação | Possível causa | O que fazer |
|-----------------|----------------|-------------|
| **Redirect URI incorreto no Google** | `redirect_uri_mismatch` | Adicionar em **Google Cloud** o URI: `https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback` |
| **Client ID ou Secret inválidos** | `invalid_client` | Conferir **Supabase → Auth → Providers → Google** (mesmo Client ID/Secret do Google Cloud) |
| **Provedor Google não habilitado** | Provider desativado | Em **Supabase → Auth → Providers → Google**, ativar e salvar |
| **URL de redirecionamento não permitida** | Redirect URL não na lista | Em **Supabase → Auth → URL Configuration → Redirect URLs**, incluir `/login`, `/perfil`, `/inicio` (com o domínio correto) |
| **Acesso negado pelo Google** | `access_denied` | Usuário fechou ou recusou a tela de permissões; tentar de novo e aceitar |

---

## 5. Fluxo do vínculo

1. Usuário clica em **"Vincular Conta Google"** (Login ou Perfil).
2. O app grava `pendingLinkUserRoleId` no `localStorage` e chama `signInWithOAuth({ provider: 'google', options: { redirectTo: '.../login' ou '.../perfil' } })`.
3. O Supabase redireciona para o Google; o usuário autoriza.
4. O Google redireciona para `https://oiwwptnqaunsyhpkwbrz.supabase.co/auth/v1/callback`.
5. O Supabase cria/atualiza a sessão e redireciona para o `redirectTo` (`/login` ou `/perfil`).
6. Na volta, o app lê `pendingLinkUserRoleId`, chama a RPC `vincular_google_user_roles` com `user_id` da sessão e o `user_role_id` pendente.
7. A RPC atualiza `user_roles.user_id` e `user_roles.vinculado_em`.

---

## 6. Conferir após alterar o OAuth

- Limpar o `localStorage` (ou usar aba anônima) e tentar vincular de novo.
- Abrir o **Console (F12)** e ver se aparece algum erro (ex.: `signInWithOAuth (link) error` ou `vincular_google_user_roles error`).
- A mensagem de toast no app deve indicar o tipo de problema (redirect, client, provider, etc.).
