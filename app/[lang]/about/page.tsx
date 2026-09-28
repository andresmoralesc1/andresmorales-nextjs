import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { Cta } from '@/components/sections/cta';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, faqSchema, breadcrumbSchema } from '@/lib/json-ld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.about.title,
    description: dict.about.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/about' : `/${safeLang}/about`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getCurrentDictionary();
  const a = dict.about;

  const faqs = [
    { question: a.faqQ1, answer: a.faqA1 },
    { question: a.faqQ2, answer: a.faqA2 },
    { question: a.faqQ3, answer: a.faqA3 },
  ];
  const breadcrumbs = [
    { name: a.breadcrumbHome, path: '/' },
    { name: a.breadcrumbAbout, path: '/about' },
  ];

  // Per-locale FAQPage inLanguage — Google indexes the FAQPage rich
  // result against the resolved BCP-47 code of the page that produced
  // it; a hardcoded 'en-US' schema on /es/about and /pt/about pages
  // would mismatch the visible language.
  const faqLocale =
    safeLang === 'es' ? 'es-CO' : safeLang === 'pt' ? 'pt-BR' : 'en-US';

  return (
    <>
      <JsonLd data={faqSchema(faqs, faqLocale)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Hero — full-bleed photo + title overlay */}
      <section className="section bg-background relative overflow-hidden">
        <div className="container-page max-w-4xl text-center pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary border border-theme-9 text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {a.heroBadge}
          </div>
          <p className="text-xs uppercase tracking-widest text-text mb-3 font-secondary font-bold">
            {a.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-secondary">
            {a.title}
          </h1>
          <p className="text-text text-lg md:text-xl max-w-2xl mx-auto">
            {a.p1}
          </p>
          <p className="text-xs text-text font-secondary mt-6">
            {safeLang === 'es'
              ? 'Última revisión 26 sep 2026'
              : safeLang === 'pt'
                ? 'Última revisão 26 set 2026'
                : 'Last reviewed Sep 26, 2026'}
          </p>
        </div>
      </section>

      {/* Bio — photo + paragraphs */}
      <section className="section bg-primary">
        <Reveal className="container-page max-w-5xl grid md:grid-cols-[360px,1fr] gap-10 items-start">
          <div className="rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 aspect-[4/3] w-full max-w-[360px] mx-auto md:mx-0">
            <Image
              src="/uploads/IMG_20220702_142658.jpg"
              alt={a.photoAlt}
              width={480}
              height={360}
              sizes="(max-width: 768px) 100vw, 360px"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-5 text-text leading-relaxed text-base md:text-lg">
            <p>{a.p2}</p>
            <p>{a.p3}</p>
          </div>
        </Reveal>
      </section>

      {/* Team in the field — LATAM client engagement */}
      <section className="section bg-primary">
        <Reveal className="container-page max-w-5xl">
          <div className="rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30">
            <Image
              src="/uploads/2026/09/team-meeting.jpg"
              alt={a.teamAlt}
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, 1024px"
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="mt-4 text-sm text-text italic font-heading text-center max-w-2xl mx-auto">
            {a.teamCaption}
          </p>
        </Reveal>
      </section>

      {/* Skills — three columns (AI / UX / Web) */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {a.skillsEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {a.skillsTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">{a.skillsBody}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                title: a.skillsAI,
                body: a.skillsAIList,
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" rx="0.5" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
                  </svg>
                ),
              },
              {
                title: a.skillsUX,
                body: a.skillsUXList,
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                ),
              },
              {
                title: a.skillsWeb,
                body: a.skillsWebList,
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="6" rx="1" />
                    <rect x="2" y="15" width="20" height="6" rx="1" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                ),
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-theme-9 bg-primary p-5 md:p-6"
              >
                <div className="text-accent mb-3">{c.icon}</div>
                <h3 className="font-heading text-xl md:text-2xl text-secondary mb-3">
                  {c.title}
                </h3>
                <p className="text-sm text-text leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Values — three promises */}
      <section className="section bg-primary">
        <Reveal className="container-page max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {a.valuesEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {a.valuesTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">{a.valuesBody}</p>
          </div>

          <div className="space-y-6">
            {[
              { n: '01', title: a.value1Title, body: a.value1Body },
              { n: '02', title: a.value2Title, body: a.value2Body },
              { n: '03', title: a.value3Title, body: a.value3Body },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-theme-9 bg-theme-5 p-6 md:p-8 flex items-start gap-5 md:gap-6"
              >
                <div className="flex-none w-12 h-12 md:w-14 md:h-14 rounded-full bg-theme-1 text-secondary flex items-center justify-center font-heading text-lg md:text-xl font-bold">
                  {v.n}
                </div>
                <div>
                  <h3 className="font-heading text-xl md:text-2xl text-secondary mb-2">
                    {v.title}
                  </h3>
                  <p className="text-text leading-relaxed">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Cross-links to relevant work */}
      <section className="section bg-background">
        <div className="container-page max-w-4xl">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { href: '/services', label: dict.nav.services, desc: a.servicesLinkDesc },
              { href: '/portfolio', label: dict.nav.portfolio, desc: a.portfolioLinkDesc },
              { href: '/contact', label: dict.nav.contact, desc: a.contactLinkDesc },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl border border-theme-9 bg-primary p-5 hover:border-theme-1 transition-colors"
              >
                <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-1">{l.label} →</p>
                <p className="text-secondary font-heading text-lg">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}