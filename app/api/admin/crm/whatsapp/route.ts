import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getEvolutionStatus, sendWhatsAppMessage } from '@/lib/evolution';
import { addLeadNote } from '@/lib/crm-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const status = await getEvolutionStatus();
  return NextResponse.json({ ok: true, status });
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { number, text, leadId } = body;
  if (!number || !text) {
    return NextResponse.json({ error: 'Número y texto son requeridos' }, { status: 400 });
  }

  const result = await sendWhatsAppMessage({ number, text });
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Fallo al enviar mensaje' }, { status: 500 });
  }

  // If leadId provided, log the outgoing WhatsApp note
  if (leadId) {
    try {
      addLeadNote(
        leadId,
        `💬 WhatsApp enviado vía Evolution API: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`
      );
    } catch (noteErr) {
      console.warn('Failed to add timeline note for WhatsApp send:', noteErr);
    }
  }

  return NextResponse.json({ ok: true, data: result.data });
}
