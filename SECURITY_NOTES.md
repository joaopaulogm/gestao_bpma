# Notas de Segurança

## Vulnerabilidades Conhecidas e Mitigações

### 1. jsPDF (CVE-2025-68428)
- **Status**: ✅ Atualizado para versão 4.0.0 (corrige vulnerabilidade crítica)
- **Vulnerabilidade**: Path Traversal/Local File Inclusion em versões anteriores a 4.0.0
- **Mitigação**: 
  - Versão 4.0.0 instalada (lançada em 03/01/2026)
  - Corrige CVE-2025-68428 completamente
  - File system access agora é restrito por padrão
  - A vulnerabilidade afetava principalmente builds Node.js, mas a atualização é recomendada

### 2. xlsx (SheetJS) - CVE-2024-22363 e ReDoS
- **Status**: Versão 0.18.5 (vulnerável, mas necessária para funcionalidade)
- **Vulnerabilidades**:
  - CVE-2024-22363: Regular Expression Denial of Service (ReDoS)
  - Prototype Pollution (falsos positivos do Snyk)
- **Análise de Migração para ExcelJS**:
  - **Uso atual**: XLSX é usado extensivamente em 8+ arquivos para:
    - Leitura de arquivos Excel (`XLSX.read`)
    - Conversão planilha→JSON (`XLSX.utils.sheet_to_json`)
    - Criação de workbooks (`XLSX.utils.book_new`)
    - Conversão JSON→planilha (`XLSX.utils.json_to_sheet`)
    - Exportação de arquivos (`XLSX.writeFile`)
  - **Complexidade da migração**: Alta - exigiria refatorar múltiplos arquivos
  - **ExcelJS vs XLSX**:
    - ExcelJS: Mais features, mas 21.8MB vs 7.5MB do XLSX
    - XLSX: Mais leve, mais downloads semanais (3.5-4.3M vs 2.6-3M)
    - ExcelJS: 745 issues abertas vs 132 do XLSX
  - **Decisão**: Manter XLSX por enquanto devido à complexidade da migração
- **Mitigação Atual**:
  - A versão mais recente (0.20.3) não está disponível no npm
  - O código usa extensivamente XLSX para importação/exportação de dados
  - **Ações implementadas**:
    - Validação de tamanho de arquivo antes do processamento
    - Limitação de linhas processadas por vez
    - Tratamento de erros robusto
  - **Ação recomendada futura**: 
    - Monitorar atualizações do SheetJS (0.20.3+ quando disponível no npm)
    - Considerar migração para ExcelJS apenas se vulnerabilidades críticas forem descobertas
    - Implementar rate limiting para uploads de arquivos Excel

### 3. Políticas RLS Corrigidas
- ✅ `dim_especies_fauna` - Agora exige autenticação
- ✅ `fact_resumo_mensal_historico` - Agora exige autenticação  
- ✅ `fact_recordes_apreensao` - Agora exige autenticação
- ✅ Tabelas de referência mantêm acesso público (valores não sensíveis)

### 4. Proteção de Senha Vazada
- **Status**: ⚠️ Não disponível no plano Free do Supabase
- **Limitação**: O plano Free do Supabase não oferece proteção de senha vazada
- **Alternativas**:
  - Implementar validação de senha forte no frontend (já implementado)
  - Educar usuários sobre boas práticas de senha
  - Considerar upgrade para plano Pro se necessário no futuro
  - Usar autenticação de dois fatores (2FA) quando disponível

### 5. Políticas RLS Corrigidas
- ✅ `fat_registros_de_resgate` - Políticas UPDATE/DELETE/INSERT corrigidas
- ✅ `fat_ocorrencia_apreensao_crime_comum` - Políticas UPDATE/DELETE/INSERT corrigidas
- ✅ `fat_equipe_crime_comum` - Políticas UPDATE/DELETE/INSERT corrigidas
- ✅ Migration criada para corrigir automaticamente outras tabelas problemáticas
- ✅ Políticas SELECT com `USING (true)` mantidas intencionalmente para tabelas de referência

### 6. Próximos Passos Recomendados
1. ✅ Atualizar jspdf para versão 4.0.0 - **CONCLUÍDO**
2. ✅ Atualizar jspdf-autotable para versão 5.0.7 (compatível com jspdf 4.0.0) - **CONCLUÍDO**
3. ✅ Revisar políticas RLS que usam `USING (true)` - **CONCLUÍDO**
4. ✅ Avaliar migração de xlsx para ExcelJS - **CONCLUÍDO** (decisão: manter XLSX)
5. ⚠️ Proteção de senha vazada não disponível no plano Free (documentado)
6. Implementar validação rigorosa de arquivos Excel antes do processamento (futuro)
