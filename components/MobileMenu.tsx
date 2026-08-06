'use client';

import { useState } from 'react';
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
export function MobileMenu({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label={dict.nav.toggleMenu}
        aria-expanded={open}
        className="md:hidden p-2"
        onClick={() => setOpen(!open)}
      >
        <span className="block w-6 h-0.5 bg-secondary mb-1" />
        <span className="block w-6 h-0.5 bg-secondary mb-1" />
        <span className="block w-6 h-0.5 bg-secondary" />
      </button>

      {open && (
        <nav
          aria-label={dict.footer.ariaNavLabel}
          className="md:hidden border-t border-theme-9 bg-background absolute left-0 right-0 top-20 shadow-lg"
        >
          <div className="container-page py-4 flex flex-col gap-4">
            {MENU.map((m) => (
              <TrackLink
                key={m.href}
                href={getLocalizedPath(m.href, locale)}
                event="nav_link_clicked"
                label={`mobile-nav-${m.href === '/' ? 'home' : m.href.replace(/^\//, '')}`}
                onClick={() => setOpen(false)}
                className="text-sm font-secondary font-bold uppercase tracking-widest link-underline text-secondary hover:text-accent"
              >
                {dict.nav[m.labelKey]}
              </TrackLink>
            ))}
            <TrackCta
              href={getLocalizedPath('/brief', locale)}
              label="mobile-cta"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-secondary font-bold uppercase tracking-widest bg-theme-1 text-secondary px-5 py-3 rounded-md shadow-[0_0_8px_rgba(255,102,0,0.3)]"
            >
              {dict.nav.startProject}
              <span aria-hidden="true">→</span>
            </TrackCta>

            {/* Locale switcher in the drawer. Visually tucked below
                the nav links so it's discoverable without scrolling. */}
            <div className="pt-3 mt-2 border-t border-theme-9">
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
