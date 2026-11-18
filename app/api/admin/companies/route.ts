import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getClientsAndCompaniesStats,
} from '@/lib/clients-companies-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const companies = getCompanies();
  const stats = getClientsAndCompaniesStats();
  return NextResponse.json({ ok: true, companies, stats });
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

  const {
    name,
    legalName,
    nit,
    industry,
    website,
    country,
    city,
    address,
    email,
    phone,
    status,
    primaryContactName,
    primaryContactEmail,
    primaryContactPhone,
    annualBudget,
    notes,
    tags,
  } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'El nombre de la empresa es obligatorio' }, { status: 400 });
  }

  const company = createCompany({
    name,
    legalName,
    nit,
    industry,
    website,
    country,
    city,
    address,
    email,
    phone,
    status,
    primaryContactName,
    primaryContactEmail,
    primaryContactPhone,
    annualBudget,
    notes,
    tags,
  });

  return NextResponse.json({ ok: true, company });
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

  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const updated = updateCompany(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, company: updated });
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

  const deleted = deleteCompany(id);
  return NextResponse.json({ ok: deleted });
}
