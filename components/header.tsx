import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { HeaderClient } from '@/components/header-client';

/**
 * Header — server boundary. Loads the dictionary + locale for the current
 * request and hands them off to the client `HeaderClient` (which owns the
 * scroll-aware condensation + interactive bits).
 *
 * Reads dictionary + locale via the `x-locale` header set by middleware.
 */
export async function Header() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  return (
    <>
      {/* Skip link: keyboard users hit Tab once to bypass the entire
          8-link nav + locale switcher + CTA and jump straight to <main>.
          sr-only by default; becomes visible only on focus. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-theme-1 focus:text-secondary focus:rounded-md focus:font-secondary focus:font-bold focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {dict.nav.skipToContent}
      </a>
      <HeaderClient dict={dict} locale={locale} />
    </>
  );
}
