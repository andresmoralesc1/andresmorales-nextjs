'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SectionLink {
  href: string;
  label: string;
}
interface Section {
  title: string;
  links: SectionLink[];
}

interface Props {
  trigger: string;
  sections: Section[];
  cta?: { href: string; label: string };
}

/**
 * MegaMenu — one dropdown that opens on click, closes on outside-click
 * or Escape. Mobile (md:hidden) → the regular hamburger drawer takes
 * over; this component is desktop-only by design.
 *
 * Why click-not-hover:
 *   - Touch-laptop users can't hover (or do so accidentally)
 *   - Keyboard users (Enter / Space) work the same as click
 *   - Sighted mouse users can still get a hover affordance via the
 *     text-color transition on the trigger
 */
export function MegaMenu({ trigger, sections, cta }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (containerRef.current && !containerRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close when the route changes (e.g. user clicks a link in the panel).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 text-base font-medium tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm ${
          open ? 'text-accent' : 'text-secondary hover:text-accent'
        }`}
      >
        {trigger}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 4.5 L6 8 L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          // w-80 (320px) is the right size for 4 short labels in a single
          // column. The previous w-[min(640px,...)] forced the panel
          // off-screen on smaller viewports because the More trigger is
          // at the right edge of the centered nav, and a 640px panel
          // right-aligned to it has nowhere to go.
          //
          // 2-col grid kept at sm+ so a future 6+ section can use 2
          // columns without another class change. The current 4 items
          // (1 section) render as a single column.
          className="absolute right-0 top-full mt-2 w-80 sm:w-[28rem] rounded-2xl border border-theme-9 bg-primary shadow-xl z-40 origin-top-right motion-safe:animate-[mega-in_180ms_ease-out]"
          style={{
            animation: 'mega-in 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {sections.map((s) => (
              <div key={s.title}>
                <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-2.5">
                  {s.title}
                </p>
                <ul className="space-y-1.5">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        role="menuitem"
                        className="block px-2.5 py-1.5 -mx-2.5 rounded-md text-[15px] text-secondary hover:bg-theme-1/5 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {cta ? (
            <div className="px-5 sm:px-6 py-3 border-t border-theme-9 bg-background rounded-b-2xl">
              <Link
                href={cta.href}
                className="text-sm font-secondary font-bold text-accent hover:opacity-80 transition-opacity inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                {cta.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
