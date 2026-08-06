import type { MetadataRoute } from 'next';
import { listSlugsByLocale } from '@/lib/blog';

// Routes as of Next.js portfolio rebuild — keep in sync with app/*/page.tsx
const SITE_URL = 'https://andresmorales.com.co';

interface RouteEntry {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
}

const ROUTES: RouteEntry[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/services', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/services/ai-automation', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/ui-ux-design', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/web-development', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/portfolio', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/brief', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/cumple-2025', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/invest-in-people-inspire-the-future', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'monthly', priority: 0.3 },
];

// Locale → URL prefix. EN is the canonical (no prefix); ES and PT get /es and /pt.
// Keep in sync with middleware.ts LOCALE_TO_PREFIX / PREFIX_TO_LOCALE maps.
const LOCALES = ['en', 'es', 'pt'] as const;
type Locale = (typeof LOCALES)[number];

function urlFor(locale: Locale, path: string): string {
  // EN is canonical with no prefix. ES/PT get /es or /pt.
  const prefix = locale === 'en' ? '' : `/${locale}`;
  // Root path is just / + prefix; otherwise prefix + path.
  if (path === '/') return `${SITE_URL}${prefix}/`;
  return `${SITE_URL}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: urlFor('en', route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, urlFor(locale, route.path)])
      ),
    },
  }));

  // Blog entries — one entry per (slug × locale) where a body actually
  // exists. The `alternates.languages` map only advertises locales that
  // ALSO have the slug — emitting hreflang for missing translations makes
  // Google follow them into 404s and report "Page with redirect" / "Not
  // found (404)" in Search Console.
  const slugsByLocale = listSlugsByLocale();
  const blogEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    [...slugsByLocale[locale]].map((slug) => {
      const existingLocales = LOCALES.filter((alt) =>
        slugsByLocale[alt].has(slug),
      );
      return {
        url: urlFor(locale, `/blog/${slug}`),
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        // Only emit alternates for languages with a body. `x-default`
        // points to the canonical no-prefix URL when EN exists, otherwise
        // the first existing locale — keeps Google's selector behaviour
        // sane for un-targeted queries.
        alternates: {
          languages: Object.fromEntries(
            existingLocales.map((alt) => [
              alt,
              urlFor(alt, `/blog/${slug}`),
            ]),
          ),
        },
      };
    }),
  );

  return [...staticEntries, ...blogEntries];
}
