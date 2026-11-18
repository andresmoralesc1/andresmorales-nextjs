import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { generateAgentReply } from '@/lib/ai-agent';
import { REX_SYSTEM_PROMPT } from '@/lib/ai-prompt';
import { getCrmData, createLead, addLeadNote } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';

const RATE_LIMIT_MAX = 40; // 40 messages per hour per IP
const RATE_LIMIT_ROUTE = 'rex-chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limit = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rate limit exceeded. Please wait a moment before sending more messages.',
          retryInSec: limit.retryInSec,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Message is required and must be non-empty.' },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    if (message.length > 2000) {
      return NextResponse.json(
        { ok: false, error: 'Message exceeds maximum length of 2000 characters.' },
        { status: 400 }
      );
    }

    bumpRateLimit(RATE_LIMIT_ROUTE, ip);

    const lang = (body.lang || 'es').toLowerCase();
    const customerName = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Visitante Web';
    const customerPhone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : 'Web-Chat';

    // Format recent history (last 8 messages max)
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];
    const formattedHistory: string[] = history
      .slice(-8)
      .map((item) => {
        const prefix = item.role === 'user' ? 'Usuario' : 'Rex';
        const txt = String(item.content || '').trim().replace(/\s+/g, ' ');
        return `${prefix}: "${txt}"`;
      })
      .filter((line) => line.length > 0);

    // Language hint tailored to visitor's locale
    let langInstruction = '';
    if (lang === 'en') {
      langInstruction = '\n\nIMPORTANTE: El usuario navega en inglés. Responde SIEMPRE en INGLÉS (English) de forma natural y carismática.';
    } else if (lang === 'pt') {
      langInstruction = '\n\nIMPORTANTE: O usuário navega em português. Responda SEMPRE em PORTUGUÊS de forma natural e amigável.';
    } else {
      langInstruction = '\n\nIMPORTANTE: El usuario navega en español. Responde en ESPAÑOL.';
    }

    const customPrompt = `${REX_SYSTEM_PROMPT}${langInstruction}`;

    const agentResult = await generateAgentReply({
      customerName,
      customerPhone,
      incomingMessage: message,
      recentHistory: formattedHistory,
      customPrompt,
    });

    // ── CRM & Telegram Integration ──────────────────────────────────────────
    // Detect contact info (email or phone) shared in chat message
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = message.match(/(?:\+?57[\s-]?)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|\b\d{10,12}\b/);
    const detectedEmail = emailMatch ? emailMatch[0].toLowerCase() : null;
    const detectedPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : null;

    if (detectedEmail || detectedPhone || agentResult.wantsHuman) {
      try {
        const crmData = getCrmData();
        const existing = crmData.leads.find((l) => {
          if (detectedEmail && l.email?.toLowerCase() === detectedEmail) return true;
          if (detectedPhone && l.phone && l.phone.replace(/\D/g, '').endsWith(detectedPhone.replace(/\D/g, ''))) return true;
          return false;
        });

        if (existing) {
          addLeadNote(
            existing.id,
            `🦖 Rex Web Chat: "${message.substring(0, 300)}"`
          );
        } else if (detectedEmail || detectedPhone) {
          const leadTitle = customerName !== 'Visitante Web' ? customerName : `Lead Web (${detectedPhone || detectedEmail})`;
          createLead({
            name: leadTitle,
            email: detectedEmail || '',
            phone: detectedPhone || '',
            company: '',
            service: 'Automatización con IA & Web (Rex Web)',
            message: `Capturado desde el chat web interactivo de Rex:\n"${message}"`,
            source: 'contact' as any,
            status: 'new',
            notes: [
              {
                id: `note_${Date.now()}`,
                text: `Lead generado en conversación interactiva con Rex (Web). Mensaje: "${message}"`,
                createdAt: new Date().toISOString(),
              },
            ],
          });

          // Immediate alert on Telegram
          sendTelegramNotification(
            `🦖 <b>¡Nuevo Lead capturado por Rex en la Web!</b>\n\n` +
              `👤 <b>Contacto:</b> ${leadTitle}\n` +
              (detectedPhone ? `📱 <b>WhatsApp:</b> ${detectedPhone}\n` : '') +
              (detectedEmail ? `📧 <b>Email:</b> ${detectedEmail}\n` : '') +
              `💬 <b>Mensaje:</b> "${message}"\n\n` +
              `🤖 <b>Rex respondió:</b> <i>"${agentResult.reply}"</i>\n\n` +
              `<i>Guardado automáticamente en tu CRM.</i>`,
            {
              buttons: [
                [
                  ...(detectedPhone
                    ? [{ text: '💬 WhatsApp', url: `https://wa.me/${detectedPhone.replace(/\D/g, '')}` }]
                    : []),
                  { text: '📂 Abrir CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
                ],
              ],
            }
          ).catch((e) => console.warn('[rex-chat] Telegram notification error:', e));
        } else if (agentResult.wantsHuman) {
          // Alert Telegram that a visitor wants to speak directly with Andres
          sendTelegramNotification(
            `🚨 <b>¡Atención! Visitante en la Web solicita hablar con Andrés</b>\n\n` +
              `💬 <b>Mensaje en Rex Chat:</b> "${message}"\n` +
              `🤖 <b>Rex respondió:</b> <i>"${agentResult.reply}"</i>\n\n` +
              `<i>El visitante fue dirigido a tu WhatsApp (+57 316 148 2507) y Calendario.</i>`,
            {
              buttons: [
                [
                  { text: '💬 Abrir WhatsApp Web', url: 'https://web.whatsapp.com' },
                  { text: '📂 Abrir CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
                ],
              ],
            }
          ).catch((e) => console.warn('[rex-chat] Telegram alert error:', e));
        }
      } catch (crmErr) {
        console.warn('[rex-chat] CRM sync error:', crmErr);
      }
    }

    return NextResponse.json({
      ok: true,
      reply: agentResult.reply,
      wantsHuman: agentResult.wantsHuman,
      modelUsed: agentResult.modelUsed,
      durationMs: agentResult.durationMs,
    });
  } catch (err: any) {
    console.error('[Rex Chat API Error]:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Error processing chat message.',
        reply: '¡Ups! Mi rugido se entrecortó un segundo. ¿Me repites tu mensaje o prefieres hablar directo con Andrés por WhatsApp?',
      },
      { status: 500 }
    );
  }
}
