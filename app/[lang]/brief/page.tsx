import { Suspense } from 'react';
import BriefHub from '@/components/brief/BriefHub';
import { Reveal } from '@/components/reveal';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, howToSchema, faqSchema, breadcrumbSchema } from '@/lib/json-ld';
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
    title: dict.brief.metaTitle,
    description: dict.brief.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/brief' : `/${safeLang}/brief`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function BriefPage() {
  const [dict, lang] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const trustStats = [
    { n: dict.brief.stats1, label: dict.brief.stats1Label },
    { n: dict.brief.stats2, label: dict.brief.stats2Label },
    { n: dict.brief.stats3, label: dict.brief.stats3Label },
  ];

  // Structured data: HowTo for the 5-step wizard, FAQ for the 6
  // pre-submit questions, and BreadcrumbList so the SERP shows
  // "Home > Brief" instead of the raw URL.
  const howTo = howToSchema({
    name: dict.brief.title,
    description: dict.brief.subtitle1,
    totalTime: 'PT5M',
    steps: [
      {
        name: dict.brief.step1Title,
        text:
          lang === 'es'
            ? 'Cuéntame quién eres: nombre, correo, empresa y rol. Toma menos de un minuto.'
            : lang === 'pt'
              ? 'Me fala quem é você: nome, e-mail, empresa e cargo. Leva menos de um minuto.'
              : 'Tell me who you are: name, email, company, and role. Takes under a minute.',
      },
      {
        name: dict.brief.step2Title,
        text:
          lang === 'es'
            ? 'Elige el tipo de proyecto: app web, automatización, integración con IA o consultoría.'
            : lang === 'pt'
              ? 'Escolha o tipo de projeto: app web, automação, integração com IA ou consultoria.'
              : 'Pick the project type: web app, automation, AI integration, or consulting.',
      },
      {
        name: dict.brief.step3Title,
        text:
          lang === 'es'
            ? 'Describe el proceso manual o dolor de cabeza, las herramientas que toca hoy y con qué frecuencia ocurre.'
            : lang === 'pt'
              ? 'Descreva o processo manual ou a dor, as ferramentas envolvidas hoje e com que frequência isso acontece.'
              : 'Describe the manual process or pain point, the tools it touches today, and how often it happens.',
      },
      {
        name: dict.brief.step4Title,
        text:
          lang === 'es'
            ? 'Define el objetivo concreto y cómo medirás el éxito.'
            : lang === 'pt'
              ? 'Defina o objetivo concreto e como você vai medir o sucesso.'
              : 'Define the concrete goal and how you will measure success.',
      },
      {
        name: dict.brief.step5Title,
        text:
          lang === 'es'
            ? 'Indica presupuesto, plazo y notas adicionales. Revisa y envía.'
            : lang === 'pt'
              ? 'Indique orçamento, prazo e notas adicionais. Revise e envie.'
              : 'Indicate budget, timeline, and any extra notes. Review and submit.',
      },
    ],
  });

  const faq = faqSchema(
    dict.brief.faqItems.map((item: { q: string; a: string }) => ({
      question: item.q,
      answer: item.a,
    })),
    lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
  );

  const breadcrumbs = breadcrumbSchema([
    {
      name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home',
      path: lang === 'en' ? '/' : `/${lang}`,
    },
    { name: dict.brief.title, path: lang === 'en' ? '/brief' : `/${lang}/brief` },
  ]);

  return (
    <>
      <JsonLd data={[howTo, faq, breadcrumbs]} />
      {/* Hero */}
      <section className="section bg-background">
        <Reveal as="div" stagger className="container-page max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-4">
            {dict.briefHub.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            {dict.brief.title}
          </h1>
          <p className="text-text text-lg mb-2">{dict.briefHub.subtitle}</p>
          <p className="text-secondary/70 text-sm mb-8">{dict.brief.subtitle2}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-theme-9">
            <div>
              <div className="font-heading text-2xl md:text-3xl text-secondary font-bold">&lt;24h</div>
              <p className="text-secondary/70 text-xs md:text-sm mt-1">
                {lang === 'en' ? 'Fixed-price quote & scoping' : lang === 'pt' ? 'Proposta com preço fechado' : 'Cotización a precio cerrado'}
              </p>
            </div>
            <div>
              <div className="font-heading text-2xl md:text-3xl text-secondary font-bold">
                {lang === 'en' ? '3 Paths' : lang === 'pt' ? '3 Caminhos' : '3 Caminos'}
              </div>
              <p className="text-secondary/70 text-xs md:text-sm mt-1">
                {lang === 'en' ? 'Web, Automation or Scoping Call' : lang === 'pt' ? 'Web, Automação ou Chamada 1 a 1' : 'Web, Automatización o Llamada 1 a 1'}
              </p>
            </div>
            <div>
              <div className="font-heading text-2xl md:text-3xl text-secondary font-bold">100%</div>
              <p className="text-secondary/70 text-xs md:text-sm mt-1">
                {lang === 'en' ? 'Custom architecture, zero spam' : lang === 'pt' ? 'Código sob medida, 0 spam' : 'Código a medida, 0 spam'}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Brief Hub & Wizards */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-6xl">
          <Suspense
            fallback={
              <div className="rounded-2xl bg-primary border border-theme-9 p-12 text-center text-secondary/60">
                <div className="inline-block w-6 h-6 border-2 border-secondary/30 border-t-accent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Cargando brief interactivo…</p>
              </div>
            }
          >
            <BriefHub dict={dict} lang={lang} />
          </Suspense>
        </div>
      </section>

      {/* FAQ — visible Q&A block so the FAQPage schema in <head> has
          matching HTML content (Google's rich-result eligibility rule).
          Accordion is <details> so it works without JS and crawlers
          see the answer text without needing to expand it. */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-3xl">
          <Reveal as="div" stagger>
            <h2 className="font-heading text-2xl md:text-3xl mb-2">
              {dict.brief.faqTitle}
            </h2>
            <p className="text-secondary/80 mb-6">{dict.brief.faqSubtitle}</p>
            <div className="space-y-3">
              {dict.brief.faqItems.map((item: { q: string; a: string }, i: number) => (
                <details
                  key={i}
                  className="group rounded-xl border border-theme-9 bg-primary px-5 py-4 open:shadow-sm transition-shadow"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-secondary font-medium">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="text-accent text-xl leading-none select-none group-open:rotate-45 transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-secondary/80 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
