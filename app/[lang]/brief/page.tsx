import BriefWizard from '@/components/brief/BriefWizard';
import { Reveal } from '@/components/reveal';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata({
  title: 'Project Brief',
  description:
    'Tell me about your project in five short steps so I can scope it on the first call. Five steps, about five minutes.',
  path: '/brief',
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function BriefPage() {
  const dict = await getCurrentDictionary();
  const trustStats = [
    { n: dict.brief.stats1, label: dict.brief.stats1Label },
    { n: dict.brief.stats2, label: dict.brief.stats2Label },
    { n: dict.brief.stats3, label: dict.brief.stats3Label },
  ];
  return (
    <>
      {/* Hero */}
      <section className="section bg-background">
        <Reveal as="div" stagger className="container-page max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-black font-secondary font-bold mb-4">
            {dict.brief.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            {dict.brief.title}
          </h1>
          <p className="text-text text-lg mb-2">{dict.brief.subtitle1}</p>
          <p className="text-secondary/70 text-sm mb-8">{dict.brief.subtitle2}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {trustStats.map(({ n, label }) => (
              <div key={label}>
                <div className="font-heading text-2xl md:text-3xl text-black font-bold">{n}</div>
                <p className="text-secondary/70 text-xs md:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Wizard */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-3xl">
          <BriefWizard />
        </div>
      </section>
    </>
  );
}
