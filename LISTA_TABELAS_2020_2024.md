# 📊 Lista de Tabelas BPMA - Estrutura Reorganizada

## 🗄️ Modelo de Dados Principal

### Migration: `20260106000000_limpar_e_reorganizar_tabelas_bpma.sql`
**Data:** 2026-01-06

#### Tabelas Principais (Modelo BI Normalizado):
1. **`bpma_fato_mensal`**
   - Modelo normalizado para Business Intelligence
   - Campos: `ano`, `natureza`, `mes`, `quantidade`, `created_at`
   - Primary Key: `(ano, natureza, mes)`
   - Dados de 2021 a 2024
   - ✅ RLS habilitado

2. **`bpma_relatorio_anual`**
   - Modelo WIDE para relatórios anuais
   - Campos: `ano`, `natureza`, `jan`, `fev`, `mar`, `abr`, `mai`, `jun`, `jul`, `ago`, `set`, `out`, `nov`, `dez`, `total`, `created_at`
   - Primary Key: `(ano, natureza)`
   - Dados de 2021 a 2024
   - ✅ RLS habilitado

---

## 🦎 Tabelas de Espécies (MANTIDAS - Muito Importantes)

### Migration: `20260102211150_e58469f9-75e7-4244-81d4-412255403dae.sql`
**Data:** 2026-01-02

#### Tabelas Fato - Resgates Diários por Espécie:
3. **`fat_resgates_diarios_2020`**
   - Dados de resgates do ano 2020 **por espécie**
   - Campos: `data_ocorrencia`, `nome_popular`, `nome_cientifico`, `classe_taxonomica`, `ordem_taxonomica`, `tipo_de_fauna`, `estado_de_conservacao`, `quantidade_resgates`, `quantidade_solturas`, `quantidade_obitos`, `quantidade_feridos`, `quantidade_filhotes`, `mes`, `especie_id`
   - ✅ Referência a `dim_especies_fauna`

4. **`fat_resgates_diarios_2021`**
   - Dados de resgates do ano 2021 **por espécie**
   - Mesma estrutura da tabela 2020

5. **`fat_resgates_diarios_2022`**
   - Dados de resgates do ano 2022 **por espécie**
   - Mesma estrutura da tabela 2020

6. **`fat_resgates_diarios_2023`**
   - Dados de resgates do ano 2023 **por espécie**
   - Mesma estrutura da tabela 2020

7. **`fat_resgates_diarios_2024`**
   - Dados de resgates do ano 2024 **por espécie**
   - Mesma estrutura da tabela 2020

### Migration: `20260105225710_criar_tabelas_estatisticas_bpma_adaptado.sql`
**Data:** 2026-01-05

#### Tabela Fato - Resgates por Espécie Mensal:
8. **`fact_resgate_fauna_especie_mensal`**
   - Resgates de fauna **por espécie e mês**
   - Campos: `id`, `tempo_id`, `id_regiao_administrativa`, `id_especie_fauna`, `nome_cientifico`, `nome_popular`, `quantidade`
   - Dados de 2020 a 2024 (~3.520 registros)
   - ✅ Referência a `dim_especies_fauna` e `dim_tempo`

#### Tabela Dimensão - Tempo:
9. **`dim_tempo`**
   - Períodos mensais de 2020-2025 (72 registros)
   - ID formato AAAAMM (ex: 202001, 202002...)
   - Campos: `id`, `ano`, `mes`, `mes_abreviacao`, `inicio_mes`
   - ✅ Mantida para suportar `fact_resgate_fauna_especie_mensal`

---

## 📊 Views Criadas

### Views BI (Modelo Long):
- `vw_bpma_bi` - Todos os anos
- `vw_bpma_bi_2021` - Ano 2021
- `vw_bpma_bi_2022` - Ano 2022
- `vw_bpma_bi_2023` - Ano 2023
- `vw_bpma_bi_2024` - Ano 2024

### Views Relatório (Modelo Wide):
- `vw_bpma_relatorio_wide` - Todos os anos
- `vw_bpma_relatorio_2021` - Ano 2021
- `vw_bpma_relatorio_2022` - Ano 2022
- `vw_bpma_relatorio_2023` - Ano 2023
- `vw_bpma_relatorio_2024` - Ano 2024

---

## 📋 Resumo

### Total de Tabelas Ativas: **9 tabelas**

#### Por Tipo:
- **Tabelas Fato (Fat/Fact)**: 7 tabelas
  - `bpma_fato_mensal` (modelo BI normalizado)
  - `bpma_relatorio_anual` (modelo WIDE)
  - `fat_resgates_diarios_2020` (por espécie) ⭐
  - `fat_resgates_diarios_2021` (por espécie) ⭐
  - `fat_resgates_diarios_2022` (por espécie) ⭐
  - `fat_resgates_diarios_2023` (por espécie) ⭐
  - `fat_resgates_diarios_2024` (por espécie) ⭐
  - `fact_resgate_fauna_especie_mensal` (por espécie) ⭐

- **Tabelas Dimensão (Dim)**: 1 tabela
  - `dim_tempo` (suporte para dados por espécie)

#### Por Período:
- **2020**: `fat_resgates_diarios_2020` (por espécie)
- **2021-2024**: 
  - `bpma_fato_mensal` (agregado)
  - `bpma_relatorio_anual` (agregado)
  - `fat_resgates_diarios_2021` a `2024` (por espécie)
  - `fact_resgate_fauna_especie_mensal` (por espécie)

---

## 🗑️ Tabelas Removidas (Limpeza)

As seguintes tabelas foram removidas por não serem mais necessárias:
- ❌ `dim_ano`
- ❌ `dim_mes`
- ❌ `dim_tipo_atendimento`
- ❌ `dim_tipo_fauna_estatistica`
- ❌ `fat_atendimentos_estatisticas`
- ❌ `fat_resgates_estatisticas`
- ❌ `fact_indicador_mensal_bpma`
- ❌ `dim_indicador_bpma`

---

## 🔒 Segurança

Todas as tabelas têm:
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso para usuários autenticados
- ✅ Índices para otimização de consultas

---

## ⭐ Dados por Espécies

**IMPORTANTE:** As tabelas marcadas com ⭐ contêm dados detalhados por espécie e são mantidas por serem muito importantes para análises específicas de fauna.

---

**Última atualização:** 2026-01-06
