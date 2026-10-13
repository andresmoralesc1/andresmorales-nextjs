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
    title: dict.briefWeb.metaTitle,
    description: dict.briefWeb.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/brief-web' : `/${safeLang}/brief-web`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function BriefWebPage() {
  const [dict, lang] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const trustStats = [
    { n: dict.briefWeb.stats1, label: dict.briefWeb.stats1Label },
    { n: dict.briefWeb.stats2, label: dict.briefWeb.stats2Label },
    { n: dict.briefWeb.stats3, label: dict.briefWeb.stats3Label },
  ];

  const howTo = howToSchema({
    name: dict.briefWeb.title,
    description: dict.briefWeb.subtitle1,
    totalTime: 'PT15M',
    steps: [
      {
        name: lang === 'es' ? 'Elige tu ritmo' : lang === 'pt' ? 'Escolha o seu ritmo' : 'Choose your pace',
        text:
          lang === 'es'
            ? 'Selecciona entre la opción Express (3-5 min) o Detallada (15-20 min) según tu disponibilidad.'
            : lang === 'pt'
              ? 'Selecione entre a opção Expressa (3-5 min) ou Detalhada (15-20 min) conforme o seu tempo.'
              : 'Pick between Express (3-5 min) or Detailed (15-20 min) depending on your availability.',
      },
      {
        name: lang === 'es' ? 'Define tu proyecto web' : lang === 'pt' ? 'Defina seu projeto web' : 'Define your web project',
        text:
          lang === 'es'
            ? 'Indica tipo de sitio, objetivos, estilo visual y referencias que te inspiren.'
            : lang === 'pt'
              ? 'Indique tipo de site, objetivos, estilo visual e referências de inspiração.'
              : 'Specify site type, goals, visual style, and inspiration references.',
      },
      {
        name: lang === 'es' ? 'Revisa y envía' : lang === 'pt' ? 'Revise e envie' : 'Review and submit',
        text:
          lang === 'es'
            ? 'Establece rango de presupuesto, fechas estimadas y recibe propuesta en menos de 24h.'
            : lang === 'pt'
              ? 'Defina faixa de investimento, prazos e receba proposta em até 24h.'
              : 'Set your budget range, target dates, and get a proposal within 24h.',
      },
    ],
  });

  const faq = faqSchema(
    dict.briefWeb.faqItems.map((item: { q: string; a: string }) => ({
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
    { name: dict.briefWeb.title, path: lang === 'en' ? '/brief-web' : `/${lang}/brief-web` },
  ]);

  return (
    <>
      <JsonLd data={[howTo, faq, breadcrumbs]} />

      {/* Hero */}
      <section className="section bg-background">
        <Reveal as="div" stagger className="container-page max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-4">
            {dict.briefWeb.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            {dict.briefWeb.title}
          </h1>
          <p className="text-text text-lg mb-2">{dict.briefWeb.subtitle1}</p>
          <p className="text-secondary/70 text-sm mb-8">{dict.briefWeb.subtitle2}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {trustStats.map(({ n, label }) => (
              <div key={label}>
                <div className="font-heading text-2xl md:text-3xl text-secondary font-bold">{n}</div>
                <p className="text-secondary/70 text-xs md:text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Wizard */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-6xl">
          <Suspense
            fallback={
              <div className="rounded-2xl bg-primary border border-theme-9 p-12 text-center text-secondary/60">
                <div className="inline-block w-6 h-6 border-2 border-secondary/30 border-t-accent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium">Cargando brief web…</p>
              </div>
            }
          >
            <BriefHub dict={dict} lang={lang} initialType="web" />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-background pt-0">
        <div className="container-page max-w-3xl">
          <Reveal as="div" stagger>
            <h2 className="font-heading text-2xl md:text-3xl mb-2">
              {dict.briefWeb.faqTitle}
            </h2>
            <p className="text-secondary/80 mb-6">{dict.briefWeb.faqSubtitle}</p>
            <div className="space-y-3">
              {dict.briefWeb.faqItems.map((item: { q: string; a: string }, i: number) => (
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
