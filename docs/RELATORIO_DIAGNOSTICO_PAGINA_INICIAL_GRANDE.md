# Relatório Técnico – Diagnóstico: Página Inicial com Elementos Grandes Demais

**Objetivo:** Identificar por que a página inicial apresenta tipografia, espaçamento, cards e banner grandes demais com zoom do Chrome 100% e escala do Windows 100%.

**Escopo analisado:** escala global (CSS/JS), REM/tipografia base, Tailwind, layout (hero, banner, cards, sidebar), responsividade (breakpoints), CSS global.

---

## A) Resumo executivo – Causas prováveis (ordem de impacto)

1. **Tipografia e espaçamento “desktop” aplicados cedo demais (breakpoints)**  
   Em 1366×768 o layout já usa `md:` (768px) e `lg:` (1024px), aplicando títulos grandes (`md:text-4xl`, `md:text-5xl`), padding alto (`md:p-10`, `py-12`/`py-16`) e logos grandes (`md:h-40`, `md:h-36`) sem considerar altura reduzida (768px). Impacto: **alto**.

2. **Logo e título da home (/inicio) muito grandes**  
   Na página Início (`Index.tsx`): logo `md:h-40 md:w-40` (160px), título `md:text-4xl` (36px), padding da página `md:p-10` (40px). Na Landing (`LandingPage.tsx`): título `md:text-5xl` (48px), logo `md:h-36` (144px), hero `py-12 sm:py-16`. Impacto: **alto**.

3. **Cards da página Início com largura fixa em % e aspect-square**  
   `HomeCard` usa `w-[75%]` e `aspect-square`, gerando quadrados grandes no centro; em 1366px a área de cada card fica excessiva. Impacto: **médio-alto**.

4. **Efeitos decorativos com `transform: scale()` na área do logo (Index)**  
   Dois divs de brilho com `transform: scale(1.3)` e `scale(1.1)` aumentam a “pegada” visual e podem contribuir para overflow/impressão de excesso. Impacto: **médio**.

5. **Sidebar fixa larga e título “Gestão - BPMA” em text-lg**  
   Sidebar `w-72` (288px) quando aberta; título da sidebar em `text-lg` (18px). Em 1366×768 a barra ocupa boa parte da largura. Impacto: **médio**.

6. **Ausência de ajuste para “telas largas mas baixas” (ex.: 1366×768)**  
   Não há media query ou classe por altura (ex.: `max-h-screen`) ou breakpoint que reduza tamanhos quando a altura é ≤768px. Tudo escala só por largura. Impacto: **médio**.

---

## B) Evidências por causa

### 1. Breakpoints aplicando tamanhos grandes em telas médias

**Arquivo:** `src/pages/Index.tsx`

**Trecho (exemplo – título e padding):**
```tsx
// Linha 137 – container da página
<div className="p-4 sm:p-6 md:p-10 min-h-screen">

// Linha 172 – título "Gestão - BPMA"
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#071d49] whitespace-nowrap tracking-tight">

// Linha 152-153 – logo
<img src={logoBpma} alt="Logo BPMA" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain ...
```

**Impacto:** A partir de 768px (md) entram `p-10` (2.5rem), `text-4xl` (2.25rem ≈ 36px) e logo 10rem (160px). Em 1366×768 isso ocupa muita altura e dá sensação de “tudo grande”.

**Como confirmar no DevTools:**  
Selecionar o `<h1>` e o container principal; em Computed ver `font-size` (≈36px) e `padding` (40px). Em 1366×768 o viewport tem apenas 768px de altura.

---

**Arquivo:** `src/pages/LandingPage.tsx`

**Trecho:**
```tsx
// Linha 9 – hero
<header className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6">

// Linha 50 – título
<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#071d49] mb-3 ...">

// Linha 41 – logo
className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 object-contain ..."

// Linha 84 – seção
<section className="flex-1 py-12 sm:py-16 px-4 sm:px-6">
```

**Impacto:** `md:text-5xl` = 3rem (48px); `py-16` = 4rem (64px) top+bottom; logo 9rem (144px). Hero e seção ficam altos demais em 1366×768.

**Como confirmar no DevTools:**  
No `<header>` ver `padding-top`/`padding-bottom` (64px) e no `<h1>` o `font-size` (48px).

---

### 2. Logo e título da home grandes (detalhamento)

**Arquivo:** `src/pages/Index.tsx`  
**Linhas:** 137, 152-153, 172, 177.

| Elemento        | Classe / valor        | Valor aproximado |
|-----------------|------------------------|-------------------|
| Container       | `md:p-10`             | padding 40px      |
| Logo            | `md:h-40 md:w-40`     | 160×160px        |
| Título          | `md:text-4xl`         | 36px             |
| Subtítulo       | `text-base sm:text-lg`| 18px em sm+      |
| Margem do bloco | `mb-6 sm:mb-8`        | 32px em sm+      |

**Como confirmar no DevTools:**  
Inspecionar a `<img>` do logo: `height`/`width` 160px em viewport ≥768px.

---

### 3. Cards da página Início (HomeCard) – largura e proporção

**Arquivo:** `src/pages/Index.tsx`

**Trecho (linhas 28-37):**
```tsx
<Link to={to} className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl 
  ...
  aspect-square w-[75%] mx-auto">
  <Icon className="w-[40%] h-[40%] text-accent shrink-0" />
  <span className="text-[clamp(10px,2.5vw,14px)] ...">{title}</span>
</Link>
```

**Impacto:** `w-[75%]` do container (max-w-3xl = 768px) dá ~576px de largura por card; `aspect-square` mantém altura = largura. Os cards ficam quadrados muito grandes. O texto dos cards está limitado com `clamp(10px,2.5vw,14px)` (até 14px), então o problema é principalmente tamanho do card.

**Como confirmar no DevTools:**  
Selecionar um `HomeCard`: Computed deve mostrar `width` ~40–50% do container (dependendo do grid) e `aspect-ratio: 1 / 1`.

---

### 4. Transform scale nos efeitos do logo (Index)

**Arquivo:** `src/pages/Index.tsx`

**Trecho (linhas 157-166):**
```tsx
<div className="absolute inset-0 rounded-full opacity-30 blur-2xl pointer-events-none" style={{
  background: 'radial-gradient(...)',
  transform: 'scale(1.3)',
  zIndex: 0
}} />
<div className="absolute inset-0 rounded-full opacity-40 blur-sm pointer-events-none" style={{
  background: 'radial-gradient(...)',
  transform: 'scale(1.1)',
  zIndex: 1
}} />
```

**Impacto:** Os elementos têm `inset-0` (mesmo tamanho do pai) e são escalados 1.3 e 1.1. Visualmente o “glow” ocupa mais espaço e pode aumentar a sensação de área grande ou overflow, mesmo com `pointer-events-none`.

**Como confirmar no DevTools:**  
Inspecionar os dois divs decorativos; em Computed ver `transform: scale(1.3)` e `scale(1.1)`.

---

### 5. Sidebar – largura e título

**Arquivo:** `src/components/Sidebar.tsx`

**Trecho (linhas 500-502, 354-355):**
```tsx
// Largura quando aberta
isOpen ? 'w-72' : 'w-[4.5rem]'

// Título "Gestão - BPMA" na sidebar (linha 354)
<span className="font-bold text-lg text-white">Gestão - BPMA</span>
```

**Impacto:** `w-72` = 18rem = 288px. Em 1366px sobram 1078px para o conteúdo; o título da sidebar em `text-lg` (18px) é coerente com o resto, mas a barra em si é larga e contribui para a sensação de “layout cheio”.

**Como confirmar no DevTools:**  
No `<aside>` da sidebar, em Computed: `width: 288px` quando aberta.

---

### 6. Sem escala global explícita; REM base padrão

**Arquivos:** `src/index.css`, `index.html`, `tailwind.config.ts`

- **index.css:** Em `@layer base` não há `html { font-size: ... }` nem `:root` alterando tamanho de fonte base. Apenas variáveis de cor e `--radius: 0.75rem`. Body usa `@apply` padrão (sem font-size).
- **index.html:** Sem meta zoom; viewport `width=device-width, initial-scale=1.0`.
- **tailwind.config.ts:** Nenhum `theme.extend.fontSize` nem override de `screens` que inflacione tamanhos. `container.padding: '2rem'` e `screens.2xl: '1400px'` são os únicos relevantes.

**Conclusão:** Não há escala global por CSS (zoom, transform no body/html/#root) nem REM base aumentado. O “tudo grande” vem de classes Tailwind grandes (text-4xl/5xl, p-10, logos em rem) e breakpoints que sobem cedo demais.

---

### 7. App.css não está em uso

**Arquivo:** `src/App.css`

**Trecho (linhas 1-6):**
```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```

**Status:** Este ficheiro **não é importado** em `main.tsx` nem em `App.tsx`. Portanto atualmente **não afeta** o layout. Se no futuro for importado, o `padding: 2rem` e `max-width: 1280px` em `#root` passariam a aplicar; manter em mente para não duplicar restrições.

---

## C) Correções recomendadas

### Correção mínima (hotfix) – reduzir tamanhos a partir de `md`

**Arquivo:** `src/pages/Index.tsx`

- Trocar `md:p-10` por `md:p-6` no container principal (linha 137).
- Reduzir logo: de `md:h-40 md:w-40` para `md:h-32 md:w-32` (linha 152).
- Título: de `md:text-4xl` para `md:text-3xl` (linha 172).
- Opcional: nos divs decorativos do logo, trocar `scale(1.3)` por `scale(1.15)` e `scale(1.1)` por `scale(1.05)` (linhas 159 e 165).

**Arquivo:** `src/pages/LandingPage.tsx`

- Hero: de `py-12 sm:py-16` para `py-8 sm:py-10 md:py-12` (linhas 9 e 84).
- Título: de `md:text-5xl` para `md:text-4xl` (linha 50).
- Logo: de `md:h-36 md:w-36` para `md:h-28 md:w-28` (linha 41).

**Diff sugerido (apenas Index – exemplo):**
```diff
- <div className="p-4 sm:p-6 md:p-10 min-h-screen">
+ <div className="p-4 sm:p-6 md:p-6 lg:p-8 min-h-screen">
```
```diff
- <img src={logoBpma} ... className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 ...
+ <img src={logoBpma} ... className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 ...
```
```diff
- <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold ...
+ <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold ...
```

---

### Correção ideal (responsiva) – breakpoints e altura

- **Breakpoint por altura (telas largas e baixas):**  
  Usar uma media query por altura, por exemplo `@media (max-height: 800px)`, e em um wrapper da página Início (e opcionalmente da Landing) aplicar uma classe utilitária que reduza:
  - padding (ex.: `md:py-6` em vez de `md:py-10`),
  - tamanho do logo (ex.: `md:h-28` em vez de `md:h-40`),
  - tamanho do título (ex.: `md:text-2xl` ou `md:text-3xl`).

  No Tailwind isso pode ser feito com um plugin que adicione uma variante `max-h-800` (ou similar) aplicando essas classes quando `max-height: 800px`. Alternativa: em `index.css`, uma classe tipo `.compact-hero` que só é aplicada via JS quando `window.innerHeight <= 800`.

- **HomeCard:**  
  Reduzir impacto dos cards na Início:
  - Trocar `w-[75%]` por algo como `w-full max-w-[180px]` ou usar grid com colunas fixas (ex.: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` já existe; garantir que o grid não force células enormes) e evitar `aspect-square` com células muito largas. Exemplo: limitar tamanho do card com `max-w-[200px] mx-auto` no próprio card.

- **Tailwind (opcional):**  
  Se quiser padrão mais contido para “desktop pequeno”, em `tailwind.config.ts` pode estender `screens` com algo como `'desktop-sm': '1366px'` e usar `desktop-sm:` para versões ligeiramente menores de fonte/espaço onde fizer sentido, em vez de depender só de `md`/`lg`.

---

## D) Lista de verificações (checklist)

Use isto para validar após as alterações em **1366×768** e **1920×1080**:

- [ ] **1366×768**  
  - [ ] Título “Gestão - BPMA” (Início) não passa de ~28–32px.  
  - [ ] Logo da Início não ultrapassa ~96–128px.  
  - [ ] Padding lateral/superior da área de conteúdo não dá sensação de “tela pequena espremida” nem de “oceanos de padding”.  
  - [ ] Cards da Início cabem na viewport sem necessidade de scroll excessivo para ver o primeiro bloco.  
  - [ ] Hero da Landing não ocupa mais que ~50% da altura visível.  

- [ ] **1920×1080**  
  - [ ] Layout não fica “minúsculo”; títulos e logos continuam legíveis e proporcionais.  
  - [ ] Sidebar e conteúdo mantêm proporção adequada.  

- [ ] **Geral**  
  - [ ] Nenhum `zoom` ou `transform: scale()` aplicado em `html`, `body` ou `#root`.  
  - [ ] DevTools → Computed no `html`: `font-size` permanece 16px (ou o valor padrão do navegador).  
  - [ ] Não foi aplicada escala global como “solução” (ex.: `transform: scale(0.9)` no body).

---

## E) Validação no Chrome DevTools (1366×768)

### Simular resolução 1366×768

1. Abra a aplicação (ex.: `http://localhost:8080/`).
2. Pressione **F12** para abrir o DevTools.
3. Pressione **Ctrl+Shift+M** (ou clique no ícone **Toggle device toolbar**) para ativar o modo dispositivo.
4. No topo, onde está "Dimensions" / "Responsive":
   - Clique no dropdown (por defeito pode estar "Responsive" ou um dispositivo).
   - Escolha **"Edit..."** / **"Adicionar dispositivo personalizado"** (ou equivalente).
   - Crie um dispositivo com **Largura: 1366** e **Altura: 768**; nome, por exemplo, "Desktop 1366x768".
   - Selecione esse dispositivo na lista.
5. Ou, em modo "Responsive", defina manualmente **1366** × **768** nos campos de largura e altura.

### O que validar

| Onde | O que ver |
|------|-----------|
| **Landing (/**)** | Com altura 768px (≤800), o hook `useViewportCompact` ativa: logo menor (~64–80px), título "Gestão BPMA" em `text-2xl`/`text-3xl`, hero com `py-6`. |
| **Início (/inicio)** | Logo ~80px, título "Gestão - BPMA" em `text-xl`/`text-2xl`, menos margens e `space-y-4`. Cards com **max-width 180px**. |
| **Computed** | Selecione o `<h1>` da página e confira em **Computed** o `font-size`. Em modo compacto deve ser ~20–24px (não 36–48px). |
| **Redimensionar** | Aumente a altura da janela para &gt;800px: layout deve ficar “normal” (logo e título maiores). Baixe de novo para &lt;800px: volta ao compacto. |

### Atalhos úteis

- **Ctrl+Shift+M** – ligar/desligar device toolbar.  
- No dropdown de dimensões, **"Responsive"** permite digitar 1366×768 manualmente.  
- **Zoom da página** deve estar em **100%** (Ctrl+0) para não mascarar o comportamento.

---

## ARQUIVOS PARA EU TE ENVIAR

Envie estes ficheiros ao ChatGPT (ou à ferramenta que for usar) para análise/correção focada:

1. **tailwind.config.ts** (raiz do projeto)  
2. **src/index.css**  
3. **src/App.css** (referência; atualmente não importado)  
4. **src/pages/Index.tsx** (página Início após login – hero, título, cards)  
5. **src/pages/LandingPage.tsx** (página inicial pública – hero, título, logo, seção)  
6. **src/components/SidebarLayout.tsx** (layout principal com sidebar)  
7. **src/components/Sidebar.tsx** (sidebar – largura e título)  
8. **index.html** (viewport e meta)  
9. **src/main.tsx** (confirmar que só importa `index.css` e não `App.css`)

Com isso é possível reproduzir o diagnóstico e aplicar as correções mínimas/ideais sem alterar comportamento do app de forma injustificada, priorizando ajustes responsivos e tipografia fluida onde fizer sentido.
