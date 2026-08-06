import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import { RetroTvError } from '@/components/ui/404-error-page';

// Tell crawlers this page is a dead-end. Returning HTTP 404 is the primary
// signal but `noindex` is the belt-and-suspenders that prevents Google from
// keeping soft-404 entries in the index (the case where Google saw the
// 404 status but treated the page as canonical because no `noindex` was
// declared). Reference:
// https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Locale-aware 404. Lives under `app/[lang]/` so it inherits the locale
// layout (Header + Footer) and reads `x-locale` to pick the right copy.
const COPY: Record<'en' | 'es' | 'pt', {
  code: string;
  title: string;
  screen: string; // short text shown inside the TV screen
  body: string;
  homeCta: string;
  reportCta: string;
}> = {
  en: {
    code: '404',
    title: 'Page not found',
    screen: 'NO SIGNAL',
    body: "The page you were looking for doesn't exist — or moved. If you came here from a link on the site, that's a bug on my end and I'd love to know about it.",
    homeCta: 'Go home',
    reportCta: 'Report this',
  },
  es: {
    code: '404',
    title: 'Página no encontrada',
    screen: 'SIN SEÑAL',
    body: 'La página que buscabas no existe — o se movió. Si llegaste aquí desde un enlace del sitio, es un error mío y me encantaría saberlo.',
    homeCta: 'Volver al inicio',
    reportCta: 'Reportar',
  },
  pt: {
    code: '404',
    title: 'Página não encontrada',
    screen: 'SEM SINAL',
    body: 'A página que você procura não existe — ou foi movida. Se chegou aqui por um link do site, é um erro meu e gostaria de saber.',
    homeCta: 'Voltar ao início',
    reportCta: 'Reportar',
  },
};

export default async function NotFound() {
  const h = await headers();
  const rawLocale = h.get('x-locale');
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = COPY[locale];

  return (
    <section className="container-page py-24 sm:py-32">
      <RetroTvError errorCode={t.code} errorMessage={t.screen} />

      <div className="mt-12 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
          {t.code}
        </p>
        <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-bold text-secondary">
          {t.title}
        </h1>
        <p className="mt-6 text-lg text-secondary/80">{t.body}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-theme-1 px-6 py-3 text-base font-semibold text-secondary shadow-sm hover:bg-theme-1/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-1"
          >
            {t.homeCta}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-secondary/20 bg-white px-6 py-3 text-base font-semibold text-secondary hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-1"
          >
            {t.reportCta}
          </Link>
        </div>
      </div>
    </section>
  );
}