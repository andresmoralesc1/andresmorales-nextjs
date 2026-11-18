import { CmsDemoView } from '@/components/demo/cms-demo-view';
import { LOCALES, isLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === 'es';
  return {
    title: isEs
      ? 'Demo Interactivo CMS & CRM Engine | Andrés Morales'
      : 'Interactive CMS & CRM Engine Demo | Andrés Morales',
    description: isEs
      ? 'Explora el motor CRM, pipeline de prospección y automatizaciones desarrollado a medida por Andrés Morales con datos simulados interactivos.'
      : 'Explore the custom-built CRM engine, prospecting pipeline, and automations developed by Andrés Morales with live interactive mock data.',
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function CmsDemoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';
  return <CmsDemoView locale={safeLang} />;
}
