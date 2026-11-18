// Server-side persistent store for Clientes and Empresas
// Interconnected with CRM leads, proposals, and prospecting data for Andrés Morales Admin

import fs from 'node:fs';
import path from 'node:path';

export type ClientStatus = 'activo' | 'en_progreso' | 'potencial' | 'inactivo';
export type CompanyStatus = 'cliente_activo' | 'en_negociacion' | 'prospecto' | 'inactivo';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string; // e.g. "Director de Operaciones", "CEO", "Gerente Comercial"
  companyId?: string;
  companyName?: string;
  status: ClientStatus;
  service?: string;
  totalValue?: string; // e.g. "$4.500.000 COP"
  notes?: string;
  leadId?: string;
  avatarBg?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  nit?: string;
  industry: string;
  website?: string;
  country: string;
  city: string;
  address?: string;
  email?: string;
  phone?: string;
  status: CompanyStatus;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  annualBudget?: string;
  notes?: string;
  leadCount?: number;
  proposalsCount?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const CLIENTS_FILE = path.join(process.cwd(), 'data', 'clients.json');
const COMPANIES_FILE = path.join(process.cwd(), 'data', 'companies.json');

const AVATAR_COLORS = [
  'bg-orange-500',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
];

function getRandomColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function initializeDefaultData(): { clients: Client[]; companies: Company[] } {
  return { clients: [], companies: [] };
}

// ── File Helpers ────────────────────────────────────────────────────────
function ensureDataDir(): void {
  const dir = path.dirname(CLIENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Clients Management ──────────────────────────────────────────────────
export function getClients(): Client[] {
  ensureDataDir();
  try {
    if (fs.existsSync(CLIENTS_FILE)) {
      const raw = fs.readFileSync(CLIENTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[clients-store] Error reading clients.json:', err);
  }

  // Initialize if missing
  const { clients, companies } = initializeDefaultData();
  saveClients(clients);
  if (!fs.existsSync(COMPANIES_FILE)) {
    saveCompanies(companies);
  }
  return clients;
}

export function saveClients(clients: Client[]): void {
  ensureDataDir();
  const tmp = `${CLIENTS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(clients, null, 2), 'utf-8');
  fs.renameSync(tmp, CLIENTS_FILE);
}

export function getClientById(id: string): Client | null {
  const clients = getClients();
  return clients.find((c) => c.id === id) || null;
}

export function createClient(input: Partial<Client> & { name: string; email?: string }): Client {
  const clients = getClients();
  const now = new Date().toISOString();
  const id = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newClient: Client = {
    id,
    name: input.name.trim(),
    email: (input.email || '').trim().toLowerCase(),
    phone: (input.phone || '').trim(),
    role: (input.role || 'Contacto Principal').trim(),
    companyId: input.companyId || '',
    companyName: input.companyName?.trim() || '',
    status: input.status || 'potencial',
    service: input.service || 'Automatización con IA',
    totalValue: input.totalValue || '',
    notes: input.notes || '',
    leadId: input.leadId,
    avatarBg: input.avatarBg || getRandomColor(input.name),
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  clients.unshift(newClient);
  saveClients(clients);

  // If companyId is given, increment or update company contact if needed
  if (newClient.companyId) {
    const comp = getCompanyById(newClient.companyId);
    if (comp && !comp.primaryContactName) {
      updateCompany(comp.id, {
        primaryContactName: newClient.name,
        primaryContactEmail: newClient.email,
        primaryContactPhone: newClient.phone,
      });
    }
  }

  return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = clients[index];
  const updated: Client = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  clients[index] = updated;
  saveClients(clients);
  return updated;
}

export function deleteClient(id: string): boolean {
  const clients = getClients();
  const initialLength = clients.length;
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length !== initialLength) {
    saveClients(filtered);
    return true;
  }
  return false;
}

// ── Companies Management ────────────────────────────────────────────────
export function getCompanies(): Company[] {
  ensureDataDir();
  try {
    if (fs.existsSync(COMPANIES_FILE)) {
      const raw = fs.readFileSync(COMPANIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[companies-store] Error reading companies.json:', err);
  }

  // Initialize if missing
  const { clients, companies } = initializeDefaultData();
  saveCompanies(companies);
  if (!fs.existsSync(CLIENTS_FILE)) {
    saveClients(clients);
  }
  return companies;
}

export function saveCompanies(companies: Company[]): void {
  ensureDataDir();
  const tmp = `${COMPANIES_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(companies, null, 2), 'utf-8');
  fs.renameSync(tmp, COMPANIES_FILE);
}

export function getCompanyById(id: string): Company | null {
  const companies = getCompanies();
  return companies.find((c) => c.id === id) || null;
}

export function createCompany(input: Partial<Company> & { name: string }): Company {
  const companies = getCompanies();
  const now = new Date().toISOString();
  const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newCompany: Company = {
    id,
    name: input.name.trim(),
    legalName: input.legalName?.trim() || input.name.trim(),
    nit: input.nit?.trim() || '',
    industry: input.industry?.trim() || 'Servicios & Consultoría',
    website: input.website?.trim() || '',
    country: input.country?.trim() || 'Colombia',
    city: input.city?.trim() || 'Medellín',
    address: input.address?.trim() || '',
    email: input.email?.trim().toLowerCase() || '',
    phone: input.phone?.trim() || '',
    status: input.status || 'prospecto',
    primaryContactName: input.primaryContactName?.trim() || '',
    primaryContactEmail: input.primaryContactEmail?.trim().toLowerCase() || '',
    primaryContactPhone: input.primaryContactPhone?.trim() || '',
    annualBudget: input.annualBudget?.trim() || '',
    notes: input.notes?.trim() || '',
    leadCount: input.leadCount || 0,
    proposalsCount: input.proposalsCount || 0,
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  companies.unshift(newCompany);
  saveCompanies(companies);
  return newCompany;
}

export function updateCompany(id: string, updates: Partial<Company>): Company | null {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = companies[index];
  const updated: Company = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  companies[index] = updated;
  saveCompanies(companies);
  return updated;
}

export function deleteCompany(id: string): boolean {
  const companies = getCompanies();
  const initialLength = companies.length;
  const filtered = companies.filter((c) => c.id !== id);
  if (filtered.length !== initialLength) {
    saveCompanies(filtered);
    return true;
  }
  return false;
}

// ── Unified Aggregation Stats ───────────────────────────────────────────
export function getClientsAndCompaniesStats() {
  const clients = getClients();
  const companies = getCompanies();

  const activeClients = clients.filter((c) => c.status === 'activo').length;
  const inProgressClients = clients.filter((c) => c.status === 'en_progreso').length;
  const potentialClients = clients.filter((c) => c.status === 'potencial').length;

  const activeCompanies = companies.filter((c) => c.status === 'cliente_activo').length;
  const negotiatingCompanies = companies.filter((c) => c.status === 'en_negociacion').length;
  const prospectCompanies = companies.filter((c) => c.status === 'prospecto').length;

  const industries = Array.from(new Set(companies.map((c) => c.industry).filter(Boolean)));
  const cities = Array.from(new Set(companies.map((c) => c.city).filter(Boolean)));

  return {
    totalClients: clients.length,
    activeClients,
    inProgressClients,
    potentialClients,
    totalCompanies: companies.length,
    activeCompanies,
    negotiatingCompanies,
    prospectCompanies,
    industriesCount: industries.length,
    citiesCount: cities.length,
    industries,
    cities,
  };
}

// ── CRM Interconnection & Auto-Promote Helper ───────────────────────────
export function syncLeadToBusiness(lead: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  notes?: string;
  status?: string;
  message?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
}): { client: Client; company?: Company } {
  const companies = getCompanies();
  const clients = getClients();

  let targetCompany: Company | undefined = undefined;
  const companyName = (lead.company || '').trim();

  if (companyName) {
    const existingComp = companies.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase()
    );
    if (existingComp) {
      targetCompany = existingComp;
      if (!existingComp.primaryContactName) {
        updateCompany(existingComp.id, {
          primaryContactName: lead.name,
          primaryContactEmail: lead.email,
          primaryContactPhone: lead.phone,
        });
      }
    } else {
      let autoIndustry = lead.industry || 'Servicios & Consultoría';
      const svc = (lead.service || '').toLowerCase();
      if (svc.includes('e-commerce') || svc.includes('tienda') || svc.includes('tenis') || svc.includes('moda')) {
        autoIndustry = 'E-commerce & Retail';
      } else if (svc.includes('joyer')) {
        autoIndustry = 'Joyería & Lujo';
      } else if (svc.includes('construc') || svc.includes('obra')) {
        autoIndustry = 'Construcción & Ingeniería';
      } else if (svc.includes('seguridad')) {
        autoIndustry = 'Seguridad & Operaciones';
      }

      const compStatus: CompanyStatus =
        lead.status === 'closed_won' || lead.status === 'in_development'
          ? 'cliente_activo'
          : lead.status === 'proposal_sent' || lead.status === 'in_conversation'
          ? 'en_negociacion'
          : 'prospecto';

      targetCompany = createCompany({
        name: companyName,
        industry: autoIndustry,
        website: lead.website || '',
        city: lead.city || 'Medellín',
        country: lead.country || 'Colombia',
        primaryContactName: lead.name,
        primaryContactEmail: (lead.email || '').endsWith('.local') ? '' : (lead.email || ''),
        primaryContactPhone: lead.phone,
        annualBudget: lead.budget || '',
        notes: lead.notes || lead.message,
        status: compStatus,
      });
    }
  }

  const rawEmail = (lead.email || '').trim().toLowerCase();
  const clientEmail = rawEmail.endsWith('.local') ? '' : rawEmail;
  const clientPhone = (lead.phone || '').trim();
  const clientName = (lead.name || '').trim();

  let targetClient: Client | undefined = undefined;
  if (clientEmail || clientPhone || clientName) {
    const existingCli = clients.find((c) => {
      if (clientEmail && c.email.toLowerCase() === clientEmail) return true;
      if (clientPhone && c.phone && c.phone.replace(/\D/g, '') === clientPhone.replace(/\D/g, '')) return true;
      if (clientName && c.name.toLowerCase() === clientName.toLowerCase()) return true;
      return false;
    });

    if (existingCli) {
      const clientStatus: ClientStatus =
        lead.status === 'closed_won' || lead.status === 'in_development'
          ? 'activo'
          : lead.status === 'proposal_sent' || lead.status === 'in_conversation'
          ? 'en_progreso'
          : existingCli.status;

      const resolvedTotalValue =
        lead.status === 'closed_won' && lead.budget
          ? lead.budget
          : existingCli.totalValue || '';

      targetClient =
        updateClient(existingCli.id, {
          companyId: targetCompany?.id || existingCli.companyId,
          companyName: targetCompany?.name || companyName || existingCli.companyName,
          service: lead.service || existingCli.service,
          totalValue: resolvedTotalValue,
          status: clientStatus,
          leadId: lead.id || existingCli.leadId,
        }) || existingCli;
    } else {
      const clientStatus: ClientStatus =
        lead.status === 'closed_won' || lead.status === 'in_development'
          ? 'activo'
          : lead.status === 'proposal_sent' || lead.status === 'in_conversation'
          ? 'en_progreso'
          : 'potencial';

      const resolvedTotalValue =
        lead.status === 'closed_won' && lead.budget ? lead.budget : '';

      targetClient = createClient({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        companyId: targetCompany?.id,
        companyName: targetCompany?.name || companyName,
        service: lead.service || 'Automatización con IA',
        totalValue: resolvedTotalValue,
        status: clientStatus,
        notes: lead.notes || lead.message,
        leadId: lead.id,
      });
    }
  }

  return { client: targetClient!, company: targetCompany };
}

