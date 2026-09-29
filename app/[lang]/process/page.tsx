import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { Cta } from '@/components/sections/cta';
import { LazyParticles } from '@/components/lazy-particles';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary, getLocalizedPath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, faqSchema } from '@/lib/json-ld';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.process.heroTitle,
    description: dict.process.heroSubtitle,
    locale: safeLang,
    path: safeLang === 'en' ? '/process' : `/${safeLang}/process`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function ProcessPage() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  const p = dict.process;

  return (
    <>
      <section className="section bg-background relative overflow-hidden">
        <LazyParticles id="hero-particles-process" variant="soft" />
        <div className="container-page text-center max-w-3xl relative z-10">
          <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
            {p.heroEyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-5 text-secondary leading-tight">
            {p.heroTitle}
          </h1>
          <p className="text-text text-lg md:text-xl leading-relaxed">
            {p.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="section bg-primary">
        <Reveal stagger className="container-page max-w-4xl">
          <div className="space-y-10">
            {[1, 2, 3, 4, 5].map((n) => (
              <article key={n} className="grid md:grid-cols-[auto,1fr] gap-6 md:gap-10 items-start">
                <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-theme-1/10 border-2 border-theme-1 flex items-center justify-center">
                  <span className="font-heading text-2xl md:text-3xl text-accent">0{n}</span>
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl mb-3 text-secondary">
                    {p[`step${n}Title` as keyof typeof p]}
                  </h2>
                  <p className="text-text leading-relaxed text-base md:text-lg">
                    {p[`step${n}Body` as keyof typeof p]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section bg-background">
        <Reveal className="container-page max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {p.statsEyebrow}
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-secondary">
              {p.statsTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="text-center">
                <div className="font-heading text-3xl md:text-4xl text-accent mb-2">
                  {p[`stat${n}Value` as keyof typeof p]}
                </div>
                <p className="text-xs uppercase tracking-widest text-text">
                  {p[`stat${n}Label` as keyof typeof p]}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section bg-theme-5">
        <Reveal stagger className="container-page max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {p.tracksEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.tracksTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">{p.tracksSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              { label: p.aiLabel, href: '/services/ai-automation' },
              { label: p.uxLabel,  href: '/services/ui-ux-design' },
              { label: p.webLabel, href: '/services/web-development' },
            ].map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="block bg-primary rounded-2xl border border-theme-9 p-6 md:p-7 hover:border-theme-1 hover:-translate-y-0.5 transition-all"
              >
                <div className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-2">
                  Cadence
                </div>
                <div className="font-heading text-xl md:text-2xl text-secondary mb-3">
                  {t.label}
                </div>
                <div className="text-sm text-accent font-secondary font-bold">
                  Read the case studies →
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section bg-primary">
        <div className="container-page text-center max-w-2xl">
          <a
            href={CALENDAR_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold rounded-md text-base"
          >
            {p.ctaCall}
          </a>
          <p className="text-xs text-text mt-6 italic max-w-xl mx-auto">
            {p.ctaProcess}
          </p>
        </div>
      </section>

      {/* Internal cross-links: /process and /about reinforce each
          other in topical authority (methodology ↔ founder credibility),
          and /blog surfaces content the user might want next. Same
          pill-style as the /vs/* section above so the user gets one
          consistent pattern for "where to go next". */}
      <section className="section bg-background">
        <div className="container-page max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-4">
            {p.crossLinksEyebrow}
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Link
              href={getLocalizedPath('/about', locale)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-theme-9 hover:border-theme-1 rounded-full text-sm font-secondary font-bold text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
            >
              {dict.nav.about}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={getLocalizedPath('/blog', locale)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-theme-9 hover:border-theme-1 rounded-full text-sm font-secondary font-bold text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
            >
              {dict.nav.blog}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-link: methodology decisions are made against specific
          tools/services. Surface the /vs/* deep dives so the reader can
          see WHY the rhythm produces the result it does. */}
      <section className="section bg-theme-5">
        <div className="container-page max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-4">
            {p.compareEyebrow}
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { label: p.compareMakeVsN8n, href: '/vs/make-vs-n8n' },
              { label: p.compareVercelVsAmplify, href: '/vs/vercel-vs-aws-amplify' },
              { label: p.compareAiVsAgency, href: '/vs/ai-consultant-vs-agency' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-theme-9 hover:border-theme-1 rounded-full text-sm font-secondary font-bold text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
              >
                {l.label}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
