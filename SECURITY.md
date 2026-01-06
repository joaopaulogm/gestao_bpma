# Políticas de Segurança

## Proteção de Dados Sensíveis

### Variáveis de Ambiente
- Todas as credenciais e chaves de API devem ser armazenadas em variáveis de ambiente
- Nunca commitar arquivos `.env` no repositório
- Use `.env.example` como template para documentar variáveis necessárias

### Chaves do Supabase
- A chave anon (publishable) pode ser exposta no frontend, mas deve ser limitada via RLS
- A chave service role NUNCA deve ser exposta no frontend
- Use variáveis de ambiente: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Validação de Inputs

### Sanitização
- Todos os inputs do usuário devem ser sanitizados antes de uso
- Use métodos seguros do Supabase (`.eq()`, `.ilike()`, etc.) em vez de concatenação de strings
- Limite o tamanho dos inputs quando apropriado

### Validação
- Valide formatos de dados (emails, datas, números)
- Use schemas de validação (Zod) para formulários
- Rejeite inputs maliciosos ou inválidos

## Autenticação e Autorização

### Row Level Security (RLS)
- Todas as tabelas devem ter RLS habilitado
- Políticas devem ser definidas para cada operação (SELECT, INSERT, UPDATE, DELETE)
- Verificar autenticação antes de operações sensíveis

### Funções do Supabase
- Todas as funções devem verificar autenticação
- Use service role key apenas no backend (funções Edge)
- Nunca exponha service role key no frontend

## CORS

### Configuração
- Restrinja origens permitidas em funções do Supabase
- Não use `Access-Control-Allow-Origin: *` em produção
- Liste origens específicas permitidas

## SQL Injection

### Prevenção
- Use sempre métodos do Supabase Client em vez de SQL raw
- Se necessário usar SQL raw, use prepared statements
- Valide e sanitize todos os inputs antes de usar em queries

## Boas Práticas

1. **Nunca commitar credenciais**: Use `.gitignore` para arquivos `.env`
2. **Validação dupla**: Valide no frontend E no backend
3. **Princípio do menor privilégio**: Dê apenas permissões necessárias
4. **Logs seguros**: Não logue dados sensíveis
5. **HTTPS**: Sempre use HTTPS em produção
6. **Atualizações**: Mantenha dependências atualizadas

## Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, por favor:
1. NÃO abra uma issue pública
2. Entre em contato diretamente com a equipe de desenvolvimento
3. Forneça detalhes sobre a vulnerabilidade encontrada
