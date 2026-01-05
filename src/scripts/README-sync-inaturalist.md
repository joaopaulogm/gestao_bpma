# Script de Sincronização com iNaturalist

Este script sincroniza imagens e nomes populares de espécies do iNaturalist com a tabela `dim_especies_fauna`.

## Funcionalidades

1. **Busca imagens do iNaturalist**: Para cada espécie, busca 5-6 imagens de alta qualidade
2. **Converte para WebP**: Converte todas as imagens para o formato WebP para otimização
3. **Upload para Supabase Storage**: Faz upload das imagens para o bucket `imagens-fauna`
4. **Atualiza tabela**: Atualiza ou cria registros na tabela `dim_especies_fauna` com:
   - Caminhos das imagens
   - Nomes populares coletados do iNaturalist
   - Informações taxonômicas
5. **Remove espécies**: Remove `Bothrops jararaca` (não ocorre na região)
6. **Atualiza nomes populares**: Coleta todos os nomes populares do iNaturalist para todas as espécies existentes

## Pré-requisitos

1. Node.js 18+ (com suporte a fetch nativo)
2. Variável de ambiente `SUPABASE_SERVICE_ROLE_KEY` configurada
3. Dependências instaladas: `npm install`

## Configuração

### 1. Obter a chave de serviço do Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá em Settings > API
3. Copie a "service_role" key (NÃO a anon key)

### 2. Configurar variável de ambiente

**Windows (PowerShell):**
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
```

**Windows (CMD):**
```cmd
set SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
```

**Linux/Mac:**
```bash
export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"
```

### 3. Instalar dependências

```bash
npm install
```

## Execução

```bash
npm run sync-inaturalist
```

## Espécies processadas

O script processa as seguintes espécies:

1. **Bothrops moojeni** (Jararaca Caiçaca) - Atualiza imagens
2. **Bothrops marmoratus** (Jararaca-Pintada) - Nova espécie
3. **Bothrops itapetiningae** (Cotiarinha) - Nova espécie
4. **Bothrops pauloensis** (Boca-de-Sapo) - Nova espécie
5. **Micrurus carvalhoi** (Cobra Coral de Faixas Brasileira) - Nova espécie
6. **Apostolepis assimilis** (Coral Falsa) - Nova espécie
7. **Apostolepis albicollaris** (Coral Falsa) - Nova espécie
8. **Chironius exoletus** (Caninana-Verde) - Nova espécie
9. **Oxyrhopus petolarius** (Coral Falsa) - Nova espécie

## Estrutura dos dados

O script atualiza os seguintes campos na tabela `dim_especies_fauna`:

- `nome_popular`: Nome popular principal
- `nome_cientifico`: Nome científico
- `nome_cientifico_slug`: Slug do nome científico
- `imagens_paths`: Array com os nomes dos arquivos de imagem (JSON)
- `imagens_qtd`: Quantidade de imagens
- `imagens_status`: Status do processamento ('processado')
- `imagens_updated_at`: Data/hora da última atualização
- `nomes_populares`: Array com todos os nomes populares coletados (JSON)
- `classe_taxonomica`: Classe taxonômica
- `ordem_taxonomica`: Ordem taxonômica
- `estado_de_conservacao`: Estado de conservação
- `tipo_de_fauna`: Tipo de fauna (Silvestre/Exótico)

## Notas

- O script faz pausas entre requisições para não sobrecarregar a API do iNaturalist
- Imagens são convertidas para WebP com qualidade 85%
- Nomes populares são coletados apenas em português (pt e pt-BR)
- O script mescla nomes populares existentes com novos nomes encontrados
- Imagens existentes são preservadas (não são substituídas, apenas adicionadas)

## Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY não está definida"
- Verifique se a variável de ambiente está configurada corretamente
- No Windows, use `$env:SUPABASE_SERVICE_ROLE_KEY` no PowerShell

### Erro: "Sharp não disponível"
- Execute `npm install sharp --save-dev --legacy-peer-deps`
- O script tentará salvar as imagens sem conversão se sharp não estiver disponível

### Nenhuma imagem encontrada
- Verifique se a URL do iNaturalist está correta
- Algumas espécies podem não ter imagens disponíveis na API
- Verifique se o taxon_id está correto

### Erro de upload
- Verifique se o bucket `imagens-fauna` existe no Supabase
- Verifique se a chave de serviço tem permissões de escrita no storage

