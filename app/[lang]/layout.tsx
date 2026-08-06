import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { headers } from 'next/headers';

// Personal campaigns where the warm-tone footer applies (hides the B2B
// "Explore" services column to preserve a personal/cálido tone).
const WARM_FOOTER_PATHS = ['/cumple-2025', '/invest-in-people-inspire-the-future'];

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
  const pathname = h.get('x-pathname') ?? '';
  const footerVariant: 'default' | 'warm' = WARM_FOOTER_PATHS.some(
    (p) => pathname === p || pathname.endsWith(p)
  )
    ? 'warm'
    : 'default';

  return (
    <>
      <Header />
      <main id="main" aria-label="Main content" className="flex-1">
        {children}
      </main>
      <Footer variant={footerVariant} />
    </>
  );
}
