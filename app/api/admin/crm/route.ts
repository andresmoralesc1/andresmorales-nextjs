import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getCrmData,
  createLead,
  updateLead,
  deleteLead,
  updateAutomationSettings,
} from '@/lib/crm-store';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const data = getCrmData();
  return NextResponse.json({
    ok: true,
    leads: data.leads,
    emailLogs: data.emailLogs,
    proposals: data.proposals || [],
    automationSettings: data.automationSettings,
  });
}

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { name, email, phone, company, service, budget, message, status, source } = body;
  if (!name) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
  }

  const effectiveEmail = email || (phone ? `${phone.replace(/\D/g, '')}@whatsapp.local` : `lead_${Date.now()}@contacto.local`);

  const lead = createLead({
    name,
    email: effectiveEmail,
    phone,
    company,
    service,
    budget,
    message,
    status,
    source: source || 'manual',
  });

  // Auto-sync to Clientes and Empresas
  try {
    syncLeadToBusiness({
      id: lead?.id,
      name,
      email: effectiveEmail,
      phone,
      company,
      service,
      budget,
      status,
      message,
    });
  } catch (syncErr) {
    console.warn('[crm/post] Could not sync lead to business:', syncErr);
  }

  return NextResponse.json({ ok: true, lead });
}

export async function PUT(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.type === 'settings') {
    const updated = updateAutomationSettings(body.settings);
    return NextResponse.json({ ok: true, settings: updated });
  }

  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const updated = updateLead(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated });
}

export const PATCH = PUT;

export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const deleted = deleteLead(id);
  return NextResponse.json({ ok: deleted });
}
