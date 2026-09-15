import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { ServicesIcons } from '@/components/sections/services-icons';
import { Skills } from '@/components/sections/skills';
import { Cta } from '@/components/sections/cta';
import { Experience } from '@/components/sections/experience';
import { HomeContact } from '@/components/sections/home-contact';
import { getCurrentDictionary } from '@/lib/dictionary';
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
  const dict = await getCurrentDictionary();
  return (
    <>
      <Hero />
      <About />
      <ServicesIcons />
      <Skills />
      <Cta />
      <Experience />

      <HomeContact />
    </>
  );
}
