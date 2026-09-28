/**
 * JSON-LD <script> tag renderer for inline page-level structured data.
 * Used by service pages, contact, and the brief landing to add
 * Service / ContactPage / FAQPage schemas that Google can pick up as
 * rich results.
 *
 * Usage in a page component:
 *
 *   export default function Page() {
 *     return (
 *       <>
 *         <JsonLd data={serviceSchema({ ... })} />
 *         <main>...</main>
 *       </>
 *     );
 *   }
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // data is fully under our control (we build the objects ourselves)
      // so dangerouslySetInnerHTML is safe here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Build a Service schema for one of the /services/* pages. Provider is
 * the same Person that the root layout exposes, so Google ties the
 * service to the entity.
 */
export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;          // e.g. '/services/ai-automation'
  serviceType: string;   // e.g. 'AI Automation Consulting'
  areaServed?: string[]; // ISO-3166 alpha-2 codes
  priceRange?: string;   // e.g. '$$'
}): Record<string, unknown> {
  const SITE = 'https://andresmorales.com.co';
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: `${SITE}${opts.path}`,
    provider: { '@id': `${SITE}/#person` },
    areaServed: (opts.areaServed || ['CO', 'US']).map((code) => ({
      '@type': 'Country',
      name: code,
    })),
    ...(opts.priceRange && { priceRange: opts.priceRange }),
  };
}

/**
 * Build a BreadcrumbList schema. Google displays breadcrumbs in the SERP
 * for a page when the corresponding BreadcrumbList structured data is
 * present — this lets a deep URL like
 * `andresmorales.com.co/services/ai-automation` show as
 * `Home > Services > AI Automation` instead of the raw URL.
 *
 * Pass the trail in order from root → current page. The last item is the
 * current page; pass its URL via `current` and we mark it as the final
 * breadcrumb (no further navigation).
 */
export function breadcrumbSchema(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  const SITE = 'https://andresmorales.com.co';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}

/**
 * Build a FAQPage schema from a list of Q&A pairs. Google uses this to
 * surface expandable Q&A cards directly in the SERP (position 0 / rich
 * result). For eligibility:
 *   - The visible page must contain the Q&A in plain HTML (don't hide
 *     the text behind tabs or accordions that require JS to expand —
 *     Google's renderer is conservative).
 *   - Each `question` and `answer` should be a single sentence where
 *     possible. Long answers are fine but the answer text is what
 *     Google shows in the snippet, so front-load the value.
 *   - Don't stuff keywords — Google has clamped FAQ rich results for
 *     pages that look spammy.
 *
 * Pass an `inLanguage` (BCP-47) so the SERP snippet is delivered in the
 * user's locale.
 */
export function faqSchema(
  items: { question: string; answer: string }[],
  inLanguage?: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(inLanguage && { inLanguage }),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Build a LocalBusiness schema for SEO. Use on the /contact page (and
 * optionally the home page) so the Google Business Profile signal is
 * reinforced by the same NAP (Name / Address / Phone) the GBP already
 * publishes. Mismatches between the two are a common source of local
 * ranking instability, so keep them aligned.
 *
 * For an AI / dev-consulting practice, "name" and "url" are required;
 * the geo + address are recommended. Pass null for any field that does
 * not apply (omit vs sending empty string — schema.org ignores null).
 */
export function localBusinessSchema(b: {
  name: string;
  url?: string;
  description?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  geo?: { lat: number; lng: number };
  telephone?: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
}): Record<string, unknown> {
  const addr =
    b.streetAddress ||
    b.addressLocality ||
    b.postalCode ||
    b.addressCountry
      ? {
          '@type': 'PostalAddress',
          ...(b.streetAddress && { streetAddress: b.streetAddress }),
          ...(b.addressLocality && { addressLocality: b.addressLocality }),
          ...(b.addressRegion && { addressRegion: b.addressRegion }),
          ...(b.postalCode && { postalCode: b.postalCode }),
          ...(b.addressCountry && { addressCountry: b.addressCountry }),
        }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    ...(b.url && { url: b.url }),
    ...(b.description && { description: b.description }),
    ...(b.email && { email: b.email }),
    ...(b.telephone && { telephone: b.telephone }),
    ...(addr && { address: addr }),
    ...(b.geo && { geo: { '@type': 'GeoCoordinates', ...b.geo } }),
    ...(b.priceRange && { priceRange: b.priceRange }),
    ...(b.openingHours?.length && { openingHours: b.openingHours }),
  };
}

/**
 * Build a HowTo schema for a process / methodology page. The site uses
 * this on /services/* to mark the 5-step engagement model as a
 * structured HowTo. Like FAQPage, the steps must be visible in the
 * page's HTML (we render them as <ol>).
 */
export function howToSchema(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string; // ISO 8601 duration, e.g. 'P14D'
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    ...(opts.totalTime && { totalTime: opts.totalTime }),
    step: opts.steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * Build an Article schema for a long-form blog / guide post. Pairs with
 * the ArticleHero + ArticleToc + SeriesNav cluster components under
 * /guide/[slug]. Author defaults to the site owner.
 */
export function articleSchema(opts: {
  headline: string;
  description: string;
  datePublished: string; // ISO yyyy-mm-dd
  dateModified?: string;
  author?: string;
  url?: string;
  image?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    ...(opts.dateModified && { dateModified: opts.dateModified }),
    author: { '@type': 'Person', name: opts.author ?? 'Andrés Morales' },
    ...(opts.url && { url: opts.url }),
    ...(opts.image && { image: opts.image }),
  };
}
