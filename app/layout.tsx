import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import { LOCALE_HTML_LANG, type Locale } from '@/lib/i18n';
import { WebMcpRegistrar } from '@/components/WebMcpRegistrar';
import './globals.css';

// Exact fonts from the original WordPress site (Astra + Elementor):
// Roboto (body), Roboto Condensed (nav + accent), Playfair Display (headings serif)
//
// Performance notes (July 2026 rewrite):
// - The font cascade used to load 3 families × 3-7 woff2 files per visit
//   (~454 KB raw on disk, ~190 KB gzipped after moving on-stack). Lighthouse
//   flagged them as the critical request chain ceiling (~1,696 ms) because
//   Playfair Display's two weights (700 + 800) alone cost 84 KB.
//
// - We kept the visual identity (serif for h1/h2/h3 + sans for the rest),
//   trimmed the cascades, and classified Playfair Display as NON-critical:
//   * preload: false — no <link rel=preload> for these files. Body and
//     headings render with the fallback faces immediately; Playfair only
//     swaps in once the woff2 lands, which is fine because none of the
//     text painted with Playfair is on the LCP path.
//   * display: 'swap' — fallback text is visible while the font loads.
//   * Roboto 500 is unused outside of a couple of eyebrows. Drop it.
//
// Fonts dropped Jul 2026 (PageSpeed mobile optimization).
// Roboto / Roboto Condensed / Playfair Display all removed — the woff2
// cascade was the longest critical-path chain (~1,600 ms) and Lighthouse
// flagged it consistently. Replaced with system stacks:
//   - body → system-ui (Segoe UI on Windows, San Francisco on macOS/iOS,
//     Roboto on Android — visually consistent with the old Roboto on
//     most devices, zero network cost)
//   - heading → Georgia (system serif, near-universal)
//   - secondary/accent → Arial Narrow (system condensed)

export const metadata: Metadata = {
  // Title parent — each page uses `title: 'Home'` and the layout converts it to
  // "Home — Andrés Morales". The name stays as proper noun / brand spelling.
  //
  // SEO focus: surface as an "AI Consultant" (the role the user is searching
  // for) and make the value prop explicit ("automate business operations" +
  // the specific tools that buyers actually search: n8n, AI agents). The
  // previous title led with "AI Automation Consultant" — that string doesn't
  // match what real users type into Google, who search "AI consultant" +
  // "business automation" far more often.
  title: {
    default: 'Andrés Morales — AI Consultant for Business Automation',
    template: '%s — Andrés Morales',
  },
  description:
    'I help companies automate their operations with AI. I design and ship n8n workflows, AI agents, and internal tools that replace manual work — so your team can focus on growth, not busywork.',
  // Google Search Console verification. After verifying your domain at
  // https://search.google.com/search-console/, GSC gives you a meta tag
  // value like "abc123xyz...". Paste it into NEXT_PUBLIC_GSC_VERIFICATION
  // in .env.local. Leave empty until you verify.
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
    // Facebook Business Manager domain verification. Token is hardcoded
    // (not env-driven) — Meta issues one tag per domain and it doesn't
    // rotate. Remove the line if the domain is ever transferred out of
    // this Business Manager.
    other: {
      'facebook-domain-verification': 'a13hez2xszu69soo8ubtc7ta9fcd1x',
    },
  },
  metadataBase: new URL('https://andresmorales.com.co'),
  // Per-page `alternates.canonical` overrides this default. The site root
  // canonical must be the absolute URL with NO trailing slash. Next 16
  // emits a double slash (`/.com.co/`) when you give it a bare path
  // (`'/'`) here on certain locales, which Google treats as a soft
  // duplicate against the middleware-rewritten bare-host version. Use
  // the absolute URL string instead.
  alternates: {
    canonical: 'https://andresmorales.com.co',
    languages: {
      'en-US': '/',
      'es-CO': '/es',
      'pt-BR': '/pt',
      // `x-default` is the fallback hreflang for users whose locale
      // doesn't match any of the above (e.g. someone browsing from
      // Argentina or Portugal — we don't have a dedicated variant for
      // them, so send them to the English canonical). Google uses this
      // to pick what to show in un-targeted SERPs.
      'x-default': '/',
    },
  },
  // PWA manifest. Generated from app/manifest.ts and served at /manifest.webmanifest.
  manifest: '/manifest.webmanifest',
  // Icons. apple-touch-icon must be declared explicitly here — browsers
  // do NOT auto-discover /apple-touch-icon.png like they do for /favicon.ico.
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  // Default OG image points to the dynamic generator. The endpoint
  // renders the same card per (lang, path) tuple, so when a page sets
  // its own generateMetadata we override this with a path-specific URL.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://andresmorales.com.co',
    siteName: 'Andrés Morales · Portfolio',
    title: 'Andrés Morales — AI Consultant for Business Automation',
    description:
      'I help companies automate their operations with AI. I design and ship n8n workflows, AI agents, and internal tools that replace manual work — so your team can focus on growth, not busywork.',
    images: [
      {
        url: '/api/og?lang=en&path=%2F',
        width: 1200,
        height: 630,
        alt: 'Andrés Morales — AI Consultant for Business Automation',
      },
    ],
  },
  // OG profile links + Twitter handles. Next 16's `openGraph.profile`
  // requires `type: 'profile'` which would override `type: 'website'`,
  // and the `other` field only emits `name=` (not `property=`). Emitted
  // directly in `<head>` below as raw `<meta>` tags. LinkedIn / Facebook
  // scrapers parse `property="og:profile"` and X parses `name="twitter:*`
  // exactly the same regardless of how Next emits them.
  // Keep in sync with SOCIAL_URLS in components/social.tsx.
  other: {},
  twitter: {
    card: 'summary_large_image',
    title: 'Andrés Morales — AI Consultant for Business Automation',
    description:
      'I help companies automate their operations with AI. n8n workflows, AI agents, and internal tools — shipped, not slides.',
    images: ['/api/og?lang=en&path=%2F'],
    // `creator` + `site` are emitted as raw <meta> in <head> below because
    // Next's typed metadata can't represent them in the current layout.
  },
};

// Brand color (#f96e03) for browser chrome on Android/ChromeOS — matches
// the orange CTA and accent palette. Light-mode + dark-mode declarations
// cover browsers that swap the chrome color based on the OS color scheme.
// In Next.js 14+ themeColor must live in the `viewport` export, not `metadata`.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f96e03' },
    { media: '(prefers-color-scheme: dark)', color: '#1E1810' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: locale-dependent UI lives in `app/[lang]/layout.tsx` so it
  // re-renders when the user switches between `/` ↔ `/es` ↔ `/pt`. The
  // root layout in App Router is shared across all routes and does NOT
  // re-render on segment changes — keeping <Header /> here would freeze
  // its labels on the first-render locale.
  const h = await headers();
  const rawLocale = h.get('x-locale');
  const htmlLang = rawLocale && LOCALE_HTML_LANG[rawLocale as Locale]
    ? LOCALE_HTML_LANG[rawLocale as Locale]
    : 'en-US';

  // JSON-LD Person + WebSite schema for knowledge graph / rich results.
  // `knowsLanguage` and `inLanguage` reflect the resolved locale so the
  // structured data agrees with the visible language.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://andresmorales.com.co/#person',
        name: 'Andrés Morales',
        givenName: 'Andrés',
        familyName: 'Morales',
        jobTitle: 'AI Automation Consultant',
        description:
          'AI & web consultant. Designs and ships AI automations, UI/UX, and production-grade web for LATAM SMBs and US startups. Founder of Andrés Morales Automation since June 2022.',
        url: 'https://andresmorales.com.co',
        image: 'https://andresmorales.com.co/uploads/IMG_20220702_142658.jpg',
        sameAs: [
          'https://andresmorales.com.co',
          'https://www.linkedin.com/in/andresmoralesc1/',
          'https://github.com/andresmoralesc1/',
          'https://www.instagram.com/andres_morales_automation/',
          'https://www.facebook.com/andresmoralesautomation/',
        ],
        knowsAbout: [
          'AI Automation',
          'n8n',
          'AI Agents',
          'Web Development',
          'UI/UX Design',
        ],
        knowsLanguage: ['es-CO', 'en-US', 'pt-BR'],
      },
      {
        // ProfessionalService: tells Google this is a real business
        // offering paid services, not just a personal blog. Improves
        // eligibility for "service near me" / local pack and makes
        // knowledge graph panel richer (hours, area, price range).
        '@type': 'ProfessionalService',
        '@id': 'https://andresmorales.com.co/#business',
        name: 'Andrés Morales — AI Consulting',
        image: 'https://andresmorales.com.co/uploads/IMG_20220702_142658.jpg',
        url: 'https://andresmorales.com.co',
        description:
          'AI consulting practice specializing in business automation, AI agents, and operational tooling. Engagements typically run $2,000 – $50,000+ USD.',
        founder: { '@id': 'https://andresmorales.com.co/#person' },
        // provider links back to the Person node (Schema.org best practice
        // for one-person businesses).
        provider: { '@id': 'https://andresmorales.com.co/#person' },
        areaServed: [
          { '@type': 'Country', name: 'Colombia' },
          { '@type': 'Country', name: 'United States' },
          { '@type': 'Country', name: 'Brazil' },
        ],
        // No physical address published — work is remote-first. Leaving
        // address out is correct; do NOT fake a street address.
        priceRange: '$$',
        // Service catalog: the three engagement tracks the user can buy.
        // Each one is a Service node so Google can index them as offerings
        // individually (better matching against specific queries like
        // "n8n consultant" or "UI/UX designer Colombia").
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'AI Automation',
                description:
                  'End-to-end workflow automation with n8n, Make, and custom code. Lead nurturing, internal reporting, CRM sync, and SaaS integrations. Custom AI agents for support, lead qualification, and internal knowledge — versioned prompts, human-in-the-loop, and source-grounded answers.',
                url: 'https://andresmorales.com.co/services/ai-automation',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'UI/UX Design',
                description:
                  'Product design for SaaS dashboards, e-commerce storefronts, and internal tools. Wireframes, prototypes, and design systems in Figma.',
                url: 'https://andresmorales.com.co/services/ui-ux-design',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Web Development',
                description:
                  'Full-stack web applications on Next.js, React, and TypeScript. PostgreSQL backends, Docker deployment, and Cloudflare in front.',
                url: 'https://andresmorales.com.co/services/web-development',
              },
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://andresmorales.com.co/#website',
        url: 'https://andresmorales.com.co',
        name: 'Andrés Morales — Portfolio',
        dateModified: '2026-09-26',
        inLanguage: htmlLang,
        publisher: { '@id': 'https://andresmorales.com.co/#person' },
        // Sitelinks searchbox — would be enabled via WebSite.potentialAction
        // when a real search endpoint exists. The previous version pointed
        // at `/portfolio?q=...` which 404s on real queries. Removed until
        // a search endpoint ships.
      },
    ],
  };

  return (
    <html
      lang={htmlLang}
      className={``}
    >
      <head>
        {/* Raw OG/Twitter meta. Next's typed metadata API can't emit
            `property="og:profile"` without changing `type` to 'profile',
            and its `other` field only emits `name=` attributes. Emit the
            tags directly. LinkedIn, Facebook, and X all parse these. */}
        <meta property="og:profile" content="https://www.linkedin.com/in/andresmoralesc1/,https://www.instagram.com/andres_morales_automation/,https://www.facebook.com/andresmoralesautomation/" />
        <meta name="twitter:creator" content="@andresmoralesc1" />
        <meta name="twitter:site" content="@andresmoralesc1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami analytics (self-hosted at umami.andresmorales.com.co, no
            cookies, GDPR-safe). Only loaded if NEXT_PUBLIC_UMAMI_WEBSITE_ID
            is set in the environment. To enable:
              1. Self-host Umami (docker-compose in /home/telchar/umami)
              2. Add your site in the Umami admin panel
              3. Copy the website-id from Settings → Websites → Tracking code
              4. Set NEXT_PUBLIC_UMAMI_WEBSITE_ID in .env.local
            When set, the script registers `window.umami` so `track()` calls
            in lib/analytics.ts forward automatically.

            Strategy is `lazyOnload` — fires after the browser is idle, well
            past LCP. Removes the cost of a render-blocking analytics script
            and keeps the LCP image as the only critical-path request. */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://umami.andresmorales.com.co/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="lazyOnload"
          />
        )}

        {/* Google Analytics 4 — opt-in. Set NEXT_PUBLIC_GA_MEASUREMENT_ID
            in .env.local (e.g. G-XXXXXXXXXX) to load gtag.js. We use
            Google's official `consent` mode v2 default so the tag fires
            only after the user grants consent via the cookie banner.
            Until consent is granted, GA4 receives cookieless pings
            (no client_id, no storage) which still gives you aggregated
            traffic numbers without violating GDPR / Colombia's
            Ley 1581/2012. If the env var is unset, the tag is omitted
            entirely — useful when you're only running Umami. */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              id="ga4-loader"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script
              id="ga4-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    ad_storage: 'denied',
                    analytics_storage: 'denied',
                    wait_for_update: 500
                  });
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    anonymize_ip: true,
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="flex flex-col min-h-screen">
        {/* a11y: keyboard users can skip past the nav. Hidden until focused.
            Pair with id="main" on the content wrapper below. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-theme-1 focus:text-secondary focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-1"
        >
          Skip to main content
        </a>
        {children}
        {/* WebMCP tool registrar — exposes submit_contact / submit_brief /
            schedule_call to AI agents via document.modelContext. No UI. */}
        <WebMcpRegistrar />
      </body>
    </html>
  );
}