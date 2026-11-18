// Server-side session verification for AmArt (amart.andresmorales.com.co)

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyCookie as verifyRawCookie } from './cookie-signature';
import { AMART_COOKIE_NAME } from './amart-auth';

export async function getAmArtServerSession(): Promise<{ username: string } | null> {
  const store = await cookies();
  const raw = store.get(AMART_COOKIE_NAME)?.value || store.get('am_admin')?.value;
  if (!raw) return null;
  return verifyRawCookie(raw);
}

export async function requireServerAmArtAdmin(next?: string): Promise<{ username: string }> {
  const session = await getAmArtServerSession();
  if (!session) {
    const target = next
      ? `/admin/login?next=${encodeURIComponent(next)}`
      : `/admin/login`;
    redirect(target);
  }
  return session;
}
