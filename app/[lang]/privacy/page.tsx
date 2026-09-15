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
  const t = dict.legal.privacy;
  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    // EN canonical is unprefixed; ES/PT add the locale to match the URL
    // the user sees in the address bar (avoids /privacy vs /es/privacy
    // being treated as duplicate content by Google).
    path: lang === 'en' ? '/privacy' : `/${lang}/privacy`,
    locale: lang as 'en' | 'es' | 'pt',
  });
}

export default async function PrivacyPage() {
  const dict = await getCurrentDictionary();
  const t = dict.legal.privacy;
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
              {t.dataCollectedTitle}
            </h2>
            <p>{t.dataCollectedBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.whyTitle}
            </h2>
            <p>{t.whyBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.thirdPartiesTitle}
            </h2>
            <p>{t.thirdPartiesBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.retentionTitle}
            </h2>
            <p>{t.retentionBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.rightsTitle}
            </h2>
            <p>{t.rightsBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.changesTitle}
            </h2>
            <p>{t.changesBody}</p>
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