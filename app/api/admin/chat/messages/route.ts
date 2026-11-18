import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getEvolutionMessages } from '@/lib/evolution';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const jid = url.searchParams.get('jid');

  if (!jid) {
    return NextResponse.json({ ok: false, error: 'Parámetro jid requerido' }, { status: 400 });
  }

  try {
    const messages = await getEvolutionMessages(jid);
    return NextResponse.json({
      ok: true,
      remoteJid: jid,
      messages,
    });
  } catch (err: any) {
    console.error('[API /api/admin/chat/messages] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}
