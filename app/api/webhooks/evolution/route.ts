import { NextRequest, NextResponse } from 'next/server';
import { getCrmData, createLead, addLeadNote, updateLead, updateAutomationSettings } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendWhatsAppMessage, sendWhatsAppPresence, recentAppSends, getMediaBase64, transcribeAudioMessage } from '@/lib/evolution';
import { generateAgentReply, getCleanGreeting, detectBotOrLoop } from '@/lib/ai-agent';
import { inspectWebsite } from '@/lib/prospect-auditor';
import { getUpcomingAvailableSlotsSummary } from '@/lib/google-calendar';

function extractWebsiteUrl(text: string): string | null {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?)/i);
  if (!match) return null;
  const raw = match[0].replace(/[.,;:!?)]+$/, '');
  const lower = raw.toLowerCase();
  if (
    lower.includes('andresmorales.com.co') ||
    lower.includes('calendar.app.google') ||
    lower.includes('google.com') ||
    lower.includes('wa.me') ||
    lower.includes('whatsapp.com') ||
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('tiktok.com') ||
    lower.includes('linkedin.com') ||
    lower.includes('youtube.com') ||
    lower.includes('t.me')
  ) {
    return null;
  }
  return raw;
}

function isAskingForAvailability(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('horario') ||
    t.includes('disponibilidad') ||
    t.includes('cuando podemos') ||
    t.includes('cuándo podemos') ||
    t.includes('que dia') ||
    t.includes('qué día') ||
    t.includes('reunirnos') ||
    t.includes('llamada') ||
    t.includes('cita') ||
    t.includes('agendar') ||
    t.includes('agenda') ||
    t.includes('tiempo el') ||
    t.includes('libre el')
  );
}

// In-memory debounced message batching to concatenate rapid-fire WhatsApp messages
interface PendingMessageBatch {
  remoteJid: string;
  remoteJidAlt: string;
  isLid: boolean;
  rawNumber: string;
  pushName: string;
  formattedPhone: string;
  targetLeadId: string;
  texts: string[];
  firstReceivedAt: number;
  timer: NodeJS.Timeout;
}

const pendingBatches = new Map<string, PendingMessageBatch>();
const DEBOUNCE_DELAY_MS = 5000; // Wait 5 seconds of silence before answering
const MAX_BATCH_WINDOW_MS = 15000; // Force answer after 15s max even if user keeps sending

function extractIncomingText(messageObj: any, data: any): string {
  let m = messageObj || {};
  if (m.ephemeralMessage?.message) m = m.ephemeralMessage.message;
  if (m.viewOnceMessage?.message) m = m.viewOnceMessage.message;
  if (m.viewOnceMessageV2?.message) m = m.viewOnceMessageV2.message;
  if (m.documentWithCaptionMessage?.message) m = m.documentWithCaptionMessage.message;

  if (typeof m.conversation === 'string' && m.conversation.trim()) {
    return m.conversation.trim();
  }
  if (typeof m.extendedTextMessage?.text === 'string' && m.extendedTextMessage.text.trim()) {
    return m.extendedTextMessage.text.trim();
  }
  if (typeof m.buttonsResponseMessage?.selectedDisplayText === 'string') {
    return m.buttonsResponseMessage.selectedDisplayText.trim();
  }
  if (typeof m.listResponseMessage?.title === 'string') {
    return m.listResponseMessage.title.trim();
  }
  if (typeof m.templateButtonReplyMessage?.selectedDisplayText === 'string') {
    return m.templateButtonReplyMessage.selectedDisplayText.trim();
  }
  if (typeof m.imageMessage?.caption === 'string' && m.imageMessage.caption.trim()) {
    return `[Imagen]: ${m.imageMessage.caption.trim()}`;
  }
  if (m.imageMessage) {
    return '[Imagen enviada]';
  }
  if (m.audioMessage) {
    return '[Nota de voz de WhatsApp]';
  }
  if (m.documentMessage) {
    const fn = m.documentMessage.fileName || 'archivo';
    const cap = m.documentMessage.caption ? ` - ${m.documentMessage.caption}` : '';
    return `[Documento]: ${fn}${cap}`;
  }
  if (data?.messageType) {
    return `[Mensaje de tipo ${data.messageType}]`;
  }
  return 'Nuevo contacto iniciado por WhatsApp';
}

async function processBatchedMessages(batch: PendingMessageBatch) {
  try {
    const crmData = getCrmData();
    const existingLead = crmData.leads.find((l) => l.id === batch.targetLeadId);

    // Double check if muted in the meantime (e.g. by manual message from phone)
    const mutedJids: string[] = crmData.automationSettings?.mutedJids || [];
    const isContactMuted =
      mutedJids.includes(batch.remoteJid) ||
      mutedJids.includes(batch.rawNumber) ||
      Boolean(existingLead?.phone && mutedJids.includes(existingLead.phone.replace(/\D/g, '')));

    if (isContactMuted) return;

    // Combine all received texts into one unified message
    const combinedText = batch.texts.join('\n');

    // 1. Circuit Breaker: Safety cap on consecutive automated bot replies without human interaction
    const allNotes = existingLead?.notes || [];
    let consecutiveBotReplies = 0;
    for (let i = allNotes.length - 1; i >= 0; i--) {
      const noteText = allNotes[i].text || '';
      if (noteText.startsWith('🤖 Agente IA')) {
        consecutiveBotReplies++;
      } else if (
        noteText.startsWith('💬 Andrés (desde WhatsApp Móvil)') ||
        noteText.startsWith('[WhatsApp Enviado desde Admin]')
      ) {
        break;
      }
    }

    if (consecutiveBotReplies >= 7) {
      updateAutomationSettings({
        mutedJids: Array.from(new Set([...mutedJids, batch.remoteJid, batch.rawNumber])),
      });
      addLeadNote(
        batch.targetLeadId,
        '🛑 Pausa de seguridad: Se alcanzaron 7 respuestas automáticas consecutivas sin intervención humana. Se silencia el agente para que Andrés continúe.'
      );
      sendTelegramNotification(
        `⚠️ <b>Chat con alta interacción en WhatsApp</b>\n\n` +
          `👤 <b>Cliente:</b> ${batch.pushName}\n` +
          `📱 <b>Teléfono:</b> ${batch.formattedPhone}\n` +
          `💬 <b>Último mensaje recibido:</b>\n"${combinedText}"\n\n` +
          `<i>El bot se pausó automáticamente tras 7 respuestas para que continúes tú personalmente.</i>`,
        {
          buttons: [
            [
              { text: '💬 Abrir Chat de WhatsApp', url: `https://wa.me/${batch.rawNumber}` },
              { text: '📂 Abrir CRM', url: `https://andresmorales.com.co/es/admin/crm` },
            ],
          ],
        }
      ).catch(() => null);
      return;
    }

    // 2. Check Bot / Loop detection on combined text & history
    const recentIncoming = allNotes
      .filter((n) => (n.text || '').startsWith('💬 WhatsApp recibido:'))
      .map((n) => (n.text || '').replace(/^💬 WhatsApp recibido:\s*/, '').replace(/^"|"$/g, ''));

    const botCheck = detectBotOrLoop(combinedText, recentIncoming);
    if (botCheck.isBot) {
      updateAutomationSettings({
        mutedJids: Array.from(new Set([...mutedJids, batch.remoteJid, batch.rawNumber])),
      });
      addLeadNote(
        batch.targetLeadId,
        `🤖⛔ Loop de bot detectado (${botCheck.reason}). Se silencia la respuesta automática.`
      );
      sendTelegramNotification(
        `🤖 <b>Bot / Loop detectado en WhatsApp</b>\n\n` +
          `👤 <b>Línea:</b> ${batch.pushName} (${batch.formattedPhone})\n` +
          `⚠️ <b>Causa:</b> ${botCheck.reason}\n` +
          `💬 <b>Mensaje recibido:</b> "${combinedText.substring(0, 150)}"\n\n` +
          `<i>Se silenció automáticamente el agente para evitar un bucle de respuestas.</i>`
      ).catch(() => null);
      return;
    }

    // 3. Extract up to 12 conversation turns for LLM context
    const conversationTurns: string[] = [];
    const advisorNotes: string[] = [];

    for (const n of allNotes) {
      const t = n.text || '';
      if (t.startsWith('💬 WhatsApp recibido:')) {
        const cleanText = t.replace(/^💬 WhatsApp recibido:\s*/, '').replace(/^"|"$/g, '');
        conversationTurns.push(`Cliente: "${cleanText}"`);
      } else if (t.startsWith('🤖 Agente IA')) {
        const cleanText = t.replace(/^🤖 Agente IA.*:\s*/, '').replace(/^"|"$/g, '');
        conversationTurns.push(`Asistente: "${cleanText}"`);
      } else if (t.startsWith('[WhatsApp Enviado desde Admin]:') || t.startsWith('💬 Andrés')) {
        const cleanText = t.replace(/^(\[WhatsApp Enviado desde Admin\]|💬 Andrés.*):\s*/, '').replace(/^"|"$/g, '');
        conversationTurns.push(`Andrés (Asesor): "${cleanText}"`);
      } else if (t.trim()) {
        advisorNotes.push(t.trim());
      }
    }

    const recentHistory = conversationTurns.slice(-12);

    // 4. Extract Brief Web & CRM Context
    const brief = existingLead?.briefData || {};
    const briefParts: string[] = [];

    if (brief.projectType || brief.tipoProyecto || brief.service) {
      briefParts.push(`Tipo: ${brief.projectType || brief.tipoProyecto || brief.service}`);
    }
    if (brief.description || brief.descripcion || brief.message) {
      const desc = String(brief.description || brief.descripcion || brief.message).slice(0, 220);
      briefParts.push(`Objetivo: "${desc}"`);
    }
    if (brief.timeline || brief.plazo) {
      briefParts.push(`Plazo: ${brief.timeline || brief.plazo}`);
    }
    if (brief.integrations) {
      briefParts.push(`Integraciones deseadas: ${brief.integrations}`);
    }

    // 4.1 Check if client shared their website URL (Live 360° Inspection)
    const prospectUrl = extractWebsiteUrl(combinedText);
    if (prospectUrl) {
      try {
        const metrics = await inspectWebsite(prospectUrl);
        if (metrics && metrics.statusCode > 0 && metrics.statusCode < 500) {
          advisorNotes.push(
            `[Diagnóstico Web en Vivo]: URL "${metrics.url}" montada en ${metrics.platform}, tiempo de respuesta inicial del servidor ${metrics.ttfbMs}ms. Coméntale con criterio técnico que analizaste su web y ofrécele revisar la optimización a fondo o la auditoría de performance en https://andresmorales.com.co/es/audit.`
          );
          addLeadNote(
            batch.targetLeadId,
            `🔍 Web analizada en vivo (${metrics.url}): Plataforma ${metrics.platform}, TTFB ${metrics.ttfbMs}ms`
          );
        }
      } catch (e) {
        console.warn('[evolution-webhook] Website inspect error:', e);
      }
    }

    // 4.2 Check if client is asking for meeting or availability (Live Google Calendar Slots)
    if (isAskingForAvailability(combinedText)) {
      try {
        const slotsSummary = await getUpcomingAvailableSlotsSummary();
        if (slotsSummary) {
          advisorNotes.push(
            `[Disponibilidad en Vivo Google Calendar de Andrés]:\n${slotsSummary}\n(Menciona estos horarios disponibles directamente para que el cliente elija el que mejor le quede)`
          );
        }
      } catch (e) {
        console.warn('[evolution-webhook] Slots summary error:', e);
      }
    }

    // 4.3 Capture email if client wrote it in chat
    const emailMatch = combinedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch && (!existingLead?.email || existingLead.email.endsWith('@whatsapp.local'))) {
      updateLead(batch.targetLeadId, { email: emailMatch[0].toLowerCase() });
    }

    const STATUS_LABELS: Record<string, string> = {
      new: 'Nuevo contacto',
      brief_received: 'Brief Web recibido',
      in_conversation: 'En conversación activa',
      proposal_sent: 'Propuesta comercial enviada',
      in_development: 'En desarrollo',
      closed_won: 'Cerrado / Ganado',
      closed_lost: 'En pausa',
    };

    const crmContext = existingLead ? {
      company: existingLead.company || brief.empresa || brief.companyName || brief.company,
      service: existingLead.service || brief.service || brief.tipoProyecto,
      statusLabel: STATUS_LABELS[existingLead.status] || existingLead.status,
      briefSummary: briefParts.length > 0 ? briefParts.join(' | ') : undefined,
      advisorNotes: advisorNotes.slice(-5),
      followUpNote: existingLead.followUpNote,
    } : undefined;

    // 5. Generate AI Agent Reply with full concatenated context
    const agentResult = await generateAgentReply({
      customerName: batch.pushName,
      customerPhone: batch.formattedPhone,
      incomingMessage: combinedText,
      recentHistory,
      crmContext,
      customPrompt: crmData.automationSettings?.aiAgentPrompt,
    });

    // 6. Natural Human Typing Simulation (Realistic delay based on length)
    if (agentResult?.reply) {
      const targetJid = batch.remoteJidAlt || batch.remoteJid;
      const sendRecipient = batch.isLid && !batch.remoteJidAlt ? batch.remoteJid : batch.rawNumber;

      const typingMs = Math.min(4800, Math.max(2200, Math.floor(agentResult.reply.length * 18)));
      await sendWhatsAppPresence({
        number: sendRecipient,
        presence: 'composing',
        delay: typingMs,
      }).catch(() => null);

      await new Promise((resolve) => setTimeout(resolve, typingMs));

      const sendRes = await sendWhatsAppMessage({
        number: sendRecipient,
        remoteJid: targetJid,
        text: agentResult.reply,
      });

      if (sendRes.ok) {
        addLeadNote(
          batch.targetLeadId,
          `🤖 Agente IA (Antigravity): "${agentResult.reply}"`
        );
      } else {
        console.warn('[evolution-webhook] Error sending AI reply:', sendRes.error);
      }
    }

    // 7. Send Telegram Alert to Andres
    if (agentResult?.wantsHuman) {
      const latestData = getCrmData();
      const currentMuted = latestData.automationSettings?.mutedJids || [];
      if (!currentMuted.includes(batch.remoteJid)) {
        updateAutomationSettings({
          mutedJids: [...currentMuted, batch.remoteJid, batch.rawNumber],
        });
      }

      sendTelegramNotification(
        `🚨 <b>¡Atención! Cliente solicita hablar con Andrés</b>\n\n` +
          `👤 <b>Cliente:</b> ${batch.pushName}\n` +
          `📱 <b>Teléfono:</b> ${batch.formattedPhone}\n` +
          `💬 <b>Mensaje del cliente:</b>\n"${combinedText}"\n\n` +
          `🤖 <b>El bot respondió:</b>\n<i>"${agentResult.reply}"</i>\n\n` +
          `<i>Por favor responde directamente al cliente en WhatsApp o abre el CRM.</i>`,
        {
          buttons: [
            [
              { text: '💬 Abrir Chat de WhatsApp', url: `https://wa.me/${batch.rawNumber}` },
              { text: '📂 Abrir CRM', url: `https://andresmorales.com.co/es/admin/crm` },
            ],
          ],
        }
      ).catch((e) => console.warn('[evolution-webhook] Telegram alert error:', e));
    } else {
      const isNew = existingLead?.status === 'new' && (existingLead?.notes?.length || 0) <= batch.texts.length + 1;
      const title = isNew
        ? `⚡ <b>¡Nuevo Lead Entrante por WhatsApp!</b>`
        : `💬 <b>Mensaje de WhatsApp Recibido</b>`;

      const msgCountLabel = batch.texts.length > 1
        ? ` (${batch.texts.length} mensajes concatenados)`
        : '';

      sendTelegramNotification(
        `${title}\n\n` +
          `👤 <b>Cliente:</b> ${batch.pushName}\n` +
          `📱 <b>Teléfono:</b> ${batch.formattedPhone}\n` +
          `💬 <b>Mensaje${msgCountLabel}:</b>\n"${combinedText}"\n\n` +
          (agentResult?.reply
            ? `🤖 <b>Respuesta IA enviada:</b>\n<i>"${agentResult.reply}"</i>\n\n`
            : '') +
          `<i>Registrado en CRM.</i>`,
        {
          buttons: [
            [
              { text: '💬 Abrir WhatsApp', url: `https://wa.me/${batch.rawNumber}` },
              { text: '📂 Ver en CRM', url: `https://andresmorales.com.co/es/admin/crm` },
            ],
          ],
        }
      ).catch((e) => console.warn('[evolution-webhook] Telegram alert error:', e));
    }

    // 8. Forward to n8n if webhook configured
    const n8nWebhook = crmData.automationSettings?.n8nWebhookLead;
    if (n8nWebhook && n8nWebhook.startsWith('http')) {
      fetch(n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'whatsapp_lead_inbound',
          leadId: batch.targetLeadId,
          phone: batch.rawNumber,
          name: batch.pushName,
          text: combinedText,
          partsCount: batch.texts.length,
          aiReply: agentResult?.reply || null,
          wantsHuman: agentResult?.wantsHuman || false,
          receivedAt: new Date().toISOString(),
        }),
      }).catch((e) => console.warn('[evolution-webhook] n8n forward error:', e));
    }
  } catch (err: any) {
    console.error('[evolution-webhook] Error in processBatchedMessages:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Evolution API sends `event` or `eventType`
    const event = String(payload.event || payload.eventType || '').toLowerCase();

    // Only process message arrival events
    if (
      !event.includes('messages.upsert') &&
      !event.includes('messages_upsert') &&
      !event.includes('message_created')
    ) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'not_messages_upsert' });
    }

    const data = payload.data || {};
    const key = data.key || {};
    const remoteJid = String(key.remoteJid || '');

    // 1. Check outgoing messages (Sent by Andres from mobile phone vs sent by app)
    if (key.fromMe === true) {
      // If there was a pending debounced batch for this chat, cancel it immediately so the bot doesn't interfere
      const existingBatch = pendingBatches.get(remoteJid);
      if (existingBatch) {
        clearTimeout(existingBatch.timer);
        pendingBatches.delete(remoteJid);
      }

      const msgId = String(key.id || '');
      // If NOT in recentAppSends, Andres sent this manually from his physical phone
      if (!recentAppSends.has(msgId) && remoteJid) {
        const textSent = extractIncomingText(data.message, data);
        const crmData = getCrmData();
        const currentMuted = crmData.automationSettings?.mutedJids || [];
        const rawDigits = remoteJid.split('@')[0].replace(/\D/g, '');
        if (!currentMuted.includes(remoteJid) || (rawDigits && !currentMuted.includes(rawDigits))) {
          updateAutomationSettings({
            mutedJids: Array.from(new Set([...currentMuted, remoteJid, rawDigits].filter(Boolean))),
          });
        }
        const existingLead = crmData.leads.find((l) => {
          const p1 = (l.phone || '').replace(/\D/g, '');
          return p1 === rawDigits || (rawDigits.endsWith(p1) && p1.length >= 8);
        });
        if (existingLead && textSent && !textSent.startsWith('[Mensaje')) {
          addLeadNote(
            existingLead.id,
            `💬 Andrés (desde WhatsApp Móvil): "${textSent.substring(0, 150)}${textSent.length > 150 ? '...' : ''}"`
          );
        }
      }
      return NextResponse.json({ ok: true, ignored: true, reason: 'outgoing_from_me' });
    }

    // 2. Ignore groups and broadcast status
    if (
      !remoteJid ||
      remoteJid.includes('@g.us') ||
      remoteJid.includes('@broadcast') ||
      remoteJid === 'status@broadcast'
    ) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'group_or_broadcast' });
    }

    // 3. Extract sender phone number (resolving WhatsApp Multi-Device @lid via remoteJidAlt)
    const isLid = remoteJid.includes('@lid');
    const remoteJidAlt = typeof key.remoteJidAlt === 'string' ? key.remoteJidAlt : '';
    let phoneDigits = '';
    if (remoteJidAlt && remoteJidAlt.includes('@s.whatsapp.net')) {
      phoneDigits = remoteJidAlt.split('@')[0].replace(/\D/g, '');
    }
    if (!phoneDigits) {
      phoneDigits = remoteJid.split('@')[0].replace(/\D/g, '');
    }
    const rawNumber = phoneDigits;
    if (!rawNumber) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'no_number' });
    }

    // 4. Extract sender name
    const pushName = data.pushName && String(data.pushName).trim()
      ? String(data.pushName).trim()
      : `WhatsApp +${rawNumber}`;

    // 5. Extract message text (unwrapping nested formats)
    let text = extractIncomingText(data.message, data);

    // Audio / Voice note automatic transcription via Gemini Flash
    const isAudio = Boolean(
      data.message?.audioMessage ||
      data.message?.ephemeralMessage?.message?.audioMessage ||
      data.message?.viewOnceMessage?.message?.audioMessage ||
      data.message?.viewOnceMessageV2?.message?.audioMessage
    );

    if (isAudio) {
      try {
        const audioBase64 = await getMediaBase64({
          messageKey: key,
          messageContent: data.message,
        });
        if (audioBase64) {
          const transcript = await transcribeAudioMessage(audioBase64, key.id || String(Date.now()));
          if (transcript && transcript.length > 2) {
            text = `[Nota de voz transcrita]: "${transcript}"`;
          }
        }
      } catch (audioErr) {
        console.warn('[evolution-webhook] Audio transcription error:', audioErr);
      }
    }

    // Trigger WhatsApp typing presence immediately on inbound message
    sendWhatsAppPresence({
      number: rawNumber,
      presence: 'composing',
      delay: 3000,
    }).catch(() => null);

    // 6. Check CRM for existing lead with this phone number
    const crmData = getCrmData();
    const existingLead = crmData.leads.find((l) => {
      const p1 = (l.phone || '').replace(/\D/g, '');
      const p2 = (l.briefData?.phone || l.briefData?.telefono || '').replace(/\D/g, '');
      return p1 === rawNumber || p2 === rawNumber || (rawNumber.endsWith(p1) && p1.length >= 8);
    });

    const formattedPhone = rawNumber.startsWith('57')
      ? `+57 ${rawNumber.slice(2, 5)} ${rawNumber.slice(5, 8)} ${rawNumber.slice(8)}`
      : `+${rawNumber}`;

    let targetLeadId: string;
    let isNewLead = false;

    // Detect if customer introduced their name in the text
    const { resolvedName } = getCleanGreeting(pushName, text);

    if (existingLead) {
      targetLeadId = existingLead.id;
      addLeadNote(
        existingLead.id,
        `💬 WhatsApp recibido: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`
      );
      const updates: any = { updatedAt: new Date().toISOString() };
      if (resolvedName && resolvedName !== pushName && !existingLead.name.includes(resolvedName)) {
        updates.name = `${resolvedName} (${existingLead.name})`;
      }
      updateLead(existingLead.id, updates);
    } else {
      isNewLead = true;
      const initialName = resolvedName && resolvedName !== pushName
        ? `${resolvedName} (${pushName})`
        : pushName;
      const newLead = createLead({
        name: initialName,
        email: `${rawNumber}@whatsapp.local`,
        phone: formattedPhone,
        company: '',
        service: 'Contacto directo por WhatsApp',
        message: text,
        source: 'whatsapp' as any,
        status: 'new',
      });
      targetLeadId = newLead.id;
    }

    // 7. Check if muted or if auto-reply is disabled
    const isAutoReplyGloballyEnabled = crmData.automationSettings?.autoReplyWhatsAppAgent !== false;
    const mutedJids: string[] = crmData.automationSettings?.mutedJids || [];
    const isContactMuted =
      mutedJids.includes(remoteJid) ||
      mutedJids.includes(rawNumber) ||
      Boolean(existingLead?.phone && mutedJids.includes(existingLead.phone.replace(/\D/g, '')));

    if (isContactMuted) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'contact_muted' });
    }

    // 8. Instant Bot / Loop Check on this single incoming text
    const allNotes = existingLead?.notes || [];
    const recentIncoming = allNotes
      .filter((n) => (n.text || '').startsWith('💬 WhatsApp recibido:'))
      .map((n) => (n.text || '').replace(/^💬 WhatsApp recibido:\s*/, '').replace(/^"|"$/g, ''));

    const botCheck = detectBotOrLoop(text, recentIncoming);
    if (botCheck.isBot) {
      updateAutomationSettings({
        mutedJids: Array.from(new Set([...mutedJids, remoteJid, rawNumber])),
      });
      addLeadNote(
        targetLeadId,
        `🤖⛔ Loop de bot detectado (${botCheck.reason}). Se silencia la respuesta automática.`
      );
      sendTelegramNotification(
        `🤖 <b>Bot / Loop detectado en WhatsApp</b>\n\n` +
          `👤 <b>Contacto:</b> ${pushName} (${formattedPhone})\n` +
          `⚠️ <b>Causa:</b> ${botCheck.reason}\n` +
          `💬 <b>Mensaje recibido:</b> "${text.substring(0, 150)}"\n\n` +
          `<i>Se silenció automáticamente el agente para evitar un bucle de respuestas.</i>`
      ).catch(() => null);
      return NextResponse.json({ ok: true, ignored: true, reason: 'bot_loop_detected' });
    }

    if (!isAutoReplyGloballyEnabled) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'auto_reply_disabled' });
    }

    // 9. Debounce Batching: Group rapid-fire consecutive messages into a single response
    const existingBatch = pendingBatches.get(remoteJid);
    if (existingBatch) {
      clearTimeout(existingBatch.timer);
      existingBatch.texts.push(text);
      if (pushName && !pushName.startsWith('WhatsApp +')) {
        existingBatch.pushName = pushName;
      }
      const elapsed = Date.now() - existingBatch.firstReceivedAt;
      const nextDelay = elapsed > MAX_BATCH_WINDOW_MS ? 1000 : DEBOUNCE_DELAY_MS;
      existingBatch.timer = setTimeout(() => {
        pendingBatches.delete(remoteJid);
        processBatchedMessages(existingBatch);
      }, nextDelay);

      return NextResponse.json({
        ok: true,
        batched: true,
        queueLength: existingBatch.texts.length,
      });
    }

    // New batch initialized
    const newBatch: PendingMessageBatch = {
      remoteJid,
      remoteJidAlt,
      isLid,
      rawNumber,
      pushName,
      formattedPhone,
      targetLeadId,
      texts: [text],
      firstReceivedAt: Date.now(),
      timer: setTimeout(() => {
        pendingBatches.delete(remoteJid);
        processBatchedMessages(newBatch);
      }, DEBOUNCE_DELAY_MS),
    };
    pendingBatches.set(remoteJid, newBatch);

    return NextResponse.json({
      ok: true,
      action: isNewLead ? 'created_new_lead' : 'updated_existing_lead',
      leadId: targetLeadId,
      queued: true,
    });
  } catch (err: any) {
    console.error('[evolution-webhook] Error processing webhook:', err);
    return NextResponse.json({ error: err.message || 'Error processing webhook' }, { status: 500 });
  }
}
