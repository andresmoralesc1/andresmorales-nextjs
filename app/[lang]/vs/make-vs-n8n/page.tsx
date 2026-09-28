import type { Metadata } from 'next';
import { Reveal } from '@/components/reveal';
import { Cta } from '@/components/sections/cta';
import { WorkflowCanvas } from '@/components/sections/workflow-canvas';
import { TrackCta } from '@/components/track';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { layoutWorkflow } from '@/lib/workflow-layout';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, faqSchema, breadcrumbSchema } from '@/lib/json-ld';
// Snapshot of one real workflow from the user's n8n instance — committed
// in content/n8n/featured-workflow.json. If the workflow stops being
// representative, regenerate via:
//   docker exec telchar-postgres-1 psql -U neuralflow -d n8n_db -tA -F $'\t' -c "..." > content/n8n/featured-workflow.json
// See plan: docs/superpowers/plans/2026-09-28-vs-make-vs-n8n-page-redesign.md
import featuredWorkflow from '@/content/n8n/featured-workflow.json';

const SLUG = 'make-vs-n8n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  const c = dict.compare.makeVsN8n;
  return pageMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? `/vs/${SLUG}` : `/${safeLang}/vs/${SLUG}`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function MakeVsN8nPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getCurrentDictionary();
  const c = dict.compare.makeVsN8n;

  const faqs = c.faqs;
  const breadcrumbs = [
    { name: dict.nav.home, path: '/' },
    { name: dict.compare.breadcrumbCompare, path: '/vs' },
    { name: c.metaTitle, path: `/vs/${SLUG}` },
  ];

  const faqLocale =
    safeLang === 'es' ? 'es-CO' : safeLang === 'pt' ? 'pt-BR' : 'en-US';

  // Workflow layout computed once per render. The JSON snapshot is
  // committed to the repo (see content/n8n/featured-workflow.json) so
  // the page doesn't need network access at build/runtime.
  // Cast through `any` for the JSON-shape mismatch (n8n nodes are
  // strictly typed but the JSON is snapshot-typed).
  const workflow = layoutWorkflow(featuredWorkflow as any);

  return (
    <>
      <JsonLd data={faqSchema(faqs, faqLocale)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <div className="container-page max-w-4xl text-center pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary border border-theme-9 text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {c.heroBadge}
          </div>
          <p className="text-xs uppercase tracking-widest text-text mb-3 font-secondary font-bold">
            {c.eyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl mb-4 text-secondary">
            {c.h1}
          </h1>
          <p className="text-text text-lg md:text-xl max-w-2xl mx-auto">
            {c.subtitle}
          </p>
          <p className="text-xs text-text font-secondary mt-6">
            {dict.compare.lastReviewed}
          </p>
        </div>
      </section>

      {/* TL;DR verdict */}
      <section className="section bg-primary">
        <Reveal className="container-page max-w-3xl">
          <div className="rounded-2xl border border-theme-9 bg-theme-5 p-6 md:p-8">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              TL;DR
            </p>
            <p className="text-secondary font-heading text-lg md:text-xl leading-relaxed whitespace-pre-line">
              {c.tldr}
            </p>
          </div>
        </Reveal>
      </section>

      {/* Workflow reality check — real n8n workflow as the page's
          centerpiece. The data is from content/n8n/featured-workflow.json
          (a snapshot of the user's actual production workflow). */}
      <WorkflowCanvas
        eyebrow={c.workflowCheck.eyebrow}
        heading={c.workflowCheck.heading}
        subtitle={c.workflowCheck.subtitle}
        workflow={workflow}
        callouts={c.workflowCheck.callouts}
        caption={c.workflowCheck.caption}
        captionLabel={c.workflowCheck.captionLabel}
      />

      {/* Comparison table */}
      <section className="section bg-background">
        <Reveal className="container-page max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {c.eyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {c.tableIntro}
            </h2>
          </div>

          <div className="rounded-2xl border border-theme-9 overflow-hidden bg-primary">
            <div className="hidden md:grid grid-cols-[1.2fr,1fr,1fr,1fr] bg-theme-5 px-4 py-3 text-xs uppercase tracking-widest text-text font-secondary font-bold">
              <div>Criterion</div>
              <div>{c.xCol}</div>
              <div>{c.yCol}</div>
              <div>Winner</div>
            </div>
            {c.rows.map((row: { criterion: string; x: string; y: string; winner: string }, i: number) => (
              <div
                key={row.criterion}
                className={`grid md:grid-cols-[1.2fr,1fr,1fr,1fr] gap-2 px-4 py-4 ${
                  i % 2 === 1 ? 'bg-theme-5/40' : ''
                }`}
              >
                <div className="font-heading text-secondary text-base md:text-lg">
                  {row.criterion}
                </div>
                <div className="text-text text-sm md:text-base">{row.x}</div>
                <div className="text-text text-sm md:text-base">{row.y}</div>
                <div className="text-accent text-sm md:text-base font-secondary font-bold">
                  {row.winner}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Per-criterion deep dives */}
      <section className="section bg-primary">
        <div className="container-page max-w-4xl space-y-8">
          {c.criteria.map((cr: { title: string; body: string }, i: number) => (
            <Reveal key={cr.title}>
              <div className="rounded-2xl border border-theme-9 bg-theme-5 p-6 md:p-8">
                <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-heading text-xl md:text-2xl text-secondary mb-3">
                  {cr.title}
                </h3>
                <p className="text-text leading-relaxed">{cr.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* When to use each */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {c.eyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl">
              {c.whenToUse.xTitle} vs {c.whenToUse.yTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-theme-9 bg-primary p-6 md:p-8">
              <h3 className="font-heading text-xl md:text-2xl text-secondary mb-4">
                {c.whenToUse.xTitle}
              </h3>
              <ul className="space-y-3">
                {c.whenToUse.x.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-text leading-relaxed">
                    <span className="flex-none mt-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-theme-9 bg-primary p-6 md:p-8">
              <h3 className="font-heading text-xl md:text-2xl text-secondary mb-4">
                {c.whenToUse.yTitle}
              </h3>
              <ul className="space-y-3">
                {c.whenToUse.y.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-text leading-relaxed">
                    <span className="flex-none mt-2 w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="section bg-background">
        <Reveal className="container-page max-w-3xl">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
              {c.eyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl">FAQ</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f: { question: string; answer: string }) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-theme-9 bg-primary p-5 md:p-6 open:bg-theme-5"
              >
                <summary className="cursor-pointer font-heading text-base md:text-lg text-secondary flex items-start gap-3 list-none">
                  <span className="flex-none w-5 h-5 mt-0.5 rounded-full border border-accent text-accent text-xs flex items-center justify-center group-open:rotate-45 transition-transform">
                    +
                  </span>
                  <span>{f.question}</span>
                </summary>
                <p className="mt-4 pl-8 text-text leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="section bg-primary">
        <Reveal className="container-page max-w-3xl">
          <div className="rounded-2xl border border-theme-9 bg-theme-5 p-8 md:p-10 text-center">
            <h2 className="font-heading text-2xl md:text-3xl text-secondary mb-3">
              {c.ctaTitle}
            </h2>
            <p className="text-text max-w-xl mx-auto mb-6">{c.ctaBody}</p>
            <TrackCta
              href={`/${safeLang === 'en' ? '' : safeLang + '/'}brief`}
              label={`vs-${SLUG}-cta`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-secondary font-heading font-bold hover:opacity-90 transition-opacity"
            >
              {c.ctaLabel}
            </TrackCta>
          </div>
        </Reveal>
      </section>

      {/* Last reviewed stamp */}
      <section className="section bg-background">
        <div className="container-page max-w-4xl text-center">
          <p className="text-xs text-text font-secondary">
            {dict.compare.lastReviewed}
          </p>
        </div>
      </section>

      <Cta />
    </>
  );
}
