/**
 * In-memory per-IP rate limiter, shared across API routes.
 *
 * The state lives in a single process — fine for the current single-instance
 * Next.js deploy. Restarting the server wipes the map (which is actually a
 * feature for a portfolio site: a deploy effectively resets abuse).
 *
 * For a multi-instance deploy, swap the Map for Redis / Upstash. The
 * public API (`checkRateLimit`, `bumpRateLimit`) wouldn't need to change.
 *
 * Each route uses its own bucket name so /api/brief and /api/contact
 * don't share a counter (one user filling out a brief shouldn't be
 * blocked from sending a separate contact message).
 */
import type { NextRequest } from 'next/server';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

type Bucket = Map<string, { count: number; resetAt: number }>;

// One bucket per route. Created lazily on first use.
const buckets = new Map<string, Bucket>();

function getBucket(route: string): Bucket {
  let b = buckets.get(route);
  if (!b) {
    b = new Map();
    buckets.set(route, b);
  }
  return b;
}

export function checkRateLimit(
  route: string,
  ip: string,
  max: number
): { allowed: boolean; retryInSec?: number } {
  const bucket = getBucket(route);
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry) return { allowed: true };
  if (now > entry.resetAt) {
    bucket.delete(ip);
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryInSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export function bumpRateLimit(route: string, ip: string): void {
  const bucket = getBucket(route);
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || now > entry.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

/**
 * Read the originating client IP, honoring common proxy headers set
 * by Caddy (`X-Forwarded-For`, `X-Real-IP`). Returns 'unknown' if
 * neither is present (e.g. direct localhost access without proxy).
 */
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
