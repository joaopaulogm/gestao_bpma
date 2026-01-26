# Guia de Instalação e Configuração do Supabase

Este guia contém todas as instruções necessárias para configurar o ambiente de desenvolvimento com Supabase.

## ✅ Status da Instalação

### Dependências NPM
- ✅ `@supabase/supabase-js@2.49.1` - Instalado
- ✅ Todas as dependências do projeto instaladas via `npm install`

### Supabase CLI
- ✅ Supabase CLI instalado (versão 2.67.1)
- ⚠️ Versão mais recente disponível: v2.72.7

### Extensões VS Code Recomendadas
- ✅ Arquivo `.vscode/extensions.json` criado com extensões recomendadas

## 📦 Instalação de Dependências

### 1. Instalar dependências do projeto
```bash
npm install
```

### 2. Atualizar Supabase CLI (Windows)

O Supabase CLI já está instalado. Para atualizar para a versão mais recente no Windows:

**Opção 1: Via Scoop (recomendado)**
```bash
scoop update supabase
```

**Opção 2: Via Chocolatey**
```bash
choco upgrade supabase
```

**Opção 3: Download manual**
1. Acesse: https://github.com/supabase/cli/releases
2. Baixe o arquivo `supabase_windows_amd64.zip`
3. Extraia e substitua o executável na pasta de instalação

## 🔧 Configuração de Variáveis de Ambiente

### 1. Criar arquivo `.env`

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 2. Configurar variáveis

Edite o arquivo `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://oiwwptnqaunsyhpkwbrz.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde encontrar as credenciais:**
1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 🔌 Extensões VS Code Recomendadas

O arquivo `.vscode/extensions.json` já foi criado com as seguintes extensões:

1. **Supabase** (`supabase.supabase-vscode`)
   - Integração com Supabase
   - Autocomplete para queries
   - Gerenciamento de migrations

2. **ESLint** (`dbaeumer.vscode-eslint`)
   - Linting de código JavaScript/TypeScript

3. **Prettier** (`esbenp.prettier-vscode`)
   - Formatação automática de código

4. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocomplete para classes Tailwind

5. **TypeScript and JavaScript Language Features** (`ms-vscode.vscode-typescript-next`)
   - Suporte avançado para TypeScript

**Para instalar as extensões:**
1. Abra o VS Code
2. Pressione `Ctrl+Shift+P`
3. Digite "Extensions: Show Recommended Extensions"
4. Clique em "Install All"

## 🚀 Verificação da Conexão

### 1. Verificar configuração do cliente

O arquivo `src/integrations/supabase/client.ts` já está configurado com:
- ✅ URL do projeto
- ✅ Chave anon (com fallback)
- ✅ Configurações de autenticação
- ✅ Timeout de 60 segundos
- ✅ Configurações de realtime

### 2. Testar conexão

Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

O projeto deve iniciar em `http://localhost:8080`

### 3. Verificar logs no console

Abra o console do navegador (F12) e verifique se não há erros de conexão com o Supabase.

## 📚 Recursos Adicionais

### Documentação
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase VS Code Extension](https://marketplace.visualstudio.com/items?itemName=supabase.supabase-vscode)

### Comandos Úteis do Supabase CLI

```bash
# Verificar status do projeto
supabase status

# Fazer login no Supabase
supabase login

# Vincular projeto local ao remoto
supabase link --project-ref oiwwptnqaunsyhpkwbrz

# Executar migrations localmente
supabase db reset

# Gerar tipos TypeScript do banco
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## ⚠️ Troubleshooting

### Problema: Erro de conexão
**Solução:** Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo `.env`

### Problema: CLI não encontrado
**Solução:** Verifique se o Supabase CLI está no PATH do sistema

### Problema: Extensões não aparecem
**Solução:** Reinicie o VS Code após criar o arquivo `.vscode/extensions.json`

## ✅ Checklist Final

- [x] Dependências NPM instaladas
- [x] Supabase CLI instalado
- [x] Arquivo `.env` configurado
- [x] Extensões VS Code recomendadas documentadas
- [x] Cliente Supabase configurado
- [ ] Testar conexão executando `npm run dev`

---

**Última atualização:** 26/01/2026
