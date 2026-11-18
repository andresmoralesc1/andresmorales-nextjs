import { NextRequest, NextResponse } from 'next/server';
import { getProposalByToken, acceptProposal, getCrmData } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const proposal = getProposalByToken(token);

  if (!proposal) {
    return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, proposal });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const proposal = getProposalByToken(token);

  if (!proposal) {
    return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const accepted = acceptProposal(token, body.notes);
  if (!accepted) {
    return NextResponse.json({ error: 'No se pudo actualizar la propuesta' }, { status: 500 });
  }

  // Auto-promote to Active Client and Active Company
  try {
    syncLeadToBusiness({
      name: accepted.clientName,
      email: accepted.clientEmail,
      company: accepted.clientCompany,
      service: accepted.service,
      budget: accepted.investmentAmount,
      status: 'closed_won',
    });
  } catch (syncErr) {
    console.warn('[proposal/accept] Error syncing to business:', syncErr);
  }

  // Telegram alert to Andrés
  sendTelegramNotification(
    `🎉 <b>¡PROPUESTA ACEPTADA POR EL CLIENTE!</b>\n\n` +
      `👤 <b>Cliente:</b> ${accepted.clientName}\n` +
      `🏢 <b>Empresa:</b> ${accepted.clientCompany || '—'}\n` +
      `💰 <b>Inversión acordada:</b> ${accepted.investmentAmount}\n` +
      `📅 <b>Fecha:</b> ${new Date().toLocaleString('es-CO')}\n` +
      (body.notes ? `💬 <b>Nota del cliente:</b> ${body.notes}\n` : '') +
      `\n🚀 El estado en el CRM avanzó automáticamente a <b>En Desarrollo</b>.`,
    {
      buttons: [
        [
          { text: '📊 Ver en CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
          { text: '✉️ Redactar Email', url: `mailto:${accepted.clientEmail}` },
        ],
      ],
    }
  ).catch(() => {});

  // Trigger n8n proposal webhook if configured
  const data = getCrmData();
  const webhookUrl = data.automationSettings.n8nWebhookProposal;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'proposal_accepted',
        proposal: accepted,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, proposal: accepted });
}
