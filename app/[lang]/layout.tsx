import { Header } from '@/components/header';
import { SiteFooter } from '@/components/site-footer';
import { StickyMobileCTA } from '@/components/sticky-mobile-cta';
import { CookieBanner } from '@/components/cookie-banner';
import { getCurrentDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers';
import { getLocalizedPath } from '@/lib/i18n';

// Locale-scoped layout. Lives under `app/[lang]/` so it re-renders when
// the user navigates between `/`, `/es/...`, and `/pt/...`. This is
// required because the App Router root layout (`app/layout.tsx`) is
// shared across all routes and does NOT re-render on segment changes
// — keeping <Header /> / <Footer /> at the root would freeze their
// translated labels on the first-render locale (the bug we fixed).
//
// The root layout still owns <html>, fonts, JSON-LD, and the skip-link.
export default async function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const locale = h.get('x-locale') ?? 'en';

  // Resolve dictionary server-side and pass only the cookie-banner strings
  // to the client component — `getCurrentDictionary` uses next/headers
  // and cannot be imported from a 'use client' module.
  const dict = await getCurrentDictionary();
  const bannerDict = dict.legal.cookieBanner;

  return (
    <>
      <Header />
      <main id="main" aria-label="Main content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyMobileCTA />
      <CookieBanner
        t={bannerDict}
        privacyHref={getLocalizedPath('/privacy', locale as 'en' | 'es' | 'pt')}
      />
    </>
  );
}
