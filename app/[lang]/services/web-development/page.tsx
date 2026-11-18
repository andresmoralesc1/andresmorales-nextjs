import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { ParticlesBackground } from '@/components/particles-background';
import { LOCALES, isLocale, getDictionary, getLocalizedPath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/json-ld';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { headers } from 'next/headers';
import { getServiceFaqs } from '@/data/service-faqs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.metadata.webdevTitle,
    description: dict.metadata.webdevDescription,
    locale: safeLang,
    path: '/services/web-development',
    type: 'website',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const STACK = [
  'Next.js 14/15 (App Router, Server Components, Route Handlers)',
  'React 18 / 19',
  'TypeScript',
  'Tailwind CSS',
  'PostgreSQL + Prisma / Drizzle',
  'NextAuth / Clerk',
  'OpenAI / Anthropic / Ollama APIs',
  'Vercel / Docker / self-hosted VPS',
];

export default async function WebDevelopmentPage({
  params,
}: {
  params?: Promise<{ lang: string }>;
}) {
  const h = await headers();
  const headerLang = h.get('x-locale');
  const resolvedParams = params ? await params : undefined;
  const rawLang = resolvedParams?.lang || headerLang || (await getCurrentLocale());
  const safeLang = isLocale(rawLang) ? rawLang : 'en';

  const dict = await getCurrentDictionary();
  const s = dict.servicesWeb;
  const c = dict.common;
  const faqs = getServiceFaqs('web-development', safeLang);

  const homeLabel = c?.breadcrumbHome || (safeLang === 'es' ? 'Inicio' : safeLang === 'pt' ? 'Início' : 'Home');
  const servicesLabel = dict.nav?.services || c?.breadcrumbServices || (safeLang === 'es' ? 'Servicios' : safeLang === 'pt' ? 'Serviços' : 'Services');
  const currentBreadcrumb = dict.metadata.webdevBreadcrumb || s?.breadcrumbCurrent || 'Web Development';

  const faqHeading = safeLang === 'es' ? 'Preguntas frecuentes' : safeLang === 'pt' ? 'Perguntas frequentes' : 'Frequently asked questions';
  const faqIntro = safeLang === 'es'
    ? 'Preguntas habituales sobre tiempos de entrega, stack tecnológico, SEO, optimización de velocidad y cotizaciones.'
    : safeLang === 'pt'
    ? 'Perguntas frequentes sobre prazos de entrega, stack técnico, SEO, performance e orçamentos.'
    : 'Common questions about timelines, stacks, SEO, performance, and e-commerce pricing.';

  const capabilities = [
    { title: s.cap1Title, desc: s.cap1Desc },
    { title: s.cap2Title, desc: s.cap2Desc },
    { title: s.cap3Title, desc: s.cap3Desc },
    { title: s.cap4Title, desc: s.cap4Desc },
    { title: s.cap5Title, desc: s.cap5Desc },
    { title: s.cap6Title, desc: s.cap6Desc },
  ];

  const approach = [
    { n: '01', title: s.approach1Title, desc: s.approach1Desc },
    { n: '02', title: s.approach2Title, desc: s.approach2Desc },
    { n: '03', title: s.approach3Title, desc: s.approach3Desc },
    { n: '04', title: s.approach4Title, desc: s.approach4Desc },
    { n: '05', title: s.approach5Title, desc: s.approach5Desc },
  ];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: dict.metadata.webdevH1 || s.heroTitle,
          description: dict.metadata.webdevDescription,
          path: getLocalizedPath('/services/web-development', safeLang),
          serviceType: 'Web Development',
          areaServed: ['CO', 'US', 'MX', 'AR', 'ES', 'BR'],
          priceRange: '$$$',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: homeLabel, path: getLocalizedPath('/', safeLang) },
          { name: servicesLabel, path: getLocalizedPath('/services', safeLang) },
          { name: currentBreadcrumb, path: getLocalizedPath('/services/web-development', safeLang) },
        ])}
      />
      <JsonLd
        data={faqSchema(
          faqs,
          safeLang === 'es' ? 'es-CO' : safeLang === 'pt' ? 'pt-BR' : 'en-US'
        )}
      />

      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-webdev" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
              {s.heroEyebrow}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-secondary leading-[1.05] tracking-tight">
              {dict.metadata.webdevH1 || s.heroTitle}
            </h1>
            <p className="text-secondary text-lg md:text-xl max-w-xl">
              {s.heroSubtitle}
            </p>
          </div>
          <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 shadow-2xl">
            <Image
              src={wpImage('/wp-content/uploads/2026/07/gps_andresmorales_com_co.png')}
              alt={s.heroImageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Breadcrumb — visible trail under the hero */}
      <div className="container-page pt-4">
        <Breadcrumbs
          lang={safeLang}
          items={[
            { name: servicesLabel, path: getLocalizedPath('/services', safeLang) },
            { name: currentBreadcrumb, current: true },
          ]}
        />
      </div>

      {/* Stats + featured case */}
      <section className="bg-primary">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">{s.stat1Num}</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat1}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">{s.stat2Num}</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat2}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">{s.stat3Num}</div>
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
                src="/sites/gps_andresmorales_com_co.png"
                alt="BarrioTech (gps.andresmorales.com.co): live GPS street-sellers platform built with Next.js"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
                {s.caseEyebrow}
              </p>
              <h3 className="font-heading text-2xl md:text-3xl mb-3 text-secondary">
                {s.caseTitle}
              </h3>
              <p className="text-secondary leading-relaxed mb-5">
                {s.caseDesc}
              </p>
              <Link
                href={getLocalizedPath('/portfolio', safeLang)}
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
            {capabilities.map((cap) => (
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
            {approach.map((pItem) => (
              <div key={pItem.n} className="relative">
                <div className="text-accent font-heading text-4xl md:text-5xl mb-3 leading-none">
                  {pItem.n}
                </div>
                <h3 className="font-heading text-lg md:text-xl mb-2 text-secondary">
                  {pItem.title}
                </h3>
                <p className="text-text leading-relaxed text-sm md:text-base">
                  {pItem.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="pt-12 flex flex-wrap items-center gap-3">
            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-theme text-base px-8 py-4"
            >
              {s.ctaCall}
            </a>
            <a
              href={getLocalizedPath('/brief?type=web', safeLang)}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md font-secondary font-bold uppercase tracking-wide text-sm border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors"
            >
              {s.ctaBrief}
            </a>
          </div>
        </Reveal>
      </section>

      {/* Stack */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            {s.stackTitle}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-text">
            {STACK.map((t) => (
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

      {/* Previous service navigation */}
      <section className="section bg-background">
        <div className="container-page">
          <Link
            href={getLocalizedPath('/services/ui-ux-design', safeLang)}
            className="group flex items-center gap-4 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all w-full md:w-1/2"
          >
            <span aria-hidden className="text-3xl md:text-4xl text-accent group-hover:-translate-x-2 transition-transform">
              ←
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                {s.prevEyebrow}
              </p>
              <h3 className="font-heading text-lg md:text-xl text-secondary group-hover:text-accent transition-colors">
                {s.prevTitle}
              </h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Localized FAQ Section */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">
            {faqHeading}
          </h2>
          <p className="text-text leading-relaxed mb-8">
            {faqIntro}
          </p>
          <div className="space-y-3">
            {faqs.map((faqItem, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-xl bg-primary border border-theme-9 open:border-accent/40 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-secondary font-bold text-secondary">
                  <span>{faqItem.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-accent text-xl leading-none transition-transform group-open:rotate-45 shrink-0"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-secondary/80 text-sm leading-relaxed">
                  {faqItem.answer}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
