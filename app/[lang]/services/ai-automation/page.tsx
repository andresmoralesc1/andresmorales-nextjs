import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { ParticlesBackground } from '@/components/particles-background';
import { LOCALES, isLocale, getDictionary, getLocalizedPath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, serviceSchema, breadcrumbSchema, faqSchema, howToSchema } from '@/lib/json-ld';
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
    title: dict.metadata.aiTitle,
    description: dict.metadata.aiDescription,
    locale: safeLang,
    path: '/services/ai-automation',
    type: 'website',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function AiautomationPage({
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
  const s = dict.servicesAi;
  const c = dict.common;
  const faqs = getServiceFaqs('ai-automation', safeLang);

  const homeLabel = c?.breadcrumbHome || (safeLang === 'es' ? 'Inicio' : safeLang === 'pt' ? 'Início' : 'Home');
  const servicesLabel = dict.nav?.services || c?.breadcrumbServices || (safeLang === 'es' ? 'Servicios' : safeLang === 'pt' ? 'Serviços' : 'Services');
  const currentBreadcrumb = s.breadcrumbCurrent || 'AI Automation';

  const faqHeading = safeLang === 'es' ? 'Preguntas frecuentes' : safeLang === 'pt' ? 'Perguntas frequentes' : 'Frequently asked questions';
  const faqIntro = safeLang === 'es'
    ? 'Preguntas clave sobre tiempos de implementación, privacidad de datos empresariales, agentes y costos.'
    : safeLang === 'pt'
    ? 'Principais dúvidas sobre tempo de entrega, privacidade de dados corporativos, agentes e investimentos.'
    : 'Common questions about timelines, data privacy, AI agents, and integration costs.';

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
  const STACK = [
    s.stack1,
    s.stack2,
    s.stack3,
    s.stack4,
    s.stack5,
    s.stack6,
    s.stack7,
    s.stack8,
  ];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: dict.metadata.aiH1 || s.heroTitle,
          description: dict.metadata.aiDescription,
          path: getLocalizedPath('/services/ai-automation', safeLang),
          serviceType: 'AI Automation Consulting',
          areaServed: ['CO', 'US', 'MX', 'AR', 'ES', 'BR'],
          priceRange: '$$',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: homeLabel, path: getLocalizedPath('/', safeLang) },
          { name: servicesLabel, path: getLocalizedPath('/services', safeLang) },
          { name: currentBreadcrumb, path: getLocalizedPath('/services/ai-automation', safeLang) },
        ])}
      />
      <JsonLd
        data={howToSchema({
          name: s.approachTitle || 'How I ship an AI automation engagement',
          description: s.approachSubtitle || 'A five-step rhythm from discovery to production.',
          totalTime: 'P21D',
          steps: APPROACH.map((a) => ({ name: a.title, text: a.desc })),
        })}
      />
      <JsonLd
        data={faqSchema(
          faqs,
          safeLang === 'es' ? 'es-CO' : safeLang === 'pt' ? 'pt-BR' : 'en-US'
        )}
      />

      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-ai" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
              {s.heroEyebrow}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-secondary leading-[1.05] tracking-tight">
              {s.heroTitle}
            </h1>
            <p className="text-secondary text-lg md:text-xl max-w-xl">
              {s.heroSubtitle}
            </p>
          </div>
          <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 shadow-2xl">
            <Image
              src={wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122107.png')}
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
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">12×</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat1}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">40+</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat2}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">10h+</div>
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
                src="/sites/temptum_home.png"
                alt={s.caseImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
                Featured case
              </p>
              <h3 className="font-heading text-2xl md:text-3xl mb-3 text-secondary">
                {s.caseTitle}
              </h3>
              <p className="text-secondary leading-relaxed mb-5">
                {s.caseDesc}
              </p>
              <Link
                href={getLocalizedPath('/work/temptum', safeLang)}
                className="inline-flex items-center gap-1 text-sm font-secondary font-bold text-secondary uppercase tracking-wider hover:gap-2 hover:text-accent transition-all"
              >
                {s.caseCta}
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Real-World Automation Cases */}
        <div className="container-page pb-12">
          <h3 className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-6">
            {safeLang === 'es' ? 'Otros Casos Reales de Automatización en Producción' : safeLang === 'pt' ? 'Outros Casos Reais de Automação em Produção' : 'More Real-World Automation Case Studies'}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href={getLocalizedPath('/work/impresos-americana', safeLang)}
              className="group p-6 rounded-2xl bg-background border border-theme-9 hover:border-theme-1 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-secondary font-bold text-accent tracking-wider block mb-2">Three.js + n8n B2B</span>
                <h4 className="font-heading text-lg text-secondary group-hover:text-accent transition-colors mb-2">
                  Impresos Americana
                </h4>
                <p className="text-text text-sm line-clamp-3">
                  {safeLang === 'es' ? 'Cotizador 3D paramétrico para empaques con generación de planos dieline y CRM n8n.' : safeLang === 'pt' ? 'Cotador 3D paramétrico para embalagens com geração de dieline e CRM n8n.' : 'Parametric 3D packaging visualizer with instant dieline export and n8n CRM pipelines.'}
                </p>
              </div>
              <span className="mt-4 text-xs font-secondary font-bold text-theme-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {safeLang === 'es' ? 'Ver caso' : safeLang === 'pt' ? 'Ver caso' : 'Read case'} →
              </span>
            </Link>

            <Link
              href={getLocalizedPath('/work/embryoglass', safeLang)}
              className="group p-6 rounded-2xl bg-background border border-theme-9 hover:border-theme-1 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-secondary font-bold text-accent tracking-wider block mb-2">HealthTech + CRM</span>
                <h4 className="font-heading text-lg text-secondary group-hover:text-accent transition-colors mb-2">
                  EmbryoGlass IVF
                </h4>
                <p className="text-text text-sm line-clamp-3">
                  {safeLang === 'es' ? 'Plataforma clínica para tratamientos de reproducción asistida con tracking de pacientes y n8n.' : safeLang === 'pt' ? 'Plataforma clínica para reprodução assistida com acompanhamento de pacientes e n8n.' : 'Assisted reproduction clinical platform with patient tracking workflows and automated onboarding.'}
                </p>
              </div>
              <span className="mt-4 text-xs font-secondary font-bold text-theme-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {safeLang === 'es' ? 'Ver caso' : safeLang === 'pt' ? 'Ver caso' : 'Read case'} →
              </span>
            </Link>

            <Link
              href={getLocalizedPath('/work/que-nivel-maribel', safeLang)}
              className="group p-6 rounded-2xl bg-background border border-theme-9 hover:border-theme-1 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-secondary font-bold text-accent tracking-wider block mb-2">Ticketing + CRM</span>
                <h4 className="font-heading text-lg text-secondary group-hover:text-accent transition-colors mb-2">
                  ¡Qué Nivel, Maribel!
                </h4>
                <p className="text-text text-sm line-clamp-3">
                  {safeLang === 'es' ? 'Plataforma cultural de boletería propia con 0% comisiones y pipeline de audiencias.' : safeLang === 'pt' ? 'Plataforma cultural de ingressos próprios com 0% comissão e pipeline de público.' : 'Direct ticketing cultural engine with zero commission fees and audience marketing pipelines.'}
                </p>
              </div>
              <span className="mt-4 text-xs font-secondary font-bold text-theme-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {safeLang === 'es' ? 'Ver caso' : safeLang === 'pt' ? 'Ver caso' : 'Read case'} →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">
            {s.capabilitiesTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {APPROACH.map((pItem) => (
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
              href={getLocalizedPath('/brief?type=ai', safeLang)}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md font-secondary font-bold uppercase tracking-wide text-sm border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors"
            >
              {s.ctaBrief}
            </a>
          </div>
        </Reveal>
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
                <p className="mt-3 text-text leading-relaxed">{faqItem.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Stack */}
      <section className="section bg-background">
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

      {/* Next service navigation */}
      <section className="section bg-background pt-0">
        <div className="container-page">
          <Link
            href={getLocalizedPath('/services/ui-ux-design', safeLang)}
            className="group flex items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                {s.nextEyebrow}
              </p>
              <h3 className="font-heading text-xl md:text-2xl text-secondary group-hover:text-accent transition-colors">
                {s.nextTitle}
              </h3>
            </div>
            <span aria-hidden className="text-3xl md:text-4xl text-accent group-hover:translate-x-2 transition-transform">
              →
            </span>
          </Link>
        </div>
      </section>

      <Cta />
    </>
  );
}
