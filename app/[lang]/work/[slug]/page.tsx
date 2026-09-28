import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/metadata';
import { LOCALES, isLocale, getDictionary, type Locale } from '@/lib/i18n';
import { CASE_STUDIES, getCaseStudyBySlug, type CaseStudy } from '@/data/case-studies';
import { JsonLd, faqSchema } from '@/lib/json-ld';
import { Reveal } from '@/components/reveal';

/**
 * Inline SVG icon registry for case-study icons.
 *
 * Why not lucide-react / heroicons?
 * The rest of andresmorales-nextjs uses inline SVGs (see components/social.tsx,
 * components/footer.tsx) — adding a new icon library would break visual
 * unity. These 9 icons cover every icon used in /work/[slug].
 *
 * Style: stroke-only, currentColor, strokeWidth 1.75, strokeLinecap/Linejoin
 * round, viewBox 0 0 24 24 — matches Lucide's defaults so the visual weight
 * is consistent with how users expect icons to look.
 */
type IconName =
  | 'MapPin' | 'Calendar' | 'Layers' | 'Users' | 'Timer' | 'Globe'
  | 'TrendingUp' | 'CheckCircle2' | 'ArrowRight' | 'ArrowUpRight'
  | 'Type' | 'Heart' | 'Sparkles' | 'Mail';

const ICON_PATHS: Record<IconName, string> = {
  MapPin: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  Calendar: 'M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5M7 15h4M15 15h2M7 11h2M13 11h4',
  Layers: 'M12.83 2.17a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83ZM22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  Users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  Timer: 'M10 2h4M12 14l3-3M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  Globe: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10',
  TrendingUp: 'M22 7l-9.5 9.5-5-5L1 18M16 7h6v6',
  CheckCircle2: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10M9 12l2 2 4-4',
  ArrowRight: 'M5 12h14m-7-7 7 7-7 7',
  ArrowUpRight: 'M7 7h10v10M7 17 17 7',
  // Stylized "Aa" — used for type/typography contexts.
  Type: 'M3 7V5h13v2M5 19h2v-7h6v7h2v-9H5v9M17 5h4v2h-2v12h2v2h-4v-2h2V7h-2V5z',
  Heart: 'M19 14c1.49-1.46 3-3.17 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.927 0-3.397 1.05-4.5 2.5C10.897 4.05 9.427 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z',
  Sparkles: 'M9.937 15.5A2 2 0 0 0 8.5 14H5.5a2 2 0 0 0-1.78 3.18M2 9.5A2 2 0 0 0 4.5 8h3a2 2 0 0 0 1.78-1.18M12 2a2 2 0 0 0-1.78 3.18M14.5 9a2 2 0 0 0 1.78-3.18M22 14.5a2 2 0 0 0-1.78-3.18M17.5 17a2 2 0 0 0 1.78 1.78M21 21a2 2 0 0 0-3.18-1.78M15.5 18a2 2 0 0 0 3.18 1.78',
  // Closed envelope — used for email / lead-capture contexts.
  Mail: 'M22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7m0 0v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7m-4-3.5L12 13.5l-6-6',
};

function Icon({ name, size = 20, className }: {
  name?: string;
  size?: number;
  className?: string;
}) {
  if (!name) return null;
  const d = ICON_PATHS[name as IconName];
  if (!d) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    for (const c of CASE_STUDIES) {
      params.push({ lang, slug: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const safeLang: Locale = isLocale(lang) ? lang : 'en';
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};
  const title = cs.title[safeLang];
  const dict = await getDictionary(safeLang);
  const workMeta = (dict.seoMeta?.work as Record<string, Record<string, string>> | undefined)?.[slug]?.[safeLang];
  const description = workMeta ?? cs.summary[safeLang];
  const path = safeLang === 'en' ? `/work/${slug}` : `/${safeLang}/work/${slug}`;
  return pageMetadata({
    title,
    description,
    locale: safeLang,
    path,
    type: 'article',
  });
}

function caseStudySchema(cs: CaseStudy, lang: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: cs.title[lang],
    description: cs.summary[lang],
    url: `https://andresmorales.com.co${lang === 'en' ? '' : `/${lang}`}/work/${cs.slug}`,
    inLanguage: lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
    genre: cs.industry[lang],
    keywords: cs.stack.join(', '),
    creator: { '@id': 'https://andresmorales.com.co/#person' },
    provider: { '@id': 'https://andresmorales.com.co/#person' },
    dateCreated: cs.timeline,
  };
}

const FAQ_LABELS: Record<Locale, { goal: string; built: string; outcome: string }> = {
  en: { goal: 'What was the project goal?', built: 'What was built?', outcome: 'What was the measurable outcome?' },
  es: { goal: '¿Cuál era el objetivo del proyecto?', built: '¿Qué se construyó?', outcome: '¿Cuál fue el resultado medible?' },
  pt: { goal: 'Qual era o objetivo do projeto?', built: 'O que foi construído?', outcome: 'Qual foi o resultado mensurável?' },
};

const FAQ_LANG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-CO',
  pt: 'pt-BR',
};

function firstSentence(text: string, max = 180): string {
  const cut = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return cut.length <= max ? cut : `${cut.slice(0, max - 1).trimEnd()}…`;
}

function workFaqs(cs: CaseStudy, lang: Locale) {
  const labels = FAQ_LABELS[lang];
  const top = cs.results[0];
  const outcome = top
    ? `${top.value[lang]} ${top.label[lang]}`
    : firstSentence(cs.summary[lang]);
  return [
    { question: labels.goal, answer: firstSentence(cs.summary[lang]) },
    { question: labels.built, answer: firstSentence(cs.solution[lang]) },
    { question: labels.outcome, answer: outcome },
  ];
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const safeLang: Locale = isLocale(lang) ? lang : 'en';
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  const dictAll = await getDictionary(safeLang);
  const p = dictAll.portfolio as Record<string, string>;

  const title = cs.title[safeLang];
  const summary = cs.summary[safeLang];
  const problem = cs.problem[safeLang];
  const solution = cs.solution[safeLang];
  const scope = cs.scope[safeLang];

  const ctaVisit = p.cardVisitLive ?? 'Visit live';
  const ctaHire = p.heroCta2 ?? 'Hire me';
  const ctaBack = safeLang === 'en' ? '← Back to portfolio' : safeLang === 'es' ? '← Volver al portafolio' : '← Voltar ao portfólio';
  const lblProblem = safeLang === 'en' ? 'The problem' : safeLang === 'es' ? 'El problema' : 'O problema';
  const lblSolution = safeLang === 'en' ? 'What I built' : safeLang === 'es' ? 'Lo que construí' : 'O que construí';
  const lblResults = safeLang === 'en' ? 'Results' : safeLang === 'es' ? 'Resultados' : 'Resultados';
  const lblScope = safeLang === 'en' ? 'Scope & architecture' : safeLang === 'es' ? 'Alcance y arquitectura' : 'Escopo e arquitetura';
  const lblStack = safeLang === 'en' ? 'Built with' : safeLang === 'es' ? 'Construido con' : 'Construído com';
  const lblCTA = safeLang === 'en' ? 'Need a similar project?' : safeLang === 'es' ? '¿Necesitas un proyecto similar?' : 'Precisa de um projeto similar?';

  return (
    <>
      <JsonLd data={caseStudySchema(cs, safeLang)} />
      <JsonLd data={faqSchema(workFaqs(cs, safeLang), FAQ_LANG[safeLang])} />

      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <div className="container-page relative z-10 max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold flex items-center gap-2">
            <Icon name={cs.industryIcon} size={14} />
            {cs.industry[safeLang]} · {cs.region}
          </p>
          <h1 className="font-heading text-3xl md:text-5xl mb-4 text-secondary leading-tight">
            {title}
          </h1>
          <p className="text-text text-lg md:text-xl mb-8 max-w-3xl">
            {summary}
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href={cs.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold rounded-lg"
            >
              {ctaVisit} <Icon name="ArrowUpRight" size={16} />
            </a>
            <Link
              href={`/${safeLang === 'en' ? '' : safeLang}/brief`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-secondary font-bold rounded-lg transition-all"
            >
              {ctaHire} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-theme-9 shadow-lg bg-theme-9">
            <Image
              src={cs.heroImage}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-top"
            />
          </div>
          <p className="text-xs text-text mt-3 font-secondary uppercase tracking-wider">
            {cs.timeline}
          </p>
        </div>
      </section>

      {/* Quick facts strip — inline stats under the hero */}
      {cs.quickFacts && cs.quickFacts.length > 0 && (
        <section className="bg-theme-5 border-y border-theme-9">
          <Reveal stagger className="container-page max-w-5xl">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
              {cs.quickFacts.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-primary border border-theme-9 flex items-center justify-center text-theme-1">
                    <Icon name={f.icon} size={16} />
                  </span>
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-text font-secondary font-bold mb-0.5">
                      {f.label[safeLang]}
                    </dt>
                    <dd className="font-heading text-base md:text-lg text-secondary leading-tight">
                      {f.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      )}

      {/* Problem + Solution — two-up on desktop */}
      <section className="section bg-primary">
        <Reveal stagger className="container-page max-w-5xl grid md:grid-cols-2 gap-10">
          <article>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-theme-1/10 border border-theme-1/30 flex items-center justify-center text-theme-1">
                <Icon name="TrendingUp" size={18} />
              </span>
              <h2 className="font-heading text-2xl md:text-3xl">{lblProblem}</h2>
            </div>
            <p className="text-text leading-relaxed text-base md:text-lg">
              {problem}
            </p>
          </article>
          <article>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-theme-1/10 border border-theme-1/30 flex items-center justify-center text-theme-1">
                <Icon name="CheckCircle2" size={18} />
              </span>
              <h2 className="font-heading text-2xl md:text-3xl">{lblSolution}</h2>
            </div>
            <p className="text-text leading-relaxed text-base md:text-lg">
              {solution}
            </p>
          </article>
        </Reveal>
      </section>

      {/* Showcases — additional screenshots with captions */}
      {cs.screenshots && cs.screenshots.length > 0 && (
        <section className="section bg-theme-5">
          <div className="container-page max-w-5xl space-y-12">
            {cs.screenshots.map((shot, i) => (
              <Reveal key={i} stagger>
                <figure
                  className={`relative overflow-hidden rounded-2xl border border-theme-9 shadow-md bg-primary ${
                    shot.aspect === 'tall' ? 'aspect-[9/16] max-w-md mx-auto' : 'aspect-[16/9]'
                  }`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.caption[safeLang]}
                    fill
                    loading={i === 0 ? 'eager' : 'lazy'}
                    sizes={shot.aspect === 'tall' ? '(max-width: 768px) 100vw, 448px' : '(max-width: 1024px) 100vw, 1024px'}
                    className="object-cover object-top"
                  />
                </figure>
                <figcaption className="mt-3 text-sm text-text text-center max-w-2xl mx-auto">
                  {shot.caption[safeLang]}
                </figcaption>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Results — metric cards with icons */}
      <section className="section bg-primary">
        <div className="container-page max-w-5xl">
          <h2 className="font-heading text-2xl md:text-3xl mb-8 text-center">{lblResults}</h2>
          <Reveal stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cs.results.map((r, i) => (
              <div
                key={i}
                className="bg-theme-5 rounded-2xl border border-theme-9 p-5 text-center hover:border-theme-1 transition-colors"
              >
                {r.icon && (
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-theme-1/10 text-theme-1 mb-3">
                    <Icon name={r.icon} size={18} />
                  </div>
                )}
                <div className="font-heading text-3xl md:text-4xl text-secondary mb-1">
                  {r.value[safeLang]}
                </div>
                <div className="text-xs uppercase tracking-wider text-text font-secondary font-bold">
                  {r.label[safeLang]}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Scope & architecture */}
      <section className="section bg-theme-5">
        <div className="container-page max-w-5xl">
          <h2 className="font-heading text-2xl md:text-3xl mb-8 text-center">{lblScope}</h2>
          <Reveal stagger className="grid md:grid-cols-2 gap-4">
            {scope.map((item, i) => (
              <div
                key={i}
                className="flex gap-3 bg-primary rounded-xl border border-theme-9 p-4 hover:border-theme-1 transition-colors"
              >
                <span aria-hidden className="shrink-0 w-7 h-7 rounded-md bg-theme-1/10 text-theme-1 flex items-center justify-center mt-0.5">
                  <Icon name="CheckCircle2" size={14} />
                </span>
                <span className="text-text leading-relaxed">{item}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Stack */}
      <section className="section bg-primary">
        <div className="container-page max-w-5xl text-center">
          <h2 className="font-heading text-xl md:text-2xl mb-4 text-text">{lblStack}</h2>
          <Reveal stagger className="flex flex-wrap gap-2 justify-center">
            {cs.stack.map((tech) => (
              <span
                key={tech}
                className="inline-block px-3 py-1.5 rounded-full bg-theme-5 border border-theme-9 text-xs font-secondary font-bold uppercase tracking-wider text-secondary hover:border-theme-1 transition-colors"
              >
                {tech}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Final CTA + back link */}
      <section className="section bg-background">
        <div className="container-page text-center max-w-2xl">
          <h2 className="font-heading text-2xl md:text-3xl mb-6">
            {lblCTA}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              href={`/${safeLang === 'en' ? '' : safeLang}/brief`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold rounded-lg"
            >
              {ctaHire} <Icon name="ArrowRight" size={16} />
            </Link>
            <a
              href={cs.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-secondary font-bold rounded-lg transition-all"
            >
              {ctaVisit} <Icon name="ArrowUpRight" size={16} />
            </a>
          </div>
          <Link
            href={`/${safeLang === 'en' ? '' : safeLang}/portfolio`}
            className="text-sm text-text hover:text-accent font-secondary uppercase tracking-wider transition-colors"
          >
            {ctaBack}
          </Link>
        </div>
      </section>
    </>
  );
}
