import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCrmData, updateProposal, addLeadNote, logSentEmail } from '@/lib/crm-store';
import { sendMail } from '@/lib/email';
import { sendWhatsAppMessage } from '@/lib/evolution';
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

  const { proposalId, sendEmail = true, sendWhatsApp = true, locale = 'es' } = body;
  if (!proposalId) {
    return NextResponse.json({ error: 'proposalId es requerido' }, { status: 400 });
  }

  const data = getCrmData();
  const proposal = data.proposals.find((p) => p.id === proposalId);
  if (!proposal) {
    return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 });
  }

  const lead = data.leads.find((l) => l.id === proposal.leadId);
  const proposalUrl = `https://andresmorales.com.co/${locale}/p/${proposal.token}`;
  const firstName = proposal.clientName.split(' ')[0] || proposal.clientName;

  const results: { email?: any; whatsapp?: any } = {};

  // 1. Send via Mailcow
  if (sendEmail && proposal.clientEmail) {
    const subject = `Propuesta Técnica & Comercial: ${proposal.title} | Andrés Morales`;
    const text = `Hola ${firstName},\n\nUn gusto saludarte. He preparado la propuesta interactiva detallada para tu proyecto:\n\n👉 Enlace privado: ${proposalUrl}\n\nEn la página podrás consultar el diagnóstico, el cronograma de entregables por fases y los términos de inversión acordados.\n\nPuedes revisarla y aceptarla directamente en la plataforma cuando desees.\n\nQuedo a tu total disposición para cualquier consulta.\n\nUn saludo cordial,\nAndrés Morales\nhttps://andresmorales.com.co`;

    const html = buildBrandedEmailHtml({
      badge: '📑 PROPUESTA TÉCNICA & COMERCIAL',
      title: proposal.title,
      subtitle: `Preparada especialmente para ${proposal.clientName} (${proposal.clientCompany || 'Proyecto Digital'})`,
      contentHtml: `
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #2B2520;">Hola <strong>${escapeHtml(firstName)}</strong>,</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #4A423D; line-height: 1.65;">
          He preparado la propuesta interactiva detallada con el diagnóstico técnico, las fases de desarrollo y los entregables de tu proyecto.
        </p>
        <p style="margin: 0; font-size: 14px; color: #4A423D; line-height: 1.65;">
          En la plataforma privada podrás revisar el desglose por semanas, los términos comerciales y confirmar la propuesta de forma 100% digital.
        </p>
      `,
      tableRows: [
        { label: 'Cliente', value: proposal.clientName },
        { label: 'Empresa', value: proposal.clientCompany || '—' },
        { label: 'Inversión Total', value: proposal.investmentAmount },
        {
          label: 'Fases / Entregables',
          value: proposal.deliverables?.length ? `${proposal.deliverables.length} etapas estructuradas` : 'Detalladas en el enlace',
        },
      ],
      ctaText: 'Ver Propuesta Interactiva',
      ctaUrl: proposalUrl,
      secondaryCtaText: '💬 Resolver dudas por WhatsApp',
      secondaryCtaUrl: 'https://wa.me/573161482507',
      replyToEmail: 'info@andresmorales.com.co',
      footerNote: 'Este enlace privado es único e intransferible para la revisión formal de la propuesta.',
    });

    try {
      const emailRes = await sendMail({
        to: proposal.clientEmail,
        toName: proposal.clientName,
        subject,
        text,
        html,
        replyTo: 'info@andresmorales.com.co',
      });

      logSentEmail({
        leadId: proposal.leadId,
        to: proposal.clientEmail,
        toName: proposal.clientName,
        subject,
        body: text,
        status: 'sent',
      });

      results.email = { ok: true, messageId: emailRes.messageId };
      if (lead) {
        addLeadNote(lead.id, `✉️ Propuesta interactiva enviada por correo Mailcow a ${proposal.clientEmail}`);
      }
    } catch (err: any) {
      console.error('[proposals-send] Email error:', err);
      results.email = { ok: false, error: err?.message || 'Error al enviar email' };
    }
  }

  // 2. Send via WhatsApp
  const phone = lead?.phone || '';
  if (sendWhatsApp && phone) {
    const waText = `¡Hola ${firstName}! 👋 Andrés Morales por aquí.\n\nYa tengo lista la propuesta técnica y comercial para tu proyecto *"${proposal.title}"*.\n\nPuedes revisarla en detalle, ver las etapas y confirmarla de forma interactiva en este enlace privado:\n👉 ${proposalUrl}\n\nQuedo súper atento si tienes cualquier duda técnica o de alcance.`;

    try {
      const waRes = await sendWhatsAppMessage({ number: phone, text: waText });
      results.whatsapp = waRes;
      if (waRes.ok && lead) {
        addLeadNote(lead.id, `💬 Propuesta interactiva enviada por WhatsApp a ${phone}`);
      }
    } catch (err: any) {
      console.error('[proposals-send] WhatsApp error:', err);
      results.whatsapp = { ok: false, error: err?.message || 'Error al enviar WhatsApp' };
    }
  }

  // Update proposal status to 'sent'
  const updatedProposal = updateProposal(proposal.id, { status: 'sent' });

  return NextResponse.json({
    ok: true,
    proposal: updatedProposal,
    results,
  });
}
