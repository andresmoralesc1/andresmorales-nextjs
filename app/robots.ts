import type { MetadataRoute } from 'next';

const SITE_URL = 'https://andresmorales.com.co';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Marketing-only site: no submission forms besides /brief want crawlers.
        // /api/* is API routes that don't need indexing.
        disallow: ['/api/', '/brief/thanks', '/unsubscribe'],
      },
      // AI training crawlers — opt out of training while staying indexable
      // for traditional search bots (Googlebot, Bingbot aren't listed;
      // they're covered by the wildcard rule above and we want them indexing).
      // Covers the major training-data scrapers as of 2026-09. Adjust when
      // new ones appear (track via robots.txt user-agent logs in GSC or
      // SE Ranking's audit).
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Bytespider',
          'CCBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
