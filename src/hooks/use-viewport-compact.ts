import * as React from 'react';

/** Altura do viewport abaixo da qual aplicamos layout compacto (telas largas mas baixas, ex.: 1366×768) */
const COMPACT_VIEWPORT_HEIGHT = 800;

/**
 * Retorna true quando a altura do viewport é ≤ COMPACT_VIEWPORT_HEIGHT.
 * Usado para reduzir tamanhos de logo, título e padding em telas "wide but short".
 */
export function useViewportCompact(): boolean {
  const [compact, setCompact] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerHeight <= COMPACT_VIEWPORT_HEIGHT : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-height: ${COMPACT_VIEWPORT_HEIGHT}px)`);
    const onChange = () => setCompact(window.innerHeight <= COMPACT_VIEWPORT_HEIGHT);
    mql.addEventListener('change', onChange);
    setCompact(window.innerHeight <= COMPACT_VIEWPORT_HEIGHT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return compact;
}
