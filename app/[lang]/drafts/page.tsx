// Drafts queue — gated behind admin session.
//
// Generates params at build time only for the slug-less `/drafts` index;
// individual `/drafts/[lang]/[slug]` pages are still static via a separate
// route. The actual gating happens in the server component below: anonymous
// visitors are redirected to /admin/login.

import { listDrafts } from '@/lib/blog';
import { getCurrentDictionary } from '@/lib/dictionary';
import { LOCALES } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { DraftsClient } from './drafts-client';
import { requireServerAdmin } from '@/lib/admin-auth-server';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamic = 'force-dynamic';

// Drafts queue — admin-only, redirect-to-login for anonymous. Defense in
// depth: also noindex/nofollow + self-canonical so even if a crawler
// follows a stale shared URL it can't surface in search results and
// Google doesn't inherit the homepage canonical from the login redirect
// destination.
export const metadata = {
  alternates: {
    canonical: '/drafts',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function DraftsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Gate: redirects to /admin/login if no session. Pass `next` so the
  // login form bounces back here after successful sign-in.
  const session = await requireServerAdmin(lang, `/${lang}/drafts`);

  // Restrict locale to known set — invalid langs are redirected away by
  // Next's middleware, but the type narrowing here keeps the client prop safe.
  const locale: Locale = (["en", "es", "pt"].includes(lang) ? lang : "en") as Locale;
  const drafts = listDrafts();
  const dict = await getCurrentDictionary();

  return (
    <section className="section bg-background">
      <div className="container-page max-w-4xl">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs uppercase tracking-widest text-secondary/60">
            {dict.metadata.blogTitle?.split(' ')[0] ?? 'Pipeline'}
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
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-3 leading-tight">
          {dict.metadata.blogTitle ?? 'Borradores pendientes'}
        </h1>
        <p className="text-secondary/80 mb-10">
          {dict.metadata.blogDescription ??
            'Posts generados por la pipeline de noticias. Apruébalos para publicarlos, o descártalos para borrarlos.'}
        </p>
        <DraftsClient initialDrafts={drafts} locale={locale} />
      </div>
    </section>
  );
}
