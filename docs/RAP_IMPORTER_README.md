# Importador Automático de RAPs - Documentação Completa

## Visão Geral

Sistema de importação automática de RAPs (Registro de Atividade Policial) em PDF do Google Drive para o banco de dados Supabase. O sistema processa PDFs automaticamente, extrai dados estruturados e insere registros na tabela `fat_registros_de_resgate` quando todos os campos obrigatórios estão presentes.

## Arquitetura

```
Google Drive (PDFs)
    ↓
Google Apps Script (Gatilho temporal - a cada 10 min)
    ↓ (HTTPS POST com PDF em base64)
Supabase Edge Function (/functions/v1/rap-import)
    ↓
Extração de Texto → Parser → Normalização → Validação → Lookups → Inserção
    ↓
Logs em rap_import_logs
    ↓
Frontend (/secao-operacional/raps/logs)
```

## Componentes

### 1. Google Apps Script (`apps_script/rap_importer.gs`)
- Monitora pasta do Google Drive
- Detecta PDFs novos/atualizados
- Envia PDFs para Edge Function
- Implementa retry com backoff exponencial

### 2. Supabase Edge Function (`supabase/functions/rap-import/`)
- Recebe PDFs do Apps Script
- Extrai texto do PDF
- Faz parsing do RAP
- Normaliza dados
- Valida campos obrigatórios (gate de inserção)
- Resolve lookups (FKs)
- Insere em `fat_registros_de_resgate`
- Registra logs detalhados

### 3. Frontend (`src/pages/RapsLogs.tsx`)
- Visualização de logs de importação
- Filtros por status, RAP, arquivo
- Detalhes completos de cada log
- Links para registros inseridos

## Setup e Configuração

### Passo 1: Configurar Supabase

#### 1.1 Executar Migration

Execute a migration para criar a tabela de logs:

```bash
supabase migration up
```

Ou execute manualmente o arquivo:
`supabase/migrations/20260127000001_rap_import_logs.sql`

#### 1.2 Configurar Edge Function

1. Deploy da Edge Function:

```bash
supabase functions deploy rap-import
```

2. Configurar variável de ambiente:

```bash
supabase secrets set IMPORT_SECRET=seu_secret_aqui
```

**IMPORTANTE**: Use um secret forte e único. Exemplo de geração:
```bash
openssl rand -base64 32
```

#### 1.3 Verificar RLS

A tabela `rap_import_logs` já tem RLS configurado:
- Usuários autenticados podem visualizar
- Service role (Edge Function) pode inserir

### Passo 2: Configurar Google Apps Script

#### 2.1 Criar Novo Projeto

1. Acesse [Google Apps Script](https://script.google.com)
2. Clique em "Novo projeto"
3. Cole o conteúdo de `apps_script/rap_importer.gs`

#### 2.2 Configurar Variáveis

No início do arquivo, atualize as constantes:

```javascript
const CONFIG = {
  FOLDER_ID: '1Rx_056ruXq_NuiVwOQ5TKmRT9TcMIMog', // ID da pasta do Drive
  EDGE_FUNCTION_URL: 'https://SEU_PROJECT_REF.supabase.co/functions/v1/rap-import',
  IMPORT_SECRET: 'seu_secret_aqui', // Mesmo valor configurado no Supabase
  MAX_FILES_PER_RUN: 10,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};
```

#### 2.3 Configurar Permissões

1. Clique em "Executar" → `testConfiguration`
2. Autorize o acesso ao Google Drive quando solicitado
3. Verifique os logs para confirmar que a pasta foi encontrada

#### 2.4 Criar Gatilho Temporal

1. No menu, vá em "Gatilhos" (Triggers)
2. Clique em "Adicionar gatilho"
3. Configure:
   - Função: `processRAPs`
   - Origem do evento: Baseado no tempo
   - Tipo de gatilho: Timer acionado a cada 10 minutos
   - Notificações de falha: Enviar email imediatamente

#### 2.5 Testar

Execute a função de teste:

```javascript
testProcessFile()
```

Verifique os logs no Logger do Apps Script.

### Passo 3: Verificar Frontend

A rota `/secao-operacional/raps/logs` já está configurada no `App.tsx`.

Acesse: `https://seu-dominio.com/secao-operacional/raps/logs`

## Gate de Inserção

O sistema só insere registros em `fat_registros_de_resgate` quando **TODOS** estes campos estão presentes e válidos:

1. ✅ `data` (válida, formato YYYY-MM-DD)
2. ✅ `latitude_origem` (não vazia, parseável)
3. ✅ `longitude_origem` (não vazia, parseável)
4. ✅ `nome_popular` OU `especie_id` resolvido
5. ✅ `quantidade_total` >= 1
6. ✅ `destinacao` presente (texto reconhecível)

### Validações Condicionais

- Se `destinacao = "Soltura"`: `latitude_soltura` e `longitude_soltura` obrigatórios
- Se `destinacao = "CEAPA/BPMA"`: `hora_guarda_ceapa` e `motivo_entrega_ceapa` obrigatórios
- Se origem/desfecho indicar TCO: `numero_tco` obrigatório

## Formato Esperado dos RAPs

### Estrutura Básica

O parser procura por:

1. **Número do RAP**: Formato `007135-2026` ou similar
2. **Data**: Formato `DD/MM/AAAA`
3. **Horários**: Formato `14h07` ou `14:07`
4. **Seção "Dados Complementares"** (opcional, mas recomendado):
   - Coordenadas do Resgate
   - Nome Popular
   - Nome Científico
   - Quantidade
   - Estágio da Vida
   - Condições Físicas
   - Local de Soltura/Encaminhamento
   - Coordenadas da Destinação (se soltura)

### Exemplo de RAP

```
REGISTRO DE ATIVIDADE POLICIAL - RAP Nº 007135-2026

Data: 26/01/2026
Horário de Acionamento: 14h07
Horário de Término: 16h45

RELATO:
[Texto do relato...]

DADOS COMPLEMENTARES:
Coordenadas do Resgate: 16.042776°S, 48.029226°W
Nome Popular: Tatu-bola
Nome Científico: Tolypeutes tricinctus
Quantidade: 1
Estágio da Vida: Adulto
Condições Físicas: Saudável
Local de Soltura/Encaminhamento: CETAS/IBAMA
Nº Termo de Entrega: 12345
```

## Normalização de Dados

### Coordenadas

Aceita múltiplos formatos:

- `16.042776°S, 48.029226°W` → `-16.042776, -48.029226`
- `-15.7801, -47.9292` → `-15.7801, -47.9292`
- `15°02'34.0"S 47°55'45.0"W` → `-15.0428, -47.9292`

### Datas

- Entrada: `DD/MM/AAAA` (ex: `26/01/2026`)
- Saída: `YYYY-MM-DD` (ex: `2026-01-26`)

### Horários

- Entrada: `14h07` ou `14:07`
- Saída: `14:07:00`

### Destinações

Mapeamento automático:
- `CETAS IBAMA` → `CETAS/IBAMA`
- `HFAUS IBRAM` → `HFAUS/IBRAM`
- `HVet UnB` → `HVet/UnB`
- `CEAPA BPMA` → `CEAPA/BPMA`
- `Soltura` → `Soltura`
- `Vida Livre` → `Vida Livre`

## Resolução de Lookups (FKs)

O sistema tenta resolver automaticamente:

- `especie_id`: Busca em `dim_especies_fauna` por `nome_popular` ou `nome_cientifico`
- `destinacao_id`: Busca em `dim_destinacao` por `nome`
- `origem_id`: Infere do relato (COPOM, Ação Policial, etc.)
- `estado_saude_id`: Mapeia condições físicas (Debilitado, Ferido, Saudável, Óbito)
- `estagio_vida_id`: Busca em `dim_estagio_vida` por `nome`
- `desfecho_id`: Infere do tipo do RAP (default: "Resgatado" para resgates)

**Nota**: Se algum lookup não resolver, o campo fica NULL mas um WARNING é registrado no log.

## Logs e Rastreabilidade

### Tabela `rap_import_logs`

Todos os processamentos geram um log com:

- Informações do arquivo (file_id, file_name, modified_time)
- Status do processamento
- Campos faltantes (se houver)
- Avisos (warnings)
- Mensagem de erro (se houver)
- IDs dos registros inseridos (se sucesso)
- Trecho do texto extraído (para depuração)

### Status Possíveis

- `success`: Registro(s) inserido(s) com sucesso
- `needs_ocr`: PDF escaneado, texto não extraído
- `missing_required_fields`: Campos obrigatórios faltando
- `error`: Erro durante processamento

## Troubleshooting

### PDF não está sendo processado

1. Verifique se o gatilho está ativo no Apps Script
2. Verifique os logs do Apps Script (Logger)
3. Verifique se o arquivo está na pasta correta
4. Verifique se o arquivo já foi processado (estado salvo)

### Erro "Texto não extraído"

- PDF pode estar escaneado (imagem)
- Solução: Implementar OCR (futuro) ou converter PDF para texto

### Erro "Campos obrigatórios faltando"

- Verifique o log detalhado para ver quais campos faltam
- Ajuste o formato do RAP ou melhore o parser

### Erro de autenticação

- Verifique se `IMPORT_SECRET` está configurado corretamente
- Verifique se o secret no Apps Script corresponde ao do Supabase

### Performance

- Limite de arquivos por execução: `MAX_FILES_PER_RUN` (padrão: 10)
- Ajuste conforme necessário

## Testes

### Executar Testes Unitários

```bash
cd supabase/functions/rap-import
deno test utils/parser.test.ts
deno test utils/normalizer.test.ts
deno test utils/validator.test.ts
```

### Testar Edge Function Localmente

```bash
supabase functions serve rap-import
```

Envie uma requisição de teste:

```bash
curl -X POST http://localhost:54321/functions/v1/rap-import \
  -H "Content-Type: application/json" \
  -H "X-IMPORT-SECRET: seu_secret" \
  -d '{
    "fileId": "test",
    "fileName": "test.pdf",
    "folderId": "test",
    "modifiedTime": "2026-01-26T00:00:00Z",
    "pdfBase64": "base64_do_pdf_aqui"
  }'
```

## Melhorias Futuras

- [ ] Implementar OCR para PDFs escaneados
- [ ] Botão "Reprocessar" no frontend
- [ ] Dashboard de estatísticas de importação
- [ ] Notificações por email em erros críticos
- [ ] Suporte a outros tipos de RAP (crimes ambientais, crimes comuns, prevenção)
- [ ] Geocoding reverso para inferir região administrativa e tipo de área
- [ ] Validação mais robusta de coordenadas (verificar se estão dentro do DF)

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `/secao-operacional/raps/logs`
2. Verifique os logs do Apps Script
3. Verifique os logs da Edge Function no Supabase Dashboard

## Changelog

### v1.0.0 (2026-01-27)
- Implementação inicial
- Suporte a RAPs de resgate
- Gate de inserção rigoroso
- Sistema de logs completo
- Frontend de visualização
