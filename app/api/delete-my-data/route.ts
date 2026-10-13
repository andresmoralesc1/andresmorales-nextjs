import { NextResponse, NextRequest } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';
import { sendMail } from '@/lib/email';

// Data-deletion request endpoint.
//
// Routes the request to info@andresmorales.com.co via self-hosted
// Mailcow (mail.cleida.com.co). GDPR right-to-erasure requires the
// controller to verify identity before destruction (Art. 12(6)),
// so we reply to the requester from the same email address on file
// to confirm the request is genuine. Manual step — not auto-delete.

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_ROUTE = 'delete-my-data';
const MAX_BODY_BYTES = 2 * 1024;

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.MAILCOW_USER || 'info@andresmorales.com.co';
const TO_NAME = process.env.MAILCOW_TO_NAME || 'Andrés Morales';

type Payload = {
  email: string;
  scope?: string;
  reason?: string;
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

function renderHtml(p: Payload, dict: Dictionary): string {
  const t = dict.legal.deleteMyData;
  const safeEmail = escapeHtml(p.email);
  const safeScope = escapeHtml(p.scope || 'all');
  const safeReason = escapeHtml(p.reason || '(no reason given)');
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">${escapeHtml(t.h1)}</h1>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px 12px;font-weight:bold;background:#F8F5F4;border:1px solid #eeeeee;width:160px;vertical-align:top;">Email</td><td style="padding:8px 12px;border:1px solid #eeeeee;"><a href="mailto:${safeEmail}" style="color:#f96e03;">${safeEmail}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">Scope</td><td style="padding:8px 12px;border:1px solid #eeeeee;">${safeScope}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;background:#F8F5F4;border:1px solid #eeeeee;vertical-align:top;">Reason</td><td style="padding:8px 12px;border:1px solid #eeeeee;white-space:pre-wrap;">${safeReason}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#575250;">
        Verify by replying to ${safeEmail} from the same address. Do NOT delete until identity check is complete.
      </p>
      <p style="margin-top:24px;font-size:11px;color:#888;">
        Sent via self-hosted Mailcow (mail.cleida.com.co). Not stored on any third-party SaaS.
      </p>
    </div>
  `;
}

function renderText(p: Payload): string {
  return [
    'DATA DELETION REQUEST',
    '========================',
    '',
    `Email:  ${p.email}`,
    `Scope:  ${p.scope || 'all'}`,
    '',
    'Reason:',
    p.reason || '(no reason given)',
    '',
    'Verify by replying to the same address before deletion.',
  ].join('\n');
}

function validate(body: unknown): { ok: true; data: Payload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'invalid_body' };
  const b = body as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'invalid_email' };
  return {
    ok: true,
    data: {
      email,
      scope: typeof b.scope === 'string' ? b.scope.trim().slice(0, 32) : 'all',
      reason: typeof b.reason === 'string' ? b.reason.trim().slice(0, 1000) : '',
      lang: typeof b.lang === 'string' && isLocale(b.lang) ? b.lang : DEFAULT_LOCALE,
    },
  };
}

export async function POST(req: NextRequest) {
  const sizeError = enforceBodySize(req, MAX_BODY_BYTES);
  if (sizeError) return sizeError;

  const ip = clientIp(req) ?? 'unknown';
  if (await checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const v = validate(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const dict = await getDictionary(v.data.lang ?? DEFAULT_LOCALE);
  const subject = `[Data deletion] ${v.data.email}`;
  const html = renderHtml(v.data, dict);
  const text = renderText(v.data);

  try {
    const result = await sendMail({
      to: TO_EMAIL,
      toName: TO_NAME,
      subject,
      html,
      text,
      replyTo: v.data.email,
    });
    const devNoop = result.messageId === 'dev-noop';
    if (!devNoop) await bumpRateLimit(RATE_LIMIT_ROUTE, ip);
    return NextResponse.json({ ok: true, emailSent: !devNoop });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}