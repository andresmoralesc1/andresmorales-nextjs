import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import { enforceBodySize } from '@/lib/api-guard';
import { getDictionary, isLocale, DEFAULT_LOCALE, type Dictionary } from '@/lib/i18n';
import { sendMail } from '@/lib/email';
import { createLead, addLeadNote } from '@/lib/crm-store';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendWhatsAppMessage } from '@/lib/evolution';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email-template';

const MAX_BODY_BYTES = 40 * 1024;
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

  // Uploaded files
  logoFiles?: Array<{ name: string; url: string; size: number; type: string }>;
  referenceFiles?: Array<{ name: string; url: string; size: number; type: string }>;
  additionalFiles?: Array<{ name: string; url: string; size: number; type: string }>;

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

function renderFilesHtmlList(files?: Array<{ name: string; url: string; size: number; type: string }>): string | undefined {
  if (!files || files.length === 0) return undefined;
  return files
    .map(
      (f) =>
        `<div style="margin-bottom:6px;"><a href="https://andresmorales.com.co${escapeHtml(f.url)}" target="_blank" style="color:#f96e03;font-weight:600;text-decoration:underline;">${escapeHtml(f.name)}</a> <span style="color:#786F68;font-size:11px;">(${Math.round(f.size / 1024)} KB)</span></div>`
    )
    .join('');
}

function renderEmailHtml(p: BriefWebPayload, dict: Dictionary): string {
  const webTypeLabel = p.webType === 'other' ? `Otro (${p.webTypeOther || ''})` : (dict.briefWeb.webTypes[p.webType] || p.webType);
  const goalLabel = p.goal === 'other' ? `Otro (${p.goalOther || ''})` : (dict.briefWeb.goals[p.goal] || p.goal);
  const budgetLabel = dict.briefWeb.budgets[p.budget] || p.budget;
  const timelineLabel = dict.briefWeb.timelines[p.timeline] || p.timeline;
  const logoLabel = p.logoStatus ? (dict.briefWeb.logoOptions[p.logoStatus] || p.logoStatus) : undefined;
  const contentLabel = p.contentOrigin ? (dict.briefWeb.contentOrigins[p.contentOrigin] || p.contentOrigin) : undefined;
  const mediaLabel = p.mediaStatus ? (dict.briefWeb.mediaOptions[p.mediaStatus] || p.mediaStatus) : undefined;
  const domainLabel = p.domainHosting ? (dict.briefWeb.domainHostingOptions[p.domainHosting] || p.domainHosting) : undefined;

  const modeBadge = p.mode === 'express' ? '⚡ BRIEF WEB EXPRESS' : '🔍 BRIEF WEB DETALLADO';
  const cleanPhone = p.phone ? p.phone.replace(/\D/g, '') : '';
  const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;

  return buildBrandedEmailHtml({
    badge: modeBadge,
    title: dict.briefWeb.email.title,
    subtitle: `Remitente: ${p.name} (${p.email}) · ${p.company || 'Proyecto Independiente'}`,
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;">
        Se ha recibido un nuevo brief de proyecto web completado en la plataforma:
      </p>
    `,
    tableRows: [
      { label: dict.briefWeb.email.fieldMode, value: modeBadge },
      { label: dict.briefWeb.email.fieldCompany, value: p.company },
      { label: dict.briefWeb.email.fieldRole, value: p.role },
      { label: dict.briefWeb.email.fieldPhone, value: p.phone },
      { label: dict.briefWeb.email.fieldCurrentSite, value: p.currentSite },
      { label: dict.briefWeb.email.fieldWebType, value: webTypeLabel },
      { label: dict.briefWeb.email.fieldGoal, value: goalLabel },
      { label: dict.briefWeb.email.fieldReferences, value: p.references },
      { label: dict.briefWeb.email.fieldReferencesNotes, value: p.referencesNotes },
      { label: dict.briefWeb.email.fieldBrandSummary, value: p.brandSummary },
      { label: dict.briefWeb.email.fieldBrandValues, value: p.brandValues },
      { label: dict.briefWeb.email.fieldLogo, value: logoLabel },
      { label: dict.briefWeb.email.fieldLogoFiles || 'Archivos de logotipo', value: renderFilesHtmlList(p.logoFiles), isHtml: true },
      { label: dict.briefWeb.email.fieldReferenceFiles || 'Archivos de referencia', value: renderFilesHtmlList(p.referenceFiles), isHtml: true },
      { label: dict.briefWeb.email.fieldColors, value: p.colors },
      { label: dict.briefWeb.email.fieldVibes, value: p.vibes?.join(', ') },
      { label: dict.briefWeb.email.fieldAudience, value: p.audience },
      { label: dict.briefWeb.email.fieldMainCta, value: p.mainCta },
      { label: dict.briefWeb.email.fieldPages, value: p.pagesNeeded?.join(', ') },
      { label: dict.briefWeb.email.fieldFeatures, value: p.featuresNeeded?.join(', ') },
      { label: dict.briefWeb.email.fieldContentOrigin, value: contentLabel },
      { label: dict.briefWeb.email.fieldMedia, value: mediaLabel },
      { label: dict.briefWeb.email.fieldLanguages, value: p.languages },
      { label: dict.briefWeb.email.fieldDomainHosting, value: domainLabel },
      { label: dict.briefWeb.email.fieldBudget, value: budgetLabel },
      { label: dict.briefWeb.email.fieldTimeline, value: timelineLabel },
      { label: dict.briefWeb.email.fieldAdditionalFiles || 'Documentos adjuntos', value: renderFilesHtmlList(p.additionalFiles), isHtml: true },
      { label: dict.briefWeb.email.fieldNotes, value: p.notes },
    ],
    ctaText: 'Ver en Dashboard CRM',
    ctaUrl: 'https://andresmorales.com.co/es/admin/crm',
    secondaryCtaText: cleanPhone ? '💬 WhatsApp al Prospecto' : '✉️ Responder por Correo',
    secondaryCtaUrl: cleanPhone ? `https://wa.me/${fullPhone}` : `mailto:${p.email}`,
    replyToEmail: p.email,
  });
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
    p.logoFiles && p.logoFiles.length ? `Archivos Logo: ${p.logoFiles.map((f) => `${f.name} (https://andresmorales.com.co${f.url})`).join(', ')}` : '',
    p.referenceFiles && p.referenceFiles.length ? `Archivos Referencias: ${p.referenceFiles.map((f) => `${f.name} (https://andresmorales.com.co${f.url})`).join(', ')}` : '',
    p.additionalFiles && p.additionalFiles.length ? `Documentos Adjuntos: ${p.additionalFiles.map((f) => `${f.name} (https://andresmorales.com.co${f.url})`).join(', ')}` : '',
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
      logoFiles: parseUploadedFiles(b.logoFiles),
      referenceFiles: parseUploadedFiles(b.referenceFiles),
      additionalFiles: parseUploadedFiles(b.additionalFiles),
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

  const html = buildBrandedEmailHtml({
    badge: 'CONFIRMACIÓN OFICIAL',
    title: greeting,
    subtitle: 'Andrés Morales · Automatización con IA & Desarrollo Web',
    contentHtml: `
      <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;line-height:1.7;">
        ${escapeHtml(dict.briefWeb.emailAutoReply.body1)}
      </p>
      <p style="margin:0 0 16px 0;font-size:14.5px;color:#4A423D;line-height:1.7;">
        ${escapeHtml(dict.briefWeb.emailAutoReply.body2)}
      </p>
      <p style="margin:24px 0 0 0;font-size:14px;color:#1E1810;font-weight:600;">
        ${escapeHtml(dict.briefWeb.emailAutoReply.signature)}
      </p>
    `,
    ctaText: 'Agendar Llamada de 30 min (Google Calendar)',
    ctaUrl: 'https://calendar.app.google/QvUUb5xu4927P95a8',
    secondaryCtaText: '💬 Contactar por WhatsApp',
    secondaryCtaUrl: 'https://wa.me/573161482507',
    footerNote: `${dict.briefWeb.emailAutoReply.footer} <a href="${briefUrl}" style="color:#f96e03;">${escapeHtml(briefUrl)}</a>.`,
  });
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
    p.logoFiles && p.logoFiles.length ? `**Archivos Logo:**\n${p.logoFiles.map((f) => `- [${f.name}](https://andresmorales.com.co${f.url})`).join('\n')}` : '',
    p.referenceFiles && p.referenceFiles.length ? `**Archivos Referencia:**\n${p.referenceFiles.map((f) => `- [${f.name}](https://andresmorales.com.co${f.url})`).join('\n')}` : '',
    p.additionalFiles && p.additionalFiles.length ? `**Documentos Adjuntos:**\n${p.additionalFiles.map((f) => `- [${f.name}](https://andresmorales.com.co${f.url})`).join('\n')}` : '',
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

  const filesSummaryList = [
    ...(data.logoFiles?.map((f) => `Logo: ${f.name} (https://andresmorales.com.co${f.url})`) || []),
    ...(data.referenceFiles?.map((f) => `Ref: ${f.name} (https://andresmorales.com.co${f.url})`) || []),
    ...(data.additionalFiles?.map((f) => `Doc: ${f.name} (https://andresmorales.com.co${f.url})`) || []),
  ];
  const filesMessagePart = filesSummaryList.length > 0 ? `\n📎 Adjuntos:\n${filesSummaryList.join('\n')}` : '';

  // Auto-log brief-web into local CRM and sync with Clientes & Empresas
  try {
    const newLead = createLead({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      service: `Desarrollo Web (${data.webType} - ${data.mode})`,
      message: `Objetivo: ${data.goal}\nReferencias: ${data.references || '—'}${filesMessagePart}`,
      source: 'brief-web',
      status: 'brief_received',
      briefData: data as any,
    });

    syncLeadToBusiness({
      id: newLead?.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: `Desarrollo Web (${data.webType} - ${data.mode})`,
      status: 'en_progreso',
      message: `Objetivo: ${data.goal}\nReferencias: ${data.references || '—'}${filesMessagePart}`,
    });

    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';

    // Auto-WhatsApp confirmation to lead if valid phone provided (>= 10 digits)
    if (cleanPhone && cleanPhone.length >= 10) {
      const firstName = data.name.split(' ')[0] || data.name;
      const projectLabel = data.company || (data.webType === 'other' ? 'tu nuevo sitio web' : `tu proyecto de ${data.webType}`);
      const waText = `¡Hola ${firstName}! 👋 Soy el asistente de Andrés Morales.\n\nYa recibimos tu brief para *${projectLabel}*. Andrés lo está analizando para evaluar los requerimientos técnicos y estructurar tu propuesta.\n\nSi deseas coordinar de una vez la llamada de diagnóstico de 30 min para evaluar el alcance, puedes elegir tu horario aquí:\n👉 https://calendar.app.google/QvUUb5xu4927P95a8`;

      sendWhatsAppMessage({ number: cleanPhone, text: waText })
        .then((waRes) => {
          if (waRes.ok && newLead?.id) {
            addLeadNote(
              newLead.id,
              `🤖 Agente IA (Auto-WhatsApp): Confirmación automática enviada con enlace de Google Calendar a ${cleanPhone}.`
            );
          }
        })
        .catch((err) => console.warn('[brief-web] Auto-WhatsApp send failed:', err));
    }

    const tgFileItems = [
      ...(data.logoFiles?.map((f) => `• <b>Logo:</b> <a href="https://andresmorales.com.co${f.url}">${escapeHtml(f.name)}</a>`) || []),
      ...(data.referenceFiles?.map((f) => `• <b>Ref:</b> <a href="https://andresmorales.com.co${f.url}">${escapeHtml(f.name)}</a>`) || []),
      ...(data.additionalFiles?.map((f) => `• <b>Doc:</b> <a href="https://andresmorales.com.co${f.url}">${escapeHtml(f.name)}</a>`) || []),
    ];
    const tgFilesText = tgFileItems.length > 0 ? `\n📎 <b>Archivos adjuntos (${tgFileItems.length}):</b>\n${tgFileItems.join('\n')}\n` : '';

    // Instant alert to Andres via Telegram Bot
    sendTelegramNotification(
      `⚡ <b>¡Nuevo Brief Web (${data.mode.toUpperCase()}) Recibido!</b>\n\n` +
        `👤 <b>Cliente:</b> ${data.name}\n` +
        `🏢 <b>Empresa:</b> ${data.company || '—'} (${data.role || '—'})\n` +
        `📱 <b>Tel/WA:</b> ${data.phone || 'No indicado'}\n` +
        `🌐 <b>Tipo de Web:</b> ${data.webType} (${data.mode})\n` +
        `💰 <b>Presupuesto:</b> ${data.budget}\n` +
        `⏱️ <b>Plazo:</b> ${data.timeline}\n\n` +
        `🎯 <b>Objetivo:</b> ${data.goal}\n` +
        tgFilesText + `\n` +
        `👉 <a href="https://andresmorales.com.co/es/admin/crm">Ver en Dashboard CRM</a>`,
      {
        buttons: [
          [
            { text: '📊 Abrir CRM', url: 'https://andresmorales.com.co/es/admin/crm' },
            ...(cleanPhone
              ? [
                  {
                    text: '💬 WhatsApp',
                    url: `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}`,
                  },
                ]
              : [{ text: '✉️ Email', url: `mailto:${data.email}` }]),
          ],
        ],
      }
    ).catch(() => {});
  } catch (crmErr) {
    console.warn('[brief-web] Could not auto-log to CRM:', crmErr);
  }
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
