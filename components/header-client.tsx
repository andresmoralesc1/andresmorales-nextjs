'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocalizedPath, type Dictionary, type Locale } from '@/lib/i18n';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { MobileMenu } from '@/components/MobileMenu';
import { MegaMenu } from '@/components/mega-menu';
import { TrackCta } from '@/components/track';

/**
 * Header (client) — owns scroll-aware condensation + the desktop
 * mega-menu.
 *
 * Server `Header` (components/header.tsx) loads the dictionary + locale and
 * hands them off here. Keeping the data fetch on the server and only the
 * interactive bits on the client keeps the bundle small.
 *
 * Top-level nav is intentionally short (Home · Services · More) — the
 * 5 secondary destinations (Work, Process, About, Guides, Blog,
 * Compare) all live inside the single "More" mega-menu. Mobile keeps
 * the full list inside the hamburger drawer; this is desktop-only
 * condensation.
 *
 * Condensation: once the user has scrolled past 40px the header drops
 * from h-16 (64px) to h-14 (56px) and gains a backdrop-blur + a subtle
 * shadow. One scroll listener, one state.
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
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Build the mega-menu data once. Two sections — "Decide" (the
  // pre-purchase evaluation: work, process, about) and "Learn"
  // (content marketing: guides, blog, compare). Each link gets the
  // locale prefix automatically via getLocalizedPath.
  const m = dict.nav.moreSections;
  const megaSections = [
    {
      title: m.decide,
      links: [
        { href: getLocalizedPath('/portfolio', locale), label: m.work },
        { href: getLocalizedPath('/process', locale), label: m.process },
        { href: getLocalizedPath('/about', locale), label: m.about },
      ],
    },
    {
      title: m.learn,
      links: [
        { href: getLocalizedPath('/guide/ai-automation-latam-2026', locale), label: m.guides },
        { href: getLocalizedPath('/blog', locale), label: m.blog },
        { href: getLocalizedPath('/vs/make-vs-n8n', locale), label: m.compare },
      ],
    },
  ];

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
            // priority + sizes: Next applies modern formats (AVIF/WebP)
            // and serves the right size for the viewport, which de-bloats
            // the colormap PNG and gives a sharper render on hi-dpi.
            sizes="(max-width: 768px) 120px, 160px"
            className="h-9 md:h-10 w-auto"
            priority
            quality={100}
          />
        </Link>

        {/* Desktop nav + CTA + locale switcher */}
        <div className="hidden md:flex items-center gap-5">
          <nav aria-label="Primary" className="flex items-center gap-5">
            <Link
              href={getLocalizedPath('/', locale)}
              className="text-base font-medium tracking-normal text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={getLocalizedPath('/services', locale)}
              className="text-base font-medium tracking-normal text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
            >
              {dict.nav.services}
            </Link>
            <MegaMenu
              trigger={dict.nav.more}
              sections={megaSections}
              cta={{
                href: getLocalizedPath('/brief', locale),
                label: m.startCta,
              }}
            />
          </nav>

          <span className="w-px h-5 bg-theme-9" aria-hidden="true" />

          <LocaleSwitcherWrapper
            dict={{ locale: dict.locale }}
            locale={locale}
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

        {/* Mobile menu drawer (still shows the full list) */}
        <MobileMenu dict={dict} locale={locale} />
      </div>
    </header>
  );
}
