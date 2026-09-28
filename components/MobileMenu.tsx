'use client';

import { useEffect, useRef, useState } from 'react';
import { MENU } from '@/lib/menu';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { getLocalizedPath, type Dictionary, type Locale } from '@/lib/i18n';
import { TrackLink, TrackCta } from '@/components/track';

// Mobile menu — hamburger button + collapsible drawer.
// Client component (owns open/close state).
//
// `locale` and `dict` are passed in from the server-rendered <Header />
// so this client component stays simple and doesn't need to touch
// headers() / dictionaries on its own.
//
// A11y: Escape closes, outside-click closes, focus moves into the drawer
// on open and returns to the trigger on close, Tab/Shift+Tab cycles
// inside the drawer.
export function MobileMenu({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const drawerId = 'mobile-menu-drawer';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (t && drawerRef.current && !drawerRef.current.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouse);
    return () => document.removeEventListener('mousedown', onMouse);
  }, [open]);

  // Focus first focusable in the drawer on open, restore focus to the
  // trigger on close. We querySelector the first <a>/<button> inside the
  // drawer instead of using a per-link ref — TrackLink isn't forwardRef,
  // so this is the cheapest path.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const first = drawerRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        first?.focus();
      });
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Simple focus trap: cycle Tab/Shift+Tab across focusables inside the drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        aria-label={dict.nav.toggleMenu}
        aria-expanded={open}
        aria-controls={drawerId}
        // h-11 w-11 = 44×44, the iOS HIG minimum tap target.
        // Was h-10 w-10 (40×40) — bumped back for thumb ergonomics.
        className="md:hidden relative h-11 w-11 inline-flex items-center justify-center rounded-md hover:bg-secondary/5 active:bg-secondary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
        onClick={() => setOpen(!open)}
      >
        <span
          className={`absolute left-1/2 -translate-x-1/2 block h-[3px] w-7 bg-secondary rounded-full transition-transform duration-200 ${
            open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[calc(50%-9px)]'
          }`}
        />
        <span
          className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 block h-[3px] w-7 bg-secondary rounded-full transition-opacity duration-150 ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`absolute left-1/2 -translate-x-1/2 block h-[3px] w-7 bg-secondary rounded-full transition-transform duration-200 ${
            open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[calc(50%+6px)]'
          }`}
        />
      </button>

      {open && (
        <nav
          ref={drawerRef}
          id={drawerId}
          aria-label={dict.nav.toggleMenu}
          className="md:hidden border-t border-theme-9 bg-background absolute left-0 right-0 top-full shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto"
        >
          <div className="container-page py-4 flex flex-col">
            {MENU.map((m) => (
              <TrackLink
                key={m.href}
                href={getLocalizedPath(m.href, locale)}
                event="nav_link_clicked"
                label={`mobile-nav-${m.href === '/' ? 'home' : m.href.replace(/^\//, '')}`}
                onClick={() => setOpen(false)}
                className="py-3 -mx-2 px-2 text-base font-secondary font-bold uppercase tracking-widest text-secondary hover:bg-secondary/5 hover:text-accent active:bg-secondary/10 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
              >
                {dict.nav[m.labelKey]}
              </TrackLink>
            ))}
            <TrackCta
              href={getLocalizedPath('/brief', locale)}
              label="mobile-cta"
              onClick={() => setOpen(false)}
              className="btn btn-theme mt-4 w-full"
            >
              {dict.nav.startProject}
              <span aria-hidden="true">→</span>
            </TrackCta>

            {/* Locale switcher in the drawer. Visually tucked below
                the nav links so it's discoverable without scrolling. */}
            <div className="pt-4 mt-3 border-t border-theme-9">
              <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                {dict.locale.switchTo}
              </p>
              <LocaleSwitcher currentLocale={locale} t={dict.locale} />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}