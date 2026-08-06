import { ImageResponse } from 'next/og';

// Dynamic Open Graph image generator.
//
// Used by social platforms (Twitter, LinkedIn, WhatsApp, Slack, iMessage,
// Discord) as the preview card when a URL is shared. We render different
// cards depending on the `lang` and `path` query params so each page has
// its own branded preview.
//
// The design places the founder's portrait at the right third (anchored
// to the bottom) so the text block has room to breathe. The image is
// fetched from the same site's `/uploads/` static dir, which Next serves
// as a public asset.
//
// Default fallback (no params) is the English home/portfolio card.
//
// Usage from a page's `generateMetadata`:
//   openGraph: {
//     images: [{ url: `/api/og?lang=en&path=${encodeURIComponent('/')}`, ... }],
//   }
//
// Endpoint is called by the social crawlers whenever a link is shared,
// so we keep the design cheap and deterministic (no fonts loaded from
// the network at request time — uses the Next.js default font stack).

export const runtime = 'edge';

// Public site URL — used to fetch the portrait from the same origin so
// the edge runtime can render it without cross-origin asset headaches.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://andresmorales.com.co';

// Founder portrait used in every variant. The static file is 700x700
// PNG (head + shoulders, sepia tone, transparent-friendly crop). The
// @vercel/og renderer supports remote/local images via `fetch`.
const PORTRAIT_URL = `${SITE_URL}/uploads/2024/andres-portrait-og.png`;

type Locale = 'en' | 'es' | 'pt';

// Copy per (locale, path). The hero block (eyebrow + title + tagline)
// is short on purpose so the card reads in <2 seconds on a phone.
// The bottom bar carries proof points + CTA so a casual scroller has
// a clear reason to click.
const COPY: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    defaultTagline: string;
    defaultSub: string;
    ctaText: string;
    stats: [string, string, string, string]; // 4 short proof points
    // Path-specific taglines. Path key must start with "/".
    pathTaglines: Partial<Record<string, string>>;
  }
> = {
  en: {
    eyebrow: 'AI AUTOMATION CONSULTANT',
    title: 'Andrés Morales',
    defaultTagline: 'Build automation that actually works.',
    defaultSub: '10+ years · n8n · AI agents · web apps',
    ctaText: 'Book a free 30-min call →',
    stats: ['n8n expert', 'AI agents', 'Next.js apps', 'Bilingual · EN/ES/PT'],
    pathTaglines: {
      '/services': 'AI, UI/UX, and Next.js — shipped together.',
      '/services/ai-automation': 'AI automation with n8n — for ops teams.',
      '/services/ui-ux-design': 'UI/UX that doesn’t need a manual.',
      '/services/web-development': 'Next.js websites — SEO-ready, fast.',
      '/portfolio': 'Real sites. Real systems. Real outcomes.',
      '/contact': 'Free 30-min strategy call · no pitch deck.',
      '/blog': 'Field notes on AI, UI/UX, and web dev.',
    },
  },
  es: {
    eyebrow: 'CONSULTOR DE AUTOMATIZACIÓN CON IA',
    title: 'Andrés Morales',
    defaultTagline: 'Automatizaciones que sí funcionan.',
    defaultSub: '10+ años · n8n · agentes IA · apps web',
    ctaText: 'Agenda una llamada gratis de 30 min →',
    stats: ['experto n8n', 'agentes IA', 'apps en Next.js', 'Bilingüe · ES/EN/PT'],
    pathTaglines: {
      '/services': 'IA, UI/UX y Next.js — todo junto.',
      '/services/ai-automation': 'Automatización con IA y n8n — para equipos de operaciones.',
      '/services/ui-ux-design': 'UI/UX que no necesita manual.',
      '/services/web-development': 'Sitios en Next.js — rápidos y posicionados.',
      '/portfolio': 'Sitios reales. Sistemas reales. Resultados reales.',
      '/contact': 'Llamada gratis de 30 min · sin pitch.',
      '/blog': 'Notas sobre IA, UI/UX y desarrollo web.',
    },
  },
  pt: {
    eyebrow: 'CONSULTOR DE AUTOMAÇÃO COM IA',
    title: 'Andrés Morales',
    defaultTagline: 'Automações que de fato funcionam.',
    defaultSub: '10+ anos · n8n · agentes de IA · apps web',
    ctaText: 'Agende uma chamada grátis de 30 min →',
    stats: ['especialista n8n', 'agentes de IA', 'apps em Next.js', 'Bilíngue · PT/ES/EN'],
    pathTaglines: {
      '/services': 'IA, UI/UX e Next.js — tudo junto.',
      '/services/ai-automation': 'Automação com IA e n8n — para times de operações.',
      '/services/ui-ux-design': 'UI/UX que não precisa de manual.',
      '/services/web-development': 'Sites em Next.js — rápidos e bem posicionados.',
      '/portfolio': 'Sites reais. Sistemas reais. Resultados reais.',
      '/contact': 'Chamada grátis de 30 min · sem pitch.',
      '/blog': 'Notas sobre IA, UI/UX e desenvolvimento web.',
    },
  },
};

// Lookup: returns the tagline that fits the request's path, falling
// back to the locale's default tagline. Centralizing this keeps the
// OG card generator honest about what copy is shown for each URL.
function pickCopy(lang: Locale, path: string) {
  const copy = COPY[lang] ?? COPY.en;
  const tagline = copy.pathTaglines[path] ?? copy.defaultTagline;
  return {
    eyebrow: copy.eyebrow,
    title: copy.title,
    tagline,
    sub: copy.defaultSub,
    ctaText: copy.ctaText,
    stats: copy.stats,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') ?? 'en').toLowerCase() as Locale;
  const path = searchParams.get('path') ?? '/';
  // Optional override for the tagline. When a page wants a custom card
  // (e.g. blog posts pass their headline here) it can supply its own
  // tagline and bypass the per-path lookup.
  const titleOverride = searchParams.get('title');
  const safeLang: Locale = (['en', 'es', 'pt'] as const).includes(lang) ? lang : 'en';

  const baseCopy = pickCopy(safeLang, path);
  const { eyebrow, title, sub, ctaText, stats } = baseCopy;
  // Cap the override to ~64 chars so a long post title still fits in
  // the OG card's tagline slot without wrapping awkwardly.
  const tagline =
    titleOverride && titleOverride.length > 64
      ? `${titleOverride.slice(0, 61).trimEnd()}…`
      : (titleOverride ?? baseCopy.tagline);

// Fetch the portrait. Satori (the renderer behind @vercel/og) accepts
// raw bytes for inline `<img src>` images — it specifically needs an
// `ArrayBuffer`, not a Node `Buffer` (the `DataView` ctor it uses
// internally rejects Buffers). We grab the response as an ArrayBuffer
// directly so the value we hand to Satori is exactly what it expects.
const portraitRes = await fetch(PORTRAIT_URL);
  const portraitBuffer: ArrayBuffer | null = portraitRes.ok
    ? await portraitRes.arrayBuffer()
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          background:
            'linear-gradient(115deg, #F8F5F4 0%, #F0E8E4 55%, #F8D7BD 100%)',
          fontFamily: 'Georgia, serif',
          color: '#1E1810',
          position: 'relative',
        }}
      >
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 760,
            height: '100%',
            paddingLeft: 64,
            paddingRight: 32,
            paddingTop: 64,
            paddingBottom: 56,
            position: 'relative',
          }}
        >
          
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: 16,
              background: '#f96e03',
              display: 'flex',
            }}
          />

          
          <div
            style={{
              display: 'flex',
              color: '#f96e03',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontSize: 22,
              letterSpacing: 3.5,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>

          
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              color: '#1E1810',
            }}
          >
            {title}
          </div>

          
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              fontSize: 36,
              fontStyle: 'italic',
              lineHeight: 1.2,
              maxWidth: 700,
              color: '#1E1810',
            }}
          >
            {tagline}
          </div>

          
          <div style={{ flex: 1, display: 'flex' }} />

          
          <div
            style={{
              display: 'flex',
              gap: 14,
              color: '#575250',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontSize: 20,
              fontWeight: 500,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex' }}>{stats[0]}</span>
            <span style={{ display: 'flex', color: '#f96e03', fontWeight: 700 }}>·</span>
            <span style={{ display: 'flex' }}>{stats[1]}</span>
            <span style={{ display: 'flex', color: '#f96e03', fontWeight: 700 }}>·</span>
            <span style={{ display: 'flex' }}>{stats[2]}</span>
            <span style={{ display: 'flex', color: '#f96e03', fontWeight: 700 }}>·</span>
            <span style={{ display: 'flex' }}>{stats[3]}</span>
          </div>

          
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#f96e03',
                color: '#FFFFFF',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                padding: '12px 22px',
                borderRadius: 999,
              }}
            >
              <span style={{ display: 'flex' }}>{ctaText}</span>
            </div>
            <div
              style={{
                fontSize: 22,
                color: '#1E1810',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              andresmorales.com.co
            </div>
          </div>
        </div>

        
        {portraitBuffer ? (
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 460,
              height: 580,
              display: 'flex',
              alignItems: 'flex-end',
justifyContent: 'flex-end',
              }}
            >
            <img
              src={portraitBuffer as unknown as string}
              width={460}
              height={460}
              style={{
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control':
          'public, max-age=604800, s-maxage=604800, immutable',
      },
    },
  );
}