import fs from 'node:fs';
import path from 'node:path';
import { sendTelegramNotification } from './telegram';

export interface AiAutomationModule {
  title: string;
  description: string;
  impact: string;
  techStack: string;
}

export interface AiAutomationProposal {
  headline: string;
  summary: string;
  modules: AiAutomationModule[];
  operationalSavingsEstimate: string;
}

export interface LighthouseMetrics {
  performanceScore: number;
  fcp?: string;
  fcpMs?: number;
  lcp?: string;
  lcpMs?: number;
  tbt?: string;
  tbtMs?: number;
  cls?: string;
  clsVal?: number;
  speedIndex?: string;
  speedIndexMs?: number;
  testedAt?: string;
  engine?: 'lighthouse' | 'pagespeed-api' | 'synthetic';
}

export interface ProspectAudit {
  loadTimeMs: number;
  ttfbMs: number;
  platform: string;
  hasWhatsAppFloating: boolean;
  hasAnalytics: boolean;
  hasMetaPixel: boolean;
  hasMobileViewport: boolean;
  score: number;
  techScore?: number;
  uxScore?: number;
  uiScore?: number;
  lighthouse?: LighthouseMetrics;
  uxFindings?: string[];
  uiFindings?: string[];
  uxUiSignals?: {
    hasSearch: boolean;
    hasCartOrCheckout: boolean;
    hasTrustBadges: boolean;
    hasFavicon: boolean;
    hasCustomTypography: boolean;
    hasModernImages: boolean;
    hasAggressivePopups: boolean;
    h1Count: number;
  };
  auditHighlights: string[];
  suggestedImprovement: string;
  aiAutomationProposal?: AiAutomationProposal;
  auditedAt: string;
}

export interface ProspectPitch {
  whatsapp: string;
  whatsappUxUi?: string;
  voiceScript?: string;
  emailSubject: string;
  emailBody: string;
}

export interface Prospect {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  website: string;
  lang?: 'es' | 'en' | 'pt';
  phone?: string;
  email?: string;
  instagram?: string;
  status: 'discovered' | 'audited' | 'contacted' | 'imported_crm' | 'discarded';
  auditSlug?: string;
  auditToken?: string;
  screenshotUrl?: string;
  pdfUrl?: string;
  viewCount?: number;
  firstViewedAt?: string;
  lastViewedAt?: string;
  audit?: ProspectAudit;
  pitch?: ProspectPitch;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectData {
  prospects: Prospect[];
  lastSearch?: {
    country?: string;
    city: string;
    category: string;
    count: number;
    searchedAt: string;
  };
}

const DATA_FILE = path.join(process.cwd(), 'data', 'prospects.json');

export function generateAuditSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'auditoria'}-${randomSuffix}`;
}

export function getProspectData(): ProspectData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.prospects)) {
        let modified = false;
        data.prospects.forEach((p: Prospect) => {
          if (!p.auditSlug) {
            p.auditSlug = generateAuditSlug(p.name);
            p.auditToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
            modified = true;
          }
        });
        if (modified) {
          saveProspectData(data);
        }

        return {
          prospects: data.prospects,
          lastSearch: data.lastSearch,
        };
      }
    }
  } catch (err) {
    console.error('[prospect-store] Error reading prospects.json:', err);
  }

  return { prospects: [] };
}

export function saveProspectData(data: ProspectData): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[prospect-store] Error writing prospects.json:', err);
  }
}

export function upsertProspect(prospect: Partial<Prospect> & { website: string; name: string }): Prospect {
  const data = getProspectData();
  const normalizedUrl = prospect.website.trim().toLowerCase().replace(/\/+$/, '');
  const existingIdx = data.prospects.findIndex(
    (p) => p.website.trim().toLowerCase().replace(/\/+$/, '') === normalizedUrl
  );

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Prospect = {
      ...data.prospects[existingIdx],
      ...prospect,
      updatedAt: now,
    };
    data.prospects[existingIdx] = updated;
    saveProspectData(data);
    return updated;
  }

  const newProspect: Prospect = {
    id: `prosp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: prospect.name,
    category: prospect.category || 'E-commerce',
    country: prospect.country || 'Colombia',
    city: prospect.city || 'Principal',
    website: prospect.website,
    phone: prospect.phone || '',
    email: prospect.email || '',
    instagram: prospect.instagram || '',
    status: prospect.status || 'discovered',
    auditSlug: prospect.auditSlug || generateAuditSlug(prospect.name),
    auditToken: prospect.auditToken || `tok_${Math.random().toString(36).substring(2, 10)}`,
    screenshotUrl: prospect.screenshotUrl,
    viewCount: prospect.viewCount || 0,
    audit: prospect.audit,
    pitch: prospect.pitch,
    createdAt: now,
    updatedAt: now,
  };

  data.prospects.unshift(newProspect);
  saveProspectData(data);
  return newProspect;
}

export function updateProspect(id: string, updates: Partial<Prospect>): Prospect | null {
  const data = getProspectData();
  const idx = data.prospects.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  data.prospects[idx] = {
    ...data.prospects[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveProspectData(data);
  return data.prospects[idx];
}

export function getProspectBySlug(slug: string): Prospect | null {
  const data = getProspectData();
  const clean = slug.trim().toLowerCase();
  const exact = data.prospects.find(
    (p) =>
      (p.auditSlug && p.auditSlug.toLowerCase() === clean) ||
      (p.id && p.id.toLowerCase() === clean)
  );
  if (exact) return exact;

  // Friendly alias fallback (e.g., 'bosi', 'bosi-colombia')
  if (clean.includes('bosi')) {
    return data.prospects.find((p) => p.auditSlug?.includes('bosi') || p.name?.toLowerCase().includes('bosi')) || null;
  }

  return null;
}

export function recordProspectView(slug: string): Prospect | null {
  const data = getProspectData();
  const clean = slug.trim().toLowerCase();
  const idx = data.prospects.findIndex(
    (p) =>
      (p.auditSlug && p.auditSlug.toLowerCase() === clean) ||
      (p.id && p.id.toLowerCase() === clean)
  );
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const prospect = data.prospects[idx];
  const newCount = (prospect.viewCount || 0) + 1;

  prospect.viewCount = newCount;
  prospect.lastViewedAt = now;
  if (!prospect.firstViewedAt) {
    prospect.firstViewedAt = now;
  }
  prospect.updatedAt = now;

  saveProspectData(data);
  return prospect;
}

export async function notifyAuditView(prospect: Prospect): Promise<void> {
  try {
    const timeFormatted = new Date().toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const buttons: Array<Array<{ text: string; url?: string }>> = [
      [
        {
          text: '📊 Ver Reporte',
          url: `https://andresmorales.com.co/audit/${prospect.auditSlug}`,
        },
      ],
    ];

    if (prospect.phone) {
      const cleanPhone = prospect.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 7) {
        buttons[0].push({
          text: '💬 WhatsApp',
          url: `https://wa.me/${cleanPhone}`,
        });
      }
    }

    const message = `🚨 <b>¡Prospecto abrió su Auditoría Técnica!</b>\n\n` +
      `🏢 <b>Empresa:</b> ${prospect.name}\n` +
      `🌍 <b>País:</b> ${prospect.country} (${prospect.city})\n` +
      `🌐 <b>Web:</b> ${prospect.website}\n` +
      `👁️ <b>Visitas totales:</b> #${prospect.viewCount || 1}\n` +
      `⏱️ <b>Hora (Bogotá):</b> ${timeFormatted}\n\n` +
      `<i>Momento ideal para enviar mensaje de seguimiento mientras exploran los hallazgos.</i>`;

    await sendTelegramNotification(message, {
      buttons,
      parseMode: 'HTML',
    });
  } catch (err) {
    console.error('[notifyAuditView] Failed to send Telegram alert:', err);
  }
}

export function deleteProspect(id: string): boolean {
  const data = getProspectData();
  const initialLen = data.prospects.length;
  data.prospects = data.prospects.filter((p) => p.id !== id);
  if (data.prospects.length !== initialLen) {
    saveProspectData(data);
    return true;
  }
  return false;
}
