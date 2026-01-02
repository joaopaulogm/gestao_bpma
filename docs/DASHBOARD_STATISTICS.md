# Sistema de Estatísticas do Dashboard

## Visão Geral

Este sistema utiliza **views materializadas** e **funções SQL** para agregar dados de todas as tabelas fat (`fat_registros_de_resgate`, `fat_registros_de_crime`, `fat_ocorrencia_apreensao`, `fat_crime_fauna`, `fat_crime_flora`, `fat_equipe_resgate`, `fat_equipe_crime`) e dados históricos (`fat_resgates_diarios_2020a2024`) para análise no Dashboard e Relatórios.

## Arquitetura

### 1. Views Materializadas

As views materializadas agregam dados de forma eficiente:

- **`mv_estatisticas_resgates`**: Combina dados atuais e históricos (2020-2024) de resgates
- **`mv_estatisticas_crimes`**: Estatísticas de crimes ambientais
- **`mv_estatisticas_apreensoes`**: Itens apreendidos
- **`mv_estatisticas_periodo`**: Agregações por período (ano/mês)
- **`mv_top_especies_resgatadas`**: Ranking de espécies
- **`mv_distribuicao_classe`**: Distribuição por classe taxonômica
- **`mv_estatisticas_regiao`**: Estatísticas por região administrativa
- **`mv_estatisticas_destinacao`**: Estatísticas por destinação
- **`mv_estatisticas_atropelamentos`**: Estatísticas de atropelamentos
- **`mv_estatisticas_equipes`**: Participação de equipes

### 2. Funções SQL

Funções que retornam dados agregados com filtros:

- `get_dashboard_statistics(ano, mes, classe_taxonomica)`: Estatísticas gerais
- `get_time_series_resgates(ano_inicio, ano_fim, classe_taxonomica)`: Série temporal
- `get_top_especies_resgatadas(limit, ano, classe_taxonomica)`: Top espécies
- `get_distribuicao_classe(ano)`: Distribuição por classe
- `get_estatisticas_regiao(ano)`: Estatísticas por região
- `get_estatisticas_destinacao(ano)`: Estatísticas por destinação
- `get_estatisticas_atropelamentos(ano, classe_taxonomica)`: Atropelamentos

### 3. Sistema de Atualização

#### Triggers
Quando novos registros são inseridos/atualizados/deletados, os triggers marcam as views relacionadas para atualização na tabela `view_refresh_queue`.

#### Atualização Manual
```sql
SELECT refresh_pending_views();
```

#### Atualização Automática (Recomendado)
Configure um cron job ou função agendada para executar `refresh_pending_views()` periodicamente (ex: a cada 5 minutos).

## Uso no Frontend

### Hook Principal

```typescript
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';
import { useFilterState } from '@/hooks/useFilterState';

const MyDashboard = () => {
  const { filters } = useFilterState(2025);
  const { data, isLoading, error } = useDashboardStatistics(filters);

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <div>
      <h1>Total de Resgates: {data.statistics.total_resgates}</h1>
      <TimeSeriesChart data={data.timeSeries} />
      <TopSpeciesChart data={data.topEspecies} />
    </div>
  );
};
```

### Serviço Direto

```typescript
import { 
  getDashboardStatistics,
  getTopEspeciesResgatadas 
} from '@/services/dashboardStatisticsService';

// Buscar estatísticas
const stats = await getDashboardStatistics(2025, 1, 'AVES');

// Buscar top espécies
const topSpecies = await getTopEspeciesResgatadas(10, 2025);
```

## Dados Históricos

A view `mv_estatisticas_resgates` combina automaticamente:
- Dados atuais de `fat_registros_de_resgate`
- Dados históricos de `fat_resgates_diarios_2020a2024` (2020-2024)

Os dados históricos são incluídos apenas se não houver registro equivalente na tabela atual.

## Performance

### Vantagens das Views Materializadas

1. **Performance**: Dados pré-agregados, consultas rápidas
2. **Escalabilidade**: Suporta grandes volumes de dados
3. **Consistência**: Dados agregados de forma consistente
4. **Histórico**: Inclui dados de 2020-2024 automaticamente

### Atualização

- Views são atualizadas automaticamente via triggers quando há mudanças
- Atualização assíncrona via `refresh_pending_views()`
- Recomendado: atualizar a cada 5-10 minutos em produção

## Manutenção

### Atualizar Views Manualmente

```sql
-- Atualizar todas as views pendentes
SELECT refresh_pending_views();

-- Atualizar view específica
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estatisticas_resgates;
```

### Verificar Status

```sql
-- Ver views que precisam de atualização
SELECT * FROM view_refresh_queue WHERE needs_refresh = true;

-- Ver última atualização
SELECT view_name, last_refreshed 
FROM view_refresh_queue 
ORDER BY last_refreshed DESC;
```

## Migrations

As migrations estão em:
- `supabase/migrations/20260102140000_criar_views_estatisticas_dashboard.sql`
- `supabase/migrations/20260102140001_criar_triggers_atualizacao_views.sql`
- `supabase/migrations/20260102140002_criar_funcoes_estatisticas_dashboard.sql`
- `supabase/migrations/20260102140003_inicializar_views_materializadas.sql`

## Próximos Passos

1. Configurar atualização automática via cron/Supabase Edge Functions
2. Criar componentes de visualização específicos
3. Adicionar cache no frontend para melhor performance
4. Implementar filtros avançados

