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

        {/* Extended GDPR / CCPA / age-gate disclosures — appended after the
            base privacy copy. Each section reads from dict.legal so the
            same component is locale-agnostic. The Do Not Sell link (CCPA
            §1798.135) is required when a business collects personal info;
            we publish one even though we do not sell, because the link
            also satisfies opt-out business-to-business obligations. */}
        <hr className="my-10 border-theme-9" />
        <div className="prose-content space-y-8 text-secondary/90 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {dict.legal.gdprRights.title}
            </h2>
            <p className="mb-3">{dict.legal.gdprRights.intro}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{dict.legal.gdprRights.access}</li>
              <li>{dict.legal.gdprRights.rectification}</li>
              <li>{dict.legal.gdprRights.erasure}</li>
              <li>{dict.legal.gdprRights.restriction}</li>
              <li>{dict.legal.gdprRights.portability}</li>
              <li>{dict.legal.gdprRights.object}</li>
              <li>{dict.legal.gdprRights.automated}</li>
              <li>{dict.legal.gdprRights.withdraw}</li>
              <li>{dict.legal.gdprRights.complain}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {dict.legal.ccpaRights.title}
            </h2>
            <p className="mb-3">{dict.legal.ccpaRights.intro}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{dict.legal.ccpaRights.know}</li>
              <li>{dict.legal.ccpaRights.delete}</li>
              <li>{dict.legal.ccpaRights.correct}</li>
              <li>{dict.legal.ccpaRights.optOut}</li>
              <li>{dict.legal.ccpaRights.limit}</li>
              <li>{dict.legal.ccpaRights.nondiscriminate}</li>
            </ul>
            <p className="mt-4">
              <a
                href="/api/delete-my-data"
                className="underline hover:no-underline font-medium"
              >
                {dict.legal.ccpaRights.doNotSellLink}
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {dict.legal.lawfulBasis.title}
            </h2>
            <p className="mb-3">{dict.legal.lawfulBasis.intro}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>{dict.legal.lawfulBasis.consent}</strong></li>
              <li><strong>{dict.legal.lawfulBasis.contract}</strong></li>
              <li><strong>{dict.legal.lawfulBasis.legal}</strong></li>
              <li><strong>{dict.legal.lawfulBasis.legitimate}</strong></li>
              <li><strong>{dict.legal.lawfulBasis.vital}</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {dict.legal.internationalTransfers.title}
            </h2>
            <p className="mb-3">{dict.legal.internationalTransfers.intro}</p>
            <p>{dict.legal.internationalTransfers.processors}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {dict.legal.children.title}
            </h2>
            <p>{dict.legal.children.intro}</p>
          </section>
        </div>
      </div>
    </section>
  );
}