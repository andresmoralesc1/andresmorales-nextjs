import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { fetchMailcowEmailsForLead } from '@/lib/mailcow-inbox';

export async function GET(req: NextRequest) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email query param is required' }, { status: 400 });
  }

  const messages = await fetchMailcowEmailsForLead(email);
  return NextResponse.json({ ok: true, messages });
}
