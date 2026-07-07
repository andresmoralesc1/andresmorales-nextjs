import type { MetadataRoute } from 'next';

const SITE_URL = 'https://portafolio.andresmorales.com.co';

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
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
