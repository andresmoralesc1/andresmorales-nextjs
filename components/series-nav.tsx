import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SeriesItem {
  slug: string;
  title: string;
  number: number; // 01, 02, ...
}

/**
 * In-line series navigation — shows the current article in context
 * with prev/next and a scrollable strip of all siblings. Reuses the
 * site tokens (orange accent + cream cards) so it sits with the rest
 * of the design without introducing new colours.
 */
export function SeriesNav({
  clusterHref,
  clusterTitle,
  current,
  items,
  prevLabel = 'Previous',
  nextLabel = 'Next',
}: {
  clusterHref: string;
  clusterTitle: string;
  current: string;
  items: SeriesItem[];
  prevLabel?: string;
  nextLabel?: string;
}) {
  const idx = items.findIndex((i) => i.slug === current);
  const prev = idx > 0 ? items[idx - 1] : undefined;
  const next = idx < items.length - 1 ? items[idx + 1] : undefined;

  return (
    <nav aria-label="Cluster navigation" className="space-y-8">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href={clusterHref}
          className="text-xs uppercase tracking-widest text-text font-secondary font-bold hover:text-accent transition-colors"
        >
          ← {clusterTitle}
        </Link>
        <span className="text-xs font-secondary font-bold text-text/60">
          {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
      </div>

      {/* Prev / next cards — same grid pattern as the rest of the site */}
      <div className="grid md:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/guide/${prev.slug}`}
            className="group block bg-primary rounded-2xl border border-theme-9 p-5 hover:border-theme-1 hover:-translate-y-0.5 transition-all"
          >
            <div className="text-xs uppercase tracking-widest text-text/60 font-secondary font-bold mb-1">
              ← {prevLabel}
            </div>
            <div className="font-heading text-base md:text-lg text-secondary group-hover:text-accent transition-colors">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/guide/${next.slug}`}
            className="group block bg-primary rounded-2xl border border-theme-9 p-5 hover:border-theme-1 hover:-translate-y-0.5 transition-all text-right"
          >
            <div className="text-xs uppercase tracking-widest text-text/60 font-secondary font-bold mb-1">
              {nextLabel} →
            </div>
            <div className="font-heading text-base md:text-lg text-secondary group-hover:text-accent transition-colors">
              {next.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Compact index strip — pills with the current one highlighted */}
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => {
          const isCurrent = i.slug === current;
          return (
            <Link
              key={i.slug}
              href={`/guide/${i.slug}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'text-xs font-secondary font-bold px-2.5 py-1 rounded-full border transition-colors',
                isCurrent
                  ? 'bg-accent text-primary border-accent'
                  : 'border-theme-9 text-text hover:text-secondary hover:border-secondary',
              )}
            >
              {String(i.number).padStart(2, '0')}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
