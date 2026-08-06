// Server-side session helpers. Read the am_admin cookie from a Server
// Component or Server Action via Next's `cookies()` API.
//
// The verification + signature checks live in lib/admin-auth.ts so the
// same logic can run on a Node `Request` (used by API routes) and on
// the cookies() store (used by Server Components).

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCookie as verifyRawCookie } from './cookie-signature';

export const ADMIN_COOKIE_NAME = 'am_admin';

export async function getServerSession(): Promise<{ username: string } | null> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifyRawCookie(raw);
}

/** Server-side gate. Redirects to /<lang>/admin/login if not authed. */
export async function requireServerAdmin(lang: string, next?: string): Promise<{ username: string }> {
  const session = await getServerSession();
  if (!session) {
    const target = next
      ? `/${lang}/admin/login?next=${encodeURIComponent(next)}`
      : `/${lang}/admin/login`;
    redirect(target);
  }
  return session;
}