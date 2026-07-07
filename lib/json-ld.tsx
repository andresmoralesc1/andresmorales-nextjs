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
  const SITE = 'https://portafolio.andresmorales.com.co';
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
