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
  const t = dict.legal.terms;
  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: lang === 'en' ? '/terms' : `/${lang}/terms`,
    locale: lang as 'en' | 'es' | 'pt',
  });
}

export default async function TermsPage() {
  const dict = await getCurrentDictionary();
  const t = dict.legal.terms;
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
              {t.serviceTitle}
            </h2>
            <p>{t.serviceBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.ipTitle}
            </h2>
            <p>{t.ipBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.paymentTitle}
            </h2>
            <p>{t.paymentBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.liabilityTitle}
            </h2>
            <p>{t.liabilityBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.warrantyTitle}
            </h2>
            <p>{t.warrantyBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.lawTitle}
            </h2>
            <p>{t.lawBody}</p>
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