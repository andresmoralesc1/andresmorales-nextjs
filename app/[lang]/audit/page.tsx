import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { AuditLandingClient } from './audit-landing-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';
  const dict = await getDictionary(safeLang);

  return pageMetadata({
    title: `${dict.speedAudit.pageTitle} · Google Cloud PageSpeed`,
    description: dict.speedAudit.pageDesc,
    locale: safeLang,
    path: safeLang === 'en' ? '/audit' : `/${safeLang}/audit`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';
  const dict = await getDictionary(safeLang);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="w-8 h-8 rounded-full border-2 border-[#f96e03] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuditLandingClient locale={safeLang} t={dict.speedAudit} />
    </Suspense>
  );
}
