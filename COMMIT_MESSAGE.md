# Mensagem de Commit para GitHub

Use a seguinte mensagem ao fazer commit das alterações:

```
feat: implementar correções de segurança e melhorias

Segurança:
- Mover credenciais do Supabase para variáveis de ambiente
- Restringir CORS em funções do Supabase (remover wildcard *)
- Adicionar sanitização e validação de inputs do usuário
- Habilitar RLS nas tabelas principais (fat_resgates_diarios_2025, fat_registros_de_resgate)
- Remover logs que expõem informações sensíveis
- Remover arquivo duplicado com credenciais hardcoded

Funcionalidades:
- Implementar lógica para mover registros entre tabelas na edição
- Permitir busca por matrícula ou nome do policial na seção de equipe
- Adaptar código para suportar tabelas históricas (2020-2024) com estrutura diferente
- Seleção automática de tabela baseada no ano da data do registro

Documentação:
- Criar SECURITY.md com políticas de segurança
- Criar CHANGELOG_SECURITY.md com histórico de correções
- Criar .env.example como template
- Atualizar README.md com seção de segurança
- Criar RESUMO_CORRECOES_SEGURANCA.md

Migrations:
- Adicionar migration para garantir RLS nas tabelas principais
```

## Comandos para atualizar o GitHub:

```bash
# Adicionar todos os arquivos modificados
git add .

# Fazer commit com a mensagem acima
git commit -m "feat: implementar correções de segurança e melhorias

Segurança:
- Mover credenciais do Supabase para variáveis de ambiente
- Restringir CORS em funções do Supabase (remover wildcard *)
- Adicionar sanitização e validação de inputs do usuário
- Habilitar RLS nas tabelas principais
- Remover logs que expõem informações sensíveis
- Remover arquivo duplicado com credenciais hardcoded

Funcionalidades:
- Implementar lógica para mover registros entre tabelas na edição
- Permitir busca por matrícula ou nome do policial
- Adaptar código para suportar tabelas históricas (2020-2024)
- Seleção automática de tabela baseada no ano da data

Documentação:
- Criar SECURITY.md, CHANGELOG_SECURITY.md, .env.example
- Atualizar README.md com seção de segurança"

# Enviar para o repositório remoto
git push
```

## ⚠️ IMPORTANTE ANTES DO COMMIT:

1. **Criar arquivo .env local** (não será commitado):
   ```bash
   # Copiar .env.example para .env e preencher com valores reais
   cp .env.example .env
   # Editar .env com suas credenciais
   ```

2. **Verificar que .env está no .gitignore**:
   - O arquivo `.env` não deve aparecer em `git status`

3. **Configurar variáveis de ambiente no ambiente de produção**:
   - Lovable: Configurar nas variáveis de ambiente do projeto
   - Outros: Seguir instruções da plataforma de deploy
