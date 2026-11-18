import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials', 'google-calendar.json');
const DEFAULT_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Bogota';
const DEFAULT_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'andresmortal1@gmail.com';

export interface TimeSlot {
  start: string; // ISO string
  end: string;   // ISO string
  display: string; // e.g. "10:00 AM"
}

export interface BookingResult {
  ok: boolean;
  eventId?: string;
  meetLink?: string;
  calendarLink?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
}

/**
 * Returns an authenticated Google Calendar API client
 */
export function getCalendarAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Google Calendar credentials not found at: ${CREDENTIALS_PATH}`);
  }

  return new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}

export function getTargetCalendarId(): string {
  return DEFAULT_CALENDAR_ID;
}

/**
 * Checks availability (free/busy) for a given date (YYYY-MM-DD)
 * Working hours: 09:00 to 18:00 (Bogota time), Mon - Fri
 */
export async function getAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  const auth = getCalendarAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = getTargetCalendarId();

  // Parse target date in local Bogota timezone
  // Expected format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Formato de fecha inválido. Usa YYYY-MM-DD');
  }

  // Work hours: 9 AM to 6 PM (18:00 Bogota = UTC-5)
  // Construct window in UTC
  const timeMin = new Date(Date.UTC(year, month - 1, day, 14, 0, 0)); // 09:00 Bogota -> 14:00 UTC
  const timeMax = new Date(Date.UTC(year, month - 1, day, 23, 0, 0)); // 18:00 Bogota -> 23:00 UTC

  const fbRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: DEFAULT_TIMEZONE,
      items: [{ id: calendarId }],
    },
  });

  const busyList = fbRes.data.calendars?.[calendarId]?.busy || [];

  // Generate 30-min candidate slots
  const slots: TimeSlot[] = [];
  const durationMs = 30 * 60 * 1000;
  const now = Date.now();

  for (let current = timeMin.getTime(); current + durationMs <= timeMax.getTime(); current += durationMs) {
    const slotStart = current;
    const slotEnd = current + durationMs;

    // Skip past slots (buffer 15 mins)
    if (slotStart <= now + 15 * 60 * 1000) {
      continue;
    }

    // Check collision with busy blocks
    const isBusy = busyList.some((b) => {
      const bStart = new Date(b.start!).getTime();
      const bEnd = new Date(b.end!).getTime();
      return Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd);
    });

    if (!isBusy) {
      const startDate = new Date(slotStart);
      const displayTime = startDate.toLocaleTimeString('es-CO', {
        timeZone: DEFAULT_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      slots.push({
        start: new Date(slotStart).toISOString(),
        end: new Date(slotEnd).toISOString(),
        display: displayTime,
      });
    }
  }

  return slots;
}

/**
 * Returns a human-friendly string summarizing real-time available slots for the upcoming business days
 */
export async function getUpcomingAvailableSlotsSummary(): Promise<string> {
  try {
    const datesToQuery: string[] = [];
    const now = new Date();
    // Start from tomorrow in Bogota timezone
    const d = new Date(now.toLocaleString('en-US', { timeZone: DEFAULT_TIMEZONE }));

    while (datesToQuery.length < 2) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        // Monday to Friday
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        datesToQuery.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    const summaries: string[] = [];
    for (const dateStr of datesToQuery) {
      const slots = await getAvailableSlots(dateStr);
      if (slots.length > 0) {
        const morningSlot = slots.find((s) => s.display.includes('AM'))?.display;
        const afternoonSlot = slots.find((s) => s.display.includes('PM') && !s.display.startsWith('12'))?.display;
        const lateSlot = slots[slots.length - 1]?.display;

        const sampleSlots = Array.from(new Set([morningSlot, afternoonSlot, lateSlot].filter(Boolean)));
        const dayLabel = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          timeZone: DEFAULT_TIMEZONE,
        });
        summaries.push(`• ${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}: ${sampleSlots.join(', ')}`);
      }
    }

    return summaries.join('\n');
  } catch (err) {
    console.warn('[google-calendar] Error generating slots summary:', err);
    return '';
  }
}

/**
 * Creates an appointment in Google Calendar
 */
export async function createMeeting({
  name,
  email,
  phone,
  startTime,
  endTime,
  summary,
  notes,
}: {
  name: string;
  email: string;
  phone?: string;
  startTime: string;
  endTime: string;
  summary?: string;
  notes?: string;
}): Promise<BookingResult> {
  const auth = getCalendarAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = getTargetCalendarId();

  const title = summary || `🦖 Sesión Técnica: Andrés Morales & ${name}`;
  const desc = [
    `🦖 Cita agendada automáticamente por Rex AI Assistant.`,
    `Cliente: ${name}`,
    `Email: ${email}`,
    phone ? `WhatsApp / Tel: ${phone}` : '',
    notes ? `Detalles / Objetivo: ${notes}` : '',
    `Llamada / Google Meet: https://meet.google.com/new`,
    `Sitio Web: https://andresmorales.com.co`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: title,
        description: desc,
        start: { dateTime: startTime, timeZone: DEFAULT_TIMEZONE },
        end: { dateTime: endTime, timeZone: DEFAULT_TIMEZONE },
      },
    });

    const event = res.data;

    return {
      ok: true,
      eventId: event.id || undefined,
      calendarLink: event.htmlLink || undefined,
      startTime,
      endTime,
    };
  } catch (err: any) {
    console.error('[google-calendar] Error creating event:', err);
    return {
      ok: false,
      error: err.message || 'Error al crear la cita en Google Calendar',
    };
  }
}

/**
 * Reschedules an existing meeting to a new start and end time
 */
export async function rescheduleMeeting({
  identifier, // eventId OR client email
  newStartTime,
  newEndTime,
}: {
  identifier: string;
  newStartTime: string;
  newEndTime: string;
}): Promise<BookingResult> {
  const auth = getCalendarAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = getTargetCalendarId();

  try {
    let targetEventId = identifier;

    // If identifier is an email, search for upcoming event
    if (identifier.includes('@')) {
      const searchRes = await calendar.events.list({
        calendarId,
        q: identifier,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 5,
      });

      const found = searchRes.data.items?.[0];
      if (!found?.id) {
        return {
          ok: false,
          error: `No encontramos ninguna cita futura asociada a ${identifier}`,
        };
      }
      targetEventId = found.id;
    }

    const patchRes = await calendar.events.patch({
      calendarId,
      eventId: targetEventId,
      requestBody: {
        start: { dateTime: newStartTime, timeZone: DEFAULT_TIMEZONE },
        end: { dateTime: newEndTime, timeZone: DEFAULT_TIMEZONE },
      },
    });

    const event = patchRes.data;

    return {
      ok: true,
      eventId: event.id || undefined,
      calendarLink: event.htmlLink || undefined,
      startTime: newStartTime,
      endTime: newEndTime,
    };
  } catch (err: any) {
    console.error('[google-calendar] Error rescheduling event:', err);
    return {
      ok: false,
      error: err.message || 'Error al reagendar la cita',
    };
  }
}

/**
 * Cancels and removes an appointment from Google Calendar
 */
export async function cancelMeeting({
  identifier, // eventId OR client email
  reason,
}: {
  identifier: string;
  reason?: string;
}): Promise<{ ok: boolean; error?: string; cancelledEventId?: string }> {
  const auth = getCalendarAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = getTargetCalendarId();

  try {
    let targetEventId = identifier;

    if (identifier.includes('@')) {
      const searchRes = await calendar.events.list({
        calendarId,
        q: identifier,
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 5,
      });

      const found = searchRes.data.items?.[0];
      if (!found?.id) {
        return {
          ok: false,
          error: `No encontramos ninguna cita pendiente para ${identifier}`,
        };
      }
      targetEventId = found.id;
    }

    await calendar.events.delete({
      calendarId,
      eventId: targetEventId,
    });

    return { ok: true, cancelledEventId: targetEventId };
  } catch (err: any) {
    console.error('[google-calendar] Error deleting event:', err);
    return { ok: false, error: err.message || 'Error al cancelar la cita' };
  }
}
