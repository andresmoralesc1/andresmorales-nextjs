// Admin auth — username + password with scrypt hash + signed cookie session.
//
// Design choices:
// - scrypt over bcrypt: built-in to node:crypto, no extra dep, equally secure
//   with sane parameters. We use N=16384 (default) and 64-byte derived key.
// - Cookie is signed (HMAC-SHA256) but NOT encrypted — it only contains the
//   username + issued-at. Sign/verify logic lives in ./cookie-signature so
//   Server Components can reuse it without re-implementing.
// - Session secret is read from ADMIN_COOKIE_SECRET. Cookie name is
//   `am_admin` and marked HttpOnly + SameSite=Lax + Secure-in-prod.
// - No JWT lib. Just a JSON payload + HMAC. Keeps the bundle lean.
//
// What this gates:
// - /drafts and /drafts/[lang]/[slug]
// - /blog/[slug]/edit
// - All /api/drafts/* and /api/posts/* write operations
//
// To rotate the cookie secret (kills all sessions at once):
//   1. Change ADMIN_COOKIE_SECRET in .env.local
//   2. `sudo systemctl restart andresmorales-nextjs.service`
//
// To rotate the admin password:
//   `node scripts/admin-reset.cjs <new-password>`

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { signCookie, verifyCookie } from './cookie-signature';

const ADMIN_FILE = join(process.cwd(), 'data', 'admin.json');
const COOKIE_NAME = 'am_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

interface AdminRecord {
  username: string;
  passwordHash: string; // "scrypt$<salt-hex>$<derived-hex>"
  createdAt: string;
}

function loadAdmin(): AdminRecord | null {
  if (!existsSync(ADMIN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(ADMIN_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Returns true if username+password match the record. */
export function checkCredentials(username: string, password: string): boolean {
  const admin = loadAdmin();
  if (!admin) return false;
  if (username !== admin.username) {
    verifyPassword(password, 'scrypt$00$00');
    return false;
  }
  return verifyPassword(password, admin.passwordHash);
}

/** Build a Set-Cookie header value for the admin session. */
export function buildSessionCookie(username: string): string {
  const value = signCookie({ username, iat: Date.now() });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`;
}

/** Build a Set-Cookie header that clears the session. */
export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

/** Returns the authenticated admin from a Request's Cookie header, or null. */
export function getSession(req: Request): { username: string } | null {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const cookies = parseCookies(cookieHeader);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return null;
  const session = verifyCookie(raw);
  return session ? { username: session.username } : null;
}

/** Returns a Response if the request is unauthenticated, else null. */
export function requireAdmin(req: Request): Response | null {
  return getSession(req) ? null : unauthorizedResponse();
}

/** Helper for API routes: returns a 401 JSON response. */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseCookies(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

/**
 * Lightweight in-memory rate limiter for the login endpoint.
 * 5 attempts per IP per 15 minutes. Resets on process restart — fine for
 * a single-user admin panel.
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
export function rateLimitLogin(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const rec = loginAttempts.get(ip);
  if (!rec || rec.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (rec.count >= 5) return false;
  rec.count += 1;
  return true;
}
