import Link from 'next/link';
import { Reveal } from '@/components/reveal';

export interface Article {
  eyebrow: string;
  title: string;
  lede: string;
  readingTime: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  seriesHref?: string;
  seriesLabel?: string;
  publishedAt: string;
  byline?: string;
}

/**
 * Hero shared by all long-form articles — guides (pillar + satellites).
 * Uses the site's existing tokens (orange/cream/Georgia/Arial Narrow)
 * via the inherited `container-page`, `font-heading`, `font-secondary`
 * and the Reveal/Container pairing used everywhere else.
 *
 * 3 layout states:
 *  - isPillar:    large, with stat strip + cluster visual hook
 *  - isSatellite:  compact, sits on the standard blog reading width
 *  - default:     same as satellite (covers blog posts that join a cluster)
 */
export function ArticleHero({
  article,
  isPillar = false,
}: {
  article: Article;
  isPillar?: boolean;
}) {
  return (
    <header className="section bg-background">
      <Reveal as="div" stagger>
        <div className="container-page max-w-3xl">
          {/* Series breadcrumb when part of a cluster */}
          {article.seriesHref && article.seriesLabel ? (
            <Link
              href={article.seriesHref}
              className="inline-flex items-center gap-1.5 text-xs font-secondary font-bold uppercase tracking-widest text-accent hover:text-secondary transition-colors mb-4"
            >
              <span aria-hidden>←</span>
              {article.seriesLabel}
            </Link>
          ) : null}

          <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold mb-3">
            {article.eyebrow}
          </p>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-5 text-secondary leading-[1.05] tracking-tight">
            {article.title}
          </h1>

          <p className="text-text text-lg md:text-xl leading-relaxed mb-8">
            {article.lede}
          </p>

          {/* Meta strip — reading time, level, date */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-secondary font-bold uppercase tracking-widest text-text pb-8 border-b border-theme-9">
            {article.byline ? (
              <span className="text-secondary">{article.byline}</span>
            ) : (
              <span>Andrés Morales</span>
            )}
            <span aria-hidden>·</span>
            <span>{article.publishedAt}</span>
            <span aria-hidden>·</span>
            <span>{article.readingTime}</span>
            <span aria-hidden>·</span>
            <span
              className={
                article.level === 'beginner'
                  ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 text-accent'
                  : article.level === 'advanced'
                    ? 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-primary'
                    : 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-theme-9 text-secondary'
              }
            >
              {article.level}
            </span>
          </div>
        </div>
      </Reveal>
    </header>
  );
}
