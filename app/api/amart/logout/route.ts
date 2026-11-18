import { NextResponse } from 'next/server';
import { clearAmArtSessionCookie } from '@/lib/amart-auth';

export async function POST() {
  const cookie = clearAmArtSessionCookie();
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}
