import type { Metadata } from 'next';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { DeleteMyDataForm } from './form.client';

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
  const t = dict.legal.deleteMyData;
  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    path: lang === 'en' ? '/delete-my-data' : `/${lang}/delete-my-data`,
    locale: lang as 'en' | 'es' | 'pt',
  });
}

export default async function DeleteMyDataPage() {
  const [dict, locale] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const t = dict.legal.deleteMyData;
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

        <div className="prose-content space-y-6 text-secondary/90 leading-relaxed mb-10">
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.verifyTitle}
            </h2>
            <p>{t.verifyBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.scopeTitle}
            </h2>
            <p>{t.scopeBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.scopeNotTitle}
            </h2>
            <p>{t.scopeNotBody}</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-secondary mb-3">
              {t.manualTitle}
            </h2>
            <p>
              {t.manualBody}{' '}
              <a
                href="mailto:info@andresmorales.com.co?subject=Data%20deletion%20request"
                className="underline hover:no-underline font-medium"
              >
                info@andresmorales.com.co
              </a>
            </p>
          </section>
        </div>

        <div className="rounded-lg border border-theme-9 bg-theme-5/[0.06] p-5 md:p-6">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-secondary mb-4">
            {t.formTitle}
          </h2>
          <DeleteMyDataForm locale={locale} dict={dict.legal.deleteMyData} />
        </div>
      </div>
    </section>
  );
}