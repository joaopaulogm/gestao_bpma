# ESTRATÉGIA: CONTROLE AUTOMÁTICO DE ORDENS DE SERVIÇO (OS)

## 📋 ANÁLISE DO DOCUMENTO

### Estrutura da Ordem de Serviço identificada:

**Cabeçalho:**
- Número da OS: `2026.00707.0000012` (formato: ANO.CODIGO.SEQUENCIAL)
- UPMs: BPMA
- Destinatários: ADJUNTO, CPU/OFICIAL DE DIA, RP AMBIENTAL 24HS, SP
- Evento: Descrição completa do evento
- Referência SEI: PROCESSO SEI - GDF N° 00054-00003823/2026-45
- Data: segunda-feira, 26 janeiro 2026
- Horário: 13h30 às 17h00
- Responsável: Nome e telefone
- Público Previsto: número
- Local: Endereço completo
- Tipo: OUTROS EVENTOS
- Uniforme/Equipamento/Armamento: ORGÂNICO

**Corpo:**
- Situação: Descrição detalhada do contexto
- Missão do Policiamento: Instruções específicas
- Prescrições por Seção:
  - EXECUÇÃO: Detalhes do evento
  - SEÇÃO DE PESSOAL/SSVG: Instruções
  - OFICIAL DE DIA/CPU: Instruções
  - ADJUNTO DO BPMA: Instruções
  - Comandante de Equipe: Instruções
- Prescrições Diversas:
  - Destaque: Sim/Não
  - Comando Móvel: Sim/Não
  - Reservada: Sim/Não
  - Ativa: Sim/Não

**Rodapé:**
- Assinaturas: Chefe da Seção Operacional, RP AMBIENTAL 24HS, ADJUNTO, CPU/OFICIAL DE DIA

### Estrutura da Pasta Google Drive:
```
ORDENS DE SERVIÇOS/
  ├── 2024/
  ├── 2025/
  └── 2026/
      └── JANEIRO/
          └── ORDEM_SERVICO_208449.pdf
```

---

## 🎯 ESTRATÉGIA COMPLETA

### FASE 1: ESTRUTURA DE DADOS

#### 1.1 Criar Tabela `fat_ordens_servico`

```sql
CREATE TABLE public.fat_ordens_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Identificação
  numero_os text NOT NULL UNIQUE, -- Ex: 2026.00707.0000012
  ano integer NOT NULL,
  mes text NOT NULL, -- JANEIRO, FEVEREIRO, etc.
  sequencial integer,
  
  -- Informações Básicas
  upms text, -- BPMA
  destinatarios text[], -- ['ADJUNTO', 'CPU/OFICIAL DE DIA', 'RP AMBIENTAL 24HS', 'SP']
  evento text NOT NULL,
  referencia_sei text, -- PROCESSO SEI - GDF N° 00054-00003823/2026-45
  
  -- Data e Horário
  data_evento date NOT NULL,
  horario_inicio time,
  horario_fim time,
  dia_semana text, -- segunda-feira, etc.
  
  -- Responsável
  responsavel_nome text,
  responsavel_contato text, -- Telefone
  
  -- Localização
  local text,
  endereco_completo text,
  regiao_administrativa_id uuid REFERENCES public.dim_regiao_administrativa(id),
  
  -- Classificação
  tipo_evento text, -- OUTROS EVENTOS, etc.
  uniforme text, -- ORGÂNICO
  equipamento text, -- ORGÂNICO
  armamento text, -- ORGÂNICO
  publico_previsto integer DEFAULT 0,
  
  -- Descrições
  situacao text, -- Descrição detalhada
  missao_policiamento text, -- Instruções específicas
  
  -- Prescrições
  prescricoes_execucao text,
  prescricoes_pessoal text,
  prescricoes_oficial_dia text,
  prescricoes_adjunto text,
  prescricoes_comandante_equipe text,
  prescricoes_diversas jsonb, -- {destaque: boolean, comando_movel: boolean, reservada: boolean, ativa: boolean}
  
  -- Assinaturas
  assinaturas jsonb, -- {chefe_secao_operacional: {nome, data}, rp_ambiental: {data}, adjunto: {data}, oficial_dia: {data}}
  
  -- Integração Google Drive
  drive_file_id text UNIQUE,
  drive_file_name text,
  drive_folder_path text, -- 2026/JANEIRO
  drive_modified_time timestamp with time zone,
  
  -- Status
  status text DEFAULT 'pendente', -- pendente, processada, executada, cancelada
  processada_em timestamp with time zone,
  processada_por uuid REFERENCES auth.users(id),
  
  -- Relacionamentos
  relacionado_rap_id uuid, -- Se gerou um RAP relacionado
  relacionado_registro_id uuid, -- Se gerou um registro de resgate/crime relacionado
  
  -- Metadados
  dados_extracao jsonb, -- Dados brutos extraídos pela IA
  confianca_extracao numeric, -- 0.0 a 1.0
  erros_extracao text[]
);
```

#### 1.2 Criar Tabela de Controle de Processamento

```sql
CREATE TABLE public.os_processadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_file_id text NOT NULL UNIQUE,
  numero_os text NOT NULL,
  processada_em timestamp with time zone DEFAULT now(),
  status text DEFAULT 'sucesso', -- sucesso, erro, duplicada
  erro text,
  os_id uuid REFERENCES public.fat_ordens_servico(id)
);
```

---

### FASE 2: FUNÇÃO SUPABASE EDGE (process-os-folder)

#### 2.1 Estrutura da Função

**Localização:** `supabase/functions/process-os-folder/index.ts`

**Funcionalidades:**
1. **Listar PDFs na pasta do Google Drive**
   - Pasta base: `1l_pC4X_BnsqKDh4XUkE5jeh9FI9lgHKc`
   - Estrutura: `/ANO/MES/ORDEM_SERVICO_*.pdf`
   - Buscar recursivamente em todas as subpastas

2. **Download e Conversão de PDF**
   - Baixar PDF do Google Drive
   - Converter para base64
   - Extrair texto usando biblioteca PDF (similar ao process-raps-folder)

3. **Extração de Dados com IA**
   - Usar Lovable AI Gateway (gemini-2.5-flash)
   - Schema de extração específico para OS
   - Extrair todos os campos estruturados

4. **Validação e Normalização**
   - Validar número da OS (formato)
   - Normalizar datas e horários
   - Mapear regiões administrativas
   - Validar destinatários

5. **Inserção no Banco de Dados**
   - Verificar se já existe (por número_os ou drive_file_id)
   - Inserir ou atualizar
   - Registrar em `os_processadas`

#### 2.2 Schema de Extração para IA

```typescript
const osExtractionSchema = {
  type: "object",
  properties: {
    numero_os: {
      type: "string",
      description: "Número completo da OS (ex: 2026.00707.0000012)"
    },
    ano: { type: "integer" },
    mes: { type: "string" },
    sequencial: { type: "integer" },
    upms: { type: "string" },
    destinatarios: {
      type: "array",
      items: { type: "string" }
    },
    evento: { type: "string" },
    referencia_sei: { type: "string" },
    data_evento: { type: "string", format: "date" },
    horario_inicio: { type: "string" },
    horario_fim: { type: "string" },
    dia_semana: { type: "string" },
    responsavel_nome: { type: "string" },
    responsavel_contato: { type: "string" },
    local: { type: "string" },
    endereco_completo: { type: "string" },
    tipo_evento: { type: "string" },
    uniforme: { type: "string" },
    equipamento: { type: "string" },
    armamento: { type: "string" },
    publico_previsto: { type: "integer" },
    situacao: { type: "string" },
    missao_policiamento: { type: "string" },
    prescricoes: {
      type: "object",
      properties: {
        execucao: { type: "string" },
        pessoal: { type: "string" },
        oficial_dia: { type: "string" },
        adjunto: { type: "string" },
        comandante_equipe: { type: "string" }
      }
    },
    prescricoes_diversas: {
      type: "object",
      properties: {
        destaque: { type: "boolean" },
        comando_movel: { type: "boolean" },
        reservada: { type: "boolean" },
        ativa: { type: "boolean" }
      }
    },
    assinaturas: {
      type: "object",
      properties: {
        chefe_secao_operacional: {
          type: "object",
          properties: {
            nome: { type: "string" },
            data: { type: "string" }
          }
        },
        rp_ambiental: { type: "string" },
        adjunto: { type: "string" },
        oficial_dia: { type: "string" }
      }
    }
  },
  required: ["numero_os", "evento", "data_evento"]
};
```

---

### FASE 3: INTERFACE NA SEÇÃO OPERACIONAL

#### 3.1 Nova Página: Controle de Ordens de Serviço

**Rota:** `/secao-operacional/controle-os`

**Componentes:**

1. **Dashboard de OS**
   - Cards com estatísticas:
     - Total de OS
     - OS Pendentes
     - OS Processadas (hoje/semana/mês)
     - OS Executadas
     - OS Canceladas

2. **Lista de OS**
   - Tabela/cards com:
     - Número da OS
     - Data do Evento
     - Evento (descrição)
     - Status
     - Ações (Visualizar, Editar, Executar)

3. **Filtros**
   - Por data (período)
   - Por status
   - Por tipo de evento
   - Por destinatário
   - Busca por número ou evento

4. **Botão de Sincronização**
   - "Sincronizar com Google Drive"
   - Processa novas OS automaticamente
   - Mostra progresso e resultados

5. **Visualização Detalhada**
   - Modal/Dialog com todos os dados da OS
   - Link para PDF no Google Drive
   - Histórico de processamento

#### 3.2 Integração com Registros

**Funcionalidade:** Vincular OS com Registros

- Quando uma OS é processada, verificar se pode gerar automaticamente:
  - Registro de Resgate (se evento envolve resgate)
  - Registro de Crime Ambiental (se evento envolve crime)
  - Registro de Atividade de Prevenção (se evento é educativo)

- Botão "Criar Registro a partir desta OS"
- Preencher formulário automaticamente com dados da OS

---

### FASE 4: AUTOMAÇÃO E SINCRONIZAÇÃO

#### 4.1 Sincronização Automática

**Opções:**

1. **Cron Job (Supabase Edge Function)**
   - Executar periodicamente (ex: a cada hora)
   - Verificar novas OS no Google Drive
   - Processar automaticamente

2. **Webhook do Google Drive**
   - Configurar notificação quando novo arquivo é adicionado
   - Processar imediatamente

3. **Sincronização Manual**
   - Botão na interface
   - Usuário controla quando sincronizar

#### 4.2 Processamento em Lote

- Processar múltiplas OS de uma vez
- Mostrar progresso
- Relatório de sucessos/erros
- Permitir reprocessar OS com erro

---

### FASE 5: FLUXO DE TRABALHO

#### 5.1 Fluxo Completo

```
1. OS é criada no Google Drive
   └─> Pasta: ORDENS DE SERVIÇOS/2026/JANEIRO/ORDEM_SERVICO_208449.pdf

2. Sistema detecta nova OS (sincronização)
   └─> Função: process-os-folder

3. Download e Extração
   └─> Baixa PDF
   └─> Extrai texto
   └─> Envia para IA (Gemini)
   └─> Recebe dados estruturados

4. Validação e Normalização
   └─> Valida formato número OS
   └─> Normaliza datas/horários
   └─> Mapeia região administrativa
   └─> Valida destinatários

5. Inserção no Banco
   └─> Verifica duplicatas
   └─> Insere em fat_ordens_servico
   └─> Registra em os_processadas

6. Interface do Usuário
   └─> OS aparece na lista
   └─> Status: "Processada"
   └─> Usuário pode:
       - Visualizar detalhes
       - Editar dados (se necessário)
       - Criar registro relacionado
       - Marcar como executada
```

---

### FASE 6: RECURSOS ADICIONAIS

#### 6.1 Relatórios e Estatísticas

- Dashboard de OS:
  - OS por mês/ano
  - OS por tipo de evento
  - OS por destinatário
  - Taxa de execução
  - Tempo médio entre criação e execução

#### 6.2 Notificações

- Notificar destinatários quando OS é criada
- Lembretes de OS pendentes
- Alertas de OS próximas do prazo

#### 6.3 Integração com Outros Módulos

- **Seção de Pessoas:** Escalar efetivo baseado na OS
- **Seção de Logística:** Alocar veículos/equipamentos
- **Registros:** Criar registro automaticamente após execução

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Tecnologias a Utilizar:

1. **Google Drive API v3**
   - Listar arquivos recursivamente
   - Download de PDFs
   - OAuth 2.0 (já configurado no projeto)

2. **PDF Parsing**
   - Biblioteca: `pdf-parse` ou similar
   - Extrair texto do PDF

3. **IA para Extração**
   - Lovable AI Gateway
   - Modelo: `google/gemini-2.5-flash`
   - Schema estruturado para extração

4. **Supabase Edge Functions**
   - Função: `process-os-folder`
   - Similar à `process-raps-folder` existente

5. **Frontend React/TypeScript**
   - Nova página: `ControleOS.tsx`
   - Componentes: Cards, Tabelas, Filtros
   - Integração com Supabase

---

## 📊 ESTRUTURA DE PASTAS

```
supabase/
  ├── functions/
  │   └── process-os-folder/
  │       └── index.ts
  ├── migrations/
  │   └── 20260125000015_criar_tabelas_ordens_servico.sql

src/
  ├── pages/
  │   └── ControleOS.tsx
  ├── components/
  │   └── os/
  │       ├── OSDashboard.tsx
  │       ├── OSList.tsx
  │       ├── OSDetail.tsx
  │       └── OSSyncButton.tsx
  └── services/
      └── osService.ts
```

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES

1. **Segurança:**
   - RLS policies para `fat_ordens_servico`
   - Apenas seção operacional e admin podem acessar
   - Logs de processamento

2. **Performance:**
   - Processar em lotes (máx 5-10 por vez)
   - Cache de OS já processadas
   - Índices no banco de dados

3. **Tratamento de Erros:**
   - PDFs corrompidos
   - Extração falha
   - Dados incompletos
   - Duplicatas

4. **Validação:**
   - Número da OS único
   - Datas válidas
   - Destinatários válidos
   - Campos obrigatórios

---

## 🎯 PRÓXIMOS PASSOS (QUANDO APROVADO)

1. Criar migration com tabelas
2. Criar função Supabase Edge `process-os-folder`
3. Criar página `ControleOS.tsx`
4. Adicionar rota em `App.tsx`
5. Adicionar card em `SecaoOperacional.tsx`
6. Testar com OS reais
7. Ajustar extração conforme necessário

---

## 📝 OBSERVAÇÕES

- A estrutura é similar ao sistema de RAPs já existente
- Pode reutilizar muito código de `process-raps-folder`
- A IA já está configurada e funcionando
- Google Drive API já está integrada
- Apenas precisa adaptar o schema de extração para OS
