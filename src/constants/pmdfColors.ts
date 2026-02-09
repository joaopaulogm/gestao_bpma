/**
 * Paleta de cores – Regulamento de Identidade Visual
 * Polícia Militar do Distrito Federal (PMDF)
 *
 * Cromia institucional primária (Azul PMDF): cor de maior importância,
 * pode ser utilizada sozinha nos projetos. Amarelo e vermelho devem
 * ser usados sempre em conjunto com o azul.
 */

export const PMDF_COLORS = {
  /** Azul PMDF – Cromia institucional primária. CMYK 100 92 38 45 | RGB 7 29 73 | Pantone 2768 C */
  blue: '#071d49',
  /** Amarelo institucional. CMYK 0 20 100 0 | RGB 255 205 5 | Pantone 2035 C. Usar em conjunto com o azul. */
  yellow: '#ffcc00',
  /** Vermelho institucional. CMYK 0 100 100 0 | RGB 239 59 57 | Pantone 7408 C */
  red: '#ef3b39',
  /** Verde institucional. CMYK 100 0 100 0 | RGB 0 153 102 | Pantone 7482 C */
  green: '#009933',
  /** Amarelo claro. CMYK 0 0 100 0 | RGB 246 236 19 | Pantone 803 C */
  yellowLight: '#fff200',
  /** Cinza escuro / preto. CMYK 30 0 0 100 | RGB 5 24 33 | Pantone 296 C */
  dark: '#051821',
} as const;

/** Azul PMDF – uso em sidebar, fundos primários, texto em fundo claro */
export const PMDF_BLUE = PMDF_COLORS.blue;

/** Amarelo PMDF – uso em destaques, links ativos, botões de ação sobre azul */
export const PMDF_YELLOW = PMDF_COLORS.yellow;
