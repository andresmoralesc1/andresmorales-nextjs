'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocalizedPath, type Dictionary, type Locale } from '@/lib/i18n';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { MobileMenu } from '@/components/MobileMenu';
import { NavItem } from '@/components/NavItem';
import { MENU } from '@/lib/menu';
import { TrackCta } from '@/components/track';

/**
 * Header (client) — owns scroll-aware condensation.
 *
 * Server `Header` (components/header.tsx) loads the dictionary + locale and
 * hands them off here. Keeping the data fetch on the server and only the
 * interactive bits on the client keeps the bundle small.
 *
 * Condensation: once the user has scrolled past 8px, the header drops from
 * h-16 (64px) to h-12 (48px) and gains a backdrop-blur + a subtle shadow.
 * One scroll listener, one state — both transitions share it.
 *
 * ponytail: threshold is 8px to avoid jitter on tiny scrolls. upgrade path:
 * rAF throttle if scroll events become a perf concern (mobile Safari).
 */
export function HeaderClient({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    // Threshold raised 8px → 40px: at 8px the header shrinks almost
    // immediately on any tap-and-flick (mobile Safari overscroll),
    // causing a distracting bounce. 40px matches "user has actually
    // scrolled" intent.
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 motion-reduce:transition-none ${
        condensed
          ? 'bg-background/80 backdrop-blur-sm shadow-sm'
          : 'bg-background'
      }`}
    >
      <div
        className={`container-page flex items-center justify-between transition-[height] duration-300 motion-reduce:transition-none ${
          // Condensed h-12 (48px) with h-10 logo (40px) leaves only 4px
          // padding top+bottom. h-14 (56px) gives 8px each side — less
          // cramped when the user has actually committed to scrolling.
          condensed ? 'h-14' : 'h-16'
        }`}
      >
        <Link
          href={getLocalizedPath('/', locale)}
          className="block transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
          aria-label="Andrés Morales — Home"
        >
          <Image
            src="/logo-wp.png"
            alt="Andrés Morales"
            width={196}
            height={94}
            className="h-10 md:h-11 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav + CTA + locale switcher */}
        <div className="hidden md:flex items-center gap-4">
          <nav aria-label="Primary" className="flex items-center gap-6">
            {MENU.map((m) => (
              <NavItem
                key={m.href}
                href={getLocalizedPath(m.href, locale)}
                label={dict.nav[m.labelKey]}
                minBp={m.minBp}
              />
            ))}
          </nav>

          <LocaleSwitcherWrapper
            dict={{ locale: dict.locale }}
            locale={locale}
            className="ml-1"
          />

          <TrackCta
            href={getLocalizedPath('/brief', locale)}
            label="header-cta"
            className="btn btn-theme"
          >
            {dict.nav.brief}
            <span aria-hidden="true">→</span>
          </TrackCta>
        </div>

        {/* Mobile menu drawer */}
        <MobileMenu dict={dict} locale={locale} />
      </div>
    </header>
  );
}
