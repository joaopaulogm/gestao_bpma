# Especificação Técnica Completa - Formulário de Resgate de Fauna

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Fluxo Passo a Passo do Usuário](#2-fluxo-passo-a-passo-do-usuário)
3. [Layout e UI](#3-layout-e-ui)
4. [Inventário de Campos](#4-inventário-de-campos)
5. [Regras de Negócio](#5-regras-de-negócio)
6. [Integrações e Persistência](#6-integrações-e-persistência)
7. [Segurança e Permissões](#7-segurança-e-permissões)
8. [Casos de Teste](#8-casos-de-teste)
9. [Blueprint para Reconstrução](#9-blueprint-para-reconstrução)

---

## 1. Visão Geral

### 1.1 Finalidade do Formulário

O formulário de Resgate de Fauna é utilizado para registrar ocorrências de resgate de animais silvestres realizadas pelo Batalhão de Polícia Militar Ambiental (BPMA). Permite cadastrar informações detalhadas sobre cada resgate, incluindo dados da ocorrência, equipe envolvida, espécies resgatadas e destinação dos animais.

### 1.2 Rotas do Sistema

- **Rota de Cadastro**: `/secao-operacional/resgate-cadastro`
- **Rota Alternativa**: `/resgate-cadastro` (requer role 'operador')
- **Rota de Edição**: `/secao-operacional/resgate-cadastro?editar={id}`

### 1.3 Perfis e Permissões

- **Role Requerida**: `secao_operacional` (para rota principal) ou `operador` (para rota alternativa)
- **Criar**: Usuários autenticados com role `secao_operacional` ou `operador`
- **Editar**: Usuários autenticados com role `secao_operacional` ou `operador`
- **Visualizar**: Usuários autenticados (qualquer role)
- **Excluir**: Não implementado no formulário (apenas via outras interfaces)

### 1.4 Componentes Principais

- **Página**: `src/pages/ResgateCadastro.tsx`
- **Container**: `src/components/resgate/ResgateFormContainer.tsx`
- **Formulário**: `src/components/resgate/ResgateForm.tsx`
- **Wrapper**: `src/components/resgate/ResgateFormWrapper.tsx`
- **Seções**:
  - `InformacoesGeraisSection.tsx`
  - `EquipeSection.tsx`
  - `EspeciesMultiplasSection.tsx`

---

## 2. Fluxo Passo a Passo do Usuário

### 2.1 Modo de Criação (Novo Registro)

**Passo 1**: Usuário acessa `/secao-operacional/resgate-cadastro`

**Passo 2**: Sistema verifica autenticação e role. Se não autenticado ou sem role adequada, redireciona para login.

**Passo 3**: Formulário é renderizado com valores padrão vazios (definidos em `defaultResgateForm`).

**Passo 4**: Usuário preenche seção "Informações Gerais":
- Data (obrigatório, formato DD/MM/AAAA com máscara automática)
- Horário de Acionamento (opcional, tipo time)
- Horário de Término (opcional, tipo time)
- Região Administrativa (obrigatório, busca por texto)
- Tipo de Área (opcional, select com dados de `dim_tipo_de_area`)
- Origem (obrigatório, select fixo)
- Se origem = "Resgate de Fauna": Desfecho do Resgate (obrigatório, select dinâmico)
- Se origem = "Apreensão": Desfecho da Apreensão (obrigatório, select fixo)
  - Se desfecho = "TCO PMDF" ou "TCO PCDF": Nº TCO (obrigatório)
  - Se desfecho = "Outros": Especificação (obrigatório, textarea)
- Latitude do Resgate (obrigatório, validação -90 a 90)
- Longitude do Resgate (obrigatório, validação -180 a 180)

**Passo 5**: Usuário adiciona membros da equipe (opcional):
- Digita matrícula ou nome do policial
- Clica em "Buscar" ou pressiona Enter
- Sistema busca em `dim_efetivo` (apenas ativos)
- Se encontrado, adiciona à lista
- Pode remover membros clicando no ícone de lixeira

**Passo 6**: Usuário adiciona espécies (obrigatório, exceto se desfecho = "Evadido"):
- Clica em "Adicionar Espécie"
- Para cada espécie:
  - Seleciona Classe Taxonômica (obrigatório, exceto se Evadido)
  - Seleciona Espécie (obrigatório, exceto se Evadido) - filtrado por classe
  - Seleciona Estado de Saúde (obrigatório, exceto se Evadido)
  - Seleciona Atropelamento (obrigatório, exceto se Evadido)
  - Seleciona Estágio da Vida (obrigatório, exceto se Evadido)
  - Define quantidades (Adultos, Filhotes, Jovens) usando botões +/- ou input direto
  - Quantidade Total é calculada automaticamente
  - Seleciona Desfecho do Resgate (obrigatório, exceto se Evadido)
  - Seleciona Destinação (obrigatório, exceto se Evadido)
  - Preenche campos condicionais baseados na destinação:
    - CETAS/IBAMA, HFAUS/IBRAM, HVet/UnB: Nº Termo de Entrega (opcional)
    - CEAPA/BPMA: Hora de Guarda (obrigatório) e Motivo (obrigatório)
    - Soltura: Latitude e Longitude da Soltura (obrigatórios)
    - Outros: Especificação (obrigatório, textarea)

**Passo 7**: Usuário clica em "Cadastrar resgate"

**Passo 8**: Sistema valida formulário:
- Validações do Zod schema
- Validações condicionais (desfecho quando origem = "Resgate de Fauna")
- Verifica se há pelo menos uma espécie (exceto se desfecho = "Evadido")
- Se houver erros, exibe mensagens e destaca campos inválidos

**Passo 9**: Se validação passar:
- Sistema determina tabela destino baseado na data:
  - >= 2026-01-01: `fat_registros_de_resgate`
  - 2025: `fat_resgates_diarios_2025`
  - 2024: `fat_resgates_diarios_2024`
  - 2023: `fat_resgates_diarios_2023`
  - 2022: `fat_resgates_diarios_2022`
  - 2021: `fat_resgates_diarios_2021`
  - 2020: `fat_resgates_diarios_2020`
- Para cada espécie, cria um registro na tabela
- Para cada registro, salva membros da equipe em `fat_equipe_resgate`
- Exibe toast de sucesso
- Reseta formulário
- Mantém na mesma página (não redireciona)

**Passo 10**: Se houver erro:
- Exibe toast de erro com mensagem específica
- Mantém dados preenchidos
- Destaca campos com erro

### 2.2 Modo de Edição

**Passo 1**: Usuário acessa `/secao-operacional/resgate-cadastro?editar={id}` ou navega de outra página passando `registro` no state.

**Passo 2**: Sistema detecta parâmetro `editar` ou `registro` no state.

**Passo 3**: Se `registro` estiver no state, usa esses dados. Caso contrário, busca do banco:
- Tenta buscar de `fat_resgates_diarios_2025` (hardcoded no hook de edição)
- Formata data para DD/MM/AAAA
- Popula formulário com dados encontrados

**Passo 4**: Formulário é preenchido com dados existentes.

**Passo 5**: Usuário pode modificar qualquer campo.

**Passo 6**: Ao clicar em "Salvar alterações":
- Valida formulário
- Determina tabela origem (baseado na data original) e tabela destino (baseado na data editada)
- Se tabelas forem diferentes, move registro (deleta do antigo, insere no novo)
- Se tabelas forem iguais, atualiza registro
- Atualiza equipe se necessário
- Exibe toast de sucesso
- Redireciona para `/secao-operacional/registros`

### 2.3 Comportamento em Caso de Erro

- **Erro de Validação**: Campos são destacados em vermelho, mensagens de erro aparecem abaixo dos campos, toast genérico "Não foi possível salvar: revise os campos destacados"
- **Erro de Rede/Banco**: Toast com mensagem específica do erro, dados mantidos no formulário
- **Erro ao Carregar para Edição**: Toast de erro, redireciona para `/secao-operacional/registros` após 2 segundos

---

## 3. Layout e UI

### 3.1 Estrutura Visual

O formulário é organizado em uma página com layout responsivo usando Tailwind CSS:

```
┌─────────────────────────────────────────┐
│  Layout (com Sidebar e Header)         │
│  ┌───────────────────────────────────┐  │
│  │  ResgateFormContainer             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  ResgateFormHeader          │  │  │
│  │  │  (Título + Descrição)       │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  FormErrorDisplay            │  │  │
│  │  │  (Alertas de erro)           │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  <form>                     │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │ InformacoesGerais     │  │  │  │
│  │  │  │ (Grid 2 colunas)      │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │ EquipeSection         │  │  │  │
│  │  │  │ (Lista de membros)    │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │ EspeciesMultiplas     │  │  │  │
│  │  │  │ (Cards por espécie)   │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │ SubmitButton          │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  │  </form>                    │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3.2 Componentes Utilizados

- **Input**: Campos de texto, números, time, date
- **Select**: Dropdowns com busca interna (para classes e espécies)
- **Textarea**: Campos de texto longo
- **Button**: Botões de ação (buscar, adicionar, remover, submit)
- **FormField**: Wrapper para campos com label, erro e required
- **FormSection**: Container de seção com título
- **Alert**: Exibição de erros de nível de formulário
- **Toast**: Notificações de sucesso/erro (via Sonner)

### 3.3 Estados de UI

- **Loading**: Spinner no botão de buscar policial, "Carregando..." nos selects
- **Disabled**: Botões desabilitados durante submissão, selects desabilitados durante carregamento
- **Validação**: Bordas vermelhas em campos com erro, mensagens abaixo dos campos
- **Empty State**: Mensagem "Nenhuma espécie adicionada" quando lista está vazia
- **Skeleton**: Não implementado

---

## 4. Inventário de Campos

### 4.1 Seção: Informações Gerais

| Campo | ID Interno | Label | Tipo | Obrigatório | Validações | Valor Padrão | Máscara | Dependências | Placeholder | Mapeamento Banco |
|-------|------------|-------|------|-------------|------------|--------------|---------|--------------|-------------|------------------|
| Data | `data` | Data | text | Sim | Formato DD/MM/AAAA, data válida | `''` | Auto-formatação DD/MM/AAAA | - | "DD/MM/AAAA" | `fat_*.data` (DATE) |
| Horário Acionamento | `horarioAcionamento` | Horário de Acionamento | time | Não | - | `''` | - | - | - | `fat_*.horario_acionamento` (TIME) |
| Horário Término | `horarioTermino` | Horário de Término | time | Não | - | `''` | - | - | - | `fat_*.horario_termino` (TIME) |
| Região Administrativa | `regiaoAdministrativa` | Região Administrativa | text (busca) | Sim | Deve existir na lista | `''` | - | - | "Digite para buscar ou selecione" | `fat_*.regiao_administrativa_id` (UUID → `dim_regiao_administrativa.id`) |
| Tipo de Área | `tipoAreaId` | Tipo de Área | select | Não | - | `''` | - | - | "Selecione o tipo de área" | `fat_*.tipo_area_id` (UUID → `dim_tipo_de_area.id`) |
| Origem | `origem` | Origem | select | Sim | Valores fixos | `''` | - | - | "Selecione a origem" | `fat_*.origem_id` (UUID → `dim_origem.id`) |
| Desfecho Resgate | `desfechoResgate` | Desfecho do Resgate | select | Condicional* | - | `''` | - | Visível apenas se `origem === "Resgate de Fauna"` | "Selecione o desfecho" | `fat_*.desfecho_id` (UUID → `dim_desfecho_resgates.id`) |
| Desfecho Apreensão | `desfechoApreensao` | Desfecho da Apreensão | select | Condicional** | - | `''` | - | Visível apenas se `origem === "Apreensão"` | "Selecione o desfecho" | `fat_*.desfecho_id` (UUID → `dim_desfecho_crime_ambientais.id`) |
| Nº TCO | `numeroTCO` | Nº TCO PMDF / Nº TCO PCDF | text | Condicional*** | - | `''` | - | Visível se `desfechoApreensao === "TCO PMDF"` ou `"TCO PCDF"` | - | `fat_*.numero_tco` (TEXT) |
| Outro Desfecho | `outroDesfecho` | Descreva o Desfecho | textarea | Condicional**** | - | `''` | - | Visível se `desfechoApreensao === "Outros"` | - | `fat_*.outro_desfecho` (TEXT) |
| Latitude Origem | `latitudeOrigem` | Latitude do Resgate | text | Sim | Número entre -90 e 90 | `''` | - | - | "Ex: -15.7801" | `fat_*.latitude_origem` (TEXT) |
| Longitude Origem | `longitudeOrigem` | Longitude do Resgate | text | Sim | Número entre -180 e 180 | `''` | - | - | "Ex: -47.9292" | `fat_*.longitude_origem` (TEXT) |

\* Obrigatório se `origem === "Resgate de Fauna"`  
\** Obrigatório se `origem === "Apreensão"`  
\*** Obrigatório se `desfechoApreensao === "TCO PMDF"` ou `"TCO PCDF"`  
\**** Obrigatório se `desfechoApreensao === "Outros"`

### 4.2 Seção: Identificação da Equipe

| Campo | ID Interno | Label | Tipo | Obrigatório | Validações | Valor Padrão | Máscara | Dependências | Placeholder | Mapeamento Banco |
|-------|------------|-------|------|-------------|------------|--------------|---------|--------------|-------------|------------------|
| Busca Policial | `matricula` (input temporário) | Matrícula ou Nome do Policial | text | Não | Mínimo 2 caracteres para busca por nome | `''` | - | - | "Digite a matrícula ou nome do policial" | - |
| Lista Membros | `membrosEquipe[]` | Policiais na Equipe | lista | Não | Não permite duplicatas | `[]` | - | - | - | `fat_equipe_resgate` (tabela relacionada) |

**Estrutura de MembroEquipe:**
- `id`: string (UUID gerado no frontend)
- `efetivo_id`: string (UUID de `dim_efetivo.id`)
- `matricula`: string
- `posto_graduacao`: string
- `nome_guerra`: string

### 4.3 Seção: Identificação das Espécies

Cada espécie é um objeto `EspecieItem` com os seguintes campos:

| Campo | ID Interno | Label | Tipo | Obrigatório | Validações | Valor Padrão | Máscara | Dependências | Placeholder | Mapeamento Banco |
|-------|------------|-------|------|-------------|------------|--------------|---------|--------------|-------------|------------------|
| Classe Taxonômica | `classeTaxonomica` | Classe Taxonômica | select (com busca) | Condicional* | - | `''` | - | - | "Selecione a classe" | Não salvo diretamente (vem da espécie) |
| Espécie | `especieId` | Espécie (Nome Popular) | select (com busca) | Condicional* | - | `''` | - | Requer `classeTaxonomica` selecionada | "Selecione a classe primeiro" / "Selecione a espécie" | `fat_*.especie_id` (UUID → `dim_especies_fauna.id`) |
| Estado de Saúde | `estadoSaude` | Estado de Saúde | select | Condicional* | - | `''` | - | - | "Selecione o estado de saúde" | `fat_*.estado_saude_id` (UUID → `dim_estado_saude.id`) |
| Atropelamento | `atropelamento` | Atropelamento | select | Condicional* | Valores: "Sim", "Não" | `''` | - | - | "Selecione" | `fat_*.atropelamento` (TEXT) |
| Estágio da Vida | `estagioVida` | Estágio da Vida | select | Condicional* | - | `''` | - | - | "Selecione o estágio" | `fat_*.estagio_vida_id` (UUID → `dim_estagio_vida.id`) |
| Quantidade Adultos | `quantidadeAdulto` | Quantidade Adultos | number (botões +/-) | Condicional* | Mínimo 0 | `0` | - | - | - | `fat_*.quantidade_adulto` (INTEGER) |
| Quantidade Filhotes | `quantidadeFilhote` | Quantidade Filhotes | number (botões +/-) | Condicional* | Mínimo 0 | `0` | - | - | - | `fat_*.quantidade_filhote` (INTEGER) |
| Quantidade Jovem | `quantidadeJovem` | Quantidade Jovem | number (botões +/-) | Condicional* | Mínimo 0 | `0` | - | - | - | `fat_*.quantidade Jovem` (INTEGER, coluna com espaço) |
| Quantidade Total | `quantidadeTotal` | Quantidade Total | number (readonly) | - | Calculado automaticamente | `0` | - | Calculado: `adulto + filhote + jovem` | - | `fat_*.quantidade_total` (INTEGER) |
| Desfecho do Resgate | `desfechoResgate` | Desfecho do Resgate | select | Condicional* | - | `''` | - | - | "Selecione o desfecho" | `fat_*.desfecho_id` (UUID → `dim_desfecho_resgates.id`) |
| Destinação | `destinacao` | Destinação | select | Condicional* | Valores fixos | `''` | - | - | "Selecione a destinação" | `fat_*.destinacao_id` (UUID → `dim_destinacao.id`) |
| Nº Termo de Entrega | `numeroTermoEntrega` | Nº Termo de Entrega | text | Não | - | `''` | - | Visível se `destinacao === "CETAS/IBAMA"` ou `"HFAUS/IBRAM"` ou `"HVet/UnB"` | "Número do termo" | `fat_*.numero_termo_entrega` (TEXT) |
| Hora Guarda CEAPA | `horaGuardaCEAPA` | Hora de Guarda no CEAPA | text | Condicional** | - | `''` | - | Visível se `destinacao === "CEAPA/BPMA"` | "HH:MM (formato 24h)" | `fat_*.hora_guarda_ceapa` (TEXT) |
| Motivo Entrega CEAPA | `motivoEntregaCEAPA` | Motivo | textarea | Condicional** | - | `''` | - | Visível se `destinacao === "CEAPA/BPMA"` | "Descreva o motivo da entrega" | `fat_*.motivo_entrega_ceapa` (TEXT) |
| Latitude Soltura | `latitudeSoltura` | Latitude da Soltura | text | Condicional*** | - | `''` | - | Visível se `destinacao === "Soltura"` | "Ex: -15.7801" | `fat_*.latitude_soltura` (TEXT) |
| Longitude Soltura | `longitudeSoltura` | Longitude da Soltura | text | Condicional*** | - | `''` | - | Visível se `destinacao === "Soltura"` | "Ex: -47.9292" | `fat_*.longitude_soltura` (TEXT) |
| Outro Destinacao | `outroDestinacao` | Especifique a Destinação | textarea | Condicional**** | - | `''` | - | Visível se `destinacao === "Outros"` | "Descreva a destinação" | `fat_*.outro_destinacao` (TEXT) |

\* Obrigatório se `isEvadido === false` (ou seja, se `desfechoResgate !== "Evadido"`)  
\** Obrigatório se `destinacao === "CEAPA/BPMA"` E `isEvadido === false`  
\*** Obrigatório se `destinacao === "Soltura"` E `isEvadido === false`  
\**** Obrigatório se `destinacao === "Outros"` E `isEvadido === false`

**Campos Auto-preenchidos ao selecionar Espécie:**
- `nomeCientifico`: string (readonly, exibido no card)
- `ordemTaxonomica`: string (readonly, exibido no card)
- `estadoConservacao`: string (readonly, exibido no card)
- `tipoFauna`: string (readonly, exibido no card)

---

## 5. Regras de Negócio

### 5.1 Validações Condicionais

1. **Desfecho do Resgate (nível registro)**: Obrigatório apenas se `origem === "Resgate de Fauna"`
2. **Desfecho da Apreensão**: Obrigatório apenas se `origem === "Apreensão"`
3. **Nº TCO**: Obrigatório apenas se `desfechoApreensao === "TCO PMDF"` ou `"TCO PCDF"`
4. **Outro Desfecho**: Obrigatório apenas se `desfechoApreensao === "Outros"`
5. **Campos de Espécie**: Todos obrigatórios EXCETO se `desfechoResgate === "Evadido"` (nível registro) ou se `especie.desfechoResgate === "Evadido"` (nível espécie)
6. **Quantidade Mínima de Espécies**: Deve haver pelo menos 1 espécie, EXCETO se `desfechoResgate === "Evadido"` (nível registro)

### 5.2 Cálculos Automáticos

- **Quantidade Total**: `quantidadeAdulto + quantidadeFilhote + quantidadeJovem` (calculado automaticamente ao alterar qualquer quantidade)
- **Data Formatada**: Conversão de DD/MM/AAAA para YYYY-MM-DD antes de salvar

### 5.3 Transformações Antes de Salvar

1. **Data**: Parse de DD/MM/AAAA para Date object, depois format para YYYY-MM-DD
2. **Nomes para IDs**: Todos os selects que exibem nomes são convertidos para IDs usando `buscarIdPorNome()`:
   - Região Administrativa → `regiao_administrativa_id`
   - Origem → `origem_id`
   - Desfecho → `desfecho_id`
   - Estado de Saúde → `estado_saude_id`
   - Estágio de Vida → `estagio_vida_id`
   - Destinação → `destinacao_id`
   - Tipo de Área → `tipo_area_id`

### 5.4 Regras de Exibição Condicional

1. **Desfecho do Resgate**: Aparece apenas se `origem === "Resgate de Fauna"`
2. **Desfecho da Apreensão**: Aparece apenas se `origem === "Apreensão"`
3. **Nº TCO**: Aparece apenas se `desfechoApreensao === "TCO PMDF"` ou `"TCO PCDF"`
4. **Outro Desfecho**: Aparece apenas se `desfechoApreensao === "Outros"`
5. **Campos de Destinação por Espécie**:
   - Nº Termo de Entrega: Se `destinacao === "CETAS/IBAMA"` ou `"HFAUS/IBRAM"` ou `"HVet/UnB"`
   - Hora Guarda CEAPA + Motivo: Se `destinacao === "CEAPA/BPMA"`
   - Latitude/Longitude Soltura: Se `destinacao === "Soltura"`
   - Outro Destinacao: Se `destinacao === "Outros"`

### 5.5 Regras de Busca

1. **Busca de Policial**: 
   - Busca por matrícula exata (com e sem zeros à esquerda)
   - Busca por nome_guerra (ILIKE, mínimo 2 caracteres)
   - Busca por nome completo (ILIKE, mínimo 2 caracteres)
   - Apenas efetivo ativo (`ativo = true`)
   - Limite de 20 resultados

2. **Busca de Classe Taxonômica**: 
   - Busca case-insensitive no select
   - Filtro em tempo real conforme digitação

3. **Busca de Espécie**: 
   - Filtrado por classe taxonômica selecionada
   - Busca case-insensitive no nome popular
   - Filtro em tempo real conforme digitação

### 5.6 Comportamento em Modo de Edição

- Formulário é preenchido com dados do registro existente
- Data é convertida de YYYY-MM-DD para DD/MM/AAAA para exibição
- Nomes são buscados das tabelas de dimensão para popular selects
- Se a data for alterada e mudar de ano, o registro é movido para a tabela correta
- Equipe é recarregada e pode ser modificada
- Espécies são recarregadas (atualmente suporta apenas 1 espécie no modo de edição, baseado no código)

---

## 6. Integrações e Persistência

### 6.1 Tabelas do Banco de Dados

#### 6.1.1 Tabelas Principais (Fato)

**Tabelas por Ano:**
- `fat_registros_de_resgate` (>= 2026-01-01)
- `fat_resgates_diarios_2025` (ano 2025)
- `fat_resgates_diarios_2024` (ano 2024)
- `fat_resgates_diarios_2023` (ano 2023)
- `fat_resgates_diarios_2022` (ano 2022)
- `fat_resgates_diarios_2021` (ano 2021)
- `fat_resgates_diarios_2020` (ano 2020)

**Estrutura Moderna (2025+ e fat_registros_de_resgate):**
```sql
- id: uuid (PK)
- data: date
- horario_acionamento: time
- horario_termino: time
- especie_id: uuid (FK → dim_especies_fauna.id)
- regiao_administrativa_id: uuid (FK → dim_regiao_administrativa.id)
- origem_id: uuid (FK → dim_origem.id)
- estado_saude_id: uuid (FK → dim_estado_saude.id)
- estagio_vida_id: uuid (FK → dim_estagio_vida.id)
- destinacao_id: uuid (FK → dim_destinacao.id)
- desfecho_id: uuid (FK → dim_desfecho_resgates.id ou dim_desfecho_crime_ambientais.id)
- tipo_area_id: uuid (FK → dim_tipo_de_area.id)
- latitude_origem: text
- longitude_origem: text
- numero_tco: text
- outro_desfecho: text
- atropelamento: text
- quantidade_adulto: integer
- quantidade_filhote: integer
- "quantidade Jovem": integer (coluna com espaço no nome)
- quantidade_total: integer
- numero_termo_entrega: text
- hora_guarda_ceapa: text
- motivo_entrega_ceapa: text
- latitude_soltura: text
- longitude_soltura: text
- outro_destinacao: text
- created_at: timestamp
```

**Estrutura Histórica (2020-2024):**
```sql
- id: uuid (PK)
- data_ocorrencia: date
- nome_popular: text
- nome_cientifico: text
- classe_taxonomica: text
- ordem_taxonomica: text
- tipo_de_fauna: text
- estado_de_conservacao: text
- quantidade_resgates: integer
- quantidade_solturas: integer
- quantidade_obitos: integer
- quantidade_feridos: integer
- quantidade_filhotes: integer
- mes: text
- especie_id: uuid (FK)
```

**Tabela de Equipe:**
- `fat_equipe_resgate`:
  - `id`: uuid (PK)
  - `registro_id`: uuid (FK → fat_*.id)
  - `efetivo_id`: uuid (FK → dim_efetivo.id)

#### 6.1.2 Tabelas de Dimensão (Lookup)

- `dim_regiao_administrativa`: id, nome
- `dim_origem`: id, nome
- `dim_destinacao`: id, nome
- `dim_estado_saude`: id, nome
- `dim_estagio_vida`: id, nome
- `dim_desfecho_resgates`: id, nome, tipo
- `dim_desfecho_crime_ambientais`: id, nome, tipo
- `dim_tipo_de_area`: id, "Tipo de Área" (coluna com espaço)
- `dim_especies_fauna`: id, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, familia_taxonomica, tipo_de_fauna, estado_de_conservacao, imagens_paths
- `dim_efetivo`: id, matricula, posto_graduacao, nome_guerra, nome, ativo

### 6.2 Operações de Banco

#### 6.2.1 Inserção (Criação)

Para cada espécie no array `especies`:
1. Buscar IDs das dimensões (região, origem, desfecho, estado_saude, estagio_vida, destinacao)
2. Se espécie tiver `desfechoResgate`, usar esse; senão, usar desfecho do registro principal
3. Preparar payload baseado no tipo de tabela (histórica vs moderna)
4. Inserir registro na tabela determinada pela data
5. Obter ID do registro inserido
6. Inserir membros da equipe em `fat_equipe_resgate` vinculados ao `registro_id`

#### 6.2.2 Atualização (Edição)

1. Determinar tabela origem (data original) e tabela destino (data editada)
2. Se tabelas diferentes:
   - Buscar equipe do registro original
   - Deletar registro da tabela origem
   - Deletar equipe vinculada
   - Inserir registro na tabela destino
   - Inserir equipe vinculada ao novo registro
3. Se tabelas iguais:
   - Atualizar registro na mesma tabela
   - Atualizar equipe se necessário

#### 6.2.3 Consultas

- **Carregar Espécies**: `SELECT * FROM dim_especies_fauna ORDER BY nome_popular`
- **Carregar Dimensões**: Queries paralelas para estados_saude, estagios_vida, desfechos_resgate
- **Buscar Policial**: Query complexa com OR conditions em `dim_efetivo`
- **Buscar ID por Nome**: `SELECT id FROM {tabela} WHERE nome ILIKE {nome}`

### 6.3 Storage de Imagens

- **Bucket**: `imagens-fauna` (Supabase Storage)
- **Path**: Armazenado em `dim_especies_fauna.imagens_paths` (JSONB array)
- **Acesso**: URLs públicas ou signed URLs via `getFaunaImageUrl()`
- **Exibição**: Galeria de até 6 imagens no card de detalhes da espécie

---

## 7. Segurança e Permissões

### 7.1 Políticas RLS (Row Level Security)

**Política Atual (Migration 20260126000002):**
- Todas as tabelas públicas têm RLS habilitado
- Políticas genéricas para usuários autenticados:
  - `authenticated_users_select_{tabela}`: SELECT para qualquer autenticado
  - `authenticated_users_insert_{tabela}`: INSERT para qualquer autenticado
  - `authenticated_users_update_{tabela}`: UPDATE para qualquer autenticado
  - `authenticated_users_delete_{tabela}`: DELETE para qualquer autenticado
- Condição: `auth.uid() IS NOT NULL` (apenas usuários autenticados)

### 7.2 Permissões no Frontend

- **Rota Protegida**: `ProtectedRoute` com `requiredRoles={['secao_operacional']}`
- **Verificação**: Hook `useAuth()` verifica role do usuário
- **Fallback**: Redireciona para login se não autenticado ou sem role adequada

### 7.3 Tratamento de Erros de Permissão

- Se backend negar acesso (403), toast de erro é exibido
- Dados não são perdidos (mantidos no formulário)
- Usuário pode tentar novamente após resolver problema de permissão

---

## 8. Casos de Teste

### 8.1 Cenários de Sucesso

**Cenário 1: Cadastro Completo com Uma Espécie**
1. Preencher todos os campos obrigatórios
2. Adicionar 1 membro à equipe
3. Adicionar 1 espécie com todos os campos
4. Clicar em "Cadastrar resgate"
5. **Resultado Esperado**: Toast de sucesso, formulário resetado, registro salvo no banco

**Cenário 2: Cadastro Múltiplas Espécies**
1. Preencher informações gerais
2. Adicionar 3 espécies diferentes
3. Cada espécie com destinação diferente
4. Clicar em "Cadastrar resgate"
5. **Resultado Esperado**: 3 registros criados, cada um com equipe vinculada

**Cenário 3: Cadastro com Desfecho "Evadido"**
1. Selecionar origem "Resgate de Fauna"
2. Selecionar desfecho "Evadido"
3. Não adicionar espécies
4. Clicar em "Cadastrar resgate"
5. **Resultado Esperado**: Registro salvo sem espécies (validação permite)

**Cenário 4: Cadastro com Apreensão**
1. Selecionar origem "Apreensão"
2. Selecionar desfecho "TCO PMDF"
3. Preencher Nº TCO
4. Adicionar espécies
5. Clicar em "Cadastrar resgate"
6. **Resultado Esperado**: Registro salvo com `desfecho_id` da tabela `dim_desfecho_crime_ambientais`

### 8.2 Cenários de Validação

**Cenário 5: Data Inválida**
1. Preencher data como "32/13/2025"
2. Tentar salvar
3. **Resultado Esperado**: Erro de validação, campo destacado em vermelho

**Cenário 6: Latitude Fora do Range**
1. Preencher latitude como "91"
2. Tentar salvar
3. **Resultado Esperado**: Erro "Latitude deve ser um número entre -90 e 90"

**Cenário 7: Desfecho Obrigatório Não Preenchido**
1. Selecionar origem "Resgate de Fauna"
2. Não selecionar desfecho
3. Tentar salvar
4. **Resultado Esperado**: Erro "Desfecho do Resgate é obrigatório"

**Cenário 8: Espécie Sem Classe**
1. Tentar selecionar espécie sem ter selecionado classe
2. **Resultado Esperado**: Select de espécie desabilitado, placeholder "Selecione a classe primeiro"

**Cenário 9: Nº TCO Obrigatório Não Preenchido**
1. Selecionar origem "Apreensão"
2. Selecionar desfecho "TCO PMDF"
3. Não preencher Nº TCO
4. Tentar salvar
5. **Resultado Esperado**: Erro "Número do TCO é obrigatório"

### 8.3 Cenários de Integração

**Cenário 10: Policial Não Encontrado**
1. Digitar matrícula inexistente
2. Clicar em "Buscar"
3. **Resultado Esperado**: Toast "Policial não encontrado"

**Cenário 11: Policial Duplicado**
1. Adicionar policial à equipe
2. Tentar adicionar o mesmo policial novamente
3. **Resultado Esperado**: Toast "Este policial já foi adicionado"

**Cenário 12: Espécie com Destinação Soltura**
1. Adicionar espécie
2. Selecionar destinação "Soltura"
3. **Resultado Esperado**: Campos de latitude e longitude da soltura aparecem

**Cenário 13: Espécie com Destinação CEAPA**
1. Adicionar espécie
2. Selecionar destinação "CEAPA/BPMA"
3. **Resultado Esperado**: Campos "Hora de Guarda" e "Motivo" aparecem

### 8.4 Cenários de Edição

**Cenário 14: Editar Registro Existente**
1. Acessar `/secao-operacional/resgate-cadastro?editar={id}`
2. Modificar data
3. Modificar espécie
4. Clicar em "Salvar alterações"
5. **Resultado Esperado**: Registro atualizado, toast de sucesso, redirecionamento

**Cenário 15: Editar Mudando Ano (Mover Registro)**
1. Editar registro de 2025
2. Alterar data para 2026
3. Salvar
4. **Resultado Esperado**: Registro deletado de `fat_resgates_diarios_2025` e inserido em `fat_registros_de_resgate`

### 8.5 Cenários de Erro

**Cenário 16: Erro de Rede**
1. Desconectar internet
2. Tentar salvar
3. **Resultado Esperado**: Toast de erro, dados mantidos

**Cenário 17: Erro ao Carregar para Edição**
1. Acessar edição com ID inválido
2. **Resultado Esperado**: Toast de erro, redirecionamento após 2 segundos

**Cenário 18: Erro ao Buscar Policial**
1. Erro na query do Supabase
2. **Resultado Esperado**: Toast com mensagem específica do erro

---

## 9. Blueprint para Reconstrução

### 9.1 JSON Schema do Formulário

```json
{
  "formSchema": {
    "sections": [
      {
        "id": "informacoes_gerais",
        "title": "Informações Gerais",
        "layout": "grid",
        "columns": 2,
        "fields": [
          {
            "id": "data",
            "name": "data",
            "label": "Data",
            "type": "text",
            "required": true,
            "mask": "DD/MM/AAAA",
            "validation": {
              "pattern": "^\\d{2}/\\d{2}/\\d{4}$",
              "message": "Data é obrigatória"
            },
            "defaultValue": "",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "data",
              "type": "date",
              "transform": "parseDDMMYYYY_to_YYYYMMDD"
            }
          },
          {
            "id": "horarioAcionamento",
            "name": "horarioAcionamento",
            "label": "Horário de Acionamento",
            "type": "time",
            "required": false,
            "defaultValue": "",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "horario_acionamento",
              "type": "time"
            }
          },
          {
            "id": "horarioTermino",
            "name": "horarioTermino",
            "label": "Horário de Término",
            "type": "time",
            "required": false,
            "defaultValue": "",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "horario_termino",
              "type": "time"
            }
          },
          {
            "id": "regiaoAdministrativa",
            "name": "regiaoAdministrativa",
            "label": "Região Administrativa",
            "type": "select_search",
            "required": true,
            "dataSource": {
              "type": "static",
              "values": "constants/regioes.ts"
            },
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "regiao_administrativa_id",
              "type": "uuid",
              "lookupTable": "dim_regiao_administrativa",
              "lookupColumn": "nome",
              "transform": "nameToId"
            }
          },
          {
            "id": "tipoAreaId",
            "name": "tipoAreaId",
            "label": "Tipo de Área",
            "type": "select",
            "required": false,
            "dataSource": {
              "type": "database",
              "table": "dim_tipo_de_area",
              "columns": ["id", "\"Tipo de Área\""],
              "orderBy": "\"Tipo de Área\""
            },
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "tipo_area_id",
              "type": "uuid"
            }
          },
          {
            "id": "origem",
            "name": "origem",
            "label": "Origem",
            "type": "select",
            "required": true,
            "dataSource": {
              "type": "static",
              "values": ["COPOM", "Ação Policial", "Comunidade", "Outras instituições", "PMDF"]
            },
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "origem_id",
              "type": "uuid",
              "lookupTable": "dim_origem",
              "lookupColumn": "nome",
              "transform": "nameToId"
            },
            "conditionalFields": [
              {
                "condition": "value === 'Resgate de Fauna'",
                "show": ["desfechoResgate"]
              },
              {
                "condition": "value === 'Apreensão'",
                "show": ["desfechoApreensao", "numeroTCO", "outroDesfecho"]
              }
            ]
          },
          {
            "id": "desfechoResgate",
            "name": "desfechoResgate",
            "label": "Desfecho do Resgate",
            "type": "select",
            "required": {
              "condition": "origem === 'Resgate de Fauna'",
              "message": "Desfecho do Resgate é obrigatório"
            },
            "dataSource": {
              "type": "database",
              "table": "dim_desfecho_resgates",
              "columns": ["id", "nome"],
              "where": {"tipo": "resgate"},
              "orderBy": "nome"
            },
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "desfecho_id",
              "type": "uuid",
              "lookupTable": "dim_desfecho_resgates",
              "lookupColumn": "nome",
              "transform": "nameToId"
            },
            "visibility": {
              "condition": "origem === 'Resgate de Fauna'"
            }
          },
          {
            "id": "desfechoApreensao",
            "name": "desfechoApreensao",
            "label": "Desfecho da Apreensão",
            "type": "select",
            "required": {
              "condition": "origem === 'Apreensão'",
              "message": "Desfecho da Apreensão é obrigatório"
            },
            "dataSource": {
              "type": "static",
              "values": ["TCO PMDF", "TCO PCDF", "Outros"]
            },
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "desfecho_id",
              "type": "uuid",
              "lookupTable": "dim_desfecho_crime_ambientais",
              "lookupColumn": "nome",
              "transform": "nameToId"
            },
            "visibility": {
              "condition": "origem === 'Apreensão'"
            },
            "conditionalFields": [
              {
                "condition": "value === 'TCO PMDF' || value === 'TCO PCDF'",
                "show": ["numeroTCO"],
                "required": ["numeroTCO"]
              },
              {
                "condition": "value === 'Outros'",
                "show": ["outroDesfecho"],
                "required": ["outroDesfecho"]
              }
            ]
          },
          {
            "id": "numeroTCO",
            "name": "numeroTCO",
            "label": "Nº TCO PMDF / Nº TCO PCDF",
            "type": "text",
            "required": {
              "condition": "desfechoApreensao === 'TCO PMDF' || desfechoApreensao === 'TCO PCDF'",
              "message": "Número do TCO é obrigatório"
            },
            "defaultValue": "",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "numero_tco",
              "type": "text"
            },
            "visibility": {
              "condition": "desfechoApreensao === 'TCO PMDF' || desfechoApreensao === 'TCO PCDF'"
            }
          },
          {
            "id": "outroDesfecho",
            "name": "outroDesfecho",
            "label": "Descreva o Desfecho",
            "type": "textarea",
            "required": {
              "condition": "desfechoApreensao === 'Outros'",
              "message": "Especificação do outro desfecho é obrigatória"
            },
            "defaultValue": "",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "outro_desfecho",
              "type": "text"
            },
            "visibility": {
              "condition": "desfechoApreensao === 'Outros'"
            }
          },
          {
            "id": "latitudeOrigem",
            "name": "latitudeOrigem",
            "label": "Latitude do Resgate",
            "type": "text",
            "required": true,
            "validation": {
              "type": "number",
              "min": -90,
              "max": 90,
              "message": "Latitude deve ser um número entre -90 e 90"
            },
            "defaultValue": "",
            "placeholder": "Ex: -15.7801",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "latitude_origem",
              "type": "text"
            }
          },
          {
            "id": "longitudeOrigem",
            "name": "longitudeOrigem",
            "label": "Longitude do Resgate",
            "type": "text",
            "required": true,
            "validation": {
              "type": "number",
              "min": -180,
              "max": 180,
              "message": "Longitude deve ser um número entre -180 e 180"
            },
            "defaultValue": "",
            "placeholder": "Ex: -47.9292",
            "databaseMapping": {
              "table": "fat_registros_de_resgate",
              "column": "longitude_origem",
              "type": "text"
            }
          }
        ]
      },
      {
        "id": "equipe",
        "title": "Identificação da Equipe",
        "layout": "vertical",
        "fields": [
          {
            "id": "buscaPolicial",
            "type": "search_input",
            "label": "Matrícula ou Nome do Policial",
            "placeholder": "Digite a matrícula ou nome do policial",
            "onSearch": {
              "table": "dim_efetivo",
              "columns": ["id", "matricula", "posto_graduacao", "nome_guerra", "nome"],
              "filters": {
                "ativo": true
              },
              "searchFields": ["matricula", "nome_guerra", "nome"],
              "limit": 20
            },
            "onSelect": {
              "action": "addToTeam",
              "target": "membrosEquipe"
            }
          },
          {
            "id": "membrosEquipe",
            "type": "list",
            "items": {
              "type": "object",
              "properties": {
                "id": "string",
                "efetivo_id": "string",
                "matricula": "string",
                "posto_graduacao": "string",
                "nome_guerra": "string"
              }
            },
            "databaseMapping": {
              "table": "fat_equipe_resgate",
              "columns": {
                "registro_id": "{{parentRecordId}}",
                "efetivo_id": "{{efetivo_id}}"
              },
              "operation": "bulk_insert"
            }
          }
        ]
      },
      {
        "id": "especies",
        "title": "Identificação das Espécies",
        "layout": "vertical",
        "repeatable": true,
        "minItems": {
          "condition": "desfechoResgate !== 'Evadido'",
          "value": 1
        },
        "itemTemplate": {
          "id": "{{generateId}}",
          "fields": [
            {
              "id": "classeTaxonomica",
              "name": "classeTaxonomica",
              "label": "Classe Taxonômica",
              "type": "select_search",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "computed",
                "from": "dim_especies_fauna",
                "extract": "classe_taxonomica",
                "unique": true,
                "orderBy": "classe_taxonomica"
              },
              "onChange": {
                "action": "clear",
                "fields": ["especieId", "nomeCientifico", "ordemTaxonomica", "estadoConservacao", "tipoFauna"]
              }
            },
            {
              "id": "especieId",
              "name": "especieId",
              "label": "Espécie (Nome Popular)",
              "type": "select_search",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "database",
                "table": "dim_especies_fauna",
                "columns": ["id", "nome_popular", "nome_cientifico", "classe_taxonomica", "ordem_taxonomica", "familia_taxonomica", "tipo_de_fauna", "estado_de_conservacao", "imagens_paths"],
                "filter": {
                  "classe_taxonomica": "{{classeTaxonomica}}"
                },
                "orderBy": "nome_popular"
              },
              "disabled": {
                "condition": "!classeTaxonomica"
              },
              "onSelect": {
                "action": "autoFill",
                "mappings": {
                  "nomeCientifico": "nome_cientifico",
                  "ordemTaxonomica": "ordem_taxonomica",
                  "estadoConservacao": "estado_de_conservacao",
                  "tipoFauna": "tipo_de_fauna"
                }
              },
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "especie_id",
                "type": "uuid"
              }
            },
            {
              "id": "estadoSaude",
              "name": "estadoSaude",
              "label": "Estado de Saúde",
              "type": "select",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "database",
                "table": "dim_estado_saude",
                "columns": ["id", "nome"],
                "orderBy": "nome"
              },
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "estado_saude_id",
                "type": "uuid",
                "lookupTable": "dim_estado_saude",
                "lookupColumn": "nome",
                "transform": "nameToId"
              }
            },
            {
              "id": "atropelamento",
              "name": "atropelamento",
              "label": "Atropelamento",
              "type": "select",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "static",
                "values": ["Sim", "Não"]
              },
              "defaultValue": "",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "atropelamento",
                "type": "text"
              }
            },
            {
              "id": "estagioVida",
              "name": "estagioVida",
              "label": "Estágio da Vida",
              "type": "select",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "database",
                "table": "dim_estagio_vida",
                "columns": ["id", "nome"],
                "orderBy": "nome"
              },
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "estagio_vida_id",
                "type": "uuid",
                "lookupTable": "dim_estagio_vida",
                "lookupColumn": "nome",
                "transform": "nameToId"
              }
            },
            {
              "id": "quantidadeAdulto",
              "name": "quantidadeAdulto",
              "label": "Quantidade Adultos",
              "type": "number_increment",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "min": 0,
              "defaultValue": 0,
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "quantidade_adulto",
                "type": "integer"
              }
            },
            {
              "id": "quantidadeFilhote",
              "name": "quantidadeFilhote",
              "label": "Quantidade Filhotes",
              "type": "number_increment",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "min": 0,
              "defaultValue": 0,
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "quantidade_filhote",
                "type": "integer"
              }
            },
            {
              "id": "quantidadeJovem",
              "name": "quantidadeJovem",
              "label": "Quantidade Jovem",
              "type": "number_increment",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "min": 0,
              "defaultValue": 0,
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "quantidade Jovem",
                "type": "integer",
                "note": "Coluna tem espaço no nome, usar aspas"
              }
            },
            {
              "id": "quantidadeTotal",
              "name": "quantidadeTotal",
              "label": "Quantidade Total",
              "type": "number",
              "readonly": true,
              "calculated": {
                "formula": "quantidadeAdulto + quantidadeFilhote + quantidadeJovem"
              },
              "defaultValue": 0,
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "quantidade_total",
                "type": "integer"
              }
            },
            {
              "id": "desfechoResgate",
              "name": "desfechoResgate",
              "label": "Desfecho do Resgate",
              "type": "select",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "database",
                "table": "dim_desfecho_resgates",
                "columns": ["id", "nome"],
                "where": {"tipo": "resgate"},
                "orderBy": "nome"
              },
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "desfecho_id",
                "type": "uuid",
                "lookupTable": "dim_desfecho_resgates",
                "lookupColumn": "nome",
                "transform": "nameToId",
                "priority": "species_level",
                "fallback": "form_level"
              }
            },
            {
              "id": "destinacao",
              "name": "destinacao",
              "label": "Destinação",
              "type": "select",
              "required": {
                "condition": "!isEvadido",
                "message": "Campo obrigatório"
              },
              "dataSource": {
                "type": "static",
                "values": ["CETAS/IBAMA", "HFAUS/IBRAM", "HVet/UnB", "CEAPA/BPMA", "Soltura", "Vida Livre", "Outros"]
              },
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "destinacao_id",
                "type": "uuid",
                "lookupTable": "dim_destinacao",
                "lookupColumn": "nome",
                "transform": "nameToId"
              },
              "conditionalFields": [
                {
                  "condition": "value === 'CETAS/IBAMA' || value === 'HFAUS/IBRAM' || value === 'HVet/UnB'",
                  "show": ["numeroTermoEntrega"]
                },
                {
                  "condition": "value === 'CEAPA/BPMA'",
                  "show": ["horaGuardaCEAPA", "motivoEntregaCEAPA"],
                  "required": ["horaGuardaCEAPA", "motivoEntregaCEAPA"]
                },
                {
                  "condition": "value === 'Soltura'",
                  "show": ["latitudeSoltura", "longitudeSoltura"],
                  "required": ["latitudeSoltura", "longitudeSoltura"]
                },
                {
                  "condition": "value === 'Outros'",
                  "show": ["outroDestinacao"],
                  "required": ["outroDestinacao"]
                }
              ]
            },
            {
              "id": "numeroTermoEntrega",
              "name": "numeroTermoEntrega",
              "label": "Nº Termo de Entrega",
              "type": "text",
              "required": false,
              "defaultValue": "",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "numero_termo_entrega",
                "type": "text"
              }
            },
            {
              "id": "horaGuardaCEAPA",
              "name": "horaGuardaCEAPA",
              "label": "Hora de Guarda no CEAPA",
              "type": "text",
              "required": {
                "condition": "destinacao === 'CEAPA/BPMA' && !isEvadido",
                "message": "Campo obrigatório"
              },
              "defaultValue": "",
              "placeholder": "HH:MM (formato 24h)",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "hora_guarda_ceapa",
                "type": "text"
              }
            },
            {
              "id": "motivoEntregaCEAPA",
              "name": "motivoEntregaCEAPA",
              "label": "Motivo",
              "type": "textarea",
              "required": {
                "condition": "destinacao === 'CEAPA/BPMA' && !isEvadido",
                "message": "Campo obrigatório"
              },
              "defaultValue": "",
              "placeholder": "Descreva o motivo da entrega",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "motivo_entrega_ceapa",
                "type": "text"
              }
            },
            {
              "id": "latitudeSoltura",
              "name": "latitudeSoltura",
              "label": "Latitude da Soltura",
              "type": "text",
              "required": {
                "condition": "destinacao === 'Soltura' && !isEvadido",
                "message": "Campo obrigatório"
              },
              "defaultValue": "",
              "placeholder": "Ex: -15.7801",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "latitude_soltura",
                "type": "text"
              }
            },
            {
              "id": "longitudeSoltura",
              "name": "longitudeSoltura",
              "label": "Longitude da Soltura",
              "type": "text",
              "required": {
                "condition": "destinacao === 'Soltura' && !isEvadido",
                "message": "Campo obrigatório"
              },
              "defaultValue": "",
              "placeholder": "Ex: -47.9292",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "longitude_soltura",
                "type": "text"
              }
            },
            {
              "id": "outroDestinacao",
              "name": "outroDestinacao",
              "label": "Especifique a Destinação",
              "type": "textarea",
              "required": {
                "condition": "destinacao === 'Outros' && !isEvadido",
                "message": "Campo obrigatório"
              },
              "defaultValue": "",
              "placeholder": "Descreva a destinação",
              "databaseMapping": {
                "table": "fat_registros_de_resgate",
                "column": "outro_destinacao",
                "type": "text"
              }
            }
          ]
        }
      }
    ],
    "submitButton": {
      "label": {
        "create": "Cadastrar resgate",
        "edit": "Salvar alterações"
      },
      "loadingLabel": {
        "create": "Cadastrando...",
        "edit": "Salvando..."
      }
    }
  }
}
```

### 9.2 Fluxo de API / Supabase

#### 9.2.1 Criação de Registro

**Endpoint**: `supabase.from(tabela).insert(dados)`

**Payload de Exemplo (Tabela Moderna)**:
```json
{
  "data": "2026-01-26",
  "horario_acionamento": "14:30:00",
  "horario_termino": "16:45:00",
  "especie_id": "uuid-da-especie",
  "regiao_administrativa_id": "uuid-da-regiao",
  "origem_id": "uuid-da-origem",
  "estado_saude_id": "uuid-do-estado",
  "estagio_vida_id": "uuid-do-estagio",
  "destinacao_id": "uuid-da-destinacao",
  "desfecho_id": "uuid-do-desfecho",
  "tipo_area_id": "uuid-do-tipo-area",
  "latitude_origem": "-15.7801",
  "longitude_origem": "-47.9292",
  "numero_tco": null,
  "outro_desfecho": null,
  "atropelamento": "Não",
  "quantidade_adulto": 2,
  "quantidade_filhote": 1,
  "quantidade Jovem": 0,
  "quantidade_total": 3,
  "numero_termo_entrega": "12345",
  "hora_guarda_ceapa": null,
  "motivo_entrega_ceapa": null,
  "latitude_soltura": null,
  "longitude_soltura": null,
  "outro_destinacao": null
}
```

**Inserção de Equipe (após registro criado)**:
```json
[
  {
    "registro_id": "uuid-do-registro-criado",
    "efetivo_id": "uuid-do-policial-1"
  },
  {
    "registro_id": "uuid-do-registro-criado",
    "efetivo_id": "uuid-do-policial-2"
  }
]
```

#### 9.2.2 Atualização de Registro

**Endpoint**: `supabase.from(tabela).update(dados).eq('id', id)`

**Payload**: Similar ao de inserção, mas apenas campos modificados.

**Se tabela mudar**: Deletar da origem, inserir no destino.

### 9.3 Exemplo de Registro Final Salvo

**Tabela**: `fat_registros_de_resgate`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "data": "2026-01-26",
  "horario_acionamento": "14:30:00",
  "horario_termino": "16:45:00",
  "especie_id": "123e4567-e89b-12d3-a456-426614174000",
  "regiao_administrativa_id": "789e0123-e45b-67c8-d901-234567890abc",
  "origem_id": "abc12345-6789-def0-1234-567890abcdef",
  "estado_saude_id": "def67890-1234-5678-9abc-def012345678",
  "estagio_vida_id": "01234567-89ab-cdef-0123-456789abcdef",
  "destinacao_id": "34567890-abcd-ef01-2345-6789abcdef01",
  "desfecho_id": "dfe87bb6-67e1-4249-9897-ac72859004c5",
  "tipo_area_id": "56789012-cdef-0123-4567-89abcdef0123",
  "latitude_origem": "-15.7801",
  "longitude_origem": "-47.9292",
  "numero_tco": null,
  "outro_desfecho": null,
  "atropelamento": "Não",
  "quantidade_adulto": 2,
  "quantidade_filhote": 1,
  "quantidade Jovem": 0,
  "quantidade_total": 3,
  "numero_termo_entrega": "12345",
  "hora_guarda_ceapa": null,
  "motivo_entrega_ceapa": null,
  "latitude_soltura": null,
  "longitude_soltura": null,
  "outro_destinacao": null,
  "created_at": "2026-01-26T18:30:00.000Z"
}
```

**Tabela Relacionada**: `fat_equipe_resgate`
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "registro_id": "550e8400-e29b-41d4-a716-446655440000",
    "efetivo_id": "22222222-2222-2222-2222-222222222222"
  },
  {
    "id": "33333333-3333-3333-3333-333333333333",
    "registro_id": "550e8400-e29b-41d4-a716-446655440000",
    "efetivo_id": "44444444-4444-4444-4444-444444444444"
  }
]
```

---

## Observações Finais

### Ambiguidades e Suposições

1. **Edição de Múltiplas Espécies**: O código atual de edição parece suportar apenas 1 espécie por registro. Se houver múltiplas espécies no mesmo registro original, apenas a primeira é carregada.

2. **Tabela de Edição**: O hook `useResgateFormEdit` busca apenas de `fat_resgates_diarios_2025`. Para editar registros de outros anos, pode ser necessário ajustar.

3. **Validação de Quantidade Total**: O campo `quantidadeTotal` é calculado automaticamente e não pode ser editado diretamente pelo usuário.

4. **Coluna com Espaço**: A coluna `"quantidade Jovem"` tem espaço no nome. Sempre usar aspas ao referenciar no código SQL/TypeScript.

5. **Prioridade de Desfecho**: Se uma espécie tiver `desfechoResgate` definido, esse é usado. Caso contrário, usa o desfecho do nível do registro principal.

---

**Documento gerado em**: 2026-01-26  
**Versão do Formulário**: Baseado no código atual do repositório  
**Última atualização do código analisado**: Commit `dc9a2f2`
