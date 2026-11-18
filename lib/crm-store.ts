// Server-side persistent CRM store for Andres Morales Automation & Web
// Centralizes leads, proposals, sent emails via Mailcow, and n8n/Telegram webhook configurations.

import fs from 'node:fs';
import path from 'node:path';

export type LeadStatus =
  | 'new'
  | 'brief_received'
  | 'in_conversation'
  | 'proposal_sent'
  | 'in_development'
  | 'closed_won'
  | 'closed_lost';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message?: string;
  source: 'contact' | 'brief' | 'brief-web' | 'manual';
  status: LeadStatus;
  score?: 'hot' | 'warm' | 'cold';
  scoreReason?: string;
  followUpDate?: string; // YYYY-MM-DD
  followUpNote?: string;
  notes: LeadNote[];
  briefData?: Record<string, any>;
  auditSlug?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalDeliverable {
  phase: string;
  title: string;
  description: string;
  duration: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  token: string; // secret random slug for sharing: andresmorales.com.co/es/p/[token]
  title: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  service: string;
  scopeSummary: string;
  deliverables: ProposalDeliverable[];
  investmentAmount: string;
  investmentTerms: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  clientNotes?: string;
}

export interface EmailLog {
  id: string;
  leadId?: string;
  to: string;
  toName?: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: string;
}

export interface AutomationSettings {
  n8nWebhookLead?: string;
  n8nWebhookProposal?: string;
  n8nWebhookCustom?: string;
  telegramChatId?: string;
  autoReplyWhatsAppAgent?: boolean;
  aiAgentPrompt?: string;
  mutedJids?: string[];
}

export interface CrmData {
  leads: Lead[];
  emailLogs: EmailLog[];
  proposals: Proposal[];
  automationSettings: AutomationSettings;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'crm.json');

export function calculateLeadScore(lead: Partial<Lead>): { score: 'hot' | 'warm' | 'cold'; reason: string } {
  const brief = lead.briefData || {};
  const budget = String(lead.budget || brief.budget || '').toLowerCase();
  const timeline = String(brief.timeline || brief.plazo || '').toLowerCase();
  const hasPhone = Boolean(lead.phone || brief.phone || brief.telefono);

  const isUrgent =
    timeline.includes('asap') ||
    timeline.includes('urgent') ||
    timeline.includes('lo antes posible') ||
    timeline.includes('1month') ||
    timeline.includes('1 mes');

  const hasSubstantialBudget =
    budget.includes('8 millones') ||
    budget.includes('millon') ||
    budget.includes('15k') ||
    budget.includes('50k') ||
    budget.includes('15to50') ||
    budget.includes('5to15') ||
    budget.includes('1.500');

  if (isUrgent && (hasSubstantialBudget || hasPhone)) {
    return { score: 'hot', reason: 'Plazo urgente con presupuesto o WhatsApp verificado' };
  }
  if (hasSubstantialBudget || isUrgent || hasPhone) {
    return { score: 'warm', reason: 'Requerimientos claros y datos de contacto directos' };
  }
  return { score: 'cold', reason: 'En etapa preliminar de exploración' };
}

export function getCrmData(): CrmData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.leads)) {
        // Ensure scores are calculated
        data.leads.forEach((l: Lead) => {
          if (!l.score) {
            const sc = calculateLeadScore(l);
            l.score = sc.score;
            l.scoreReason = sc.reason;
          }
        });

        return {
          leads: data.leads,
          emailLogs: Array.isArray(data.emailLogs) ? data.emailLogs : [],
          proposals: Array.isArray(data.proposals) ? data.proposals : [],
          automationSettings: data.automationSettings || {},
        };
      }
    }
  } catch (err) {
    console.error('[crm-store] Error reading crm.json:', err);
  }

  // Initial defaults
  return {
    leads: [],
    emailLogs: [],
    proposals: [],
    automationSettings: {
      telegramChatId: '11366916',
      n8nWebhookLead: 'https://n8n.andresmorales.com.co/webhook/lead-incoming',
      n8nWebhookProposal: 'https://n8n.andresmorales.com.co/webhook/send-proposal',
    },
  };
}

export function saveCrmData(data: CrmData): void {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

export function createLead(input: Partial<Lead> & { name: string; email: string }): Lead {
  const data = getCrmData();
  const now = new Date().toISOString();
  const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const sc = calculateLeadScore(input);

  const newLead: Lead = {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || '',
    company: input.company?.trim() || '',
    service: input.service || 'Automatización con IA',
    budget: input.budget || '',
    message: input.message || '',
    source: input.source || 'manual',
    status: input.status || (input.source === 'contact' ? 'new' : 'brief_received'),
    score: input.score || sc.score,
    scoreReason: input.scoreReason || sc.reason,
    followUpDate: input.followUpDate,
    followUpNote: input.followUpNote,
    notes: input.notes || [],
    briefData: input.briefData,
    auditSlug: input.auditSlug,
    pdfUrl: input.pdfUrl,
    createdAt: now,
    updatedAt: now,
  };

  data.leads.unshift(newLead);
  saveCrmData(data);
  return newLead;
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const data = getCrmData();
  const index = data.leads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  const current = data.leads[index];
  const updated: Lead = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (!updated.score) {
    const sc = calculateLeadScore(updated);
    updated.score = sc.score;
    updated.scoreReason = sc.reason;
  }

  data.leads[index] = updated;
  saveCrmData(data);
  return updated;
}

export function deleteLead(id: string): boolean {
  const data = getCrmData();
  const len = data.leads.length;
  data.leads = data.leads.filter((l) => l.id !== id);
  if (data.leads.length !== len) {
    saveCrmData(data);
    return true;
  }
  return false;
}

export function addLeadNote(leadId: string, text: string): Lead | null {
  const data = getCrmData();
  const lead = data.leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const note: LeadNote = {
    id: `note_${Date.now()}`,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  lead.notes.unshift(note);
  lead.updatedAt = new Date().toISOString();
  saveCrmData(data);
  return lead;
}

// ── Proposals Management ────────────────────────────────────────────────
export function createProposal(
  input: Partial<Proposal> & {
    leadId: string;
    clientName: string;
    clientEmail: string;
  }
): Proposal {
  const data = getCrmData();
  const now = new Date().toISOString();
  const id = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // Random url-safe token for private access: e.g. p-juan-esteban-89f3
  const slug = (input.clientName || 'propuesta')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 20);
  const token = `${slug}-${Math.random().toString(36).substring(2, 8)}`;

  const newProp: Proposal = {
    id,
    leadId: input.leadId,
    token,
    title: input.title || `Propuesta de Proyecto — ${input.clientName}`,
    clientName: input.clientName,
    clientCompany: input.clientCompany || '',
    clientEmail: input.clientEmail,
    service: input.service || 'Automatización & Desarrollo Web',
    scopeSummary: input.scopeSummary || '',
    deliverables: input.deliverables || [
      {
        phase: 'Fase 1',
        title: 'Arquitectura & Configuración Base',
        description: 'Definición de modelos de datos, flujos de integración y credenciales de acceso.',
        duration: 'Semana 1',
      },
      {
        phase: 'Fase 2',
        title: 'Implementación & Conexiones',
        description: 'Construcción de agentes, webhooks, base de datos y validaciones de campo.',
        duration: 'Semana 2',
      },
      {
        phase: 'Fase 3',
        title: 'Pruebas Piloto & Entrega Final',
        description: 'Capacitación, afinamiento de casos borde y puesta en producción.',
        duration: 'Semana 3',
      },
    ],
    investmentAmount: input.investmentAmount || '',
    investmentTerms: input.investmentTerms || '50% al iniciar · 50% contra entrega y satisfacción final.',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  data.proposals.unshift(newProp);
  saveCrmData(data);
  return newProp;
}

export function getProposalByToken(token: string): Proposal | null {
  const data = getCrmData();
  return data.proposals.find((p) => p.token === token) || null;
}

export function getProposalsByLead(leadId: string): Proposal[] {
  const data = getCrmData();
  return data.proposals.filter((p) => p.leadId === leadId);
}

export function updateProposal(id: string, updates: Partial<Proposal>): Proposal | null {
  const data = getCrmData();
  const index = data.proposals.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = data.proposals[index];
  const updated: Proposal = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  data.proposals[index] = updated;
  saveCrmData(data);
  return updated;
}

export function acceptProposal(token: string, notes?: string): Proposal | null {
  const data = getCrmData();
  const prop = data.proposals.find((p) => p.token === token);
  if (!prop) return null;

  prop.status = 'accepted';
  prop.acceptedAt = new Date().toISOString();
  if (notes) prop.clientNotes = notes;
  prop.updatedAt = new Date().toISOString();

  // Also advance the lead status to in_development
  const leadIndex = data.leads.findIndex((l) => l.id === prop.leadId);
  if (leadIndex !== -1) {
    data.leads[leadIndex].status = 'in_development';
    data.leads[leadIndex].updatedAt = new Date().toISOString();
  }

  saveCrmData(data);
  return prop;
}

export function deleteProposal(id: string): boolean {
  const data = getCrmData();
  const len = data.proposals.length;
  data.proposals = data.proposals.filter((p) => p.id !== id);
  if (data.proposals.length !== len) {
    saveCrmData(data);
    return true;
  }
  return false;
}

export function logSentEmail(entry: Omit<EmailLog, 'id' | 'sentAt'>): EmailLog {
  const data = getCrmData();
  const log: EmailLog = {
    id: `email_${Date.now()}`,
    sentAt: new Date().toISOString(),
    ...entry,
  };
  data.emailLogs.unshift(log);
  if (data.emailLogs.length > 100) {
    data.emailLogs = data.emailLogs.slice(0, 100);
  }
  saveCrmData(data);
  return log;
}

export function updateAutomationSettings(settings: Partial<AutomationSettings>): AutomationSettings {
  const data = getCrmData();
  data.automationSettings = {
    ...data.automationSettings,
    ...settings,
  };
  saveCrmData(data);
  return data.automationSettings;
}
