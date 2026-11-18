import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getEvolutionStatus,
  getEvolutionChats,
  sendWhatsAppMessage,
  formatWhatsAppNumber,
} from '@/lib/evolution';
import { getCrmData, addLeadNote, updateAutomationSettings } from '@/lib/crm-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  try {
    const [status, chats, crmData] = await Promise.all([
      getEvolutionStatus(),
      getEvolutionChats(),
      Promise.resolve(getCrmData()),
    ]);

    // Cross-reference with CRM leads
    const leads = crmData?.leads || [];

    const enrichedChats = chats.map((chat) => {
      const chatDigits = chat.phone.replace(/\D/g, '');
      const matchedLead = leads.find((l) => {
        if (!l.phone) return false;
        const leadDigits = l.phone.replace(/\D/g, '');
        if (!leadDigits || !chatDigits) return false;
        return (
          chatDigits === leadDigits ||
          chatDigits.endsWith(leadDigits) ||
          leadDigits.endsWith(chatDigits)
        );
      });

      return {
        ...chat,
        lead: matchedLead
          ? {
              id: matchedLead.id,
              name: matchedLead.name,
              status: matchedLead.status,
              score: matchedLead.score,
              service: matchedLead.service,
            }
          : null,
      };
    });

    return NextResponse.json({
      ok: true,
      status,
      chats: enrichedChats,
      settings: crmData?.automationSettings || {},
    });
  } catch (err: any) {
    console.error('[API /api/admin/chat GET] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error al obtener chats de Evolution API' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const { remoteJid, phone, text, leadId } = body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ ok: false, error: 'El mensaje no puede estar vacío' }, { status: 400 });
  }

  const isLid = Boolean(remoteJid && remoteJid.includes('@lid'));
  const targetNumber = isLid
    ? remoteJid
    : (phone || (remoteJid ? remoteJid.replace(/@.*$/, '') : ''));

  if (!targetNumber) {
    return NextResponse.json(
      { ok: false, error: 'Se requiere número o remoteJid de WhatsApp' },
      { status: 400 }
    );
  }

  try {
    const res = await sendWhatsAppMessage({
      number: targetNumber,
      remoteJid,
      text: text.trim(),
    });

    if (!res.ok) {
      const errMsg = typeof res.error === 'string' ? res.error : JSON.stringify(res.error);
      return NextResponse.json({ ok: false, error: errMsg || 'Fallo al enviar mensaje' }, { status: 502 });
    }

    // If associated with a lead, record in lead notes timeline
    try {
      const crmData = getCrmData();
      let targetLeadId = leadId;

      if (!targetLeadId) {
        const cleanDigits = targetNumber.replace(/\D/g, '');
        const matched = crmData.leads.find((l) => {
          if (!l.phone) return false;
          const leadDigits = l.phone.replace(/\D/g, '');
          return leadDigits && (cleanDigits === leadDigits || cleanDigits.endsWith(leadDigits) || leadDigits.endsWith(cleanDigits));
        });
        if (matched) targetLeadId = matched.id;
      }

      if (targetLeadId) {
        addLeadNote(
          targetLeadId,
          `[WhatsApp Enviado desde Admin]: ${text.trim()}`
        );
      }

      // Automatically mute the bot for this chat so Andres can take over smoothly
      const currentMuted = crmData.automationSettings?.mutedJids || [];
      const jidToMute = remoteJid || targetNumber;
      const cleanDigits = targetNumber.replace(/\D/g, '');
      if (!currentMuted.includes(jidToMute) || (cleanDigits && !currentMuted.includes(cleanDigits))) {
        updateAutomationSettings({
          mutedJids: Array.from(new Set([...currentMuted, jidToMute, cleanDigits].filter(Boolean))),
        });
      }
    } catch (noteErr) {
      console.error('[API /api/admin/chat POST] Error appending CRM note:', noteErr);
    }

    return NextResponse.json({
      ok: true,
      sentAt: new Date().toISOString(),
      data: res.data,
    });
  } catch (err: any) {
    console.error('[API /api/admin/chat POST] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error al enviar por Evolution API' },
      { status: 500 }
    );
  }
}
