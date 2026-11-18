import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import {
  getProspectData,
  upsertProspect,
  updateProspect,
  deleteProspect,
} from '@/lib/prospect-store';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const data = getProspectData();
  return NextResponse.json({
    ok: true,
    prospects: data.prospects || [],
    lastSearch: data.lastSearch,
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

  const { name, website, country, city, category, phone, email, instagram } = body;
  if (!name || !website) {
    return NextResponse.json({ error: 'Nombre y Sitio Web son requeridos' }, { status: 400 });
  }

  const created = upsertProspect({
    name,
    website,
    country: country || 'Colombia',
    city: city || 'Principal',
    category: category || 'E-commerce',
    phone: phone || '',
    email: email || '',
    instagram: instagram || '',
    status: 'discovered',
  });

  return NextResponse.json({ ok: true, prospect: created });
}

export async function PATCH(req: Request) {
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

  const updated = updateProspect(id, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, prospect: updated });
}

export async function DELETE(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }

  const deleted = deleteProspect(id);
  return NextResponse.json({ ok: true, deleted });
}
