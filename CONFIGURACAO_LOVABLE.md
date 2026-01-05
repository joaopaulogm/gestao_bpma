# Configuração de Variáveis de Ambiente no Lovable

## ⚠️ IMPORTANTE: Configurar Variáveis de Ambiente no Lovable

Para que as alterações de segurança funcionem corretamente no ambiente de produção (Lovable), você **DEVE** configurar as variáveis de ambiente no projeto.

## Passos para Configurar no Lovable:

1. **Acesse o projeto no Lovable**
   - Vá para: https://lovable.dev/projects/o679bdd7-61a0-41f0-ae02-460a13e03df4
   - Ou acesse o projeto através do dashboard do Lovable

2. **Navegue até as Configurações do Projeto**
   - Procure por "Environment Variables" ou "Variáveis de Ambiente"
   - Geralmente está em: **Settings** → **Environment Variables** ou **Config** → **Env Variables**

3. **Adicione as seguintes variáveis de ambiente:**

   ```
   VITE_SUPABASE_URL=https://oiwwptnqaunsyhpkwbrz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE
   ```

4. **Salve as configurações**

5. **Reinicie o ambiente de desenvolvimento/preview**
   - Após adicionar as variáveis, pode ser necessário reiniciar o servidor de desenvolvimento
   - No Lovable, geralmente há um botão "Restart" ou "Redeploy"

## Verificação:

Após configurar, verifique se as variáveis estão sendo carregadas:
- O aplicativo deve funcionar normalmente
- Não deve aparecer erros relacionados a variáveis de ambiente ausentes

## Notas:

- As variáveis de ambiente no Lovable são diferentes do arquivo `.env` local
- O arquivo `.env` local é apenas para desenvolvimento local
- No Lovable, você deve configurar as variáveis através da interface do projeto
- As variáveis começam com `VITE_` porque o projeto usa Vite como bundler

## Problemas Comuns:

### ❌ "Missing Supabase environment variables"
- **Solução**: Verifique se as variáveis foram adicionadas corretamente no Lovable
- Certifique-se de que os nomes estão exatamente como: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### ❌ Aplicativo não funciona após adicionar variáveis
- **Solução**: Reinicie o ambiente de desenvolvimento/preview no Lovable

### ❌ Variáveis não são reconhecidas
- **Solução**: Verifique se os nomes das variáveis estão corretos (case-sensitive)
- Certifique-se de que não há espaços extras antes ou depois dos valores
