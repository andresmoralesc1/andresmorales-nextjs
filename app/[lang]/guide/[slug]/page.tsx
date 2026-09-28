import { notFound } from 'next/navigation';
import Link from 'next/link';
import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { renderMarkdown } from '@/lib/markdown';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { type Locale, getLocalizedPath } from '@/lib/i18n';
import { ArticleHero, type Article } from '@/components/article-hero';
import { ArticleToc, type TocItem } from '@/components/article-toc';
import { SeriesNav, type SeriesItem } from '@/components/series-nav';
import { Cta } from '@/components/sections/cta';
import { Reveal } from '@/components/reveal';
import { pageMetadata } from '@/lib/metadata';
import { LOCALES, isLocale } from '@/lib/i18n';
import { listGuideSlugsByLocale } from '@/lib/blog';
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

  // Related guides: pick up to 3 OTHER guides in the same locale.
  // The list comes from the same helper that powers the sitemap, so
  // guides that exist in the file system always appear in this list.
  // Title is derived from the slug (kebab-case → Title Case) since
  // we don't load each guide's frontmatter just to render the link
  // label — it'd be 3x filesystem reads per page render.
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  const otherGuides = [...listGuideSlugsByLocale()[safeLang]]
    .filter((s) => s !== slug)
    .slice(0, 3);
  const relatedGuides = otherGuides.map((s) => ({
    slug: s,
    href: getLocalizedPath(`/guide/${s}`, locale),
    title: s
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  }));

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

      {/* Cross-link to other guides + the blog — the user just read a
          long-form guide, the natural next step is another guide
          (related topic) or the field-notes blog. Uses the same
          pill-style as /process and /about cross-link sections. */}
      <section className="section bg-background">
        <div className="container-page max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-4">
            {dict.guide.keepReading}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {relatedGuides.map((rg) => (
              <Link
                key={rg.slug}
                href={rg.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-theme-9 hover:border-theme-1 rounded-full text-sm font-secondary font-bold text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
              >
                {rg.title}
                <span aria-hidden>→</span>
              </Link>
            ))}
            <Link
              href={getLocalizedPath('/blog', locale)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border border-theme-9 hover:border-theme-1 rounded-full text-sm font-secondary font-bold text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2"
            >
              {dict.nav.blog}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
