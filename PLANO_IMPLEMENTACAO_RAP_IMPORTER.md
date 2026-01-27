# Plano de Implementação - Importador Automático de RAPs

## Visão Geral

Sistema de importação automática de RAPs (Registro de Atividade Policial) em PDF do Google Drive para o banco de dados Supabase, com validação rigorosa e rastreabilidade completa.

## Arquitetura

```
Google Drive (PDFs)
    ↓
Google Apps Script (Gatilho temporal)
    ↓ (HTTPS POST)
Supabase Edge Function (/functions/v1/rap-import)
    ↓
Parser de PDF → Validação → Inserção em fat_registros_de_resgate
    ↓
Logs em rap_import_logs
    ↓
Frontend (/secao-operacional/raps/logs)
```

## Etapas de Implementação

### Etapa 1: Infraestrutura de Banco de Dados
**Objetivo**: Criar tabela de logs e índices

**Tarefas**:
1. Criar migration SQL para `rap_import_logs`
2. Criar índices para performance (status, created_at, file_id)
3. Configurar RLS policies (apenas autenticados)

**Arquivos**:
- `supabase/migrations/YYYYMMDDHHMMSS_rap_import_logs.sql`

**Critérios de Aceite**:
- Tabela criada com todos os campos necessários
- Índices criados
- RLS habilitado e políticas configuradas

---

### Etapa 2: Supabase Edge Function
**Objetivo**: Processar PDFs e extrair dados

**Tarefas**:
1. Criar estrutura da Edge Function
2. Implementar validação de secret
3. Implementar extração de texto do PDF (usando biblioteca Deno)
4. Implementar parser de RAP com regex e lógica de extração
5. Implementar normalização de dados (coordenadas, datas, horas)
6. Implementar resolução de FKs (lookups em tabelas dim_*)
7. Implementar gate de inserção (validação de campos obrigatórios)
8. Implementar inserção em `fat_registros_de_resgate`
9. Implementar escrita de logs em `rap_import_logs`
10. Implementar tratamento de erros e retornos apropriados

**Arquivos**:
- `supabase/functions/rap-import/index.ts`
- `supabase/functions/rap-import/utils/parser.ts`
- `supabase/functions/rap-import/utils/normalizer.ts`
- `supabase/functions/rap-import/utils/validator.ts`
- `supabase/functions/rap-import/utils/lookup.ts`

**Critérios de Aceite**:
- Extração de texto funcional
- Parser identifica todos os campos principais
- Normalização correta de coordenadas, datas e horas
- Gate de inserção funciona corretamente
- Logs são escritos em todos os cenários
- Retornos HTTP apropriados (200, 400, 500)

---

### Etapa 3: Google Apps Script
**Objetivo**: Monitorar Drive e enviar PDFs para Edge Function

**Tarefas**:
1. Implementar listagem de arquivos na pasta
2. Implementar detecção de arquivos novos/atualizados
3. Implementar persistência de estado (PropertiesService)
4. Implementar download de PDF como base64
5. Implementar envio HTTPS POST com retry e backoff
6. Implementar tratamento de respostas do backend
7. Implementar logs no Logger do Apps Script
8. Configurar gatilho temporal

**Arquivos**:
- `apps_script/rap_importer.gs`
- `apps_script/README_SETUP.md`

**Critérios de Aceite**:
- Detecta novos PDFs corretamente
- Evita reprocessamento de arquivos já processados
- Envia PDFs para Edge Function com sucesso
- Implementa retry em caso de falha temporária
- Logs são registrados no Logger

---

### Etapa 4: Frontend de Logs
**Objetivo**: Interface para visualizar e gerenciar logs de importação

**Tarefas**:
1. Criar página `/secao-operacional/raps/logs`
2. Implementar tabela de logs com paginação
3. Implementar filtros (status, data, file_name, rap_numero)
4. Implementar modal/drawer de detalhes do log
5. Implementar exibição de missing_fields, warnings, error_message
6. Implementar exibição de inserted_ids (links para registros)
7. Implementar query Supabase com RLS
8. Adicionar rota no App.tsx

**Arquivos**:
- `src/pages/RapsLogs.tsx`
- `src/components/raps/RapsLogsTable.tsx`
- `src/components/raps/RapsLogDetail.tsx`
- `src/hooks/useRapsLogs.ts`

**Critérios de Aceite**:
- Página acessível e funcional
- Filtros funcionam corretamente
- Detalhes do log exibem todas as informações
- Performance adequada com muitos logs

---

### Etapa 5: Testes Unitários
**Objetivo**: Garantir qualidade do parser e validações

**Tarefas**:
1. Criar testes para normalização de coordenadas
2. Criar testes para parsing de data/hora
3. Criar testes para extração de campos do RAP
4. Criar testes para gate de inserção
5. Criar fixtures (RAP simulado em texto)
6. Criar testes para detecção de needs_ocr

**Arquivos**:
- `supabase/functions/rap-import/utils/parser.test.ts`
- `supabase/functions/rap-import/utils/normalizer.test.ts`
- `supabase/functions/rap-import/utils/validator.test.ts`
- `supabase/functions/rap-import/fixtures/rap_example.txt`

**Critérios de Aceite**:
- Todos os testes passam
- Cobertura adequada das funções críticas
- Fixtures representam casos reais

---

### Etapa 6: Documentação
**Objetivo**: Guia completo de setup e uso

**Tarefas**:
1. Documentar setup do Google Apps Script
2. Documentar criação de gatilho temporal
3. Documentar configuração de secrets
4. Documentar estrutura do Edge Function
5. Documentar formato esperado dos RAPs
6. Documentar troubleshooting

**Arquivos**:
- `docs/RAP_IMPORTER_README.md`

**Critérios de Aceite**:
- Documentação completa e clara
- Passos de setup funcionam
- Exemplos práticos incluídos

---

## Ordem de Execução Recomendada

1. **Etapa 1** (Infraestrutura) - Base para tudo
2. **Etapa 2** (Edge Function) - Core do sistema
3. **Etapa 5** (Testes) - Validar Edge Function
4. **Etapa 3** (Apps Script) - Integração com Drive
5. **Etapa 4** (Frontend) - Visualização
6. **Etapa 6** (Documentação) - Finalização

---

## Dependências e Bibliotecas

### Supabase Edge Function
- `deno.land/std` - Utilitários padrão
- `jsr:@supabase/supabase-js` - Cliente Supabase
- PDF parsing: Usar biblioteca nativa do Deno ou `pdf-parse` via npm

### Google Apps Script
- APIs nativas do Google Drive
- `UrlFetchApp` para HTTPS
- `PropertiesService` para estado
- `Utilities` para base64

---

## Configurações Necessárias

### Supabase
- Variável de ambiente: `IMPORT_SECRET` (secret para autenticação)
- RLS habilitado em `rap_import_logs`
- Permissões de escrita na Edge Function

### Google Apps Script
- Acesso à pasta do Drive
- Secret configurado
- Gatilho temporal configurado (a cada 10 minutos)
- URL da Edge Function configurada

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| PDF escaneado (sem texto) | Retornar `needs_ocr` e não inserir |
| Dados incompletos | Gate de inserção rigoroso + logs detalhados |
| Loop infinito de reprocessamento | Marcar como processado mesmo em erro |
| Performance com muitos PDFs | Processar em lote, limitar por execução |
| Falhas de rede | Retry com backoff exponencial |

---

## Métricas de Sucesso

- Taxa de sucesso de importação > 80%
- Tempo médio de processamento < 5s por PDF
- Zero inserções com dados incompletos
- 100% dos processamentos geram log
- Frontend carrega logs em < 2s

---

## Próximos Passos (Backlog)

- Implementar OCR para PDFs escaneados
- Botão "Reprocessar" no frontend
- Dashboard de estatísticas de importação
- Notificações por email em caso de erros críticos
- Suporte a outros tipos de RAP (crimes ambientais, crimes comuns, prevenção)
