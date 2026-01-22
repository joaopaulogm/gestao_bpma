# Notas de Segurança

## Vulnerabilidades Conhecidas e Mitigações

### 1. jsPDF (CVE-2025-68428)
- **Status**: Atualizado para versão 3.0.0 (mais recente disponível no npm)
- **Vulnerabilidade**: Path Traversal/Local File Inclusion em versões anteriores a 4.0.0
- **Mitigação**: 
  - Versão 3.0.0 instalada (mais recente no npm)
  - A vulnerabilidade afeta apenas builds Node.js (`dist/jspdf.node.js`)
  - Como estamos usando no navegador, o risco é reduzido
  - Monitorar atualizações futuras para versão 4.0.0 quando disponível

### 2. xlsx (SheetJS) - CVE-2024-22363 e ReDoS
- **Status**: Versão 0.18.5 (vulnerável, mas necessária para funcionalidade)
- **Vulnerabilidades**:
  - CVE-2024-22363: Regular Expression Denial of Service (ReDoS)
  - Prototype Pollution (falsos positivos do Snyk)
- **Mitigação**:
  - A versão mais recente (0.20.3) não está disponível no npm
  - O código usa extensivamente XLSX para importação/exportação de dados
  - Refatorar para ExcelJS exigiria mudanças significativas
  - **Ação recomendada**: 
    - Monitorar atualizações do SheetJS
    - Considerar migração para ExcelJS em versão futura
    - Validar e sanitizar todos os inputs de arquivos Excel antes do processamento

### 3. Políticas RLS Corrigidas
- ✅ `dim_especies_fauna` - Agora exige autenticação
- ✅ `fact_resumo_mensal_historico` - Agora exige autenticação  
- ✅ `fact_recordes_apreensao` - Agora exige autenticação
- ✅ Tabelas de referência mantêm acesso público (valores não sensíveis)

### 4. Próximos Passos Recomendados
1. Atualizar jspdf para versão 4.0.0 quando disponível no npm
2. Avaliar migração de xlsx para ExcelJS ou aguardar versão 0.20.3 no npm
3. Implementar validação rigorosa de arquivos Excel antes do processamento
4. Habilitar proteção de senha vazada no Supabase
5. Revisar políticas RLS que usam `USING (true)` para operações UPDATE/DELETE/INSERT
