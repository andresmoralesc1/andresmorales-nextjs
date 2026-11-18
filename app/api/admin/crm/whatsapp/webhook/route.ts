import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getEvolutionWebhook, setEvolutionWebhook } from '@/lib/evolution';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const webhook = await getEvolutionWebhook();
  return NextResponse.json({ ok: true, webhook });
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Body optional
  }

  const url = body.url || 'https://andresmorales.com.co/api/webhooks/evolution';
  const enabled = body.enabled !== undefined ? Boolean(body.enabled) : true;

  const result = await setEvolutionWebhook({ url, enabled });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Error setting webhook' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
