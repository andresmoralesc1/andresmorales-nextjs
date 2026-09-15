import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, serviceSchema, breadcrumbSchema, faqSchema, howToSchema } from '@/lib/json-ld';
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
    title: dict.metadata.aiTitle,
    description: dict.metadata.aiDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/services/ai-automation' : `/${safeLang}/services/ai-automation`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function AiautomationPage() {
  const h = await headers();
  // Resolve the locale from the request header that the middleware sets
  // (`x-locale`). Fall back to 'en' for the bare-host landing. Used here
  // for the visible breadcrumb and the inLanguage on the FAQPage schema.
  const lang = (h.get('x-locale') as 'en' | 'es' | 'pt') || 'en';

  const dict = await getCurrentDictionary();
  const s = dict.servicesAi;
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

  // FAQ items shown both as visible <details> blocks on the page AND in
  // the FAQPage JSON-LD schema below. Google's rich-results guideline
  // requires the Q&A to be present in the page's HTML — not just in the
  // schema — so the visible <details> is the source of truth and the
  // schema mirrors it. Don't ship the schema without the visible
  // questions or Google will reject the rich result.
  //
  // The strings are hardcoded in English because (a) the questions are
  // commonly searched in English globally regardless of locale and
  // (b) the dictionary system doesn't yet carry FAQ strings per locale.
  // The visible <details> is what users read; the schema matches it.
  const FAQS = [
    {
      question: 'How long does an AI automation project take?',
      answer:
        'A typical engagement runs 2 to 6 weeks from kickoff to first flow in production. Workflow audits ship in 1 week. The first automation in production usually lands by week 3.',
    },
    {
      question: 'What does an AI automation engagement cost?',
      answer:
        'Projects start at $2,000 USD for a single workflow and scale to $50,000+ for multi-agent systems with custom integrations. Pricing is fixed per workflow after the audit so there are no surprise bills.',
    },
    {
      question: 'Do I need to replace my existing tools?',
      answer:
        'No. Automations layer on top of the tools you already use — HubSpot, Pipedrive, Airtable, Notion, Google Sheets, WooCommerce, Shopify, Telegram, WhatsApp, Slack. n8n and Make connect them via APIs and webhooks without requiring a migration.',
    },
    {
      question: 'Where does my data live?',
      answer:
        'Your data stays where it already is. I use self-hosted models (Ollama, vLLM) when privacy or cost demands it, and third-party APIs (OpenAI, Anthropic) when speed to ship matters more. The choice is yours per workflow.',
    },
    {
      question: 'What happens after the automation ships?',
      answer:
        'Every flow has a dashboard, every error has an alert, every retry has a story. I monitor what real traffic teaches and iterate. Most clients keep a small monthly retainer for ongoing improvements.',
    },
    {
      question: 'Do you build AI agents and chatbots?',
      answer:
        'Yes. Custom AI agents for support, lead qualification, and internal knowledge. Versioned prompts, human-in-the-loop handoffs, and source-grounded answers so the agent does not hallucinate about your business.',
    },
  ];

  // ISO 639-1 / BCP-47 tag for the FAQPage inLanguage. The visible
  // strings are English so we declare 'en' here regardless of which
  // locale rendered the page; users in /es/ and /pt/ still see the
  // Spanish/Portuguese UI around the FAQ section.
  const FAQ_LANG = 'en';

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'AI Automation Consulting',
          description:
            'AI-powered automations, chatbots and digital agents that save hours every week. Built on real workflow analysis, not hype.',
          path: '/services/ai-automation',
          serviceType: 'AI Automation Consulting',
          areaServed: ['CO', 'US', 'MX', 'AR', 'ES'],
          priceRange: '$$',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'AI Automation', path: '/services/ai-automation' },
        ])}
      />
      <JsonLd
        data={howToSchema({
          name: 'How I ship an AI automation engagement',
          description:
            'A five-step rhythm I follow on every AI automation project, from the first discovery call to a flow running in production.',
          totalTime: 'P21D',
          steps: APPROACH.map((a) => ({ name: a.title, text: a.desc })),
        })}
      />
      <JsonLd data={faqSchema(FAQS, FAQ_LANG)} />
      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-ai" variant="soft" />
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
              src={wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122107.png')}
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
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">6×</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat1}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">14+</div>
              <p className="text-secondary text-sm md:text-base">
                {s.stat2}
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">200h+</div>
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
                src={wpImage('/wp-content/uploads/2025/09/Untitled-design-1-poster.jpg')}
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
          <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {APPROACH.map((p) => (
              <li key={p.n} className="relative">
                <div className="text-accent font-heading text-4xl md:text-5xl mb-3 leading-none">
                  {p.n}
                </div>
                <h3 className="font-heading text-lg md:text-xl mb-2 text-secondary">
                  {p.title}
                </h3>
                <p className="text-text leading-relaxed text-sm md:text-base">
                  {p.desc}
                </p>
              </li>
            ))}
          </ol>
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

      {/* FAQ — visible Q&A mirrors the FAQPage schema above. Required
          for Google rich-results eligibility: the JSON-LD must agree
          with on-page content. Using <details> rather than a custom
          accordion keeps the Q&A in the HTML even when JS is off
          (Google's renderer is conservative about JS-only content). */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-3">
            Frequently asked questions
          </h2>
          <p className="text-text leading-relaxed mb-8">
            Common questions about timelines, pricing, data, and what
            happens after the automation ships.
          </p>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-xl bg-primary border border-theme-9 open:border-accent/40 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-secondary font-bold text-secondary">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-accent text-xl leading-none transition-transform group-open:rotate-45 shrink-0"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-text leading-relaxed">{faq.answer}</p>
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

      {/* Next service */}
      <section className="section bg-background pt-0">
        <div className="container-page">
          <Link
            href="/services/ui-ux-design"
            className="group flex items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                {s.nextEyebrow}
              </p>
              <h3 className="font-heading text-xl md:text-2xl text-black group-hover:text-accent transition-colors">
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
