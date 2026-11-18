import { Header } from '@/components/header';
import { SiteFooter } from '@/components/site-footer';
import { StickyMobileCTA } from '@/components/sticky-mobile-cta';
import { CookieBanner } from '@/components/cookie-banner';
import { RexChatLoader } from '@/components/ui/rex-chat-loader.client';
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

  const pathname = h.get('x-pathname') ?? '';
  const isArt = pathname === '/art' || pathname.endsWith('/art') || h.get('x-is-art') === '1';

  if (isArt) {
    return (
      <main id="main" aria-label="Main content" className="flex-1 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-black overscroll-none">
        {children}
      </main>
    );
  }

  // Admin portal has its own unified sidebar, mobile drawer, and standalone header.
  // Rendering the marketing header / footer here breaks scroll containers and clutters the workspace.
  const isAdmin = pathname.startsWith('/admin') || pathname.includes('/admin');
  if (isAdmin) {
    return (
      <main id="main" aria-label="Admin content" className="h-[100dvh] w-full overflow-hidden bg-[#F8F5F4]">
        {children}
      </main>
    );
  }

  // Private proposals have their own dedicated client view
  const isProposal = pathname.includes('/p/');
  if (isProposal) {
    return (
      <main id="main" aria-label="Propuesta de proyecto" className="min-h-screen w-full bg-[#F8F5F4]">
        {children}
      </main>
    );
  }

  // Formal technical audit reports use the brand executive palette
  const isAudit = pathname.includes('/audit');
  if (isAudit) {
    return (
      <main id="main" aria-label="Reporte técnico de auditoría" className="min-h-screen w-full bg-[#F8F5F4] text-[#1E1810] selection:bg-[#f96e03] selection:text-white">
        {children}
        <RexChatLoader locale={locale as 'en' | 'es' | 'pt'} />
      </main>
    );
  }

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
      <RexChatLoader locale={locale as 'en' | 'es' | 'pt'} />
      <CookieBanner
        t={bannerDict}
        privacyHref={getLocalizedPath('/privacy', locale as 'en' | 'es' | 'pt')}
      />
    </>
  );
}
