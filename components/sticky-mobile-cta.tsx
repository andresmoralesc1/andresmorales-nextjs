'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { TrackCta } from '@/components/track';

interface Copy {
  primary: string; // "Book a free 30-min call"
  secondary: string; // "or send a brief"
}

const COPY: Record<'en' | 'es' | 'pt', Copy> = {
  en: { primary: 'Book a free 30-min call', secondary: 'or send a brief' },
  es: { primary: 'Agenda una llamada de 30 min', secondary: 'o envíame un brief' },
  pt: { primary: 'Agende uma chamada de 30 min', secondary: 'ou me envie um briefing' },
};

const HIDE_ON: RegExp[] = [
  /^\/blog\/?/,
  /^\/(en|es|pt)\/blog\/?/,
  /^\/brief\/?$/, // on the brief page the CTA is already inline
  /^\/(en|es|pt)\/brief\/?$/,
  /^\/brief\/thanks/,
  /^\/(en|es|pt)\/brief\/thanks/,
  /^\/contact\/?/, // on contact the CTA is the form
  /^\/(en|es|pt)\/contact\/?/,
];

/**
 * Floating CTA bar for mobile only (sm:hidden).
 *
 * Mounted in the root locale layout so it persists across navigations.
 * The bar gets out of the way on the pages where the primary CTA is
 * already inline (brief / contact / blog index).
 *
 * z-60 sits above the header (z-50) so the CTA is always tappable
 * even when scrolled to the top. Below modal overlays.
 *
 * Body padding: while mounted (and visible on mobile), we add
 * `.has-sticky-mobile-cta` to <body> so globals.css can reserve space
 * at the bottom and prevent the bar from covering the last lines of
 * content. Cleaned up on unmount.
 */
export function StickyMobileCTA() {
  const pathname = usePathname() ?? '';
  // Derive locale from the URL prefix. The first segment is either
  // "es" or "pt" (or absent for the default English tree).
  const seg = pathname.split('/')[1];
  const locale: 'en' | 'es' | 'pt' = seg === 'es' || seg === 'pt' ? seg : 'en';
  const copy = COPY[locale] ?? COPY.en;

  const hidden = useMemo(
    () => HIDE_ON.some((re) => re.test(pathname)),
    [pathname],
  );

  // While visible, reserve space at the bottom of <body> so the bar
  // doesn't cover the last lines of page content. globals.css pairs
  // .has-sticky-mobile-cta with the actual padding-bottom rule.
  useEffect(() => {
    if (hidden) return;
    document.body.classList.add('has-sticky-mobile-cta');
    return () => {
      document.body.classList.remove('has-sticky-mobile-cta');
    };
  }, [hidden]);

  if (hidden) return null;

  const briefHref = locale === 'en' ? '/brief' : `/${locale}/brief`;

  return (
    <div
      className="sm:hidden fixed inset-x-0 bottom-0 z-[60] border-t border-secondary/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="region"
      aria-label={copy.primary}
    >
      <div className="container-page flex items-center gap-2 py-2.5">
        <TrackCta
          href={CALENDAR_BOOKING_URL}
          label="sticky-mobile-cta"
          className="btn-theme flex-1 text-sm px-4 py-2.5"
        >
          {copy.primary}
        </TrackCta>
        <Link
          href={briefHref}
          className="inline-flex items-center justify-center rounded-md border border-secondary/20 bg-white px-3 py-2.5 text-xs font-secondary font-bold text-secondary hover:bg-secondary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
        >
          {copy.secondary}
        </Link>
      </div>
      {/* Safe-area inset for iOS — keeps the bar above the home indicator
          on devices with display: notch / dynamic island. */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background" />
    </div>
  );
}