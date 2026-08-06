import type { BlogLocale } from '@/lib/blog';

const SITE_URL = 'https://andresmorales.com.co';

const COPY: Record<BlogLocale, { title: string; description: string }> = {
  en: {
    title: 'Andrés Morales — AI automation, UI/UX, and Next.js notes',
    description:
      'Field notes on AI automation with n8n, UI/UX work, and Next.js web development — by Andrés Morales, an AI consultant in Bogotá.',
  },
  es: {
    title: 'Andrés Morales — Notas sobre automatización con IA, UI/UX y Next.js',
    description:
      'Notas técnicas sobre automatización con IA con n8n, UI/UX y desarrollo web con Next.js — por Andrés Morales, consultor de IA en Bogotá.',
  },
  pt: {
    title: 'Andrés Morales — Notas sobre automação com IA, UI/UX e Next.js',
    description:
      'Notas técnicas sobre automação com IA com n8n, UI/UX e desenvolvimento web com Next.js — por Andrés Morales, consultor de IA.',
  },
};

// Read content/blog/*.md and emit a single RSS feed per locale.
// `route.ts` in Next 15 is a server-only response handler; we read the
// filesystem at request time so the feed stays in sync with published posts.
//
// Locale resolution priority:
//   1. `x-feed-lang` request header — set by `middleware.ts` when the
//      request came in via the locale-prefixed shortcut URLs
//      `/<locale>/feed.xml`. Next.js rewrites don't reliably forward
//      rewritten searchParams to the handler, so the middleware passes
//      the locale through this header instead.
//   2. `?lang=` query param — works for direct hits on `/feed.xml?lang=es`.
//   3. Default `en` — fallback for `/feed.xml` with no hints.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const headerLang = request.headers.get('x-feed-lang');
  const queryLang = url.searchParams.get('lang');
  const rawLang = (headerLang ?? queryLang ?? 'en').toLowerCase();
  const locale: BlogLocale = ['en', 'es', 'pt'].includes(rawLang)
    ? (rawLang as BlogLocale)
    : 'en';

  // Lazy import to keep this route bundle small and only fetch when hit.
  const { listPosts } = await import('@/lib/blog');
  const posts = listPosts(locale);
  const meta = COPY[locale];

  const items = posts
    .map((p) => {
      const link = `${SITE_URL}${p.href}`;
      return `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.description}]]></description>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${SITE_URL}/${locale === 'en' ? '' : `${locale}/`}blog</link>
    <atom:link href="${SITE_URL}/feed.xml?lang=${locale}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(meta.description)}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
