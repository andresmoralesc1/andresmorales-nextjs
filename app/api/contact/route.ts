import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';
import { sendMail } from '@/lib/email';
import { createLead } from '@/lib/crm-store';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email-template';

// ── Anti-spam: in-memory rate limit per IP ───────────────────────────────
// 5 contact messages / hour / IP. Generous than /api/brief because the
// contact form is also used by visitors with quick questions, not just
// qualified leads. State lives in lib/rate-limit.ts (shared with /api/brief).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_ROUTE = 'contact';
// 2 KB is plenty for a contact form (name + email + short message = ~300 B
// typical). Anything larger is almost certainly abuse.
const MAX_BODY_BYTES = 2 * 1024;

// Self-hosted Mailcow SMTP — see lib/email.ts for the transport config.
// Recipient + sender fall back to the Mailcow mailbox configured in
// lib/email.ts. The CONTACT_*_EMAIL env vars are kept as optional
// overrides for testing or routing to a different mailbox.
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.MAILCOW_USER || 'info@andresmorales.com.co';
const TO_NAME = process.env.CONTACT_TO_NAME || 'Andrés Morales';
const FROM_NAME = process.env.CONTACT_FROM_NAME || 'Andrés Morales · Portfolio Contact';
const MAIL_CONFIGURED = Boolean(process.env.MAILCOW_PASSWORD);

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  lang?: string;
};

function renderEmailHtml(p: ContactPayload, dict: Dictionary): string {
  const n = dict.contact.emailNotification;
  const subtitle = n.subtitle.replace('{name}', p.name).replace('{email}', p.email);
  return buildBrandedEmailHtml({
    badge: '✉️ MENSAJE DE CONTACTO',
    title: n.title,
    subtitle,
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;">
        Se ha recibido una nueva solicitud a través del formulario de contacto web:
      </p>
    `,
    tableRows: [
      { label: n.fieldName, value: p.name },
      { label: n.fieldEmail, value: p.email },
      { label: n.fieldMessage, value: p.message },
    ],
    ctaText: 'Abrir Dashboard CRM',
    ctaUrl: 'https://andresmorales.com.co/es/admin/crm',
    secondaryCtaText: 'Responder al Remitente',
    secondaryCtaUrl: `mailto:${p.email}`,
    replyToEmail: p.email,
  });
}

function renderEmailText(p: ContactPayload, dict: Dictionary): string {
  const n = dict.contact.emailNotification;
  const upper = (s: string) => s.toUpperCase();
  const sep = (label: string) => `${upper(label)}\n${'-'.repeat(label.length)}`;
  const lines = [
    sep(n.title),
    '='.repeat(n.title.length),
    ``,
    `${n.fieldName}: ${p.name}`,
    `${n.fieldEmail}: ${p.email}`,
    ``,
    sep(n.fieldMessage),
    p.message,
  ];
  return lines.join('\n');
}

function validatePayload(body: unknown): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const required = ['name', 'email', 'message'];
  for (const k of required) {
    if (!b[k] || (typeof b[k] === 'string' && !(b[k] as string).trim())) {
      return { ok: false, error: `Missing field: ${k}` };
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email))) {
    return { ok: false, error: 'Invalid email' };
  }

  // `lang` is optional. Whitelisted via isLocale (same as /api/brief);
  // undefined if missing so the route falls back to DEFAULT_LOCALE.
  const langRaw = b.lang;
  const lang = typeof langRaw === 'string' && isLocale(langRaw) ? langRaw : undefined;

  return {
    ok: true,
    data: {
      name: String(b.name).trim().slice(0, 200),
      email: String(b.email).trim().slice(0, 200),
      message: String(b.message).trim().slice(0, 4000),
      lang,
    },
  };
}

async function sendNotification(data: ContactPayload, dict: Dictionary): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendMail({
      to: TO_EMAIL,
      toName: TO_NAME,
      replyTo: data.email,
      subject: `${dict.contact.emailNotification.title}: ${data.name}`,
      html: renderEmailHtml(data, dict),
      text: renderEmailText(data, dict),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

// Auto-reply mirrors the pattern in /api/brief/route.ts. Same Mailcow
// transport, parallel route. Localized via dict.contact.emailAutoReply.
async function sendAutoReply(p: ContactPayload, dict: Dictionary, lang: string): Promise<void> {
  const ar = dict.contact.emailAutoReply;
  const firstName = p.name.split(' ')[0] || p.name;
  const greeting = ar.greeting.replace('{firstName}', firstName);
  const subject = ar.subject.replace('{firstName}', firstName);
  const linkUrl = lang === 'en'
    ? 'https://andresmorales.com.co/contact'
    : `https://andresmorales.com.co/${lang}/contact`;

  const html = buildBrandedEmailHtml({
    badge: 'CONFIRMACIÓN OFICIAL',
    title: greeting,
    subtitle: 'Andrés Morales · Automatización con IA & Desarrollo Web',
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;line-height:1.7;">
        ${escapeHtml(ar.body1)}
      </p>
      <p style="margin:0 0 16px 0;font-size:14.5px;color:#4A423D;line-height:1.7;">
        ${escapeHtml(ar.body2)}
      </p>
      <p style="margin:24px 0 0 0;font-size:14px;color:#1E1810;font-weight:600;">
        ${escapeHtml(ar.signature)}
      </p>
    `,
    ctaText: 'Agendar Llamada de 30 min',
    ctaUrl: 'https://calendar.app.google/QvUUb5xu4927P95a8',
    secondaryCtaText: '💬 WhatsApp Directo',
    secondaryCtaUrl: 'https://wa.me/573161482507',
    footerNote: `${ar.footer} <a href="${linkUrl}" style="color:#f96e03;">${escapeHtml(ar.linkText)}</a>.`,
  });

  const text = `${ar.greeting.replace('{firstName}', firstName)}

${ar.body1}

${ar.body2}

${ar.signature}

---
${ar.footer} ${linkUrl}.`;

  await sendMail({
    to: p.email,
    toName: p.name,
    replyTo: TO_EMAIL,
    subject,
    html,
    text,
  });
}

export async function POST(req: NextRequest) {
  // Drop oversized payloads before parsing. 2 KB is the contact form's
  // realistic ceiling — anything larger is almost certainly abuse.
  const tooBig = enforceBodySize(req, MAX_BODY_BYTES);
  if (tooBig) return tooBig;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Anti-spam #1: rate limit per IP. 5 messages / hour. Returns 429 with
  // a retry-after hint so legitimate users know to wait.
  const ip = clientIp(req);
  const rl = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);
  if (!rl.allowed) {
    console.warn(`[contact] rate-limited ip=${ip} retry_in=${rl.retryInSec}s`);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryInSec) } }
    );
  }

  // Anti-spam #2: honeypot. The `website` field is hidden from real users.
  // Any non-empty value → silently 400 (don't signal detection to the bot).
  const b = body as Record<string, unknown>;
  if (typeof b?.website === 'string' && b.website.trim() !== '') {
    console.warn(`[contact] honeypot tripped ip=${ip} website="${String(b.website).slice(0, 60)}"`);
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  }

  // Anti-spam #3: timing. Bots submit in <1s. Real users take longer to
  // read the form. Server tracks mounted-at via `_t` field in ms. Threshold
  // of 1500ms is conservative — drops fast bots without false positives.
  if (typeof b?._t === 'number' && b._t > 0 && b._t < 1500) {
    console.warn(`[contact] too-fast submission ip=${ip} _t=${b._t}ms`);
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  }

  const result = validatePayload(body);
  if (!result.ok || !('data' in result)) {
    return NextResponse.json({ error: 'error' in result ? result.error : 'Invalid payload' }, { status: 400 });
  }
  const data = result.data;

  // Auto-log lead into local CRM and sync with Clientes & Empresas
  try {
    const lead = createLead({
      name: data.name,
      email: data.email,
      message: data.message,
      source: 'contact',
      service: 'Consulta de Contacto',
      status: 'new',
    });
    syncLeadToBusiness({
      id: lead?.id,
      name: data.name,
      email: data.email,
      message: data.message,
      service: 'Consulta de Contacto',
      status: 'new',
    });
  } catch (crmErr) {
    console.warn('[contact] Could not auto-log to CRM:', crmErr);
  }

  // Bump AFTER honeypot + timing + validation all pass — failed spam
  // checks don't count against the limit (a torrent of honeypot triggers
  // would otherwise lock out a legitimate user sharing an IP).
  bumpRateLimit(RATE_LIMIT_ROUTE, ip);

  if (!MAIL_CONFIGURED) {
    // Dev / preview fallback. The form still returns 200 so the UI shows
    // the success state and the message lands in server logs for review.
    // In production, MAILCOW_PASSWORD is set and we never hit this branch.
    console.warn('[contact] MAILCOW_PASSWORD not set — message received but not emailed:', {
      from: data.name,
      email: data.email,
    });
    return NextResponse.json({ ok: true, emailSent: false, reason: 'email-not-configured' });
  }

  try {
    // Resolve the locale for email templates. If the contact was submitted
    // without `lang` (e.g. hand-crafted curl), fall back to DEFAULT_LOCALE.
    const lang = data.lang ?? DEFAULT_LOCALE;
    const dict = await getDictionary(lang);

    const sendResult = await sendNotification(data, dict);
    if (!sendResult.ok) {
      console.error('[contact] Mailcow error:', sendResult.error);
      return NextResponse.json(
        { error: 'Failed to send' },
        { status: 502 }
      );
    }

    // Fire-and-forget auto-reply to the user. Failure here does NOT
    // affect the contact send — already logged + replied in the inbox.
    // Same non-blocking pattern as /api/brief.
    sendAutoReply(data, dict, lang).catch((err) => {
      console.warn('[contact] auto-reply failed (non-fatal):', err);
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

// Health check (does NOT expose whether the key is set)
export async function GET() {
  return NextResponse.json({ ok: true, route: 'contact' });
}