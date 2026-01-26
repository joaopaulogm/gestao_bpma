
# Plano de Reconstrução da Página Campanha

## Visão Geral

Reconstruir a página de Campanha (Escala de Serviço) com foco em:
1. Formato calendário com seleção de Ano/Mês/Dia
2. Página detalhada para cada dia com equipes e policiais
3. Sinalização correta de impedimentos (férias/abono marcados) e previsões
4. Cálculos de cotas corrigidos com os limites especificados
5. Botões para geração de minutas

---

## Arquitetura Proposta

```text
src/pages/pessoas/
├── Campanha.tsx (página principal - calendário)
└── CampanhaDia.tsx (NOVA - página detalhada do dia)

src/components/campanha/
├── CampanhaCalendarView.tsx (calendário mensal - refatorar)
├── CampanhaQuotaSection.tsx (NOVA - seção de cotas colapsável)
├── CampanhaDayTeams.tsx (NOVA - grid de equipes do dia)
├── TeamMemberCard.tsx (NOVA - card de policial com status)
├── EditTeamMemberDialog.tsx (NOVA - editar equipe do policial)
└── ... (manter componentes existentes úteis)

src/hooks/
├── useCampanhaCalendar.ts (refatorar cálculos de status)
└── useCampanhaQuotas.ts (NOVO - cálculos de cotas)
```

---

## Detalhamento das Funcionalidades

### 1. Calendário Principal (Campanha.tsx)

**Header com Seletores:**
- Selector de Ano (2025, 2026, 2027)
- Navegação por mês (setas + nome do mês)
- Botão "Hoje"

**Seção de Cotas (Colapsável):**

```text
┌─────────────────────────────────────────────────────────────────┐
│ [−] Cotas do Mês                                    [Gerar Minuta Férias] [Gerar Minuta Abono] │
├─────────────────────────────────────────────────────────────────┤
│  COTA DE FÉRIAS                    │  COTA DE ABONO                     │
│  ─────────────────                 │  ─────────────────                  │
│  Limite mensal: 480 dias           │  Limite mensal: 80 dias             │
│  Previsto: X dias                  │  Previsto: X dias                   │
│  Marcados: Y dias                  │  Marcados: Y dias                   │
│  Saldo disponível: (480-Y) dias    │  Saldo disponível: (80-Y) dias      │
└─────────────────────────────────────────────────────────────────┘
```

**Calendário Mensal:**
- Grid 7 colunas (Dom-Sáb)
- Cada célula mostra:
  - Número do dia
  - Indicadores de status (pontos coloridos)
  - Equipe de serviço principal
  - Feriados destacados em vermelho
- Clique no dia → navega para página `/secao-pessoas/campanha/:data`

### 2. Página Detalhada do Dia (CampanhaDia.tsx - NOVA ROTA)

**Estrutura:**
```text
/secao-pessoas/campanha/2026-01-15
```

**Layout:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ ← Voltar    Campanha - Quinta-feira, 15 de Janeiro de 2026      │
├─────────────────────────────────────────────────────────────────┤
│ [Card Resumo] Aptos: X | Impedidos: Y | Restrição: Z | ...      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   GUARDA    │  │   ARMEIRO   │  │ RP AMBIENTAL│             │
│  │ Equipe Alfa │  │ Equipe Alfa │  │ Equipe Alfa │             │
│  │ [Editar]    │  │ [Editar]    │  │ [Editar]    │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ ● SD Silva  │  │ ● CB Santos │  │ ● 3ºSGT Lima│             │
│  │ ⛔ CB Souza │  │ ● SD Costa  │  │ ● SD Alves  │             │
│  │   (Férias)  │  │             │  │             │             │
│  │ ⚠ SD Lima   │  │             │  │             │             │
│  │  (Previsão) │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │     GOC     │  │  LACUSTRE   │  │     GTA     │             │
│  │ Equipe Alfa │  │ Equipe Alfa │  │ Equipe Alfa │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │              SEÇÕES ADMINISTRATIVAS             │           │
│  │  (Seg-Sex, exceto feriados)                     │           │
│  │  SEÇÃO SOI | SEÇÃO SP | SEÇÃO SLOG | ...        │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Funcionalidades de Edição:**
- Botão [Editar] em cada equipe → abre dialog para:
  - Trocar a equipe escalada (Alfa → Bravo, etc.)
  - Registrar motivo da alteração
- Cada policial tem ícone de edição → permite:
  - Remanejar para outra equipe/unidade
  - Adicionar como voluntário

### 3. Lógica de Status dos Policiais

**Hierarquia de Status (prioridade):**

| Prioridade | Status | Condição | Impede Escalar? |
|------------|--------|----------|-----------------|
| 1 | Impedido | `fat_ferias_parcelas.data_inicio <= data <= data_fim` (marcado) | **SIM** |
| 2 | Impedido | `fat_abono.parcela1/2/3_inicio <= data <= fim` (marcado) | **SIM** |
| 3 | Atestado | `fat_licencas_medicas.data_inicio <= data <= data_fim` | **SIM** |
| 4 | Restrição | `fat_restricoes.data_inicio <= data <= data_fim` | **SIM** (com flag) |
| 5 | Previsão | `fat_ferias.mes_inicio = mês` sem parcela com data | Não |
| 6 | Previsão | `fat_abono.mes = mês` sem parcela1/2/3_inicio | Não |
| 7 | Apto | Nenhuma condição acima | Não |

**Fontes de Dados:**
- **Férias Marcadas**: `fat_ferias_parcelas` onde `data_inicio` e `data_fim` estão preenchidos
- **Férias Previstas**: `fat_ferias` onde existe registro para o mês mas sem datas em `fat_ferias_parcelas`
- **Abono Marcado**: `fat_abono` onde `parcela1_inicio`, `parcela2_inicio` ou `parcela3_inicio` estão preenchidos
- **Abono Previsto**: `fat_abono` onde `mes` corresponde mas sem datas de parcela

### 4. Cálculos de Cotas

**Cota de Férias (por mês):**
```typescript
interface FeriasQuota {
  limite: 480;  // constante
  previsto: number;  // soma de dias de fat_ferias onde mes_inicio = mês e sem data marcada
  marcados: number;  // soma de dias de fat_ferias_parcelas onde data_inicio está no mês
  saldo: number;     // limite - marcados
}
```

**Cálculo:**
```typescript
// Previsto: policiais com férias previstas para o mês (sem data específica)
const previsto = ferias
  .filter(f => f.mes_inicio === mes && !temParcelaMarcada(f))
  .reduce((sum, f) => sum + f.dias, 0);

// Marcados: dias efetivamente ocupados no mês
const marcados = feriasParcelas
  .filter(p => p.data_inicio && mesFromDate(p.data_inicio) === mes)
  .reduce((sum, p) => sum + p.dias, 0);

const saldo = 480 - marcados;
```

**Cota de Abono (por mês):**
```typescript
interface AbonoQuota {
  limite: 80;  // constante
  previsto: number;  // registros em fat_abono onde mes = mês e sem parcela marcada
  marcados: number;  // soma de dias das parcelas com data no mês
  saldo: number;     // limite - marcados
}
```

### 5. Geração de Minutas

**Botão "Gerar Minuta Férias":**
- Navega para `/secao-pessoas/ferias/minuta?mes={mes}&ano={ano}`
- Página existente (MinutaFerias.tsx) já implementada

**Botão "Gerar Minuta Abono":**
- Navega para `/secao-pessoas/abono/minuta?mes={mes}&ano={ano}`
- Página existente (MinutaAbono.tsx) já implementada

### 6. Roteamento

**Nova rota em App.tsx:**
```typescript
{
  path: '/secao-pessoas/campanha/:data',
  element: <CampanhaDia />
}
```

---

## Seção Técnica

### Mudanças no Banco de Dados
Nenhuma alteração necessária - todas as tabelas já existem:
- `fat_ferias`, `fat_ferias_parcelas`
- `fat_abono`
- `fat_licencas_medicas`, `fat_restricoes`
- `dim_efetivo`, `dim_equipes`, `fat_equipe_membros`
- `fat_campanha_membros`, `fat_campanha_config`, `fat_campanha_alteracoes`

### Hook useCampanhaQuotas.ts (NOVO)
```typescript
export function useCampanhaQuotas(ano: number, mes: number) {
  // Buscar fat_ferias, fat_ferias_parcelas, fat_abono
  // Calcular previsto e marcados para férias e abono
  return {
    feriasQuota: { limite: 480, previsto, marcados, saldo },
    abonoQuota: { limite: 80, previsto, marcados, saldo },
    loading
  };
}
```

### Refatoração do useCampanhaCalendar.ts
- Corrigir `getMemberStatus()` para usar a hierarquia de status correta
- Separar "marcado" (impedido) de "previsto" (não impede)
- Verificar `fat_ferias_parcelas.data_inicio/fim` para férias marcadas
- Verificar `fat_abono.parcela*_inicio/fim` para abono marcado

### Componentes Principais

**CampanhaQuotaSection.tsx:**
- Seção colapsável com Collapsible do shadcn/ui
- Dois cards lado a lado (Férias e Abono)
- Botões de minuta no header

**CampanhaDayTeams.tsx:**
- Grid responsivo de cards de equipes
- Cada card mostra unidade, equipe do dia e lista de membros
- Botão de edição para trocar equipe

**TeamMemberCard.tsx:**
- Avatar + Posto/Grad + Nome de Guerra
- Badge de status (Apto/Impedido/Previsão/Atestado/Restrição)
- Ícone de edição para remanejar

---

## Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/pessoas/CampanhaDia.tsx` | Criar | Página detalhada do dia |
| `src/hooks/useCampanhaQuotas.ts` | Criar | Hook para cálculos de cotas |
| `src/components/campanha/CampanhaQuotaSection.tsx` | Criar | Seção de cotas colapsável |
| `src/components/campanha/CampanhaDayTeams.tsx` | Criar | Grid de equipes do dia |
| `src/pages/pessoas/Campanha.tsx` | Modificar | Simplificar para calendário + cotas |
| `src/hooks/useCampanhaCalendar.ts` | Modificar | Corrigir lógica de status |
| `src/App.tsx` | Modificar | Adicionar rota para CampanhaDia |

---

## Fluxo do Usuário

1. **Acessa /secao-pessoas/campanha**
   - Vê calendário do mês atual
   - Seção de cotas expandível no topo

2. **Expande Cotas**
   - Vê limite, previsto, marcados e saldo
   - Pode clicar em "Gerar Minuta Férias" ou "Gerar Minuta Abono"

3. **Clica em um Dia**
   - Navega para `/secao-pessoas/campanha/2026-01-15`
   - Vê todas as equipes e policiais escalados

4. **Na página do Dia**
   - Vê policiais com status visual (verde=apto, vermelho=impedido, amarelo=previsão)
   - Pode editar equipe de cada unidade
   - Pode remanejar policiais entre equipes

5. **Volta ao Calendário**
   - Clica no botão voltar
   - Retorna ao mês que estava visualizando

---

## Considerações de Implementação

1. **Performance**: Usar `useMemo` para cálculos de cotas e status
2. **Realtime**: Manter subscriptions para `fat_ferias`, `fat_abono`, etc.
3. **Timezone**: Usar parsing direto de strings ISO (já implementado no projeto)
4. **Mobile**: Layout responsivo com grid que colapsa em telas menores
5. **Acessibilidade**: Usar `aria-label` em ícones (não prop `title` em Lucide)
