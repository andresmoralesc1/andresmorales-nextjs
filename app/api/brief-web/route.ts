import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';
import { sendMail } from '@/lib/email';

const MAX_BODY_BYTES = 15 * 1024;
const TO_EMAIL = process.env.BRIEF_TO_EMAIL || process.env.MAILCOW_USER || 'info@andresmorales.com.co';
const MAIL_CONFIGURED = Boolean(process.env.MAILCOW_PASSWORD);

const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN || '';
const CLICKUP_LIST_ID = process.env.CLICKUP_BRIEF_LIST_ID || '';

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_ROUTE = 'brief-web';

type BriefWebPayload = {
  mode: 'express' | 'detailed';
  name: string;
  email: string;
  company?: string;
  role?: string;
  phone?: string;
  currentSite?: string;

  webType: 'landing' | 'corporate' | 'ecommerce' | 'webapp' | 'redesign' | 'other';
  webTypeOther?: string;
  goal: 'leads' | 'sales' | 'credibility' | 'automation' | 'launch' | 'other';
  goalOther?: string;
  references?: string;
  referencesNotes?: string;

  brandSummary?: string;
  brandValues?: string;
  logoStatus?: 'vector' | 'image' | 'need_design' | 'partial';
  colors?: string;
  vibes?: string[];
  audience?: string;
  mainCta?: string;
  pagesNeeded?: string[];
  featuresNeeded?: string[];
  contentOrigin?: 'client' | 'need_copywriting' | 'mix' | 'existing';
  mediaStatus?: 'yes' | 'partial' | 'need_help';
  languages?: string;
  domainHosting?: 'both' | 'domain_only' | 'none' | 'not_sure';

  budget: 'under2k' | '2to5k' | '5to15k' | '15to50k' | 'flexible';
  timeline: 'asap' | '1month' | '1to2months' | 'flexible';
  notes?: string;

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

function renderEmailHtml(p: BriefWebPayload, dict: Dictionary): string {
  const row = (label: string, value: string | string[] | undefined) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return '';
    const v = Array.isArray(value) ? value.join(', ') : value;
    return `<tr><td style="padding:8px 12px;font-weight:bold;color:#1E1810;background:#F8F5F4;border:1px solid #eeeeee;width:180px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#575250;border:1px solid #eeeeee;">${escapeHtml(v)}</td></tr>`;
  };

  const webTypeLabel = p.webType === 'other' ? `Otro (${p.webTypeOther || ''})` : (dict.briefWeb.webTypes[p.webType] || p.webType);
  const goalLabel = p.goal === 'other' ? `Otro (${p.goalOther || ''})` : (dict.briefWeb.goals[p.goal] || p.goal);
  const budgetLabel = dict.briefWeb.budgets[p.budget] || p.budget;
  const timelineLabel = dict.briefWeb.timelines[p.timeline] || p.timeline;
  const logoLabel = p.logoStatus ? (dict.briefWeb.logoOptions[p.logoStatus] || p.logoStatus) : undefined;
  const contentLabel = p.contentOrigin ? (dict.briefWeb.contentOrigins[p.contentOrigin] || p.contentOrigin) : undefined;
  const mediaLabel = p.mediaStatus ? (dict.briefWeb.mediaOptions[p.mediaStatus] || p.mediaStatus) : undefined;
  const domainLabel = p.domainHosting ? (dict.briefWeb.domainHostingOptions[p.domainHosting] || p.domainHosting) : undefined;

  const modeBadge = p.mode === 'express' ? '⚡ EXPRESS (3-5 min)' : '🔍 DETALLADO (15-20 min)';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <span style="display:inline-block;background:rgba(0,0,0,0.2);padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;margin-bottom:8px;">${modeBadge}</span>
        <h1 style="margin:0;font-size:22px;">${escapeHtml(dict.briefWeb.email.title)}</h1>
        <p style="margin:8px 0 0 0;opacity:0.95;font-size:14px;">De: <strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.email)})</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${row(dict.briefWeb.email.fieldMode, modeBadge)}
        ${row(dict.briefWeb.email.fieldCompany, p.company)}
        ${row(dict.briefWeb.email.fieldRole, p.role)}
        ${row(dict.briefWeb.email.fieldPhone, p.phone)}
        ${row(dict.briefWeb.email.fieldCurrentSite, p.currentSite)}
        ${row(dict.briefWeb.email.fieldWebType, webTypeLabel)}
        ${row(dict.briefWeb.email.fieldGoal, goalLabel)}
        ${row(dict.briefWeb.email.fieldReferences, p.references)}
        ${row(dict.briefWeb.email.fieldReferencesNotes, p.referencesNotes)}
        ${row(dict.briefWeb.email.fieldBrandSummary, p.brandSummary)}
        ${row(dict.briefWeb.email.fieldBrandValues, p.brandValues)}
        ${row(dict.briefWeb.email.fieldLogo, logoLabel)}
        ${row(dict.briefWeb.email.fieldColors, p.colors)}
        ${row(dict.briefWeb.email.fieldVibes, p.vibes)}
        ${row(dict.briefWeb.email.fieldAudience, p.audience)}
        ${row(dict.briefWeb.email.fieldMainCta, p.mainCta)}
        ${row(dict.briefWeb.email.fieldPages, p.pagesNeeded)}
        ${row(dict.briefWeb.email.fieldFeatures, p.featuresNeeded)}
        ${row(dict.briefWeb.email.fieldContentOrigin, contentLabel)}
        ${row(dict.briefWeb.email.fieldMedia, mediaLabel)}
        ${row(dict.briefWeb.email.fieldLanguages, p.languages)}
        ${row(dict.briefWeb.email.fieldDomainHosting, domainLabel)}
        ${row(dict.briefWeb.email.fieldBudget, budgetLabel)}
        ${row(dict.briefWeb.email.fieldTimeline, timelineLabel)}
        ${row(dict.briefWeb.email.fieldNotes, p.notes)}
      </table>
      <p style="margin-top:24px;font-size:13px;color:#575250;">
        ${escapeHtml(dict.briefWeb.email.replyTo.replace('{email}', p.email))} <a href="mailto:${escapeHtml(p.email)}" style="color:#f96e03;">${escapeHtml(p.email)}</a>
      </p>
    </div>
  `;
}

function renderEmailText(p: BriefWebPayload, dict: Dictionary): string {
  const webTypeLabel = p.webType === 'other' ? `Otro (${p.webTypeOther || ''})` : (dict.briefWeb.webTypes[p.webType] || p.webType);
  const goalLabel = p.goal === 'other' ? `Otro (${p.goalOther || ''})` : (dict.briefWeb.goals[p.goal] || p.goal);
  const budgetLabel = dict.briefWeb.budgets[p.budget] || p.budget;
  const timelineLabel = dict.briefWeb.timelines[p.timeline] || p.timeline;

  const lines = [
    `=== BRIEF DE PROYECTO WEB (${p.mode.toUpperCase()}) ===`,
    ``,
    `Nombre: ${p.name}`,
    `Email: ${p.email}`,
    p.company ? `Empresa: ${p.company}` : '',
    p.role ? `Rol: ${p.role}` : '',
    p.phone ? `Tel/WhatsApp: ${p.phone}` : '',
    p.currentSite ? `Web actual: ${p.currentSite}` : '',
    ``,
    `--- PROYECTO WEB ---`,
    `Tipo de web: ${webTypeLabel}`,
    `Objetivo: ${goalLabel}`,
    p.references ? `Referencias: ${p.references}` : '',
    p.referencesNotes ? `Notas referencias: ${p.referencesNotes}` : '',
    ``,
    p.brandSummary ? `Resumen marca: ${p.brandSummary}` : '',
    p.brandValues ? `Valores marca: ${p.brandValues}` : '',
    p.colors ? `Colores: ${p.colors}` : '',
    p.vibes && p.vibes.length ? `Estilo/Vibes: ${p.vibes.join(', ')}` : '',
    p.audience ? `Público objetivo: ${p.audience}` : '',
    p.mainCta ? `CTA Principal: ${p.mainCta}` : '',
    p.pagesNeeded && p.pagesNeeded.length ? `Páginas: ${p.pagesNeeded.join(', ')}` : '',
    p.featuresNeeded && p.featuresNeeded.length ? `Features: ${p.featuresNeeded.join(', ')}` : '',
    p.languages ? `Idiomas: ${p.languages}` : '',
    ``,
    `--- INVERSIÓN & FECHAS ---`,
    `Presupuesto: ${budgetLabel}`,
    `Plazo: ${timelineLabel}`,
    p.notes ? `Notas adicionales: ${p.notes}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

function validatePayload(body: unknown): { ok: true; data: BriefWebPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const mode = String(b.mode);
  if (mode !== 'express' && mode !== 'detailed') {
    return { ok: false, error: 'Invalid mode' };
  }

  if (!b.name || typeof b.name !== 'string' || b.name.trim().length < 2) {
    return { ok: false, error: 'Name required' };
  }

  if (!b.email || typeof b.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) {
    return { ok: false, error: 'Valid email required' };
  }

  const BUDGETS = ['under2k', '2to5k', '5to15k', '15to50k', 'flexible'] as const;
  const TIMELINES = ['asap', '1month', '1to2months', 'flexible'] as const;

  const budget = String(b.budget) as (typeof BUDGETS)[number];
  if (!BUDGETS.includes(budget)) return { ok: false, error: 'Invalid budget' };

  const timeline = String(b.timeline) as (typeof TIMELINES)[number];
  if (!TIMELINES.includes(timeline)) return { ok: false, error: 'Invalid timeline' };

  const WEB_TYPES = ['landing', 'corporate', 'ecommerce', 'webapp', 'redesign', 'other'] as const;
  const GOALS = ['leads', 'sales', 'credibility', 'automation', 'launch', 'other'] as const;

  const webType = (b.webType ? String(b.webType) : 'corporate') as (typeof WEB_TYPES)[number];
  const goal = (b.goal ? String(b.goal) : 'leads') as (typeof GOALS)[number];

  const langRaw = b.lang;
  const lang = typeof langRaw === 'string' && isLocale(langRaw) ? langRaw : undefined;

  return {
    ok: true,
    data: {
      mode,
      name: String(b.name).slice(0, 200),
      email: String(b.email).slice(0, 200),
      company: b.company ? String(b.company).slice(0, 200) : '',
      role: b.role ? String(b.role).slice(0, 200) : '',
      phone: b.phone ? String(b.phone).slice(0, 80) : '',
      currentSite: b.currentSite ? String(b.currentSite).slice(0, 300) : '',
      webType: WEB_TYPES.includes(webType) ? webType : 'corporate',
      webTypeOther: b.webTypeOther ? String(b.webTypeOther).slice(0, 300) : '',
      goal: GOALS.includes(goal) ? goal : 'leads',
      goalOther: b.goalOther ? String(b.goalOther).slice(0, 300) : '',
      references: b.references ? String(b.references).slice(0, 2000) : '',
      referencesNotes: b.referencesNotes ? String(b.referencesNotes).slice(0, 1000) : '',
      brandSummary: b.brandSummary ? String(b.brandSummary).slice(0, 2000) : '',
      brandValues: b.brandValues ? String(b.brandValues).slice(0, 1000) : '',
      logoStatus: b.logoStatus ? (String(b.logoStatus) as BriefWebPayload['logoStatus']) : undefined,
      colors: b.colors ? String(b.colors).slice(0, 500) : '',
      vibes: Array.isArray(b.vibes) ? (b.vibes as string[]).slice(0, 10).map((v) => String(v).slice(0, 80)) : [],
      audience: b.audience ? String(b.audience).slice(0, 3000) : '',
      mainCta: b.mainCta ? String(b.mainCta).slice(0, 500) : '',
      pagesNeeded: Array.isArray(b.pagesNeeded) ? (b.pagesNeeded as string[]).slice(0, 20).map((p) => String(p).slice(0, 80)) : [],
      featuresNeeded: Array.isArray(b.featuresNeeded) ? (b.featuresNeeded as string[]).slice(0, 20).map((f) => String(f).slice(0, 80)) : [],
      contentOrigin: b.contentOrigin ? (String(b.contentOrigin) as BriefWebPayload['contentOrigin']) : undefined,
      mediaStatus: b.mediaStatus ? (String(b.mediaStatus) as BriefWebPayload['mediaStatus']) : undefined,
      languages: b.languages ? String(b.languages).slice(0, 300) : '',
      domainHosting: b.domainHosting ? (String(b.domainHosting) as BriefWebPayload['domainHosting']) : undefined,
      budget,
      timeline,
      notes: b.notes ? String(b.notes).slice(0, 3000) : '',
      lang,
    },
  };
}

async function sendNotification(data: BriefWebPayload, dict: Dictionary): Promise<{ ok: boolean; error?: string }> {
  try {
    const modeBadge = data.mode === 'express' ? '⚡ Express' : '🔍 Detallado';
    await sendMail({
      to: TO_EMAIL,
      replyTo: data.email,
      subject: `[Brief Web ${modeBadge}]: ${data.name} — ${data.company || 'Proyecto Web'}`,
      html: renderEmailHtml(data, dict),
      text: renderEmailText(data, dict),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

async function sendAutoReply(p: BriefWebPayload, dict: Dictionary, lang: string): Promise<void> {
  const firstName = p.name.split(' ')[0] || p.name;
  const greeting = dict.briefWeb.emailAutoReply.greeting.replace('{firstName}', escapeHtml(firstName));
  const subject = dict.briefWeb.emailAutoReply.subject.replace('{firstName}', firstName);
  const briefUrl = lang === 'en'
    ? 'https://andresmorales.com.co/brief-web'
    : `https://andresmorales.com.co/${lang}/brief-web`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#f96e03;padding:24px 32px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">${greeting}</h1>
      </div>
      <div style="padding:24px 32px;color:#575250;line-height:1.6;">
        <p>${escapeHtml(dict.briefWeb.emailAutoReply.body1)}</p>
        <p>${escapeHtml(dict.briefWeb.emailAutoReply.body2)}</p>
        <p style="margin-top:32px;">${escapeHtml(dict.briefWeb.emailAutoReply.signature)}</p>
        <p style="font-size:13px;color:#999;margin-top:24px;">
          ${escapeHtml(dict.briefWeb.emailAutoReply.footer)}
          <a href="${briefUrl}" style="color:#f96e03;">${escapeHtml(briefUrl)}</a>.
        </p>
      </div>
    </div>
  `;
  const text = `${dict.briefWeb.emailAutoReply.greeting.replace('{firstName}', firstName)}

${dict.briefWeb.emailAutoReply.body1}

${dict.briefWeb.emailAutoReply.body2}

${dict.briefWeb.emailAutoReply.signature}

---
${dict.briefWeb.emailAutoReply.footer} ${briefUrl}.`;

  await sendMail({
    to: p.email,
    toName: p.name,
    replyTo: TO_EMAIL,
    subject,
    html,
    text,
  });
}

async function sendToClickUp(p: BriefWebPayload, dict: Dictionary): Promise<void> {
  if (!CLICKUP_API_TOKEN || !CLICKUP_LIST_ID) return;

  let priority = 3;
  if (p.budget === '15to50k') priority = 1;
  else if (p.budget === '5to15k') priority = 2;
  else if (p.budget === 'under2k' || p.budget === '2to5k') priority = 3;

  const titleName = p.name.length > 50 ? p.name.slice(0, 47) + '...' : p.name;
  const webTypeLabel = p.webType === 'other' ? 'Otro' : (dict.briefWeb.webTypes[p.webType] || p.webType);
  const budgetLabel = dict.briefWeb.budgets[p.budget] || p.budget;
  const title = `[Web ${p.mode.toUpperCase()}]: ${titleName} — ${webTypeLabel} · ${budgetLabel}`;

  const user = (s: string) => `\`${s.replace(/`/g, '‵')}\``;
  const description = [
    `**Modo:** ${p.mode.toUpperCase()}`,
    `**Nombre:** ${user(p.name)}`,
    `**Email:** ${user(p.email)}`,
    p.company ? `**Empresa:** ${user(p.company)}` : '',
    p.phone ? `**Tel/WA:** ${user(p.phone)}` : '',
    p.currentSite ? `**Sitio actual:** ${user(p.currentSite)}` : '',
    ``,
    `**Tipo de web:** ${user(webTypeLabel)}`,
    `**Objetivo:** ${user(dict.briefWeb.goals[p.goal] || p.goal)}`,
    `**Presupuesto:** ${user(budgetLabel)}`,
    `**Plazo:** ${user(dict.briefWeb.timelines[p.timeline] || p.timeline)}`,
    ``,
    p.references ? `**Referencias:**\n${user(p.references)}` : '',
    p.audience ? `**Audiencia:**\n${user(p.audience)}` : '',
    p.pagesNeeded && p.pagesNeeded.length ? `**Páginas:**\n- ${p.pagesNeeded.map(user).join('\n- ')}` : '',
    p.featuresNeeded && p.featuresNeeded.length ? `**Features:**\n- ${p.featuresNeeded.map(user).join('\n- ')}` : '',
    p.notes ? `**Notas adicionales:**\n${user(p.notes)}` : '',
    `---`,
    `_Enviado desde andresmorales.com.co/brief-web_`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: CLICKUP_API_TOKEN,
      },
      body: JSON.stringify({
        name: title,
        description,
        status: 'to do',
        priority,
      }),
    });
  } catch (err) {
    console.warn('[brief-web] ClickUp sync failed:', err);
  }
}

export async function POST(req: NextRequest) {
  const tooBig = enforceBodySize(req, MAX_BODY_BYTES);
  if (tooBig) return tooBig;

  const ip = clientIp(req);
  const rl = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);
  if (!rl.allowed) {
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

  if (body && typeof body === 'object' && 'website' in body) {
    const w = (body as Record<string, unknown>).website;
    if (w && String(w).trim() !== '') {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }
  }

  const t = (body && typeof body === 'object' && (body as Record<string, unknown>)._t) as unknown;
  if (typeof t === 'number' && t > 0 && t < 1500) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  }

  const result = validatePayload(body);
  if (!result.ok || !('data' in result)) {
    return NextResponse.json({ error: 'error' in result ? result.error : 'Invalid payload' }, { status: 400 });
  }

  const data = result.data;
  bumpRateLimit(RATE_LIMIT_ROUTE, ip);

  if (!MAIL_CONFIGURED) {
    console.warn('[brief-web] MAILCOW_PASSWORD not set — brief received but not emailed:', {
      from: data.name,
      email: data.email,
      mode: data.mode,
      webType: data.webType,
    });
    return NextResponse.json({ ok: true, emailSent: false, reason: 'email-not-configured' });
  }

  try {
    const lang = data.lang ?? DEFAULT_LOCALE;
    const dict = await getDictionary(lang);

    const sendResult = await sendNotification(data, dict);
    if (!sendResult.ok) {
      console.error('[brief-web] Mailcow error:', sendResult.error);
      return NextResponse.json({ error: 'Failed to send' }, { status: 502 });
    }

    sendAutoReply(data, dict, lang).catch((err) => {
      console.warn('[brief-web] auto-reply failed:', err);
    });

    sendToClickUp(data, dict).catch((err) => {
      console.warn('[brief-web] ClickUp sync failed:', err);
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error('[brief-web] Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'brief-web' });
}
