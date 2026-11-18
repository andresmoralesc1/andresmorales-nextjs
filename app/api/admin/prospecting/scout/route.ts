import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { discoverProspects } from '@/lib/prospect-discovery';
import { upsertProspect, getProspectData, saveProspectData } from '@/lib/prospect-store';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { country = 'Colombia', city = 'Medellín', category = 'Joyería', count = 5 } = body;

  try {
    const rawResults = await discoverProspects({
      country,
      city,
      category,
      count: Math.min(20, Math.max(1, Number(count) || 5)),
    });

    const savedProspects = rawResults.map((r) =>
      upsertProspect({
        name: r.name,
        website: r.website,
        country: r.country || country,
        city: r.city || city,
        category: r.category || category,
        phone: r.phone || '',
        instagram: r.instagram || '',
        status: 'discovered',
      })
    );

    // Update last search metadata
    const data = getProspectData();
    data.lastSearch = {
      country,
      city,
      category,
      count: savedProspects.length,
      searchedAt: new Date().toISOString(),
    };
    saveProspectData(data);

    return NextResponse.json({
      ok: true,
      foundCount: savedProspects.length,
      prospects: savedProspects,
    });
  } catch (err: any) {
    console.error('[prospecting/scout] Discovery error:', err);
    return NextResponse.json(
      { error: 'Error durante la búsqueda de prospectos: ' + (err?.message || 'Error') },
      { status: 500 }
    );
  }
}
