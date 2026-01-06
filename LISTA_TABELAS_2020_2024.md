# 📊 Lista de Tabelas Criadas com Dados de 2020 a 2024

## 🗓️ Tabelas de Resgates Diários por Ano

### Migration: `20260102211150_e58469f9-75e7-4244-81d4-412255403dae.sql`
**Data:** 2026-01-02

#### Tabelas Fato (Fat) - Resgates Diários:
1. **`fat_resgates_diarios_2020`**
   - Dados de resgates do ano 2020
   - Campos: data_ocorrencia, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, tipo_de_fauna, estado_de_conservacao, quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes, mes, especie_id

2. **`fat_resgates_diarios_2021`**
   - Dados de resgates do ano 2021
   - Mesma estrutura da tabela 2020

3. **`fat_resgates_diarios_2022`**
   - Dados de resgates do ano 2022
   - Mesma estrutura da tabela 2020

4. **`fat_resgates_diarios_2023`**
   - Dados de resgates do ano 2023
   - Mesma estrutura da tabela 2020

5. **`fat_resgates_diarios_2024`**
   - Dados de resgates do ano 2024
   - Mesma estrutura da tabela 2020

---

## 📈 Tabelas de Estatísticas BPMA (2020-2025)

### Migration 1: `20260105225302_criar_tabelas_estatisticas_bpma.sql`
**Data:** 2026-01-05

#### Tabelas Dimensão (Dim):
6. **`dim_ano`**
   - Anos de 2020 a 2025
   - Campos: id, ano, created_at

7. **`dim_mes`**
   - Meses do ano (1-12)
   - Campos: id, mes, nome, abreviacao, created_at

8. **`dim_tipo_atendimento`**
   - Tipos de atendimento registrados
   - Campos: id, nome, created_at

9. **`dim_tipo_fauna_estatistica`**
   - Tipos de fauna (AVES, MAMÍFEROS, RÉPTEIS)
   - Campos: id, nome, created_at

#### Tabelas Fato (Fat):
10. **`fat_atendimentos_estatisticas`**
    - Atendimentos agregados por ano, mês e tipo
    - Campos: id, ano_id, mes_id, tipo_atendimento_id, quantidade
    - Dados de 2020 a 2024

11. **`fat_resgates_estatisticas`**
    - Resgates por espécie, ano, mês e tipo de fauna
    - Campos: id, ano_id, mes_id, tipo_fauna_id, especie_id, nome_popular, nome_cientifico, ordem_taxonomica, quantidade
    - Dados de 2020 a 2024

---

### Migration 2: `20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql`
**Data:** 2026-01-05

#### Tabelas Dimensão (Dim):
12. **`dim_tempo`**
    - Períodos mensais de 2020-2025 (72 registros)
    - ID formato AAAAMM (ex: 202001, 202002...)
    - Campos: id, ano, mes, mes_abreviacao, inicio_mes

13. **`dim_indicador_bpma`**
    - Indicadores e categorias (~234 indicadores)
    - Campos: id, nome, categoria

#### Tabelas Fato (Fact):
14. **`fact_indicador_mensal_bpma`**
    - Valores mensais dos indicadores BPMA
    - Campos: tempo_id, indicador_id, valor
    - Dados de 2020 a 2024 (~6.239 registros)

15. **`fact_resgate_fauna_especie_mensal`**
    - Resgates de fauna por espécie e mês
    - Campos: id, tempo_id, id_regiao_administrativa, id_especie_fauna, nome_cientifico, nome_popular, quantidade
    - Dados de 2020 a 2024 (~3.520 registros)

---

## 📋 Resumo

### Total de Tabelas Criadas: **15 tabelas**

#### Por Tipo:
- **Tabelas Fato (Fat/Fact)**: 7 tabelas
  - `fat_resgates_diarios_2020`
  - `fat_resgates_diarios_2021`
  - `fat_resgates_diarios_2022`
  - `fat_resgates_diarios_2023`
  - `fat_resgates_diarios_2024`
  - `fat_atendimentos_estatisticas`
  - `fat_resgates_estatisticas`
  - `fact_indicador_mensal_bpma`
  - `fact_resgate_fauna_especie_mensal`

- **Tabelas Dimensão (Dim)**: 6 tabelas
  - `dim_ano`
  - `dim_mes`
  - `dim_tipo_atendimento`
  - `dim_tipo_fauna_estatistica`
  - `dim_tempo`
  - `dim_indicador_bpma`

#### Por Período:
- **2020**: `fat_resgates_diarios_2020`
- **2021**: `fat_resgates_diarios_2021`
- **2022**: `fat_resgates_diarios_2022`
- **2023**: `fat_resgates_diarios_2023`
- **2024**: `fat_resgates_diarios_2024`
- **2020-2024**: Todas as tabelas de estatísticas (dim_*, fat_*, fact_*)

---

## 🔒 Segurança

Todas as tabelas têm:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso para usuários autenticados
- ✅ Índices para otimização de consultas

---

**Última atualização:** 2026-01-06
