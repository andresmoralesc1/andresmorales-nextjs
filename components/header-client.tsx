'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getLocalizedPath, type Dictionary, type Locale } from '@/lib/i18n';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { MobileMenu } from '@/components/MobileMenu';
import { MoreMenu as MegaMenu } from '@/components/sections/more-menu';
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
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Micro-interaction: animated underline on hover + persistent
  // underline when the link is the current route. The actual gradient
  // is in .link-underline (globals.css); here we toggle `is-active` to
  // keep the underline visible without hover.
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };
  const navLinkClass = (href: string) =>
    `link-underline py-1 text-base font-medium tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm ${
      isActive(href)
        ? 'text-accent [background-size:100%_1px]'
        : 'text-secondary hover:text-accent'
    }`;

  // Build the mega-menu data once. Five top-level items consume
  // Home, Services, Portfolio, About us directly. The "More" mega-menu
  // "More" mega-menu data — single "Learn" section. Per-item desc
  // comes from dict.nav.moreMenu (added in this commit) so the panel
  // shows a one-line preview under each link.
  const m = dict.nav.moreSections;
  const mm = dict.nav.moreMenu;
  const moreItems = [
    { href: getLocalizedPath('/process', locale), title: m.process, description: mm.processDesc },
    { href: getLocalizedPath('/guide/ai-automation-latam-2026', locale), title: m.guides, description: mm.guidesDesc },
    { href: getLocalizedPath('/blog', locale), title: m.blog, description: mm.blogDesc },
    { href: getLocalizedPath('/vs/make-vs-n8n', locale), title: m.compare, description: mm.compareDesc },
  ];

  return (
    <header
      // Always translucent + blurred (the 'gloss' effect) so the page
      // content shows through faintly. The condensed state just turns
      // up the blur + adds a shadow + a top highlight stripe. No full
      // opaque cream at any point — that's what made the header feel
      // disconnected from the page on long scroll.
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300 motion-reduce:transition-none ${
        condensed
          ? 'bg-background/75 backdrop-blur-md shadow-sm'
          : 'bg-background/85 backdrop-blur-sm'
      }`}
    >
      {/* Gloss highlight: a 1px horizontal line + a soft 1-unit
          vertical fade at the very top. Together they read as a
          glassy 'shine' on the header edge — the visual signature of
          frosted-glass UIs. Pointer-events-none so they don't
          interfere with click targets. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-theme-1/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-primary/30 to-transparent"
      />
      <div
        className={`container-page flex items-center justify-between transition-[height] duration-300 motion-reduce:transition-none relative ${
          condensed ? 'h-14' : 'h-16'
        }`}
      >
        <Link
          href={getLocalizedPath('/', locale)}
          // Logo micro-interaction: subtle 1.04× scale on hover. The
          // transition is 200ms with the same easing the rest of the
          // header uses (transition-colors duration-300 family) so it
          // feels coherent with the link-underline animation.
          className="block transition-transform duration-200 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
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

        {/* Desktop nav: centered between the logo (left) and the
            locale+CTA group (right). flex-1 + justify-center makes
            the nav occupy all available middle space and center its
            items within. On narrower viewports the layout still works
            because gap-5 keeps the items breathable when the absolute
            middle shrinks. */}
        <nav
          aria-label="Primary"
          className="hidden md:flex flex-1 items-center justify-center gap-5"
        >
          <Link
            href={getLocalizedPath('/', locale)}
            className={navLinkClass(getLocalizedPath('/', locale))}
            aria-current={isActive(getLocalizedPath('/', locale)) ? 'page' : undefined}
          >
            {dict.nav.home}
          </Link>
          <Link
            href={getLocalizedPath('/services', locale)}
            className={navLinkClass(getLocalizedPath('/services', locale))}
            aria-current={isActive(getLocalizedPath('/services', locale)) ? 'page' : undefined}
          >
            {dict.nav.services}
          </Link>
          <Link
            href={getLocalizedPath('/portfolio', locale)}
            className={navLinkClass(getLocalizedPath('/portfolio', locale))}
            aria-current={isActive(getLocalizedPath('/portfolio', locale)) ? 'page' : undefined}
          >
            {dict.nav.portfolio}
          </Link>
          <Link
            href={getLocalizedPath('/about', locale)}
            className={navLinkClass(getLocalizedPath('/about', locale))}
            aria-current={isActive(getLocalizedPath('/about', locale)) ? 'page' : undefined}
          >
            {dict.nav.about}
          </Link>
          <MegaMenu
            trigger={dict.nav.more}
            learnLabel={mm.learnLabel}
            learnDescription={mm.learnDescription}
            ctaLabel={m.startCta}
            ctaHref={getLocalizedPath('/brief', locale)}
            items={moreItems}
          />
        </nav>

        {/* Locale switcher + CTA — right-aligned. The subtle vertical
            divider visually separates the navigation from the action
            area (locale + primary CTA). */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
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
