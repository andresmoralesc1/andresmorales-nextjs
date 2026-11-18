import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getCrmData,
  createProposal,
  updateProposal,
  deleteProposal,
  type Proposal,
} from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const data = getCrmData();
  return NextResponse.json({
    ok: true,
    proposals: data.proposals || [],
  });
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

  const { leadId, clientName, clientEmail } = body;
  if (!leadId || !clientName || !clientEmail) {
    return NextResponse.json(
      { error: 'leadId, clientName y clientEmail son requeridos' },
      { status: 400 }
    );
  }

  const proposal = createProposal(body);

  // Send an alert to Telegram about proposal creation
  sendTelegramNotification(
    `📑 <b>Nueva Propuesta Creada</b>\n\n` +
      `👤 <b>Cliente:</b> ${proposal.clientName}\n` +
      `🏢 <b>Empresa:</b> ${proposal.clientCompany || '—'}\n` +
      `💰 <b>Inversión:</b> ${proposal.investmentAmount}\n` +
      `🔗 <b>Enlace Privado:</b> https://andresmorales.com.co/es/p/${proposal.token}`,
    {
      buttons: [
        [
          {
            text: '👁️ Ver Propuesta Online',
            url: `https://andresmorales.com.co/es/p/${proposal.token}`,
          },
        ],
      ],
    }
  ).catch(() => {});

  return NextResponse.json({ ok: true, proposal });
}

export async function PATCH(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID de propuesta requerido' }, { status: 400 });
  }

  const updated = updateProposal(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, proposal: updated });
}

export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID de propuesta requerido' }, { status: 400 });
  }

  const deleted = deleteProposal(id);
  return NextResponse.json({ ok: deleted });
}
