import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCrmData, updateAutomationSettings } from '@/lib/crm-store';

export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  try {
    const body = await req.json();
    const updated = updateAutomationSettings(body.settings || body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al guardar' }, { status: 400 });
  }
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

  const { webhookUrl, event, leadId, customPayload } = body;
  const data = getCrmData();
  const lead = leadId ? data.leads.find((l) => l.id === leadId) : null;

  const targetUrl = webhookUrl || data.automationSettings?.n8nWebhookLead;
  if (!targetUrl) {
    return NextResponse.json({ error: 'No se configuró URL de Webhook para n8n' }, { status: 400 });
  }

  try {
    const payload = {
      event: event || 'crm_action_triggered',
      lead,
      custom: customPayload || {},
      triggeredAt: new Date().toISOString(),
      source: 'andresmorales_crm',
    };

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AndresMorales-CRM/1.0',
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      response: text.slice(0, 500),
    });
  } catch (err: any) {
    console.error('[crm-trigger] Webhook trigger error:', err);
    return NextResponse.json(
      { error: 'Error al contactar n8n: ' + (err?.message || 'Error de conexión') },
      { status: 502 }
    );
  }
}
