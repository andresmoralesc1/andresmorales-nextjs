import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';

// ── Anti-spam: in-memory rate limit per IP ───────────────────────────────
// 5 contact messages / hour / IP. Generous than /api/brief because the
// contact form is also used by visitors with quick questions, not just
// qualified leads. State lives in lib/rate-limit.ts (shared with /api/brief).
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_ROUTE = 'contact';
// 2 KB is plenty for a contact form (name + email + short message = ~300 B
// typical). Anything larger is almost certainly abuse.
const MAX_BODY_BYTES = 2 * 1024;

// Lightweight contact form endpoint — sends to inbox via Brevo.
// Mirrors the pattern in app/api/brief/route.ts (same sender + validation).
// Docs: https://developers.brevo.com/reference/sendtransacemail
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.BRIEF_TO_EMAIL || 'andres@andresmorales.com.co';
const TO_NAME = process.env.BREVO_TO_NAME || 'Andrés Morales';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || process.env.BRIEF_FROM_EMAIL || 'andres@andresmorales.com.co';
const FROM_NAME = process.env.CONTACT_FROM_NAME || process.env.BRIEF_FROM_NAME || 'Andrés Morales · Portfolio Contact';

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  lang?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmailHtml(p: ContactPayload, dict: Dictionary): string {
  const n = dict.contact.emailNotification;
  const subtitle = n.subtitle.replace('{name}', p.name).replace('{email}', p.email);
  const replyTo = n.replyTo.replace('{email}', p.email);
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">${escapeHtml(n.title)}</h1>
        <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px;">${escapeHtml(subtitle)}</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;width:160px;vertical-align:top;">${escapeHtml(n.fieldName)}</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;">${escapeHtml(p.name)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">${escapeHtml(n.fieldEmail)}</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;"><a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">${escapeHtml(n.fieldMessage)}</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;white-space:pre-wrap;">${escapeHtml(p.message)}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#575250;">
        ${escapeHtml(replyTo)} <a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a>
      </p>
    </div>
  `;
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

async function sendViaBrevo(data: ContactPayload, dict: Dictionary): Promise<{ ok: boolean; error?: string; status?: number }> {
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: TO_EMAIL, name: TO_NAME }],
    replyTo: { email: data.email, name: data.name },
    subject: `${dict.contact.emailNotification.title}: ${data.name}`,
    htmlContent: renderEmailHtml(data, dict),
    textContent: renderEmailText(data, dict),
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) return { ok: true };

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text().catch(() => null);
  }

  return { ok: false, status: res.status, error: JSON.stringify(body) };
}

// Auto-reply mirrors the pattern in /api/brief/route.ts. Same Brevo
// endpoint, parallel route. Localized via dict.contact.emailAutoReply.
async function sendAutoReply(p: ContactPayload, dict: Dictionary, lang: string): Promise<void> {
  const ar = dict.contact.emailAutoReply;
  const firstName = p.name.split(' ')[0] || p.name;
  const greeting = ar.greeting.replace('{firstName}', escapeHtml(firstName));
  const subject = ar.subject.replace('{firstName}', firstName);
  const linkUrl = lang === 'en'
    ? 'https://andresmorales.com.co/contact'
    : `https://andresmorales.com.co/${lang}/contact`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">${greeting}</h1>
      </div>
      <div style="padding:24px 32px;color:#575250;line-height:1.6;">
        <p>${escapeHtml(ar.body1)}</p>
        <p>${escapeHtml(ar.body2)}</p>
        <p style="margin-top:32px;">${escapeHtml(ar.signature)}</p>
        <p style="font-size:13px;color:#999;margin-top:24px;">
          ${escapeHtml(ar.footer)} <a href="${linkUrl}" style="color:#f96e03;">${escapeHtml(ar.linkText)}</a>.
        </p>
      </div>
    </div>
  `;
  const text = `${ar.greeting.replace('{firstName}', firstName)}

${ar.body1}

${ar.body2}

${ar.signature}

---
${ar.footer} ${linkUrl}.`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: p.email, name: p.name }],
      replyTo: { email: FROM_EMAIL, name: TO_NAME },
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo auto-reply failed: ${res.status} ${body}`);
  }
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

  // Bump AFTER honeypot + timing + validation all pass — failed spam
  // checks don't count against the limit (a torrent of honeypot triggers
  // would otherwise lock out a legitimate user sharing an IP).
  bumpRateLimit(RATE_LIMIT_ROUTE, ip);

  if (!BREVO_API_KEY) {
    console.warn('[contact] BREVO_API_KEY not set — message received but not emailed:', {
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

    const sendResult = await sendViaBrevo(data, dict);
    if (!sendResult.ok) {
      console.error('[contact] Brevo error:', sendResult.status, sendResult.error);
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