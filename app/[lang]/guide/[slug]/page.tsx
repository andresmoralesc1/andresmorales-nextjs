import { notFound } from 'next/navigation';
import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { renderMarkdown } from '@/lib/markdown';
import { getCurrentDictionary } from '@/lib/dictionary';
import type { Locale } from '@/lib/i18n';
import { ArticleHero, type Article } from '@/components/article-hero';
import { ArticleToc, type TocItem } from '@/components/article-toc';
import { SeriesNav, type SeriesItem } from '@/components/series-nav';
import { Cta } from '@/components/sections/cta';
import { Reveal } from '@/components/reveal';
import { pageMetadata } from '@/lib/metadata';
import { LOCALES, isLocale } from '@/lib/i18n';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/lib/json-ld';
import styles from './guide-prose.module.css';

const CONTENT_DIR = join(process.cwd(), 'content', 'guide');

type GuideLocale = 'en' | 'es' | 'pt';

export async function generateStaticParams() {
  if (!existsSync(CONTENT_DIR)) return [];
  const files = readdirSync(CONTENT_DIR);
  const slugsByLocale: Record<GuideLocale, Set<string>> = {
    en: new Set(),
    es: new Set(),
    pt: new Set(),
  };
  for (const f of files) {
    const m = /^(.+?)\.(en|es|pt)\.md$/.exec(f);
    if (!m) continue;
    const [, slug, locale] = m;
    slugsByLocale[locale as GuideLocale].add(slug);
  }
  return (['en', 'es', 'pt'] as const).flatMap((lang) =>
    [...slugsByLocale[lang]].map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const article = readGuidePost(slug, safeLang);
  if (!article) return {};
  return pageMetadata({
    title: article.data.title,
    description: article.data.lede,
    locale: safeLang,
    path: safeLang === 'en' ? `/guide/${slug}` : `/${safeLang}/guide/${slug}`,
    type: 'article',
  });
}

function readGuidePost(slug: string, locale: string) {
  const path = join(CONTENT_DIR, `${slug}.${locale}.md`);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf-8');
  return { data: matter(raw).data as ArticleFrontmatter, raw };
}

type ArticleFrontmatter = {
  title: string;
  lede: string;
  eyebrow: string;
  publishedAt: string;
  readingTime: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  clusterHref?: string;
  clusterTitle?: string;
  byline?: string;
  series?: SeriesItem[];
  currentSlug?: string;
  photoAlt?: string;
};

function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = [];
  // Match H2 and H3 headings (no code block context — simplified)
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1].length === 2 ? 2 : 3;
    const text = m[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    toc.push({ id, text, level });
  }
  return toc;
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const safeLang: GuideLocale = isLocale(lang) ? (lang as GuideLocale) : 'en';
  const article = readGuidePost(slug, safeLang);
  if (!article) notFound();

  const html = renderMarkdown(article.raw.replace(/^---[\s\S]*?---\n/, ''));
  const toc = extractToc(article.raw);

  const articleData: Article = {
    ...article.data,
    byline: article.data.byline ?? 'Andrés Morales',
  };

  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: article.data.title,
          description: article.data.lede,
          datePublished: article.data.publishedAt,
          author: 'Andrés Morales',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guide', path: '/guide/ai-automation-latam-2026' },
          { name: article.data.title, path: `/guide/${slug}` },
        ])}
      />

      <ArticleHero article={articleData} isPillar={article.data.level === 'advanced' && !!article.data.series?.length} />

      <section className="section bg-primary">
        <div className="container-page max-w-6xl">
          <div className="grid lg:grid-cols-[220px,1fr] gap-10">
            {/* Sticky TOC on desktop */}
            <aside className="hidden lg:block">
              <ArticleToc items={toc} />
            </aside>

            <article className={`prose max-w-none ${styles.prose}`}>
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
            </article>
          </div>
        </div>
      </section>

      {/* Mobile TOC — inline at the top of the article body (above the prose) */}
      <section className="section bg-primary pt-0 lg:hidden">
        <div className="container-page max-w-3xl">
          <details className="rounded-2xl border border-theme-9 bg-theme-5 p-4">
            <summary className="cursor-pointer list-none flex items-center justify-between font-secondary font-bold text-secondary">
              <span>Table of contents</span>
              <span aria-hidden className="text-accent text-xl">+</span>
            </summary>
            <ol className="mt-3 space-y-1.5 text-sm">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={item.level === 3 ? 'pl-3' : ''}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-text hover:text-secondary"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      {/* Series nav (prev/next + index pills) */}
      {article.data.series && article.data.series.length > 0 && article.data.clusterHref && article.data.clusterTitle ? (
        <section className="section bg-theme-5">
          <div className="container-page max-w-3xl">
            <SeriesNav
              clusterHref={article.data.clusterHref}
              clusterTitle={article.data.clusterTitle}
              current={article.data.currentSlug ?? slug}
              items={article.data.series}
            />
          </div>
        </section>
      ) : null}

      <Cta />
    </>
  );
}
