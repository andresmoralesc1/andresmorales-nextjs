'use client';

/**
 * Reveal — fade + 12px translateY on first viewport entry.
 *
 * Conservador: 0 deps, ~0.5 kB gzip. Reusa IntersectionObserver (mismo
 * patrón que experience/skills client components).
 *
 * Tres mitigaciones contra el bug histórico "opacity-0 para siempre"
 * (auditoría 2026-07-11 — experience.client.tsx):
 *   1. prefers-reduced-motion → marca visible inmediatamente.
 *   2. IntersectionObserver no soportado → marca visible inmediatamente.
 *   3. Elemento ya en viewport al montar → marca visible inmediatamente.
 *
 * Importante: NO envolver <Hero> ni la imagen LCP. La clase `reveal`
 * pone opacity:0 en SSR, lo que retrasa el LCP. Usar solo en
 * secciones debajo del fold o contenido secundario del hero.
 */

import { useEffect, useRef, type ReactNode, type ElementType } from 'react';

type Props = {
  children: ReactNode;
  /** Tag del wrapper. Default 'div'. Usar 'section' cuando envuelve un bloque semántico. */
  as?: ElementType;
  /** Cascada de 80ms entre children directos (hasta 6). */
  stagger?: boolean;
  /** Threshold del IntersectionObserver (0-1). Default 0.15 = 15% visible. */
  threshold?: number;
  className?: string;
};

export function Reveal({
  children,
  as: Tag = 'div',
  stagger = false,
  threshold = 0.15,
  className = '',
  ...rest
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mitigación 1: motion reducido → visible ya.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window)) {
      // Mitigación 2: sin IntersectionObserver (navegadores viejos) → visible ya.
      el.classList.add('is-visible');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);

    // Mitigación 3: si el elemento ya está visible al montar (ej. usuario
    // llegó con #fragment, o el IO no disparó en el primer frame), forzar
    // visible después de un microtask. Previene el flash de opacity:0.
    const fallback = window.setTimeout(() => {
      if (!el.classList.contains('is-visible')) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, 400);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  const cls = `${stagger ? 'reveal-stagger' : 'reveal'} ${className}`.trim();

  return (
    <Tag ref={ref} className={cls} {...rest}>
      {children}
    </Tag>
  );
}