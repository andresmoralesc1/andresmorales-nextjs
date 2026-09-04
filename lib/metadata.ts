import type { Locale } from '@/lib/i18n';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n';

/**
 * Page metadata helper.
 *
 * Centralizes the title template + OG image sharing so every page
 * inherits the brand by default.
 *
 * OG images are now generated dynamically at `/api/og?lang=<locale>&path=<path>`
 * so each page has its own preview in the user's language — falling back
 * to the English variant when a path-specific copy isn't defined. The
 * static OG (`/uploads/2025/06/andres-morales-og.jpg`) is still used as
 * the absolute fallback when no `locale` is provided.
 */

const SITE_NAME = 'Andrés Morales';
const STATIC_FALLBACK_OG = '/uploads/2025/06/andres-morales-og.jpg';

// Map our app locales to a language code understood by `image-generation`/OG
// consumers. EN is omitted from the URL by convention; ES + PT use their
// short codes.
const OG_LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
};

// BCP 47 hreflang tag per app locale. Used to populate
// `alternates.languages` so search engines understand the relationship
// between `/services` ↔ `/es/services` ↔ `/pt/services`. Keep in sync
// with `og:locale` below.
const HREFLANG_TAG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-CO',
  pt: 'pt-BR',
};

export function ogImageUrl(locale: Locale, path: string): string {
  // Use the dynamic endpoint so each page has a tailored card.
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `/api/og?lang=${OG_LOCALE_TAG[locale]}&path=${encodeURIComponent(safePath)}`;
}

export function staticOgUrl(): string {
  return STATIC_FALLBACK_OG;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  locale?: Locale;
  path?: string;
  ogImage?: string;
  /**
   * Set to true for post-action / utility pages that should not appear in
   * search results (e.g. /brief/thanks, /unsubscribe). Even though
   * robots.txt disallows them, we add a noindex meta as a defense in
   * depth — some crawlers and link-preview bots ignore robots.txt.
   */
  noindex?: boolean;
  /** Override OG image (else dynamic by locale+path). */
  type?: 'website' | 'article';
}) {
  const {
    title,
    description,
    locale = 'en',
    path = '/',
    ogImage,
    noindex = false,
    type = 'website',
  } = opts;
  const ogFullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} — ${SITE_NAME}`;
  const imageUrl = ogImage ?? ogImageUrl(locale, path);

  // Locale tag for OG (Spanish: es_CO, Portuguese: pt_BR, English: en_US).
  const ogLocale =
    locale === 'es' ? 'es_CO' : locale === 'pt' ? 'pt_BR' : 'en_US';

  return {
    title,
    description,
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    }),
    openGraph: {
      title: ogFullTitle,
      description,
      url: `https://andresmorales.com.co${normalizePath(path)}`,
      siteName: SITE_NAME,
      locale: ogLocale,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogFullTitle,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://andresmorales.com.co${normalizePath(path)}`,
      // Hreflang per-locale: each locale gets its own canonical URL using
      // the same `path`. EN has no prefix (`/services`), ES/PT add the
      // locale (`/es/services`, `/pt/services`). `x-default` points at the
      // English version for users whose locale doesn't match any of these
      // — this is the SEO best practice for multi-region multi-language
      // sites. Computed dynamically per call so the same helper works for
      // `/`, `/services`, `/blog/<slug>`, and every other route without
      // hardcoding.
      languages: {
        ...Object.fromEntries(
          LOCALES.map((loc) => [
            HREFLANG_TAG[loc],
            loc === DEFAULT_LOCALE
              ? normalizePathWithRoot(path)
              : `/${loc}${normalizePathWithRoot(path) === '/' ? '' : normalizePathWithRoot(path)}`,
          ])
        ),
        'x-default': normalizePathWithRoot(path),
      },
    },
  };
}

// Strip the trailing slash for canonical / OG url so we don't ship
// `andresmorales.com.co/` while the rest of the site is the bare host.
// The root path collapses to the bare host (no slash); other paths
// keep the leading slash. Hreflang values keep a trailing `/` when
// they represent the site root, because Google's hreflang parser is
// picky about empty paths.
function normalizePath(p: string): string {
  if (p === '/' || p === '') return '';
  return p.replace(/\/+$/, '');
}

// Like normalizePath but keeps `/` for the site root. Used in hreflang
// where an empty path would be invalid.
function normalizePathWithRoot(p: string): string {
  if (p === '/' || p === '') return '/';
  return p.replace(/\/+$/, '');
}
