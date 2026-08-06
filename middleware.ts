import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE, isLocale } from '@/lib/i18n';

// App Router locale routing.
//
// Resolution priority:
//   1. URL prefix (`/es/...`, `/pt/...`) — explicit, shareable, SEO-friendly.
//   2. `NEXT_LOCALE` cookie — sticky preference set by <LocaleSwitcher /> when
//      the user picks a flag. Survives navigation across non-prefixed URLs
//      (e.g. clicking "Contact" while on `/es/services` lands on `/contact`
//      but still renders in Spanish).
//   3. Default locale (`en`) — fallback for first-time visitors without a
//      cookie preference.
//
// The resolved locale is propagated to downstream RSC handlers via the
// `x-locale` header so `getCurrentDictionary()` / `getCurrentLocale()` in
// `@/lib/dictionary` resolve correctly.
//
// On locale changes (when the URL prefix disagrees with the cookie) we also
// refresh the cookie to keep it authoritative.
// Locale-scoped special files that should rewrite to their root counterpart.
// Used so `/es/sitemap.xml` and `/es/feed.xml` resolve to the same handler
// as `/sitemap.xml` and `/feed.xml` — there's only one source of truth for
// each (single file with `?lang=` support), and the locale-prefixed URLs
// exist purely so search engines and humans can discover the per-locale
// version of the artifact.
const LOCALE_SCOPED_FILES = /^\/(en|es|pt)\/(sitemap\.xml|feed\.xml)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Locale-scoped static files (sitemap.xml / feed.xml) — strip the prefix
  // so they hit the canonical handler at `/<file>`. The route handlers
  // already pick up the locale via `?lang=` (feed) or emit hreflang
  // alternates (sitemap). Done first so the x-locale/x-pathname headers
  // below still reflect the original URL for downstream consumers.
  //
  // For the feed: Next.js rewrites don't reliably forward rewritten
  // searchParams to the downstream route handler (`request.url` in the
  // handler reflects the *original* request URL, not the rewrite
  // target's). So instead of relying on `?lang=`, we set a custom
  // `x-feed-lang` header here and read it from `app/feed.xml/route.ts`.
  // Sitemap doesn't need this — it already emits hreflang for all three
  // locales in a single response.
  const scopedFileMatch = pathname.match(LOCALE_SCOPED_FILES);
  if (scopedFileMatch) {
    const [, locale, file] = scopedFileMatch;
    const stripped = pathname.replace(/^\/(en|es|pt)\//, '/');
    const requestHeaders = new Headers(req.headers);
    if (file === 'feed.xml') {
      requestHeaders.set('x-feed-lang', locale);
    }
    return NextResponse.rewrite(new URL(stripped, req.url), {
      request: { headers: requestHeaders },
    });
  }

  const seg = pathname.split('/').filter(Boolean)[0];
  const urlLocale = isLocale(seg) ? seg : null;

  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
  const validCookieLocale = isLocale(cookieLocale) ? cookieLocale : null;

  // Accept-Language fallback for first-time visitors without a cookie.
  // Only used for the locale rewrite so Spanish/Portuguese browsers land
  // on `/es/...` / `/pt/...` instead of being silently demoted to English.
  // The cookie always wins once set, and the URL prefix always wins over
  // everything (URL is the shareable, canonical form).
  const acceptLang = req.headers.get('accept-language') ?? '';
  const primaryTag = acceptLang.split(',')[0]?.toLowerCase() ?? '';
  const acceptLangLocale = primaryTag.startsWith('es')
    ? 'es'
    : primaryTag.startsWith('pt')
      ? 'pt'
      : null;

  const locale = urlLocale ?? validCookieLocale ?? acceptLangLocale ?? DEFAULT_LOCALE;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-locale', locale);
  // Expose the resolved pathname to server components so layouts can branch
  // on it (e.g. app/[lang]/layout.tsx reads this to decide between the
  // default B2B Footer and the warm variant for cumple/invest).
  requestHeaders.set('x-pathname', pathname);

  // If the request hit a non-prefixed URL (e.g. `/contact` or `/`), the only
  // `page.tsx` that exists is under `app/[lang]/<page>/page.tsx`. Internally
  // rewrite to `/<locale>/<path>` so Next.js routes it correctly. The user's
  // address bar stays on `/` or `/contact` — the rewrite is invisible.
  //
  // This is what makes "en is the canonical no-prefix locale" actually work
  // after we deleted `app/contact/page.tsx` and the equivalent duplicates.
  // For `/`, the rewrite target is `/<locale>` (no trailing path).
  //
  // Only rewrite when the URL has no locale prefix. If the user explicitly
  // visited `/es/contact`, that wins over the cookie — the URL is the
  // shareable, canonical form and we respect it.
  const rewritePath =
    urlLocale === null
      ? `/${locale}${pathname === '/' ? '' : pathname}`
      : null;

  const res = rewritePath
    ? NextResponse.rewrite(new URL(rewritePath, req.url), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({
        request: { headers: requestHeaders },
      });

  return res;
}

export const config = {
  // Two matchers:
  //
  // 1. Locale-prefixed special files (`/<locale>/sitemap.xml`,
  //    `/<locale>/feed.xml`). These get rewritten to their root
  //    counterpart before the regular page routing kicks in. Listed
  //    FIRST so they take precedence over the app-route matcher below
  //    (Next.js matches in array order).
  //
  // 2. App routes — everything except Next internals, API routes, static
  //    uploads, and files with extensions (favicons, asset hashes, etc.).
  //    The negative lookahead `.*\\..*` excludes files like
  //    `/favicon.ico` so the dictionary lookup is bounded to actual app
  //    routes. The locale-scoped `sitemap.xml`/`feed.xml` are NOT
  //    excluded here because their corresponding locale-prefixed URL is
  //    a different path — the negative lookahead only fires when the
  //    path itself contains a `.`, which these do (e.g.
  //    `/es/sitemap.xml`), so they get filtered out by matcher #2 but
  //    caught by matcher #1 above. That's the intended behavior.
  matcher: [
    '/(en|es|pt)/(sitemap\\.xml|feed\\.xml)',
    '/((?!_next|api|uploads|.*\\..*).*)',
  ],
};

// Re-exported to keep the module self-contained when imported elsewhere.
export { LOCALES, DEFAULT_LOCALE };
