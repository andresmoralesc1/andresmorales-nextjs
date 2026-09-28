import type { MetadataRoute } from 'next';
import { listSlugsByLocale, listGuideSlugsByLocale, postMtime } from '@/lib/blog';
import { CASE_STUDIES } from '@/data/case-studies';

// Routes as of Next.js portfolio rebuild — keep in sync with app/*/page.tsx
const SITE_URL = 'https://andresmorales.com.co';

interface RouteEntry {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
  // ISO date of the route's last meaningful content edit (page file).
  // Set per route so the sitemap doesn't advertise "modified now" on
  // every Next.js rebuild — Google downweights those signals.
  lastModified: string;
}

const ROUTES: RouteEntry[] = [
  { path: '/',                                          changeFrequency: 'weekly',  priority: 1.0, lastModified: '2026-09-08' },
  { path: '/services',                                  changeFrequency: 'weekly',  priority: 0.9, lastModified: '2026-08-26' },
  { path: '/process',                                    changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-09-24' },
  { path: '/about',                                      changeFrequency: 'monthly', priority: 0.7, lastModified: '2026-09-24' },
  { path: '/services/ai-automation',                    changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-08-26' },
  { path: '/services/ui-ux-design',                     changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-08-26' },
  { path: '/services/web-development',                  changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-08-26' },
  { path: '/guide/ai-automation-latam-2026',              changeFrequency: 'monthly', priority: 0.9, lastModified: '2026-09-25' },
  { path: '/portfolio',                                 changeFrequency: 'weekly',  priority: 0.9, lastModified: '2026-09-14' },
  { path: '/blog',                                      changeFrequency: 'weekly',  priority: 0.8, lastModified: '2026-09-08' },
  { path: '/contact',                                   changeFrequency: 'monthly', priority: 0.7, lastModified: '2026-08-21' },
  { path: '/brief',                                     changeFrequency: 'monthly', priority: 0.6, lastModified: '2026-08-26' },
  { path: '/cumple-2025',                               changeFrequency: 'monthly', priority: 0.5, lastModified: '2026-08-26' },
  { path: '/invest-in-people-inspire-the-future',       changeFrequency: 'monthly', priority: 0.5, lastModified: '2026-08-26' },
  { path: '/privacy',                                   changeFrequency: 'monthly', priority: 0.3, lastModified: '2026-08-21' },
  { path: '/terms',                                     changeFrequency: 'monthly', priority: 0.3, lastModified: '2026-08-21' },
  { path: '/vs/make-vs-n8n',                            changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-09-26' },
  { path: '/vs/ai-consultant-vs-agency',                changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-09-26' },
  { path: '/vs/vercel-vs-aws-amplify',                  changeFrequency: 'monthly', priority: 0.8, lastModified: '2026-09-26' },
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
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: urlFor('en', route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    // `x-default` points at the EN canonical no-prefix URL. Including it
    // tells Google which variant to show users whose locale doesn't match
    // any of the alternatives (e.g. someone browsing from Argentina or
    // Portugal). Mirrors the layout's `alternates.languages.x-default`
    // so sitemap and HTML agree.
    alternates: {
      // x-default only emits when EN exists for this route. For static
      // routes every locale exists, so the condition is always true —
      // the guard mirrors the blog entries below and prevents future
      // EN-only routes from emitting x-default into a 404.
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [locale, urlFor(locale, route.path)]),
        ),
        ...(LOCALES.includes('en') && {
          'x-default': urlFor('en', route.path),
        }),
      },
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
      const blogPath = `/blog/${slug}`;
      const existingLocales = LOCALES.filter((alt) =>
        slugsByLocale[alt].has(slug),
      );
      // `postMtime` reads the .md file's mtime so blog entries advertise
      // a real last-modified signal — falls back to now() when the helper
      // can't find a body file (e.g. mismatched slug list).
      const postDate = postMtime(slug, locale) ?? new Date();
      // `x-default` only emitted when EN has a translation — pointing it
      // at a 404 would mislead Google and waste crawl budget. When EN is
      // missing, leave it out entirely; Google's selector falls back to
      // the URL the user landed on.
      const languages: Record<string, string> = Object.fromEntries(
        existingLocales.map((alt) => [alt, urlFor(alt, blogPath)]),
      );
      if (existingLocales.includes('en')) {
        languages['x-default'] = urlFor('en', blogPath);
      }
      return {
        url: urlFor(locale, blogPath),
        lastModified: postDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages },
      };
    }),
  );

  // Case study entries — one per (slug × locale). Same alternates
  // pattern as blog: x-default only when EN exists for the slug.
  const caseStudySlugs = CASE_STUDIES.map((c) => c.slug);
  const caseStudyEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    caseStudySlugs.map((slug) => {
      const workPath = `/work/${slug}`;
      const languages: Record<string, string> = Object.fromEntries(
        LOCALES.map((alt) => [alt, urlFor(alt, workPath)]),
      );
      if (LOCALES.includes('en')) {
        languages['x-default'] = urlFor('en', workPath);
      }
      return {
        url: urlFor(locale, workPath),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.75,
        alternates: { languages },
      };
    }),
  );

  // Guide entries — one per (slug × locale) where a body exists in
  // content/guide/. Same hreflang discipline as blog: only emit
  // alternates for locales that actually have the guide body.
  const guideSlugsByLocale = listGuideSlugsByLocale();
  const guideEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    [...guideSlugsByLocale[locale]].map((slug) => {
      const guidePath = `/guide/${slug}`;
      const existingLocales = LOCALES.filter((alt) =>
        guideSlugsByLocale[alt].has(slug),
      );
      const languages: Record<string, string> = Object.fromEntries(
        existingLocales.map((alt) => [alt, urlFor(alt, guidePath)]),
      );
      if (existingLocales.includes('en')) {
        languages['x-default'] = urlFor('en', guidePath);
      }
      return {
        url: urlFor(locale, guidePath),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: { languages },
      };
    }),
  );

  return [...staticEntries, ...blogEntries, ...caseStudyEntries, ...guideEntries];
}
