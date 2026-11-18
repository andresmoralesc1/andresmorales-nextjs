import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientsAndCompaniesStats,
} from '@/lib/clients-companies-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const clients = getClients();
  const stats = getClientsAndCompaniesStats();
  return NextResponse.json({ ok: true, clients, stats });
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

  const { name, email, phone, role, companyId, companyName, status, service, totalValue, notes, tags } = body;
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
  }

  const client = createClient({
    name,
    email,
    phone,
    role,
    companyId,
    companyName,
    status,
    service,
    totalValue,
    notes,
    tags,
  });

  return NextResponse.json({ ok: true, client });
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

  const updated = updateClient(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, client: updated });
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

  const deleted = deleteClient(id);
  return NextResponse.json({ ok: deleted });
}
