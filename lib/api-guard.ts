/**
 * Request body size guard for API routes.
 *
 * Reads Content-Length from the request and returns a 413 Response if the
 * body exceeds the limit. Skips the check when Content-Length is missing
 * (chunked encoding) — Next.js / the runtime will still cap bodies, and
 * streams with no length are rare for our form submissions.
 *
 * Usage in a route handler:
 *
 *   const tooBig = enforceBodySize(req, MAX_BODY_BYTES);
 *   if (tooBig) return tooBig;
 *   // ... continue with req.json() etc.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function enforceBodySize(
  req: NextRequest,
  maxBytes: number
): NextResponse | null {
  const len = req.headers.get('content-length');
  if (len && Number(len) > maxBytes) {
    return NextResponse.json(
      { error: 'Payload too large' },
      {
        status: 413,
        headers: { 'Content-Length-Limit': String(maxBytes) },
      }
    );
  }
  return null;
}
