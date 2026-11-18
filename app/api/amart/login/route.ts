import { NextResponse } from 'next/server';
import { checkAmArtCredentials, buildAmArtSessionCookie } from '@/lib/amart-auth';
import { rateLimitLogin } from '@/lib/admin-auth';

function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (!rateLimitLogin(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { username, password } = body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
  }

  if (!checkAmArtCredentials(username, password)) {
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ error: 'Credenciales inválidas para AmArt' }, { status: 401 });
  }

  const cookie = buildAmArtSessionCookie(username);
  return new NextResponse(
    JSON.stringify({ ok: true, username, app: 'amart' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    },
  );
}
