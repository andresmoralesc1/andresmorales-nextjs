// POST /api/admin/login
// Body: { username, password }
// Returns 200 + Set-Cookie if credentials match; 401 otherwise.
// Rate-limited: 5 attempts / 15 min per IP.

import { NextResponse } from 'next/server';
import { checkCredentials, buildSessionCookie, rateLimitLogin } from '@/lib/admin-auth';

function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (!rateLimitLogin(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { username, password } = body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 });
  }

  if (!checkCredentials(username, password)) {
    // Constant-time-ish: always issue a comparable response time
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const cookie = buildSessionCookie(username);
  return new NextResponse(
    JSON.stringify({ ok: true, username }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    },
  );
}