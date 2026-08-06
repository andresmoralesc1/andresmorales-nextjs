// /[lang]/blog/[slug]/edit
//
// Admin-only post editor. Loads the 3 localized bodies for a slug (EN, ES,
// PT — missing locales are flagged as "missing" so the user knows what to
// create). Renders the client-side tabbed editor.

import { notFound } from 'next/navigation';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES } from '@/lib/i18n';
import { getPost, listAllPostSlugs } from '@/lib/blog';
import { requireServerAdmin } from '@/lib/admin-auth-server';
import { PostEditClient } from './edit-client';

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

export const dynamic = 'force-dynamic';

// We keep generateStaticParams so the page slug-set is known at build, but
// the page itself runs dynamically (gated by session).
export function generateStaticParams() {
  const slugs = listAllPostSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

interface LocaleBody {
  locale: 'en' | 'es' | 'pt';
  exists: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
  bodyMarkdown?: string;
}

async function loadLocaleBody(slug: string, locale: 'en' | 'es' | 'pt'): Promise<LocaleBody> {
  const localized = join(CONTENT_DIR, `${slug}.${locale}.md`);
  if (existsSync(localized)) {
    const raw = readFileSync(localized, 'utf-8');
    const fmMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
    if (fmMatch) {
      const [, fmBlock, bodyMd] = fmMatch;
      const meta: Record<string, string> = {};
      for (const line of fmBlock.split('\n')) {
        const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
        if (m) meta[m[1]] = m[2];
      }
      return {
        locale,
        exists: true,
        title: meta.title?.replace(/^["']|["']$/g, '') ?? '',
        description: meta.description?.replace(/^["']|["']$/g, '') ?? '',
        tags: (meta.tags ?? '[]')
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean),
        coverImage: meta.coverImage,
        bodyMarkdown: bodyMd.trim(),
      };
    }
  }
  return { locale, exists: false };
}

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!['en', 'es', 'pt'].includes(lang)) notFound();

  // Gate: redirect anonymous to login.
  const session = await requireServerAdmin(
    lang,
    `/${lang}/blog/${slug}/edit`,
  );

  // Verify the slug exists in at least one locale.
  const en = getPost(slug, 'en');
  const es = getPost(slug, 'es');
  const pt = getPost(slug, 'pt');
  if (!en && !es && !pt) notFound();

  const bodies = await Promise.all([
    loadLocaleBody(slug, 'en'),
    loadLocaleBody(slug, 'es'),
    loadLocaleBody(slug, 'pt'),
  ]);

  const editHref = `/${lang}/blog/${slug}/edit`;

  return (
    <section className="section bg-background">
      <div className="container-page max-w-5xl">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-secondary/60">
            Editor
          </p>
          <form action="/api/admin/logout" method="post" className="text-xs">
            <button
              type="submit"
              className="text-theme-5/50 hover:text-theme-1 font-mono uppercase tracking-widest"
              aria-label={`Sign out ${session.username}`}
            >
              ↪ Sign out ({session.username})
            </button>
          </form>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-2 leading-tight">
          Edit post: <span className="text-theme-1">{slug}</span>
        </h1>
        <p className="text-secondary/80 mb-2">
          {bodies.filter((b) => b.exists).length} of 3 languages have a body
          for this slug. Edits save independently per language; a rebuild is
          required for the live site to reflect the changes.
        </p>
        <p className="text-sm text-theme-5/60 mb-8 font-mono">
          content/blog/{slug}.&lt;lang&gt;.md
        </p>
        <PostEditClient
          slug={slug}
          initialBodies={bodies}
          isAuthenticated={!!session}
        />
      </div>
    </section>
  );
}
