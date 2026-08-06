// Cookie sign/verify — shared between the API (Request headers) and the
// Server Component path (Next's cookies() store).

import { createHmac } from 'node:crypto';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days, kept in sync with admin-auth.ts

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error('ADMIN_COOKIE_SECRET missing or too short.');
  }
  return s;
}

export function signCookie(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyCookie(value: string): { username: string; iat: number } | null {
  const i = value.indexOf('.');
  if (i < 0) return null;
  const body = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  if (sig.length !== expected.length) return null;
  // Constant-time compare
  let mismatch = 0;
  for (let k = 0; k < expected.length; k++) {
    mismatch |= expected.charCodeAt(k) ^ sig.charCodeAt(k);
  }
  if (mismatch !== 0) return null;
  try {
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (typeof decoded?.username !== 'string' || typeof decoded?.iat !== 'number') return null;
    const ageMs = Date.now() - decoded.iat;
    if (ageMs > COOKIE_MAX_AGE * 1000) return null;
    return decoded;
  } catch {
    return null;
  }
}