import Link from 'next/link';

export interface BreadcrumbItem {
  /** Display label. Plain string, not a React node. */
  name: string;
  /** Site-relative path, e.g. '/services'. Locale prefix is added by the
   *  component. The `current` flag below is what marks the leaf. */
  path?: string;
  /** Mark the leaf of the trail. The leaf renders as a `<span>` (no link)
   *  and is the canonical URL the BreadcrumbList schema points at. */
  current?: boolean;
}

/**
 * Visible breadcrumb nav for service / blog / portfolio pages. Renders as
 * a single line of `Home > Services > AI Automation` links, separated by
 * an inline `›`. Pairs with the matching `breadcrumbSchema()` in
 * `lib/json-ld.tsx` so the same trail is exposed to Google as structured
 * data — when the two disagree Google can reject the rich result.
 *
 * Visual: small, low-contrast text under the page hero. Not styled as a
 * full nav bar — breadcrumbs should be informational, not interactive
 * chrome. The font and spacing match the eyebrow style used elsewhere
 * on the site (Roboto 500, wide tracking, secondary color).
 *
 * Locale handling: the `lang` prop is required so we can prefix the
 * internal links to the user's locale (`/services` vs `/es/services`).
 * Pass `'en'` for the bare-host site, `'es'` for `/es/...`, etc.
 */
export function Breadcrumbs({
  items,
  lang,
  homeLabel = 'Home',
}: {
  items: BreadcrumbItem[];
  lang: 'en' | 'es' | 'pt';
  homeLabel?: string;
}) {
  const homeHref = lang === 'en' ? '/' : `/${lang}`;
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs uppercase tracking-widest text-secondary/70 mb-6"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={homeHref} className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm">
            {homeLabel}
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-secondary/40">
              ›
            </span>
            {item.current || !item.path ? (
              <span aria-current="page" className="text-secondary font-semibold">
                {item.name}
              </span>
            ) : (
              <Link
                href={lang === 'en' ? item.path : `/${lang}${item.path}`}
                className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
