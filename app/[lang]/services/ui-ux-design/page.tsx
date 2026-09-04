import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, serviceSchema, breadcrumbSchema } from '@/lib/json-ld';
import { getCurrentDictionary } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { headers } from 'next/headers';




export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.metadata.uiuxTitle,
    description: dict.metadata.uiuxDescription,
    locale: safeLang,
    path: '/services/ui-ux-design',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}



export default async function UiUxDesignPage() {
  const h = await headers();
  const lang = (h.get('x-locale') as 'en' | 'es' | 'pt') || 'en';
  const dict = await getCurrentDictionary();
  const s = dict.servicesUiUx;
  const c = dict.common;
  const CAPABILITIES = [
    { title: s.cap1Title, desc: s.cap1Desc },
    { title: s.cap2Title, desc: s.cap2Desc },
    { title: s.cap3Title, desc: s.cap3Desc },
    { title: s.cap4Title, desc: s.cap4Desc },
    { title: s.cap5Title, desc: s.cap5Desc },
    { title: s.cap6Title, desc: s.cap6Desc },
  ];
  const APPROACH = [
    { n: '01', title: s.approach1Title, desc: s.approach1Desc },
    { n: '02', title: s.approach2Title, desc: s.approach2Desc },
    { n: '03', title: s.approach3Title, desc: s.approach3Desc },
    { n: '04', title: s.approach4Title, desc: s.approach4Desc },
    { n: '05', title: s.approach5Title, desc: s.approach5Desc },
  ];
  const TOOLS = [
    s.tool1,
    s.tool2,
    s.tool3,
    s.tool4,
    s.tool5,
    s.tool6,
  ];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'UI/UX Design',
          description: 'UX research, interface design and conversion-focused UI — built on a decade in sales and product thinking. Research, design, test, ship.',
          path: '/services/ui-ux-design',
          serviceType: 'User Interface & User Experience Design',
          areaServed: ['CO', 'US', 'MX', 'AR', 'ES'],
          priceRange: '$$',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'UI/UX Design', path: '/services/ui-ux-design' },
        ])}
      />
      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-uiux" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
              {s.heroEyebrow}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-black leading-[1.05] tracking-tight">
              {s.heroTitle}
            </h1>
            <p className="text-secondary text-lg md:text-xl max-w-xl">
              {s.heroSubtitle}
            </p>
          </div>
          <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 shadow-2xl">
            <Image
              src="/uploads/2024/pexels-ui-ux-hero.jpg"
              alt={s.heroImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Breadcrumb — visible trail under the hero. Pairs with the
          breadcrumbSchema() JSON-LD above; the trail MUST agree or
          Google will reject the rich-result breadcrumbs. */}
      <div className="container-page pt-4">
        <Breadcrumbs
          lang={lang}
          items={[
            { name: c.breadcrumbServices, path: '/services' },
            { name: s.breadcrumbCurrent, current: true },
          ]}
        />
      </div>

      {/* Stats + featured case */}
      <section className="bg-primary">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">47+</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat1}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">+32%</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat2}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">6</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat3}
              </p>
            </div>
          </div>
        </div>
        <div className="container-page pb-12">
          <div className="bg-background rounded-2xl overflow-hidden border border-theme-9 grid md:grid-cols-2 items-center">
            <div className="aspect-[4/3] md:aspect-auto md:h-full bg-theme-9 relative">
              <Image
                src="/sites/superllantas_co.png"
                alt={s.caseImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
                {c.featuredCaseBadge}
              </p>
              <h3 className="font-heading text-2xl md:text-3xl mb-3 text-black">
                {s.caseTitle}
              </h3>
              <p className="text-secondary leading-relaxed mb-5">
                {s.caseDesc}
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1 text-sm font-secondary font-bold text-secondary uppercase tracking-wider hover:gap-2 hover:text-accent transition-all"
              >
                {s.caseCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">
            {s.capabilitiesTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="p-8 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-xl mb-3 text-secondary">
                  {cap.title}
                </h3>
                <p className="text-text leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Approach */}
      <section className="section">
        <Reveal className="container-page">
          <div className="max-w-3xl mb-12">
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {s.approachTitle}
            </h2>
            <p className="text-text leading-relaxed">
              {s.approachSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {APPROACH.map((p) => (
              <div key={p.n} className="relative">
                <div className="text-accent font-heading text-4xl md:text-5xl mb-3 leading-none">
                  {p.n}
                </div>
                <h3 className="font-heading text-lg md:text-xl mb-2 text-secondary">
                  {p.title}
                </h3>
                <p className="text-text leading-relaxed text-sm md:text-base">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="pt-12 flex flex-wrap items-center gap-3">
            <a
              href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
              target="_blank"
              rel="noreferrer"
              className="btn-theme text-base px-8 py-4 shadow-lg"
            >
              {s.ctaCall}
            </a>
            <a
              href="/brief"
              className="inline-flex items-center justify-center px-8 py-4 rounded-md font-secondary font-bold uppercase tracking-wide text-sm border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors"
            >
              {s.ctaBrief}
            </a>
          </div>
        </Reveal>
      </section>

      {/* Tools */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            {s.toolsTitle}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-text">
            {TOOLS.map((t) => (
              <li
                key={t}
                className="px-4 py-2 rounded-lg bg-primary border border-theme-9"
              >
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Previous + Next services */}
      <section className="section bg-background">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/services/ai-automation"
              className="group flex items-center gap-4 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all"
            >
              <span aria-hidden className="text-3xl md:text-4xl text-accent group-hover:-translate-x-2 transition-transform">
                ←
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                  {s.prevEyebrow}
                </p>
                <h3 className="font-heading text-lg md:text-xl text-black group-hover:text-accent transition-colors">
                  {s.prevTitle}
                </h3>
              </div>
            </Link>
            <Link
              href="/services/web-development"
              className="group flex items-center justify-end gap-4 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all text-right"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                  {s.nextEyebrow}
                </p>
                <h3 className="font-heading text-lg md:text-xl text-black group-hover:text-accent transition-colors">
                  {s.nextTitle}
                </h3>
              </div>
              <span aria-hidden className="text-3xl md:text-4xl text-accent group-hover:translate-x-2 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
