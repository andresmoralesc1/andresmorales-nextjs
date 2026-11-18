import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCrmData, updateLead } from '@/lib/crm-store';
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

  const { leadId } = body;
  if (!leadId) {
    return NextResponse.json({ error: 'leadId es requerido' }, { status: 400 });
  }

  const crmData = getCrmData();
  const lead = crmData.leads.find((l) => l.id === leadId);
  if (!lead) {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
  }

  try {
    const { client, company } = syncLeadToBusiness({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: lead.service,
      budget: lead.budget,
      status: lead.status,
      message: lead.message,
    });

    // Update lead with company name if created
    if (company && !lead.company) {
      updateLead(lead.id, { company: company.name });
    }

    return NextResponse.json({
      ok: true,
      client,
      company,
      message: `Lead promovido con éxito a Cliente (${client.name})${company ? ` y Empresa (${company.name})` : ''}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Error al promover lead' },
      { status: 500 }
    );
  }
}
