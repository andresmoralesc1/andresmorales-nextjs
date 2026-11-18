import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { addLeadNote } from '@/lib/crm-store';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { leadId, text } = body;
  if (!leadId || !text) {
    return NextResponse.json({ error: 'leadId y text son requeridos' }, { status: 400 });
  }

  const lead = addLeadNote(leadId, text);
  if (!lead) {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}
