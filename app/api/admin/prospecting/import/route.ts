import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createLead, addLeadNote } from '@/lib/crm-store';
import { getProspectData, updateProspect } from '@/lib/prospect-store';
import { syncLeadToBusiness } from '@/lib/clients-companies-store';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID de prospecto requerido' }, { status: 400 });
  }

  const data = getProspectData();
  const prospect = data.prospects.find((p) => p.id === id);
  if (!prospect) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 });
  }

  try {
    const highlightsText = prospect.audit?.auditHighlights
      ? prospect.audit.auditHighlights.map((h) => `• ${h}`).join('\n')
      : 'Auditoría preliminar generada por Lead Hunter.';

    const newLead = createLead({
      name: prospect.name,
      email: prospect.email || '',
      phone: prospect.phone || '',
      company: prospect.name,
      service: `Optimización E-commerce (${prospect.category})`,
      message: `Sitio web: ${prospect.website}\nCiudad: ${prospect.city}\nPuntuación técnica: ${prospect.audit?.score || '—'}/100\nPropuesta: ${prospect.audit?.suggestedImprovement || 'Optimización integral'}`,
      source: 'manual',
      status: 'new',
      auditSlug: prospect.auditSlug,
      pdfUrl: prospect.pdfUrl,
    });

    if (newLead?.id) {
      addLeadNote(
        newLead.id,
        `🔍 Auditoría Técnica Inicial (Puntaje: ${prospect.audit?.score || 'N/A'}/100):\n${highlightsText}`
      );

      // Auto-create or link Empresa and Cliente
      syncLeadToBusiness({
        id: newLead.id,
        name: prospect.name,
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.name,
        service: `Optimización E-commerce (${prospect.category})`,
        status: 'potencial',
        city: prospect.city,
        country: prospect.country,
        website: prospect.website,
        industry: prospect.category,
        notes: `Score: ${prospect.audit?.score || '—'}/100. ${prospect.audit?.suggestedImprovement || ''}`,
      });
    }

    updateProspect(id, { status: 'imported_crm' });

    return NextResponse.json({
      ok: true,
      lead: newLead,
    });
  } catch (err: any) {
    console.error('[prospecting/import] Import error:', err);
    return NextResponse.json(
      { error: 'Error al importar prospecto al CRM: ' + (err?.message || 'Error') },
      { status: 500 }
    );
  }
}
