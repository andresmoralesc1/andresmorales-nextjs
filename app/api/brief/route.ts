import { NextRequest, NextResponse } from 'next/server';

// Brevo transactional email API
// Docs: https://developers.brevo.com/reference/sendtransacemail
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const TO_EMAIL = process.env.BRIEF_TO_EMAIL || 'andres@andresmorales.com.co';
const FROM_EMAIL = process.env.BRIEF_FROM_EMAIL || 'andres@andresmorales.com.co';
const FROM_NAME = process.env.BRIEF_FROM_NAME || 'Andres Morales · Portfolio Brief';

// ── Anti-spam: in-memory rate limit per IP ───────────────────────────────
// 3 briefs / hour / IP. In-memory is fine for a single-instance Next server
// (it restarts on deploy, which effectively wipes the slate). For a
// multi-instance deploy, swap for Redis or Upstash.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryInSec?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) return { allowed: true };
  if (now > entry.resetAt) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryInSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function bumpRateLimit(ip: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clientIp(req: NextRequest): string {
  // Honor common proxy headers; fall back to a tag if nothing is present.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

type BriefPayload = {
  // step 1 — About you
  name: string;
  email: string;
  company?: string;
  role?: string;
  // step 2 — Project type
  projectType: 'web' | 'automation' | 'ai-integration' | 'consulting' | 'other';
  projectTypeOther?: string;
  // step 3 — The problem
  problem: string;
  tools: string[];
  toolsOther?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-off' | 'ad-hoc';
  // step 4 — The goal
  goal: string;
  successMetric?: string;
  // step 5 — Logistics
  budget: '<2k' | '2-5k' | '5-15k' | '15-50k' | '50k+';
  timeline: 'asap' | '1-month' | '1-3-months' | '3+ months' | 'flexible';
  additionalNotes?: string;
};

const PROJECT_TYPE_LABELS: Record<BriefPayload['projectType'], string> = {
  web: 'Web app / site',
  automation: 'Automation / workflow',
  'ai-integration': 'AI integration',
  consulting: 'Consulting / advisory',
  other: 'Other',
};

const FREQUENCY_LABELS: Record<BriefPayload['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'one-off': 'One-off',
  'ad-hoc': 'Ad-hoc (on demand)',
};

const BUDGET_LABELS: Record<BriefPayload['budget'], string> = {
  '<2k': 'Under $2k',
  '2-5k': '$2k – $5k',
  '5-15k': '$5k – $15k',
  '15-50k': '$15k – $50k',
  '50k+': '$50k+',
};

const TIMELINE_LABELS: Record<BriefPayload['timeline'], string> = {
  asap: 'ASAP',
  '1-month': 'Within 1 month',
  '1-3-months': '1 – 3 months',
  '3+ months': '3+ months',
  flexible: 'Flexible',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmailHtml(p: BriefPayload): string {
  const row = (label: string, value: string | string[] | undefined) => {
    const v = Array.isArray(value) ? value.join(', ') : value || '—';
    return `<tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;width:160px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;">${escapeHtml(v)}</td></tr>`;
  };

  return `
    <div style="font-family:Roboto,Arial,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">New Project Brief</h1>
        <p style="margin:8px 0 0 0;opacity:0.9;font-size:14px;">From ${escapeHtml(p.name)} — ${escapeHtml(p.email)}</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${row('Company', p.company)}
        ${row('Role', p.role)}
        ${row('Project type', PROJECT_TYPE_LABELS[p.projectType] + (p.projectTypeOther ? ` — ${p.projectTypeOther}` : ''))}
        ${row('Problem to solve', p.problem)}
        ${row('Tools it touches today', [...(p.tools || []), p.toolsOther].filter(Boolean) as string[])}
        ${row('Frequency', FREQUENCY_LABELS[p.frequency])}
        ${row('Goal / outcome', p.goal)}
        ${row('Success metric', p.successMetric)}
        ${row('Budget', BUDGET_LABELS[p.budget])}
        ${row('Timeline', TIMELINE_LABELS[p.timeline])}
        ${row('Additional notes', p.additionalNotes)}
      </table>
      <p style="margin-top:24px;font-size:13px;color:#575250;">
        Reply directly to <a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a>
      </p>
    </div>
  `;
}

function renderEmailText(p: BriefPayload): string {
  const lines = [
    `NEW PROJECT BRIEF`,
    `================`,
    ``,
    `From:  ${p.name} <${p.email}>`,
    `Role:  ${p.role || '—'}`,
    `Company: ${p.company || '—'}`,
    ``,
    `PROJECT TYPE`,
    `------------`,
    `${PROJECT_TYPE_LABELS[p.projectType]}${p.projectTypeOther ? ` — ${p.projectTypeOther}` : ''}`,
    ``,
    `THE PROBLEM`,
    `-----------`,
    p.problem,
    ``,
    `Tools it touches:  ${[...(p.tools || []), p.toolsOther].filter(Boolean).join(', ') || '—'}`,
    `Frequency:        ${FREQUENCY_LABELS[p.frequency]}`,
    ``,
    `GOAL / OUTCOME`,
    `--------------`,
    p.goal,
    `Success metric:  ${p.successMetric || '—'}`,
    ``,
    `LOGISTICS`,
    `---------`,
    `Budget:    ${BUDGET_LABELS[p.budget]}`,
    `Timeline:  ${TIMELINE_LABELS[p.timeline]}`,
    ``,
    `ADDITIONAL NOTES`,
    `----------------`,
    p.additionalNotes || '—',
  ];
  return lines.join('\n');
}

function validatePayload(body: unknown): { ok: true; data: BriefPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const required = ['name', 'email', 'projectType', 'problem', 'goal', 'frequency', 'budget', 'timeline'];
  for (const k of required) {
    if (!b[k] || (typeof b[k] === 'string' && !(b[k] as string).trim())) {
      return { ok: false, error: `Missing field: ${k}` };
    }
  }

  // Basic email shape
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email))) {
    return { ok: false, error: 'Invalid email' };
  }

  return {
    ok: true,
    data: {
      name: String(b.name).slice(0, 200),
      email: String(b.email).slice(0, 200),
      company: b.company ? String(b.company).slice(0, 200) : '',
      role: b.role ? String(b.role).slice(0, 200) : '',
      projectType: b.projectType as BriefPayload['projectType'],
      projectTypeOther: b.projectTypeOther ? String(b.projectTypeOther).slice(0, 400) : '',
      problem: String(b.problem).slice(0, 4000),
      tools: Array.isArray(b.tools) ? (b.tools as string[]).slice(0, 20).map((t) => String(t).slice(0, 80)) : [],
      toolsOther: b.toolsOther ? String(b.toolsOther).slice(0, 200) : '',
      frequency: b.frequency as BriefPayload['frequency'],
      goal: String(b.goal).slice(0, 4000),
      successMetric: b.successMetric ? String(b.successMetric).slice(0, 400) : '',
      budget: b.budget as BriefPayload['budget'],
      timeline: b.timeline as BriefPayload['timeline'],
      additionalNotes: b.additionalNotes ? String(b.additionalNotes).slice(0, 2000) : '',
    },
  };
}
async function sendViaBrevo(data: BriefPayload): Promise<{ ok: boolean; error?: string; status?: number }> {
  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: TO_EMAIL, name: 'Andres' }],
    replyTo: { email: data.email, name: data.name },
    subject: `Brief: ${data.name} — ${PROJECT_TYPE_LABELS[data.projectType]}`,
    htmlContent: renderEmailHtml(data),
    textContent: renderEmailText(data),
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
  // Anti-spam #1: honey-pot field. Bots fill every input they see;
  // humans never see this one because it's hidden via CSS in the form.
  // If a value arrives here, we silently reject as a generic 400 so the
  // bot doesn't learn anything about the schema.
  // Check is duplicated on client (input has 'display:none') and server.
  try {
    const formPeek = await req.clone().formData().catch(() => null);
    if (formPeek) {
      const honeypot = formPeek.get('website');
      if (honeypot && String(honeypot).trim() !== '') {
        console.warn('[brief] honey-pot triggered (bot)');
        return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
      }
    }
  } catch {
    // body isn't form-encoded — skip, fall through to JSON parse
  }

  // Anti-spam #2: rate limit per IP. 3 briefs / hour. Returns 429 with
  // a retry-after hint so legitimate users know to wait.
  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    console.warn(`[brief] rate-limited ip=${ip} retry_in=${rl.retryInSec}s`);
    return NextResponse.json(
      { error: 'Too many requests. Try again later.', retryInSec: rl.retryInSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryInSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honey-pot check on JSON path too: a handcrafted bot might POST
  // application/json with { website: 'http://spam' }.
  if (body && typeof body === 'object' && 'website' in body) {
    const w = (body as Record<string, unknown>).website;
    if (w && String(w).trim() !== '') {
      console.warn('[brief] honey-pot triggered (bot/json)');
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }
  }

  const result = validatePayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const data = result.data;

  // Bump AFTER validation passes — failed validation doesn't count
  // against the limit (so a human user fixing typos isn't punished).
  bumpRateLimit(ip);

  // If Brevo key is not configured, we don't fail the UX — we just log the brief.
  // This lets the route work in dev/demo without leaking the API setup.
  if (!BREVO_API_KEY) {
    console.warn('[brief] BREVO_API_KEY not set — brief received but not emailed:', {
      from: data.name,
      email: data.email,
      type: data.projectType,
    });
    return NextResponse.json({ ok: true, emailSent: false, reason: 'email-not-configured' });
  }

  try {
    const sendResult = await sendViaBrevo(data);
    if (!sendResult.ok) {
      console.error('[brief] Brevo error:', sendResult.status, sendResult.error);
      return NextResponse.json(
        { error: 'Failed to send', details: sendResult.error },
        { status: 502 }
      );
    }

    // Fire-and-forget auto-reply to the user. Failure here does NOT
    // affect the brief send — already logged + replied in the inbox.
    // await is intentionally skipped so we don't inflate the response
    // time if Brevo is slow on the second send.
    sendAutoReply(data).catch((err) => {
      console.warn('[brief] auto-reply failed (non-fatal):', err);
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error('[brief] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

// Send a confirmation email to whoever filled the brief. Uses the same
// verified sender so nothing leaves the andres@andresmorales.com.co
// envelope. Same Brevo endpoint, parallel route.
async function sendAutoReply(p: BriefPayload): Promise<void> {
  const html = `
    <div style="font-family:Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">Thanks for the brief, ${escapeHtml(p.name.split(' ')[0] || p.name)}.</h1>
      </div>
      <div style="padding:24px 32px;color:#575250;line-height:1.6;">
        <p>I got your brief and will read it personally within the next 24 hours.</p>
        <p>If anything is unclear or you want to add context in the meantime, just reply to this email — it goes straight to me.</p>
        <p style="margin-top:32px;">— Andrés</p>
        <p style="font-size:13px;color:#999;margin-top:24px;">
          You received this because you submitted the project brief at
          <a href="https://portafolio.andresmorales.com.co/brief" style="color:#f96e03;">portafolio.andresmorales.com.co/brief</a>.
        </p>
      </div>
    </div>
  `;
  const text = `Thanks for the brief, ${p.name.split(' ')[0] || p.name}.

I got it and will read it personally within the next 24 hours.

If anything is unclear or you want to add context in the meantime, just reply to this email — it goes straight to me.

— Andrés

---
You received this because you submitted the project brief at portafolio.andresmorales.com.co/brief.`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      // User is the recipient. Using email-to-name "Andrés" would confuse;
      // use the user's own name (or fall back to their email) as the "to" name.
      to: [{ email: p.email, name: p.name }],
      replyTo: { email: FROM_EMAIL, name: 'Andrés Morales' },
      subject: `Got your brief — ${p.name.split(' ')[0] || p.name}`,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo auto-reply failed: ${res.status} ${body}`);
  }
}

// GET returns a simple health check (does NOT expose whether the key is set)
export async function GET() {
  return NextResponse.json({ ok: true, route: 'brief' });
}
