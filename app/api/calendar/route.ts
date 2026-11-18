import { NextRequest, NextResponse } from 'next/server';
import {
  getAvailableSlots,
  createMeeting,
  rescheduleMeeting,
  cancelMeeting,
} from '@/lib/google-calendar';
import { createLead, addLeadNote, getCrmData } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'slots';
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (action === 'slots') {
      if (!date) {
        return NextResponse.json(
          { ok: false, error: 'Parámetro date (YYYY-MM-DD) requerido' },
          { status: 400 }
        );
      }

      const slots = await getAvailableSlots(date);
      return NextResponse.json({ ok: true, date, slots });
    }

    return NextResponse.json({ ok: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Calendar GET error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error al consultar disponibilidad' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limit = checkRateLimit('calendar-booking', ip, 15);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json({ ok: false, error: 'Payload inválido' }, { status: 400 });
    }

    bumpRateLimit('calendar-booking', ip);

    // ── 1. BOOK MEETING ────────────────────────────────────────────────────
    if (body.action === 'book') {
      const { name, email, phone, startTime, endTime, notes } = body;
      if (!name || !email || !startTime || !endTime) {
        return NextResponse.json(
          { ok: false, error: 'Campos requeridos: name, email, startTime, endTime' },
          { status: 400 }
        );
      }

      const result = await createMeeting({
        name,
        email,
        phone,
        startTime,
        endTime,
        notes,
      });

      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }

      // Sync to CRM
      try {
        const crmData = getCrmData();
        const existing = crmData.leads.find(
          (l) => l.email?.toLowerCase() === email.toLowerCase()
        );

        const appointmentNote = `📅 Cita agendada con Google Calendar para ${startTime} (Google Meet: ${result.meetLink || 'N/A'})`;

        if (existing) {
          addLeadNote(existing.id, appointmentNote);
        } else {
          createLead({
            name,
            email,
            phone: phone || '',
            service: 'Sesión Técnica de Diagnóstico (Rex Calendar)',
            message: `Cita agendada por Rex. Google Meet: ${result.meetLink || 'Generado'}`,
            source: 'contact' as any,
            status: 'in_conversation',
            notes: [
              {
                id: `note_${Date.now()}`,
                text: appointmentNote,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }

        // Notify Andres on Telegram
        sendTelegramNotification(
          `📅 <b>¡Nueva Cita Agendada en Google Calendar!</b>\n\n` +
            `👤 <b>Cliente:</b> ${name}\n` +
            `📧 <b>Email:</b> ${email}\n` +
            (phone ? `📱 <b>Tel:</b> ${phone}\n` : '') +
            `⏰ <b>Horario:</b> ${new Date(startTime).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n` +
            (result.meetLink ? `📹 <b>Google Meet:</b> ${result.meetLink}\n` : '') +
            `<i>Rex ha enviado las invitaciones automáticas por correo.</i>`,
          {
            buttons: [
              [
                ...(result.meetLink ? [{ text: '📹 Unirse a Google Meet', url: result.meetLink }] : []),
                { text: '📂 Ver en CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
              ],
            ],
          }
        ).catch((e) => console.warn('[calendar-api] Telegram alert error:', e));
      } catch (crmErr) {
        console.warn('[calendar-api] CRM sync error:', crmErr);
      }

      return NextResponse.json({ ok: true, booking: result });
    }

    // ── 2. RESCHEDULE MEETING ──────────────────────────────────────────────
    if (body.action === 'reschedule') {
      const { identifier, newStartTime, newEndTime } = body;
      if (!identifier || !newStartTime || !newEndTime) {
        return NextResponse.json(
          { ok: false, error: 'Campos requeridos: identifier (email o id), newStartTime, newEndTime' },
          { status: 400 }
        );
      }

      const result = await rescheduleMeeting({
        identifier,
        newStartTime,
        newEndTime,
      });

      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }

      // Notify Telegram
      sendTelegramNotification(
        `🔄 <b>Cita Reagendada en Google Calendar</b>\n\n` +
          `👤 <b>Identificador:</b> ${identifier}\n` +
          `⏰ <b>Nuevo Horario:</b> ${new Date(newStartTime).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n` +
          (result.meetLink ? `📹 <b>Google Meet:</b> ${result.meetLink}` : '')
      ).catch((e) => console.warn('[calendar-api] Telegram alert error:', e));

      return NextResponse.json({ ok: true, booking: result });
    }

    // ── 3. CANCEL MEETING ──────────────────────────────────────────────────
    if (body.action === 'cancel') {
      const { identifier, reason } = body;
      if (!identifier) {
        return NextResponse.json(
          { ok: false, error: 'Campo requerido: identifier (email o eventId)' },
          { status: 400 }
        );
      }

      const result = await cancelMeeting({ identifier, reason });
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
      }

      // Notify Telegram
      sendTelegramNotification(
        `❌ <b>Cita Cancelada en Google Calendar</b>\n\n` +
          `👤 <b>Identificador:</b> ${identifier}\n` +
          (reason ? `📝 <b>Motivo:</b> ${reason}` : '')
      ).catch((e) => console.warn('[calendar-api] Telegram alert error:', e));

      return NextResponse.json({ ok: true, cancelled: result });
    }

    return NextResponse.json({ ok: false, error: 'Acción desconocida' }, { status: 400 });
  } catch (err: any) {
    console.error('[API Calendar POST error]:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Error procesando solicitud de calendario' },
      { status: 500 }
    );
  }
}
