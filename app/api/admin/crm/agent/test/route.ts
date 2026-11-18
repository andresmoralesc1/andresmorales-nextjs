import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { generateAgentReply } from '@/lib/ai-agent';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const { message, prompt, customerName, recentHistory, crmContext } = body;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ ok: false, error: 'Ingresa un mensaje para probar' }, { status: 400 });
  }

  try {
    const result = await generateAgentReply({
      customerName: customerName || 'Cliente de Prueba',
      customerPhone: '+57 300 000 0000',
      incomingMessage: message.trim(),
      recentHistory: Array.isArray(recentHistory) ? recentHistory : undefined,
      crmContext: crmContext || undefined,
      customPrompt: prompt || undefined,
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      wantsHuman: result.wantsHuman,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    });
  } catch (err: any) {
    console.error('[API /api/admin/crm/agent/test] Error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Error al ejecutar agente' }, { status: 500 });
  }
}
