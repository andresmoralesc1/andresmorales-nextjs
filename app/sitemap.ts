import type { MetadataRoute } from 'next';

// Routes as of Next.js portfolio rebuild — keep in sync with app/*/page.tsx
const SITE_URL = 'https://portafolio.andresmorales.com.co';

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
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/brief', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        es: `${SITE_URL}${route.path}`,
        en: `${SITE_URL}${route.path}`,
      },
    },
  }));
}
