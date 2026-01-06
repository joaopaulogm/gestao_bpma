# Configuração de Variáveis de Ambiente no Lovable

## ✅ IMPORTANTE: O código já funciona com valores padrão!

**Boa notícia**: O código já tem valores padrão (fallback) configurados, então **deve funcionar mesmo sem configurar variáveis de ambiente no Lovable**.

As variáveis de ambiente são uma **melhor prática de segurança**, mas não são obrigatórias para o funcionamento, pois a chave anon do Supabase é pública por design.

## 🔍 Como Configurar Variáveis de Ambiente no Lovable (Opcional):

### Opção 1: Através do Prompt do Lovable

No chat do Lovable, você pode pedir:

```
"Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para este projeto"
```

E fornecer os valores quando solicitado.

### Opção 2: Criar arquivo .env diretamente no Lovable

1. **No editor do Lovable**, crie um novo arquivo chamado `.env` na raiz do projeto
2. **Adicione o seguinte conteúdo:**

   ```
   VITE_SUPABASE_URL=https://oiwwptnqaunsyhpkwbrz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE
   ```

3. **Salve o arquivo** (o Lovable deve detectar automaticamente)

### Opção 3: Verificar se há seção de Configurações

1. **Procure por um menu ou ícone de configurações** (geralmente um ícone de engrenagem ⚙️)
2. **Procure por seções como:**
   - "Project Settings"
   - "Deploy Settings"
   - "Build Settings"
   - "Environment"
   - "Secrets"
   - "Variables"

### Opção 4: Usar o arquivo .env local (se o Lovable sincronizar)

Se o Lovable sincronizar arquivos do repositório Git, o arquivo `.env` local será ignorado pelo `.gitignore`, mas você pode criar um `.env` diretamente no editor do Lovable.

## ⚠️ Nota Importante:

**O código já funciona sem configurar variáveis de ambiente!**

O arquivo `src/integrations/supabase/client.ts` tem valores padrão (fallback) que são usados automaticamente se as variáveis de ambiente não estiverem configuradas:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGci...";
```

Isso significa que:
- ✅ **O aplicativo funciona normalmente** mesmo sem configurar variáveis
- ✅ **As alterações de segurança já estão ativas** (CORS restrito, sanitização de inputs, etc.)
- ⚠️ **Configurar variáveis de ambiente é uma boa prática**, mas não é obrigatório

## Verificação:

Para verificar se está funcionando:
1. **Teste o aplicativo** - deve funcionar normalmente
2. **Teste a busca de policiais** - deve permitir buscar por matrícula ou nome
3. **Verifique o console do navegador** - não deve haver erros relacionados a variáveis

## Se ainda não estiver funcionando:

Se as alterações não estão aparecendo no Lovable, pode ser necessário:

1. **Fazer um novo deploy/publicação** no Lovable
2. **Limpar o cache do navegador** e recarregar a página
3. **Verificar se o código foi atualizado** no repositório Git que o Lovable usa

## Problemas Comuns:

### ❌ Alterações não aparecem no Lovable
- **Solução**: Verifique se o código foi commitado e enviado para o GitHub
- O Lovable pode precisar de alguns minutos para sincronizar as alterações

### ❌ "Missing Supabase environment variables"
- **Solução**: Isso não deve acontecer, pois há valores padrão. Se acontecer, crie o arquivo `.env` no Lovable conforme a Opção 2 acima.

### ❌ Busca de policiais não funciona
- **Solução**: Verifique se o código foi atualizado. A lógica de busca foi corrigida para funcionar com matrícula E nome.
