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
const DEFAULT_OG = 'https://andresmorales.com.co/wp-content/uploads/2025/06/andres-morales-og.jpg';

export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
}) {
  const { title, description, path = '/', ogImage = DEFAULT_OG } = opts;
  return {
    title,
    description,
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: `https://portafolio.andresmorales.com.co${path}`,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
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
