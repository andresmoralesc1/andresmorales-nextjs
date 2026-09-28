import { notFound, redirect } from 'next/navigation';
import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { getCurrentDictionary } from '@/lib/dictionary';
import { getDictionary, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';
import { getPost, listPosts, postMtime, type BlogLocale, listAllPostSlugs, listSlugsByLocale } from '@/lib/blog';
import { TrackLink } from '@/components/track';
import { Reveal } from '@/components/reveal';
import styles from './blog-prose.module.css';

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

/**
 * Find the locale that actually has a body for `slug`. Returns undefined
 * when the slug doesn't exist in any locale.
 *
 * Used as a fallback when a user lands on `/blog/<slug>` (no locale
 * prefix, treated as EN) but the post only exists in ES/PT. Without
 * this, generateStaticParams never pre-renders the route, so the
 * server returns 404 even though the content is live in another locale.
 * The fix: detect the available locale and redirect — better UX than
 * a dead 404 page, and preserves link equity for shared social URLs.
 */
function findAvailableLocale(slug: string, requested: Locale): Locale | undefined {
  for (const loc of LOCALES) {
    if (loc === requested) continue;
    if (getPost(slug, loc)) return loc;
  }
  return undefined;
}

export async function generateStaticParams() {
  // Only pre-render (slug, lang) pairs where a localized body actually
  // exists. Visiting /en/blog/<es-only-slug> will 404 on the server
  // rather than serve a half-built page.
  if (!existsSync(CONTENT_DIR)) return [];
  const files = readdirSync(CONTENT_DIR);
  const slugsByLocale: Record<BlogLocale, Set<string>> = {
    en: new Set(),
    es: new Set(),
    pt: new Set(),
  };
  for (const f of files) {
    const m = /^(.+?)\.(en|es|pt)\.md$/.exec(f);
    if (!m) continue;
    const [, slug, locale] = m;
    slugsByLocale[locale as BlogLocale].add(slug);
  }
  return (['en', 'es', 'pt'] as const).flatMap((lang) =>
    [...slugsByLocale[lang]].map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = getPost(slug, lang);
  if (!post) {
    // Post missing in the requested locale. Try other locales; if found,
    // redirect so social shares + shared links reach the right page.
    // `redirect()` throws NEXT_REDIRECT — Next.js handles it before any
    // body is rendered. If no locale has the post, return {} and the
    // page handler will 404.
    const fallback = findAvailableLocale(slug, lang);
    if (fallback) {
      const prefix = fallback === DEFAULT_LOCALE ? '' : `/${fallback}`;
      redirect(`${prefix}/blog/${slug}`);
    }
    return {};
  }

  const dict = await getDictionary(lang);
  const blogMeta = (dict.seoMeta?.blog as Record<string, Record<string, string>> | undefined)?.[slug]?.[lang];
  const description = blogMeta ?? post.description;

  // Only emit hreflang for languages that actually have a translation of
  // this slug. Emitting all three when the post only exists in one
  // language sends Google to 404s (or, worse, to the wrong-locale URL
  // when the page falls back to EN content).
  const slugsByLocale = listSlugsByLocale();
  const existingLocales = (['en', 'es', 'pt'] as const).filter((l) =>
    slugsByLocale[l].has(slug),
  );

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${lang === 'en' ? '' : `/${lang}`}/blog/${slug}`,
      languages: Object.fromEntries(
        existingLocales.map((l) => [l, `${l === 'en' ? '' : `/${l}`}/blog/${slug}`]),
      ),
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `https://andresmorales.com.co/${lang}/blog/${slug}`,
      siteName: 'Andrés Morales',
      locale: lang === 'es' ? 'es_CO' : lang === 'pt' ? 'pt_BR' : 'en_US',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
images: [
            {
              url: `/api/og?lang=${lang}&path=${encodeURIComponent(`/blog/${slug}`)}&title=${encodeURIComponent(post.title)}`,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [`/api/og?lang=${lang}&path=${encodeURIComponent(`/blog/${slug}`)}&title=${encodeURIComponent(post.title)}`],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = getPost(slug, lang);
  if (!post) {
    // Same fallback as generateMetadata: redirect to whatever locale
    // does have the post, so /blog/<es-only-slug> → /es/blog/<slug>
    // instead of 404.
    const fallback = findAvailableLocale(slug, lang);
    if (fallback) {
      const prefix = fallback === DEFAULT_LOCALE ? '' : `/${fallback}`;
      redirect(`${prefix}/blog/${slug}`);
    }
    notFound();
  }

  const dict = await getCurrentDictionary();

  // Last-updated: show "Updated X" only if the file mtime is at least
  // one day after the published date. Avoids the visual noise of
  // "Updated Sep 28" on a post published Sep 28 (where the difference
  // is just metadata write time).
  const mtime = postMtime(slug, lang);
  const publishedDate = new Date(post.date);
  const oneDay = 24 * 60 * 60 * 1000;
  const showUpdated =
    mtime && mtime.getTime() - publishedDate.getTime() > oneDay;
  const updatedDateStr = showUpdated
    ? mtime!.toLocaleDateString(
        lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : '';

  // Related posts: score by tag overlap, fall back to most recent
  // posts in the same locale. Cap at 3.
  const candidates = listPosts(lang).filter((p) => p.slug !== slug);
  const scored = candidates
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .sort((a, b) =>
      b.score !== a.score ? b.score - a.score : b.post.date.localeCompare(a.post.date),
    );
  const related = scored.slice(0, 3).map((s) => s.post);

  return (
    <main className="container-page py-16 min-h-[60vh] max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-secondary font-bold mb-3">
        <TrackLink
          href={`/${lang}/blog`}
          event="nav_link_clicked"
          label="blog-back"
          className="hover:underline"
        >
          {lang === 'es' ? '← Volver a notas' : lang === 'pt' ? '← Voltar pras notas' : '← Back to notes'}
        </TrackLink>
      </p>

      <article>
        {post.coverImage && (
          <figure className="mb-8 -mx-4 md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.coverImageAlt ?? ''}
              className="w-full rounded-lg aspect-[21/9] object-cover"
              loading="eager"
            />
            {post.coverImageCredit && (
              <figcaption className="mt-2 text-xs text-theme-5/70">
                {post.coverImageCredit}
              </figcaption>
            )}
          </figure>
        )}
        <Reveal className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-sm text-theme-5 mb-4">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(
                lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </time>
            {' · '}
            {post.readingTime}{' '}
            {lang === 'es' ? 'min de lectura' : lang === 'pt' ? 'min de leitura' : 'min read'}
            {' · '}
            {post.author}
          </p>
          {showUpdated ? (
            <p className="text-xs text-theme-5/70 mt-1">
              {dict.blog.updatedOn.replace('{date}', updatedDateStr)}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="text-xs uppercase tracking-wide bg-theme-1/10 text-secondary px-2 py-1 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        {/* `prose` styles moved from Tailwind Typography plugin (was 57KB
            in the global stylesheet) to a local CSS module loaded only on
            /blog/[slug]. See blog-prose.module.css for the rule set. */}
        <div
          className={`${styles.prose} max-w-none text-secondary`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <footer className="mt-16 pt-8 border-t border-theme-9 flex flex-wrap items-center justify-between gap-4">
        <TrackLink
          href={`/${lang}/contact`}
          event="cta_clicked"
          label="blog-detail-cta"
          className="inline-block text-sm font-bold uppercase tracking-widest bg-theme-1 text-secondary px-5 py-2.5 rounded-md shadow-[0_0_8px_rgba(255,102,0,0.3)] hover:shadow-[0_6px_16px_rgba(255,102,0,0.4)]"
        >
          {lang === 'es'
            ? '¿Quieres hablar? Agenda 30 min gratis'
            : lang === 'pt'
            ? 'Quer conversar? Agenda 30 min de graça'
            : 'Want to talk? Book a free 30-min call'}
          {' →'}
        </TrackLink>
        {/* Edit post — visible to anyone who knows the URL. The /edit page
            itself enforces auth via the same token system as /drafts. */}
        <a
          href={`/${lang}/blog/${slug}/edit`}
          className="text-xs uppercase tracking-widest text-theme-5/50 hover:text-theme-1 transition-colors font-mono"
          aria-label="Edit this post"
        >
          ✏ Edit post
        </a>
      </footer>

      {related.length > 0 ? (
        <section className="mt-16 pt-8 border-t border-theme-9" aria-labelledby="related-posts">
          <h2
            id="related-posts"
            className="text-xs uppercase tracking-widest text-accent font-bold mb-6"
          >
            {dict.blog.relatedPosts}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <TrackLink
                  href={r.href}
                  event="blog_post_clicked"
                  label={`blog-related-${r.slug}`}
                  className="block group"
                >
                  <p className="text-xs text-theme-5/70 mb-2">
                    <time dateTime={r.date}>
                      {new Date(r.date).toLocaleDateString(
                        lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' },
                      )}
                    </time>
                    {' · '}
                    {r.readingTime} min
                  </p>
                  <h3 className="font-heading text-base font-bold text-secondary group-hover:text-accent transition-colors leading-snug">
                    {r.title}
                  </h3>
                </TrackLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
