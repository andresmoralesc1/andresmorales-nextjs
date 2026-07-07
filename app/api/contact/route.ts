import { NextRequest, NextResponse } from 'next/server';

// Lightweight contact form endpoint — sends to inbox via Brevo.
// Mirrors the pattern in app/api/brief/route.ts (same sender + validation).
// Docs: https://developers.brevo.com/reference/sendtransacemail
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.BRIEF_TO_EMAIL || 'andres@andresmorales.com.co';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || process.env.BRIEF_FROM_EMAIL || 'andres@andresmorales.com.co';
const FROM_NAME = process.env.CONTACT_FROM_NAME || process.env.BRIEF_FROM_NAME || 'Andrés Morales · Portfolio Contact';

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmailHtml(p: ContactPayload): string {
  // Reuse the same visual style as the brief email for inbox consistency.
  return `
    <div style="font-family:Roboto,Arial,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">New Contact Form Message</h1>
        <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px;">From ${escapeHtml(p.name)} — ${escapeHtml(p.email)}</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;width:160px;vertical-align:top;">Name</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;">${escapeHtml(p.name)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">Email</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;"><a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">Message</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;white-space:pre-wrap;">${escapeHtml(p.message)}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#575250;">
        Reply directly to <a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a>
      </p>
    </div>
  `;
}

function renderEmailText(p: ContactPayload): string {
  return [
    `NEW CONTACT FORM MESSAGE`,
    `========================`,
    ``,
    `From:  ${p.name} <${p.email}>`,
    ``,
    `MESSAGE`,
    `-------`,
    p.message,
  ].join('\n');
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

  return {
    ok: true,
    data: {
      name: String(b.name).trim().slice(0, 200),
      email: String(b.email).trim().slice(0, 200),
      message: String(b.message).trim().slice(0, 4000),
    },
  };
}

async function sendViaBrevo(data: ContactPayload): Promise<{ ok: boolean; error?: string; status?: number }> {
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: TO_EMAIL, name: 'Andrés' }],
    replyTo: { email: data.email, name: data.name },
    subject: `Contact: ${data.name}`,
    htmlContent: renderEmailHtml(data),
    textContent: renderEmailText(data),
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

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = validatePayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const data = result.data;

  if (!BREVO_API_KEY) {
    console.warn('[contact] BREVO_API_KEY not set — message received but not emailed:', {
      from: data.name,
      email: data.email,
    });
    return NextResponse.json({ ok: true, emailSent: false, reason: 'email-not-configured' });
  }

  try {
    const sendResult = await sendViaBrevo(data);
    if (!sendResult.ok) {
      console.error('[contact] Brevo error:', sendResult.status, sendResult.error);
      return NextResponse.json(
        { error: 'Failed to send', details: sendResult.error },
        { status: 502 }
      );
    }

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
