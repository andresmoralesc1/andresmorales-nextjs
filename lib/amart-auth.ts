// AmArt Auth — Dedicated session authentication for amart.andresmorales.com.co
// Independent from the main andresmorales.com.co admin cookie (am_admin)

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { signCookie, verifyCookie } from './cookie-signature';

const ADMIN_FILE = join(process.cwd(), 'data', 'admin.json');
export const AMART_COOKIE_NAME = 'amart_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

interface AdminRecord {
  username: string;
  passwordHash: string;
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

export function checkAmArtCredentials(username: string, password: string): boolean {
  const admin = loadAdmin();
  if (!admin) return false;
  if (username !== admin.username) {
    verifyPassword(password, 'scrypt$00$00');
    return false;
  }
  return verifyPassword(password, admin.passwordHash);
}

export function buildAmArtSessionCookie(username: string): string {
  const value = signCookie({ username, app: 'amart', iat: Date.now() });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AMART_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`;
}

export function clearAmArtSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AMART_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
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

export function getAmArtSession(req: Request): { username: string } | null {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const cookies = parseCookies(cookieHeader);
  const raw = cookies[AMART_COOKIE_NAME] || cookies['am_admin'];
  if (!raw) return null;
  const session = verifyCookie(raw);
  return session ? { username: session.username } : null;
}

export function requireAmArtAdmin(req: Request): Response | null {
  return getAmArtSession(req) ? null : new Response(JSON.stringify({ error: 'Unauthorized AmArt' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
