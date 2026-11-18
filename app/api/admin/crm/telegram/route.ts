import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCrmData } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { leadId, customNote } = body;
  if (!leadId) {
    return NextResponse.json({ error: 'leadId requerido' }, { status: 400 });
  }

  const data = getCrmData();
  const lead = data.leads.find((l) => l.id === leadId);
  if (!lead) {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
  }

  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const result = await sendTelegramNotification(
    `🔔 <b>Recordatorio de Lead CRM</b>\n\n` +
      `👤 <b>Cliente:</b> ${lead.name}\n` +
      `🏢 <b>Empresa:</b> ${lead.company || '—'}\n` +
      `🎯 <b>Servicio:</b> ${lead.service || '—'}\n` +
      `🔥 <b>Score:</b> ${lead.score === 'hot' ? '🔥 Alta Prioridad' : lead.score === 'warm' ? '⚡ Moderado' : '💡 Exploración'}\n` +
      (lead.followUpDate ? `📅 <b>Próximo Seguimiento:</b> ${lead.followUpDate}\n` : '') +
      (customNote ? `\n📝 <b>Nota:</b> ${customNote}\n` : '') +
      `\n👉 <a href="https://andresmorales.com.co/es/admin/crm">Abrir Dashboard CRM</a>`,
    {
      buttons: [
        [
          { text: '📊 Abrir CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
          ...(cleanPhone
            ? [
                {
                  text: '💬 WhatsApp',
                  url: `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}`,
                },
              ]
            : [{ text: '✉️ Email', url: `mailto:${lead.email}` }]),
        ],
      ],
    }
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Error al enviar a Telegram' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
