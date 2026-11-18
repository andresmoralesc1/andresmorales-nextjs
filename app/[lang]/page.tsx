import { Hero } from '@/components/sections/hero';
import { SpeedAuditTeaser } from '@/components/sections/speed-audit-teaser';
import { About } from '@/components/sections/about';
import { ServicesIcons } from '@/components/sections/services-icons';
import { Skills } from '@/components/sections/skills';
import { Experience } from '@/components/sections/experience';
import { RecentWork } from '@/components/sections/recent-work';
import { HomeContact } from '@/components/sections/home-contact';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
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
    title: dict.metadata.homeTitle,
    description: dict.metadata.homeDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/' : `/${safeLang}/`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function HomePage() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  return (
    <>
      <Hero />
      <SpeedAuditTeaser locale={locale} t={dict.speedAudit} />
      <About />
      <ServicesIcons />
      <Skills />
      <Experience />
      <RecentWork />
      <HomeContact />
    </>
  );
}
