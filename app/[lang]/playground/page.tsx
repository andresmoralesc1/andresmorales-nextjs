import MascotPortfolioHero from '@/components/ui/mascot-portfolio-hero';
import { CONTACT_EMAIL } from '@/lib/constants';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getCurrentDictionary();
  return pageMetadata({
    title: dict.playground.title,
    description: dict.playground.description,
    locale: safeLang,
    path: safeLang === 'en' ? '/playground' : `/${safeLang}/playground`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Playground page — MascotPortfolioHero demo. The site-wide
// TicketStubFooter is rendered by `app/[lang]/layout.tsx`, so this
// page only mounts the hero piece (the orange band is no longer
// duplicated here).
export default async function PlaygroundPage() {
  const dict = await getCurrentDictionary();
  const locale = await getCurrentLocale();
  const m = dict.playground.mascot;

  return (
    <>
      <MascotPortfolioHero
        height="100svh"
        index={m.index}
        discipline={m.discipline}
        tagline={m.tagline}
        collection={[m.collection[0], m.collection[1]] as [string, string]}
        reel={[m.reel[0], m.reel[1]] as [string, string]}
        year={m.year}
        initials={m.initials}
        badge={m.badge}
        line2={m.line2}
        line3={m.line3}
        word={m.word}
        verticalTag={m.verticalTag}
        seekingLabel={m.seekingLabel}
        seeking={m.seeking}
        href={m.href}
        services={[
          dict.homeServicesIcons.aiTitle,
          dict.homeServicesIcons.uiTitle,
          dict.homeServicesIcons.webTitle,
        ]}
        greetings={m.greetings}
        skin="#c98e66"
        shirt="#2fb5a8"
        accent="#f96e03"
      />
      <span className="sr-only">locale: {locale}</span>
    </>
  );
}