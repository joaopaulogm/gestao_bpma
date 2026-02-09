import React from 'react';
import { cn } from '@/lib/utils';
import { PMDF_COLORS } from '@/constants/pmdfColors';

/**
 * Faixa quadriculada – Sillitoe Tartan (Regulamento Identidade Visual PMDF 1.19).
 * Adotada em 2012 como elemento adicional de identidade; símbolo internacional de identificação policial.
 * Pode ser usada em 2 ou 3 linhas de quadrados, nas cores azul/branco, preto/branco ou retícula 20% preto.
 */

export type SillitoeTartanVariant = 'blueWhite' | 'blackWhite' | 'halftone';

export interface SillitoeTartanProps {
  /** Número de linhas de quadrados: 2 ou 3 */
  rows?: 2 | 3;
  /** Variante de cor (azul/branco institucional, preto/branco ou 20% preto) */
  variant?: SillitoeTartanVariant;
  /** Tamanho do lado de cada quadrado em pixels */
  squareSize?: number;
  /** Espaçamento entre quadrados em pixels */
  gap?: number;
  /** Quantidade de colunas (quadrados por linha). Se não informado, preenche 100% da largura. */
  columns?: number;
  className?: string;
  /** Acessibilidade: esconde visualmente mas mantém para leitores de tela */
  decorative?: boolean;
}

const VARIANT_COLORS: Record<
  SillitoeTartanVariant,
  { dark: string; light: string }
> = {
  blueWhite: { dark: PMDF_COLORS.blue, light: '#ffffff' },
  blackWhite: { dark: '#000000', light: '#ffffff' },
  halftone: { dark: 'rgba(0,0,0,0.2)', light: '#ffffff' },
};

export default function SillitoeTartan({
  rows = 2,
  variant = 'blueWhite',
  squareSize = 8,
  gap = 2,
  columns,
  className,
  decorative = true,
}: SillitoeTartanProps) {
  const { dark, light } = VARIANT_COLORS[variant];
  const count = columns ?? 80;

  return (
    <div
      className={cn('flex flex-wrap', className)}
      style={{ gap }}
      role={decorative ? 'img' : undefined}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : 'Faixa quadriculada Sillitoe Tartan - identidade visual PMDF'}
    >
      {Array.from({ length: count }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col"
          style={{ gap }}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const isDark = (colIndex + rowIndex) % 2 === 0;
            return (
              <div
                key={rowIndex}
                style={{
                  width: squareSize,
                  height: squareSize,
                  minWidth: squareSize,
                  minHeight: squareSize,
                  backgroundColor: isDark ? dark : light,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
