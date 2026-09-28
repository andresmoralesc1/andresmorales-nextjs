'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Table of contents for long-form articles (guide + satellites).
 * Highlights the section the reader is currently in via an
 * IntersectionObserver. Reuses the site's `text-text` muted color
 * for the resting state and `text-accent` (theme-1) for the active
 * marker, so it sits with the rest of the design system.
 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section closest to the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-3">
        Contents
      </p>
      <ol className="space-y-2 border-l border-theme-9">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className={cn('relative pl-3 -ml-px border-l-2', isActive ? 'border-accent' : 'border-transparent')}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'block text-sm py-1 transition-colors',
                  item.level === 3 ? 'pl-3' : 'font-secondary font-bold',
                  isActive ? 'text-accent' : 'text-text hover:text-secondary',
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
