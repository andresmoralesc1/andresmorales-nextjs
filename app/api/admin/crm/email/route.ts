import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sendMail } from '@/lib/email';
import { logSentEmail } from '@/lib/crm-store';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email-template';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { to, toName, subject, text, body: textBody, leadId } = body;
  const rawText = text || textBody;
  if (!to || !subject || !rawText) {
    return NextResponse.json({ error: 'to, subject y text son requeridos' }, { status: 400 });
  }

  try {
    const formattedHtml = buildBrandedEmailHtml({
      badge: '✉️ MENSAJE OFICIAL',
      title: subject,
      subtitle: toName ? `Destinatario: ${toName} (${to})` : `Destinatario: ${to}`,
      contentHtml: `<div style="font-size: 15px; color: #2B2520; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(rawText)}</div>`,
      ctaText: 'Agendar Llamada de 30 min',
      ctaUrl: 'https://calendar.app.google/QvUUb5xu4927P95a8',
      secondaryCtaText: '💬 Escribir por WhatsApp',
      secondaryCtaUrl: 'https://wa.me/573161482507',
      replyToEmail: 'info@andresmorales.com.co',
    });

    const result = await sendMail({
      to,
      toName,
      subject,
      text: rawText,
      html: formattedHtml,
      replyTo: 'info@andresmorales.com.co',
    });

    const logged = logSentEmail({
      leadId,
      to,
      toName,
      subject,
      body: rawText,
      status: 'sent',
    });

    return NextResponse.json({
      ok: true,
      success: true,
      messageId: result.messageId,
      log: logged,
    });
  } catch (err: any) {
    console.error('[crm-email] Error sending email via Mailcow:', err);
    logSentEmail({
      leadId,
      to,
      toName,
      subject,
      body: text,
      status: 'failed',
      error: err?.message || 'Error desconocido',
    });

    return NextResponse.json(
      { error: 'Error al enviar email a través de Mailcow: ' + (err?.message || 'Error') },
      { status: 500 }
    );
  }
}
