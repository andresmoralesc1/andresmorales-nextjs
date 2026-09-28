import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { pageMetadata } from '@/lib/metadata';
import { Reveal } from '@/components/reveal';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.cumple.metaTitle,
    description: dict.cumple.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/cumple-2025' : `/${safeLang}/cumple-2025`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Custom campaign landing page extracted from WP (page id 1020)
// Uses the warm-tone footer variant (set in app/[lang]/(warm)/layout.tsx).
export default async function CumplePage() {
  const dict = await getCurrentDictionary();
  return (
    <section className="section bg-gradient-to-br from-theme-1 to-theme-2 text-primary">
      <Reveal as="div" stagger className="container-page text-center max-w-3xl">
        <p className="text-sm uppercase tracking-widest text-primary/80 mb-3">
          {dict.cumple.eyebrow}
        </p>
        <h1 className="font-heading text-4xl md:text-6xl mb-6">{dict.cumple.title}</h1>
        <p className="text-primary/90 text-lg mb-8">{dict.cumple.body}</p>
        <a
          href={CALENDAR_BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className="btn bg-primary text-theme-2 hover:bg-primary/90"
        >
          {dict.cumple.cta}
        </a>
      </Reveal>
    </section>
  );
}