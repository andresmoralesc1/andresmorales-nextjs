import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';
import { sendMail } from '@/lib/email';
import { createLead } from '@/lib/crm-store';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email-template';

// Brief has a max of 5 submissions / hour / IP (see checkRateLimit below).
// Body size guard: 10 KB is plenty for a full brief (name + email + role
// + company + problem + goal + tools + success metric + notes) which
// measures ~1.5-3 KB in practice.
const MAX_BODY_BYTES = 40 * 1024;

// Self-hosted Mailcow SMTP — see lib/email.ts for the transport config.
// Recipient + sender fall back to the Mailcow mailbox. BRIEF_*_EMAIL
// env vars are kept as optional overrides for testing.
const TO_EMAIL = process.env.BRIEF_TO_EMAIL || process.env.MAILCOW_USER || 'info@andresmorales.com.co';
const FROM_NAME = process.env.BRIEF_FROM_NAME || 'Andrés Morales · Portfolio Brief';
const MAIL_CONFIGURED = Boolean(process.env.MAILCOW_PASSWORD);

// ── ClickUp integration ─────────────────────────────────────────────────
// When a brief is received, also create a task in a ClickUp list so you
// can track, prioritize, and convert it to a project from one dashboard.
// Free-tier ClickUp doesn't expose Custom Fields via API in some plans, so
// we encode every brief field into the task description as Markdown instead.
// Get the API token at: Settings > Apps > API in ClickUp.
const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN || '';
const CLICKUP_LIST_ID = process.env.CLICKUP_BRIEF_LIST_ID || '';

// ── Anti-spam: in-memory rate limit per IP ───────────────────────────────
// 3 briefs / hour / IP. State lives in lib/rate-limit.ts so it can be
// shared with /api/contact (which uses its own bucket + max).
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_ROUTE = 'brief';

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
  budget: 'under2k' | '2to5k' | '5to15k' | '15to50k' | 'over50k';
  timeline: 'asap' | '1month' | '1to3months' | 'over3months' | 'flexible';
  additionalNotes?: string;
  attachmentFiles?: Array<{ name: string; url: string; size: number; type: string }>;
  // Locale submitted with the brief. Optional — used to pick the right
  // dictionary for the email templates (notification + auto-reply).
  lang?: string;
};

// ── Localized labels (from dict, not hardcoded maps) ───────────────────
// Each helper returns the localized label for the enum value, sourced from
// the active dictionary. Previously these were hardcoded English maps
// (`PROJECT_TYPE_LABELS`, etc.); they now live in `dictionaries/*.json` so
// notifications + auto-replies match the brief's submission locale.

function projectTypeLabel(p: BriefPayload, dict: Dictionary): string {
  return dict.brief.step2Type[p.projectType];
}

function frequencyLabel(p: BriefPayload, dict: Dictionary): string {
  return dict.brief.step3Frequency[p.frequency];
}

function budgetLabel(p: BriefPayload, dict: Dictionary): string {
  return dict.brief.step5Budget[p.budget];
}

function timelineLabel(p: BriefPayload, dict: Dictionary): string {
  return dict.brief.step5Timeline[p.timeline];
}

function renderFilesHtmlList(files?: Array<{ name: string; url: string; size: number; type: string }>): string | undefined {
  if (!files || files.length === 0) return undefined;
  return files
    .map(
      (f) =>
        `<div style="margin-bottom:6px;"><a href="https://andresmorales.com.co${escapeHtml(f.url)}" target="_blank" style="color:#f96e03;font-weight:600;text-decoration:underline;">${escapeHtml(f.name)}</a> <span style="color:#786F68;font-size:11px;">(${Math.round(f.size / 1024)} KB)</span></div>`
    )
    .join('');
}

function renderEmailHtml(p: BriefPayload, dict: Dictionary): string {
  const projectTypeOther = p.projectTypeOther ? `${dict.brief.email.fieldOther}${p.projectTypeOther}` : '';
  const subtitle = dict.brief.email.subtitle
    .replace('{name}', p.name)
    .replace('{email}', p.email);

  return buildBrandedEmailHtml({
    badge: '🚀 BRIEF DE PROYECTO & AUTOMATIZACIÓN',
    title: dict.brief.email.title,
    subtitle: `${subtitle} · ${p.company || 'Empresa Independiente'}`,
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;">
        Se ha recibido un nuevo brief completo de requerimientos técnicos y alcance:
      </p>
    `,
    tableRows: [
      { label: dict.brief.email.fieldCompany, value: p.company },
      { label: dict.brief.email.fieldRole, value: p.role },
      { label: dict.brief.email.fieldProjectType, value: projectTypeLabel(p, dict) + projectTypeOther },
      { label: dict.brief.email.fieldProblem, value: p.problem },
      { label: dict.brief.email.fieldTools, value: [...(p.tools || []), p.toolsOther].filter(Boolean).join(', ') },
      { label: dict.brief.email.fieldFrequency, value: frequencyLabel(p, dict) },
      { label: dict.brief.email.fieldGoal, value: p.goal },
      { label: dict.brief.email.fieldSuccess, value: p.successMetric },
      { label: dict.brief.email.fieldBudget, value: budgetLabel(p, dict) },
      { label: dict.brief.email.fieldTimeline, value: timelineLabel(p, dict) },
      { label: dict.brief.email.fieldAttachments || 'Archivos adjuntos', value: renderFilesHtmlList(p.attachmentFiles), isHtml: true },
      { label: dict.brief.email.fieldNotes, value: p.additionalNotes },
    ],
    ctaText: 'Abrir Dashboard CRM',
    ctaUrl: 'https://andresmorales.com.co/es/admin/crm',
    secondaryCtaText: 'Responder al Prospecto',
    secondaryCtaUrl: `mailto:${p.email}`,
    replyToEmail: p.email,
  });
}

function renderEmailText(p: BriefPayload, dict: Dictionary): string {
  // Section labels use the same field labels as the HTML table (uppercased
  // for the plain-text section headers — they read like newspaper headlines).
  const upper = (s: string) => s.toUpperCase();
  const sep = (label: string) => `${upper(label)}\n${'-'.repeat(label.length)}`;
  const projectTypeFull = p.projectTypeOther
    ? `${projectTypeLabel(p, dict)}${dict.brief.email.fieldOther}${p.projectTypeOther}`
    : projectTypeLabel(p, dict);
  const lines = [
    sep(dict.brief.email.title),
    '='.repeat(dict.brief.email.title.length),
    ``,
    `${dict.brief.email.fieldCompany}: ${p.company || '—'}`,
    `${dict.brief.email.fieldRole}: ${p.role || '—'}`,
    `From: ${p.name} <${p.email}>`,
    ``,
    sep(dict.brief.email.fieldProjectType),
    projectTypeFull,
    ``,
    sep(dict.brief.email.fieldProblem),
    p.problem,
    ``,
    `${dict.brief.email.fieldTools}: ${[...(p.tools || []), p.toolsOther].filter(Boolean).join(', ') || '—'}`,
    `${dict.brief.email.fieldFrequency}: ${frequencyLabel(p, dict)}`,
    ``,
    sep(dict.brief.email.fieldGoal),
    p.goal,
    `${dict.brief.email.fieldSuccess}: ${p.successMetric || '—'}`,
    ``,
    sep(dict.brief.email.fieldBudget),
    `${budgetLabel(p, dict)} · ${timelineLabel(p, dict)}`,
    ``,
    p.attachmentFiles && p.attachmentFiles.length
      ? `${sep(dict.brief.email.fieldAttachments || 'ARCHIVOS ADJUNTOS')}\n${p.attachmentFiles.map((f) => `${f.name} (https://andresmorales.com.co${f.url})`).join('\n')}\n`
      : '',
    sep(dict.brief.email.fieldNotes),
    p.additionalNotes || '—',
  ];
  return lines.join('\n');
}

function parseUploadedFiles(val: unknown): Array<{ name: string; url: string; size: number; type: string }> {
  if (!Array.isArray(val)) return [];
  return val
    .filter((f) => f && typeof f === 'object' && typeof (f as any).url === 'string' && (f as any).url.startsWith('/uploads/briefs/'))
    .slice(0, 10)
    .map((f: any) => ({
      name: String(f.name || 'archivo').slice(0, 120),
      url: String(f.url).slice(0, 300),
      size: typeof f.size === 'number' ? f.size : 0,
      type: String(f.type || '').slice(0, 80),
    }));
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

  // Whitelist enum values (NOT just `as` cast). Without this, a malicious
  // POST with budget='hacked' would crash BUDGET_LABELS lookup → `undefined`
  // injected into the email body, or a stray field like frequency='<script>'
  // would land in ClickUp as markdown. Fail closed.
  const PROJECT_TYPES = ['web', 'automation', 'ai-integration', 'consulting', 'other'] as const;
  const FREQUENCIES = ['daily', 'weekly', 'monthly', 'one-off', 'ad-hoc'] as const;
  const BUDGETS = ['under2k', '2to5k', '5to15k', '15to50k', 'over50k'] as const;
  const TIMELINES = ['asap', '1month', '1to3months', 'over3months', 'flexible'] as const;

  const projectType = String(b.projectType) as (typeof PROJECT_TYPES)[number];
  if (!PROJECT_TYPES.includes(projectType)) return { ok: false, error: 'Invalid projectType' };
  const frequency = String(b.frequency) as (typeof FREQUENCIES)[number];
  if (!FREQUENCIES.includes(frequency)) return { ok: false, error: 'Invalid frequency' };
  const budget = String(b.budget) as (typeof BUDGETS)[number];
  if (!BUDGETS.includes(budget)) return { ok: false, error: 'Invalid budget' };
  const timeline = String(b.timeline) as (typeof TIMELINES)[number];
  if (!TIMELINES.includes(timeline)) return { ok: false, error: 'Invalid timeline' };

  // `lang` is optional. If absent or invalid, the POST handler will fall
  // back to DEFAULT_LOCALE (`en`). Whitelisting here just normalizes the
  // value to a known Locale — no error if missing.
  const langRaw = b.lang;
  const lang = typeof langRaw === 'string' && isLocale(langRaw) ? langRaw : undefined;

  return {
    ok: true,
    data: {
      name: String(b.name).slice(0, 200),
      email: String(b.email).slice(0, 200),
      company: b.company ? String(b.company).slice(0, 200) : '',
      role: b.role ? String(b.role).slice(0, 200) : '',
      projectType,
      projectTypeOther: b.projectTypeOther ? String(b.projectTypeOther).slice(0, 400) : '',
      problem: String(b.problem).slice(0, 4000),
      tools: Array.isArray(b.tools) ? (b.tools as string[]).slice(0, 20).map((t) => String(t).slice(0, 80)) : [],
      toolsOther: b.toolsOther ? String(b.toolsOther).slice(0, 200) : '',
      frequency,
      goal: String(b.goal).slice(0, 4000),
      successMetric: b.successMetric ? String(b.successMetric).slice(0, 400) : '',
      budget,
      timeline,
      additionalNotes: b.additionalNotes ? String(b.additionalNotes).slice(0, 2000) : '',
      attachmentFiles: parseUploadedFiles(b.attachmentFiles),
      lang,
    },
  };
}
async function sendNotification(data: BriefPayload, dict: Dictionary): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendMail({
      to: TO_EMAIL,
      replyTo: data.email,
      subject: `${dict.brief.email.title}: ${data.name} — ${projectTypeLabel(data, dict)}`,
      html: renderEmailHtml(data, dict),
      text: renderEmailText(data, dict),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

export async function POST(req: NextRequest) {
  // Drop oversized payloads before parsing. 10 KB is the brief form's
  // realistic ceiling — anything larger is abuse.
  const tooBig = enforceBodySize(req, MAX_BODY_BYTES);
  if (tooBig) return tooBig;

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
  const rl = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);
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

  // Anti-spam #3: timing. Bots submit in <1s. Real users take ~30s to fill
  // a 5-step wizard. Server tracks mounted-at via `_t` field in ms.
  // Threshold of 1500ms is conservative — drops fast bots without false
  // positives (matches the threshold used on /api/contact).
  const t = (body && typeof body === 'object' && (body as Record<string, unknown>)._t) as unknown;
  if (typeof t === 'number' && t > 0 && t < 1500) {
    console.warn(`[brief] too-fast submission ip=${ip} _t=${t}ms`);
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  }

  const result = validatePayload(body);
  // `validatePayload` returns a discriminated union `{ ok: true, data }
  // | { ok: false, error }`. The `result.ok = false` branch must be
  // narrowed to access `error` — using `in` operator for explicit
  // narrowing that survives any compiler regression.
  if (!result.ok || !('data' in result)) {
    return NextResponse.json({ error: 'error' in result ? result.error : 'Invalid payload' }, { status: 400 });
  }
  const data = result.data;

  const filesSummaryList = data.attachmentFiles?.map((f) => `Adjunto: ${f.name} (https://andresmorales.com.co${f.url})`) || [];
  const filesMessagePart = filesSummaryList.length > 0 ? `\n📎 Adjuntos:\n${filesSummaryList.join('\n')}` : '';

  // Auto-log brief into local CRM and sync with Clientes & Empresas
  try {
    const lead = createLead({
      name: data.name,
      email: data.email,
      company: data.company || '',
      service: `Brief: ${data.projectType}`,
      budget: data.budget,
      message: `Problema: ${data.problem}\nObjetivo: ${data.goal}${filesMessagePart}`,
      source: 'brief',
      status: 'brief_received',
      briefData: data as any,
    });

    syncLeadToBusiness({
      id: lead?.id,
      name: data.name,
      email: data.email,
      company: data.company,
      service: `Brief: ${data.projectType}`,
      budget: data.budget,
      status: 'en_progreso',
      message: `Problema: ${data.problem}\nObjetivo: ${data.goal}${filesMessagePart}`,
    });

    const tgFileItems = data.attachmentFiles?.map((f) => `• <a href="https://andresmorales.com.co${f.url}">${escapeHtml(f.name)}</a>`) || [];
    const tgFilesText = tgFileItems.length > 0 ? `\n📎 <b>Archivos adjuntos (${tgFileItems.length}):</b>\n${tgFileItems.join('\n')}\n` : '';

    // Instant alert to Andres via Telegram Bot
    sendTelegramNotification(
      `🚀 <b>¡Nuevo Brief de Proyecto Recibido!</b>\n\n` +
        `👤 <b>Cliente:</b> ${data.name}\n` +
        `🏢 <b>Empresa:</b> ${data.company || '—'} (${data.role || '—'})\n` +
        `🎯 <b>Tipo:</b> ${data.projectType}\n` +
        `💰 <b>Presupuesto:</b> ${data.budget}\n` +
        `⏱️ <b>Plazo:</b> ${data.timeline}\n\n` +
        `📝 <b>Objetivo:</b> ${data.goal.slice(0, 240)}...\n` +
        tgFilesText + `\n` +
        `👉 <a href="https://andresmorales.com.co/es/admin/crm">Ver en Dashboard CRM</a>`,
      {
        buttons: [
          [
            { text: '📊 Abrir CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
            { text: '✉️ Responder por Correo', url: `mailto:${data.email}` },
          ],
        ],
      }
    ).catch(() => {});
  } catch (crmErr) {
    console.warn('[brief] Could not auto-log to CRM:', crmErr);
  }

  // Bump AFTER validation passes — failed validation doesn't count
  // against the limit (so a human user fixing typos isn't punished).
  bumpRateLimit(RATE_LIMIT_ROUTE, ip);

  // If Mailcow is not configured, we don't fail the UX — we just log the brief.
  // This lets the route work in dev/demo without leaking the SMTP setup.
  if (!MAIL_CONFIGURED) {
    console.warn('[brief] MAILCOW_PASSWORD not set — brief received but not emailed:', {
      from: data.name,
      email: data.email,
      type: data.projectType,
    });
    return NextResponse.json({ ok: true, emailSent: false, reason: 'email-not-configured' });
  }

  try {
    // Resolve the locale for email templates. If the brief was submitted
    // without a `lang` field (e.g. a hand-crafted curl), fall back to en.
    const lang = data.lang ?? DEFAULT_LOCALE;
    const dict = await getDictionary(lang);

    const sendResult = await sendNotification(data, dict);
    if (!sendResult.ok) {
      console.error('[brief] Mailcow error:', sendResult.error);
      return NextResponse.json(
        { error: 'Failed to send' },
        { status: 502 }
      );
    }

    // Fire-and-forget auto-reply to the user. Failure here does NOT
    // affect the brief send — already logged + replied in the inbox.
    // await is intentionally skipped so we don't inflate the response
    // time if the SMTP relay is slow on the second send.
    sendAutoReply(data, dict, lang).catch((err) => {
      console.warn('[brief] auto-reply failed (non-fatal):', err);
    });

    // Fire-and-forget: create a task in ClickUp so the brief lands in
    // your board as soon as it arrives. Same non-blocking pattern as the
    // auto-reply: a ClickUp outage must never affect the user-facing
    // success of the submission.
    sendToClickUp(data, dict).catch((err) => {
      console.warn('[brief] ClickUp sync failed (non-fatal):', err);
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error('[brief] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

// Send a confirmation email to whoever filled the brief. Uses the same
// Mailcow transport so nothing leaves the user's own mail server.
async function sendAutoReply(p: BriefPayload, dict: Dictionary, lang: string): Promise<void> {
  const firstName = p.name.split(' ')[0] || p.name;
  const greeting = dict.brief.emailAutoReply.greeting.replace('{firstName}', escapeHtml(firstName));
  const subject = dict.brief.emailAutoReply.subject.replace('{firstName}', firstName);
  // Locale-aware brief link. `en` uses the root URL; `es`/`pt` prefix the
  // path segment. Matches the `[lang]` route segment in `app/[lang]/brief/page.tsx`.
  const briefUrl = lang === 'en'
    ? 'https://andresmorales.com.co/brief'
    : `https://andresmorales.com.co/${lang}/brief`;

  const html = buildBrandedEmailHtml({
    badge: 'CONFIRMACIÓN OFICIAL',
    title: greeting,
    subtitle: 'Andrés Morales · Automatización con IA & Desarrollo Web',
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;line-height:1.7;">
        ${escapeHtml(dict.brief.emailAutoReply.body1)}
      </p>
      <p style="margin:0 0 16px 0;font-size:14.5px;color:#4A423D;line-height:1.7;">
        ${escapeHtml(dict.brief.emailAutoReply.body2)}
      </p>
      <p style="margin:24px 0 0 0;font-size:14px;color:#1E1810;font-weight:600;">
        ${escapeHtml(dict.brief.emailAutoReply.signature)}
      </p>
    `,
    ctaText: 'Agendar Llamada de 30 min (Google Calendar)',
    ctaUrl: 'https://calendar.app.google/QvUUb5xu4927P95a8',
    secondaryCtaText: '💬 Contactar por WhatsApp',
    secondaryCtaUrl: 'https://wa.me/573161482507',
    footerNote: `${dict.brief.emailAutoReply.footer} <a href="${briefUrl}" style="color:#f96e03;">${escapeHtml(briefUrl)}</a>.`,
  });
  const text = `${dict.brief.emailAutoReply.greeting.replace('{firstName}', firstName)}

${dict.brief.emailAutoReply.body1}

${dict.brief.emailAutoReply.body2}

${dict.brief.emailAutoReply.signature}

---
${dict.brief.emailAutoReply.footer} ${briefUrl}.`;

  await sendMail({
    to: p.email,
    toName: p.name,
    replyTo: TO_EMAIL,
    subject,
    html,
    text,
  });
}

// GET returns a simple health check (does NOT expose whether the key is set)
export async function GET() {
  return NextResponse.json({ ok: true, route: 'brief' });
}

// Send the brief to ClickUp as a task in the configured list. We encode
// every form field into the task description as Markdown rather than
// relying on Custom Fields (those are gated behind a paid plan on
// some ClickUp workspaces). Free-tier friendly + instantly readable.
async function sendToClickUp(p: BriefPayload, dict: Dictionary): Promise<void> {
  if (!CLICKUP_API_TOKEN || !CLICKUP_LIST_ID) {
    // Not configured: skip silently. The brief still went to email.
    return;
  }

  // Priority mapping: 1=urgent, 2=high, 3=normal, 4=low. We use the
  // raw budget code (e.g. "over50k") rather than the display label so
  // this stays correct as the form's dict.brief.step5Budget values evolve.
  let priority = 3;
  if (p.budget === 'over50k' || p.budget === '15to50k') priority = 1;  // urgent
  else if (p.budget === '5to15k') priority = 2;                       // high
  else if (p.budget === 'under2k' || p.budget === '2to5k') priority = 3; // normal

  // Use the human-readable labels for the task title so the board is
  // readable at a glance. Truncate name for the title (ClickUp titles
  // are 250 chars max, but we keep it short to scan well in a list).
  const titleName = p.name.length > 60 ? p.name.slice(0, 57) + '...' : p.name;
  const title = `${dict.brief.email.title}: ${titleName} — ${projectTypeLabel(p, dict)} · ${budgetLabel(p, dict)}`;

  // Wrap free-form user input in backticks to neutralize Markdown
  // (asterisks, brackets, code fences) inside ClickUp's renderer.
  // ClickUp's markdown viewer sanitizes javascript: URLs, but XSS-via-
  // markdown remains a real surface (e.g. `[text](url)` exfiltration,
  // img-tag tracking pixels). Backtick-quoting turns the whole field
  // into a single inline-code block — escapes all special chars.
  const user = (s: string) => `\`${s.replace(/`/g, '‵')}\``;
  const description = [
    `**Name:** ${user(p.name)}`,
    `**Email:** ${user(p.email)}`,
    p.company ? `**${dict.brief.email.fieldCompany}:** ${user(p.company)}` : '',
    p.role ? `**${dict.brief.email.fieldRole}:** ${user(p.role)}` : '',
    ``,
    `**${dict.brief.email.fieldProjectType}:** ${projectTypeLabel(p, dict)}`,
    p.projectTypeOther ? `**${dict.brief.email.fieldProjectType} (other):** ${user(p.projectTypeOther)}` : '',
    `**${dict.brief.email.fieldBudget}:** ${budgetLabel(p, dict)}`,
    `**${dict.brief.email.fieldTimeline}:** ${timelineLabel(p, dict)}`,
    `**${dict.brief.email.fieldFrequency}:** ${frequencyLabel(p, dict)}`,
    ``,
    `**${dict.brief.email.fieldProblem}**`,
    user(p.problem),
    ``,
    p.tools && p.tools.length ? `**${dict.brief.email.fieldTools}**\n- ${p.tools.map(user).join('\n- ')}` : '',
    p.toolsOther ? `**${dict.brief.email.fieldTools} (other):** ${user(p.toolsOther)}` : '',
    ``,
    `**${dict.brief.email.fieldGoal}**`,
    user(p.goal),
    p.successMetric ? `**${dict.brief.email.fieldSuccess}:** ${user(p.successMetric)}` : '',
    ``,
    p.additionalNotes ? `**${dict.brief.email.fieldNotes}**\n${user(p.additionalNotes)}\n` : '',
    p.attachmentFiles && p.attachmentFiles.length
      ? `**${dict.brief.email.fieldAttachments || 'Archivos Adjuntos'}**\n${p.attachmentFiles.map((f) => `- [${f.name}](https://andresmorales.com.co${f.url})`).join('\n')}\n`
      : '',
    `---`,
    `_Submitted via andresmorales.com.co brief wizard._`,
  ]
    .filter(Boolean)
    .join('\n');

  // ClickUp custom status IDs (from the list setup). Hard-coded so we
  // don't hit the API on every submission just to resolve names — the
  // list config rarely changes. Update these if the workflow is
  // reshuffled in the ClickUp UI.
  //
  //   to do      → newly received, unread
  //   reviewing  → opened, doing the 24h read
  //   quoted     → sent a proposal back
  //   complete   → won (or lost and archived)
  //
  // ClickUp only allows one custom closed status per list, so we
  // collapse "won" and "lost" into the same `complete` lane. To tell
  // them apart at a glance, mark the task with a custom field or just
  // rename the task title once the deal closes.
  const STATUS_NEW = 'to do';

  // Slack-style deadline flag in the title — high-budget leads feel
  // more urgent in the inbox. The 🔥 only appears on $15k+ briefs.
  const urgencyEmoji =
    priority === 1 ? '🔥 ' : priority === 2 ? '⚡️ ' : '';

  const res = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
    method: 'POST',
    headers: {
      Authorization: CLICKUP_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `${urgencyEmoji}${title}`,
      description,
      priority,
      status: STATUS_NEW,
      // Start date = the moment the brief landed, so the time-in-list
      // metric ("how long has this been sitting in 'to do'") is real,
      // not zero. ClickUp's API is fussy about date formats: it expects
      // a UNIX timestamp in **milliseconds**, not ISO-8601 — the latter
      // returns INPUT_006 ("Date invalid"). Tested live 2026-07-10.
      start_date: Date.now(),
      // Due date is a soft SLA: 24h to move out of "to do". Low-budget
      // briefs (<$2k) get 72h because they're often aspirational and
      // chasing them within a day burns goodwill.
      due_date: Date.now() +
        (priority === 1 ? 24 : priority === 2 ? 24 : 72) * 60 * 60 * 1000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ClickUp task create failed: ${res.status} ${body}`);
  }
}
