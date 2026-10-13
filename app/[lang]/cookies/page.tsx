import type { Metadata } from 'next';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { getCurrentDictionary } from '@/lib/dictionary';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getCurrentDictionary();
  const t = dict.legal.cookies;
  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: lang === 'en' ? '/cookies' : `/${lang}/cookies`,
    locale: lang as 'en' | 'es' | 'pt',
  });
}

export default async function CookiesPage() {
  const dict = await getCurrentDictionary();
  const t = dict.legal.cookies;
  return (
    <section className="section bg-background">
      <div className="container-page max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-secondary/60 mb-3">
          {t.lastUpdated}
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">
          {t.h1}
        </h1>
        <p className="text-lg text-secondary/80 mb-10">{t.intro}</p>

        <div className="prose-content space-y-8 text-secondary/90 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.whatTitle}
            </h2>
            <p>{t.whatBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.essentialTitle}
            </h2>
            <p>{t.essentialBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.analyticsTitle}
            </h2>
            <p>{t.analyticsBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.preferencesTitle}
            </h2>
            <p>{t.preferencesBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.thirdPartyTitle}
            </h2>
            <p>{t.thirdPartyBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.manageTitle}
            </h2>
            <p>{t.manageBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.contactTitle}
            </h2>
            <p>{t.contactBody}</p>
          </section>
        </div>
      </div>
    </section>
  );
}