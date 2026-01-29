# Relatório de Auditoria do Repositório

Realizei uma análise abrangente do repositório e identifiquei os seguintes erros, bugs e pontos de atenção:

## 🚨 Bugs Críticos e Erros de Lógica

### 1. Limite de 1000 Usuários no Login (Critical)

**Arquivo:** `supabase/functions/sync-auth-password/index.ts`
**Linha 94:** `page: 1, perPage: 1000`
**Descrição:** A função que sincroniza senhas busca todos os usuários do Supabase Auth para verificar se o usuário já existe. Ela faz isso listando apenas a **página 1** com **1000** resultados.
**Consequência:** Quando a aplicação tiver mais de 1001 usuários, qualquer usuário que esteja "no final" da lista não será encontrado. A função tentará criar um novo usuário (`admin.createUser`) e falhará com erro de "Email already exists", **impedindo o login** dessas pessoas.
**Solução Recomendada:** Utilizar `supabase.auth.admin.getUserByEmail(email)` em vez de `listUsers`, ou implementar paginação correta.

## 🔒 Riscos de Segurança

### 2. E-mails de Admin "Hardcoded" no Frontend

**Arquivo:** `src/contexts/AuthContext.tsx`
**Linha 46:** `if (emailLower === 'soi.bpma@gmail.com' || emailLower === 'joaopaulogm@gmail.com')`
**Descrição:** As regras de administrador estão fixas no código do frontend.
**Risco:** Se o e-mail mudar ou novos admins precisarem ser adicionados, exige recompilação do código. Além disso, expõe quem são os admins no código fonte cliente.
**Solução:** Gerenciar permissões apenas via tabela `user_roles` no banco de dados.

### 3. Funções Edge sem Verificação de JWT

**Arquivo:** `supabase/config.toml`
**Descrição:** Várias funções estão marcadas com `verify_jwt = false`, incluindo `sync-auth-password`, `sync-all-users-auth`, `parse-rap`.
**Risco:** Qualquer pessoa na internet pode chamar esses endpoints. Embora `sync-auth-password` tenha uma camada de validação de senha interna, outros endpoints podem não estar tão protegidos contra abuso ou ataques de Negação de Serviço (DoS).
**Solução:** Habilitar `verify_jwt = true` onde possível e usar autenticação via Header Authorization, ou implementar validação de API Key manual.

### 4. Vulnerabilidade Potencial em "Local Auth"

**Arquivo:** `src/pages/Login.tsx` e `src/contexts/AuthContext.tsx`
**Descrição:** A aplicação usa um mecanismo híbrido onde salva dados do usuário no `localStorage` (`bpma_auth_user`). Se alguma lógica crítica do frontend confiar apenas nesse objeto do localStorage sem revalidar com o Supabase, um usuário mal-intencionado pode injetar dados falsos no seu próprio navegador para acessar telas restritas (visualização apenas).
**Observação:** O acesso aos dados REAIS parece estar protegido por RLS (Row Level Security), o que mitiga o risco, mas a UI pode ser enganada.

## 🛠️ Qualidade de Código e Manutenção

### 5. Inconsistência de Diretórios de Scripts

**Arquivo:** `package.json`
**Descrição:** Existem scripts apontando para `src/scripts/` (ex: `sync-inaturalist`) e outros para `scripts/` (ex: `migrate-estatisticas`).
**Problema:** Dificulta a manutenção e organização. Recomenda-se consolidar todos os scripts utilitários em uma única pasta (ex: `scripts/` na raiz).

### 6. Caminhos Absolutos em Scripts Python

**Arquivo:** `scripts/analyze_excel.py`
**Linha 8:** `os.environ.get('EXCEL_PATH', r'C:\Users\joaop\BPMA\Resumos Estatísticas 2025 a 2020.xlsx')`
**Descrição:** Caminhos locais do seu computador estão "chumbados" no código.
**Problema:** O script falhará se executado em outro ambiente.

## Próximos Passos Sugeridos

1.  **Corrigir imediatamente** o bug de paginação no `sync-auth-password`.
2.  Remover os e-mails hardcoded do `AuthContext.tsx`.
3.  Padronizar a estrutura de pastas de scripts.
