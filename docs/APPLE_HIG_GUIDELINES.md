# Apple Human Interface Guidelines (HIG) - Adaptação Web

## Princípios Fundamentais

### 1. Clarity (Clareza)
- **Hierarquia Visual Clara**: Use tamanhos de fonte, pesos e espaçamentos consistentes
- **Tipografia Legível**: SF Pro ou equivalente, com tamanhos adequados
- **Ícones Claros**: Ícones simples e reconhecíveis
- **Contraste Adequado**: Garantir legibilidade em todos os contextos

### 2. Deference (Deferência)
- **Conteúdo é o Foco**: UI não compete com o conteúdo
- **Elementos Sutis**: Bordas, sombras e cores discretas
- **Espaço em Branco**: Uso generoso de espaçamento
- **Minimalismo**: Remover elementos desnecessários

### 3. Depth (Profundidade)
- **Camadas Visuais**: Usar elevação através de sombras sutis
- **Hierarquia de Informação**: Elementos importantes em primeiro plano
- **Movimento Natural**: Animações suaves e contextuais
- **Feedback Visual**: Respostas claras às interações

## Sistema de Cores (SF Colors)

### Cores Primárias
- **Blue**: `#007AFF` - Ações primárias, links
- **Gray**: `#8E8E93` - Texto secundário, bordas
- **Background**: `#F2F2F7` - Fundo claro
- **Background Secondary**: `#FFFFFF` - Cards, superfícies

### Cores Semânticas
- **Red**: `#FF3B30` - Destrutivo, erros
- **Orange**: `#FF9500` - Avisos
- **Green**: `#34C759` - Sucesso
- **Yellow**: `#FFCC00` - Atenção (mantido do design atual)

### Cores Adaptativas
- **Light Mode**: Fundo claro, texto escuro
- **Dark Mode**: Fundo escuro, texto claro
- **Acessibilidade**: Contraste mínimo WCAG AA

## Tipografia

### Fonte
- **Primária**: SF Pro Display / SF Pro Text (ou Inter como fallback)
- **Tamanhos**:
  - Large Title: 34px (2.125rem)
  - Title 1: 28px (1.75rem)
  - Title 2: 22px (1.375rem)
  - Title 3: 20px (1.25rem)
  - Headline: 17px (1.0625rem) - semibold
  - Body: 17px (1.0625rem) - regular
  - Callout: 16px (1rem)
  - Subhead: 15px (0.9375rem)
  - Footnote: 13px (0.8125rem)
  - Caption 1: 12px (0.75rem)
  - Caption 2: 11px (0.6875rem)

### Pesos
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Espaçamento

### Sistema de Grid
- **Base**: 4px
- **Espaçamentos Comuns**:
  - xs: 4px (0.25rem)
  - sm: 8px (0.5rem)
  - md: 16px (1rem)
  - lg: 24px (1.5rem)
  - xl: 32px (2rem)
  - 2xl: 48px (3rem)

### Padding de Componentes
- **Cards**: 16px-20px
- **Botões**: 12px-16px vertical, 16px-24px horizontal
- **Inputs**: 12px-16px
- **Listas**: 12px-16px por item

## Bordas e Cantos

### Border Radius
- **Small**: 8px (0.5rem) - botões pequenos, badges
- **Medium**: 12px (0.75rem) - cards, inputs
- **Large**: 16px (1rem) - modais, sheets
- **Full**: 9999px - pills, avatares

### Bordas
- **Largura**: 0.5px a 1px
- **Cor**: rgba(0, 0, 0, 0.1) em light mode
- **Estilo**: Sólido, sutil

## Sombras e Elevação

### Níveis de Elevação
1. **Level 0**: Sem sombra (background)
2. **Level 1**: `0 1px 3px rgba(0, 0, 0, 0.1)` - cards básicos
3. **Level 2**: `0 2px 6px rgba(0, 0, 0, 0.1)` - cards elevados
4. **Level 3**: `0 4px 12px rgba(0, 0, 0, 0.15)` - modais, popovers
5. **Level 4**: `0 8px 24px rgba(0, 0, 0, 0.2)` - sheets, drawers

## Animações

### Duração
- **Rápida**: 150ms - hover, focus
- **Média**: 250ms - transições de estado
- **Lenta**: 350ms - transições de página, modais

### Easing
- **Padrão**: `cubic-bezier(0.4, 0.0, 0.2, 1)` - Material Design
- **Entrada**: `cubic-bezier(0.0, 0.0, 0.2, 1)` - aparecer
- **Saída**: `cubic-bezier(0.4, 0.0, 1, 1)` - desaparecer

### Movimentos
- **Scale**: 0.95 a 1.05 para feedback tátil
- **Translate**: Máximo 8px para movimento sutil
- **Opacity**: 0 a 1 para fade in/out

## Componentes

### Botões
- **Altura Mínima**: 44px (touch target)
- **Padding**: 12px-16px vertical, 16px-24px horizontal
- **Border Radius**: 12px
- **Estados**: Default, Hover, Active, Disabled, Loading

### Cards
- **Padding**: 16px-20px
- **Border Radius**: 12px-16px
- **Sombra**: Level 1 ou 2
- **Hover**: Elevação sutil (Level 2)

### Inputs
- **Altura**: 44px
- **Padding**: 12px-16px
- **Border Radius**: 12px
- **Focus**: Ring azul, 2px

### Listas
- **Item Height**: Mínimo 44px
- **Separadores**: 0.5px, rgba(0, 0, 0, 0.1)
- **Padding**: 16px horizontal

## Acessibilidade

### Contraste
- **Texto Normal**: Mínimo 4.5:1
- **Texto Grande**: Mínimo 3:1
- **Elementos Não-Textuais**: Mínimo 3:1

### Touch Targets
- **Mínimo**: 44x44px
- **Recomendado**: 48x48px
- **Espaçamento**: Mínimo 8px entre targets

### Navegação por Teclado
- **Focus Visible**: Ring azul, 2px
- **Tab Order**: Lógico e intuitivo
- **Atalhos**: Suporte a atalhos comuns

## Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações
- **Mobile**: Sidebar como drawer
- **Tablet**: Sidebar colapsável
- **Desktop**: Sidebar fixa

## Dark Mode

### Cores Adaptativas
- **Background**: `#000000` ou `#1C1C1E`
- **Secondary Background**: `#2C2C2E`
- **Text**: `#FFFFFF` ou `#F2F2F7`
- **Borders**: `rgba(255, 255, 255, 0.1)`

### Sombras
- Usar brilho sutil em vez de sombras escuras
- `0 2px 8px rgba(0, 0, 0, 0.3)` para elevação

