import { getCurrentDictionary } from '@/lib/dictionary';
import type { Locale } from '@/lib/i18n';
import { listPosts } from '@/lib/blog';
import { TrackLink } from '@/components/track';
import { Reveal } from '@/components/reveal';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }, { lang: 'pt' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getCurrentDictionary();
  const m = dict.metadata;
  return {
    title: m.blogTitle,
    description: m.blogDescription,
    alternates: {
      // EN has no locale prefix (served at /blog), ES/PT add it.
      // Matches the URL the user sees in the address bar so Google
      // doesn't dedupe /blog against /en/blog as duplicate content.
      canonical: lang === 'en' ? '/blog' : `/${lang}/blog`,
      languages: {
        en: '/blog',
        es: '/es/blog',
        pt: '/pt/blog',
      },
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const posts = listPosts(lang);
  const dict = await getCurrentDictionary();
  const m = dict.metadata;

  return (
    <main className="container-page py-16 min-h-[60vh]">
      <header className="max-w-3xl mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-3">
          {m.blogH1}
        </h1>
        <p className="text-lg text-theme-5">{m.blogIntro}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-theme-5 italic">{m.blogEmpty}</p>
      ) : (
        <Reveal as="ul" stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="border border-theme-9 rounded-lg p-6 hover:border-theme-1 transition-colors bg-theme-3"
            >
              <TrackLink
                href={p.href}
                event="blog_post_clicked"
                label={`blog-index-${p.slug}`}
                className="block group"
              >
                {p.coverImage && (
                  <div className="relative -mx-6 -mt-6 mb-4 aspect-[16/9] overflow-hidden rounded-t-lg bg-theme-1/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.coverImage}
                      alt={p.coverImageAlt ?? ''}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString(
                      lang === 'es'
                        ? 'es-CO'
                        : lang === 'pt'
                        ? 'pt-BR'
                        : 'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
                  </time>
                  {' · '}
                  {p.readingTime} min
                </p>
                <h2 className="font-heading text-xl font-bold text-secondary group-hover:text-accent transition-colors mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-theme-5 leading-relaxed mb-3">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-xs uppercase tracking-wide bg-theme-1/10 text-accent px-2 py-1 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </TrackLink>
            </li>
          ))}
        </Reveal>
      )}
    </main>
  );
}