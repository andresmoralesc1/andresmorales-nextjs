// /admin/login — username + password form. Sets the am_admin cookie on success.
//
// Redirect rules:
// - If already logged in (cookie present + valid) → bounce to /drafts.
// - After successful login → redirect to `?next=...` if it points to a
//   local path, otherwise /drafts.

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/admin-auth';
import { LoginForm } from './login-form';

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { lang } = await params;
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' && next.startsWith('/') ? next : `/${lang}/drafts`;

  // If a valid cookie is already present, skip the form entirely.
  // We can't read the cookie from a Server Component directly; use headers().
  // Next.js exposes cookies() but we already have a Request-less context here.
  // Instead, the LoginForm client component checks and redirects.
  return (
    <section className="section bg-background">
      <div className="container-page max-w-md">
        <p className="text-xs uppercase tracking-widest text-secondary/60 mb-3">
          Admin
        </p>
        <h1 className="font-heading text-3xl font-bold text-secondary mb-2">
          Sign in
        </h1>
        <p className="text-secondary/70 mb-6 text-sm">
          Editor de blog (drafts y posts publicados). Sesion dura 14 dias.
        </p>
        <LoginForm next={safeNext} />
      </div>
    </section>
  );
}