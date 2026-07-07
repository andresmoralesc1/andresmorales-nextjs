/**
 * Page metadata helper.
 *
 * Centralizes the title template + OG image sharing so every page
 * inherits the brand by default.
 *
 * Strings: English-only for now. When i18n lands, switch to
 * `t()` from lib/i18n.
 */

const SITE_NAME = 'Andrés Morales';
const DEFAULT_OG = '/uploads/2025/06/andres-morales-og.jpg';

export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  /**
   * Set to true for post-action / utility pages that should not appear in
   * search results (e.g. /brief/thanks, /unsubscribe). Even though
   * robots.txt disallows them, we add a noindex meta as a defense in
   * depth — some crawlers and link-preview bots ignore robots.txt.
   */
  noindex?: boolean;
}) {
  const { title, description, path = '/', ogImage = DEFAULT_OG, noindex = false } = opts;
  // Avoid appending "— Andrés Morales" twice when the page title already
  // includes the brand. The title is the headline; the suffix is the brand.
  const ogFullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} — ${SITE_NAME}`;
  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }),
    openGraph: {
      title: ogFullTitle,
      description,
      url: `https://portafolio.andresmorales.com.co${path}`,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogFullTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://portafolio.andresmorales.com.co${path}`,
      languages: {
        'en-US': '/',
        'es-CO': '/',
      },
    },
  };
}
