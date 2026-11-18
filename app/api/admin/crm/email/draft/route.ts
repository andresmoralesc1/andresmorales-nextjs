import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getCrmData } from '@/lib/crm-store';
import { generateAgentEmailDraft, type ClientCrmContext } from '@/lib/ai-agent';

export async function POST(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { leadId, to, toName, incomingSubject, incomingSnippet, instruction } = body;

  const data = getCrmData();
  let foundLead = leadId ? data.leads.find((l) => l.id === leadId) : null;
  if (!foundLead && to) {
    foundLead = data.leads.find((l) => l.email.toLowerCase() === to.toLowerCase()) || null;
  }

  const targetName = foundLead?.name || toName || 'Cliente';
  const targetEmail = foundLead?.email || to || '';
  const targetCompany = foundLead?.company || '';
  const targetService = foundLead?.service || '';

  // Extract CRM context
  let crmContext: ClientCrmContext | undefined;
  if (foundLead) {
    const brief = foundLead.briefData || {};
    const briefParts: string[] = [];
    if (brief.webType) briefParts.push(`Tipo de web: ${brief.webType}`);
    if (brief.goal) briefParts.push(`Objetivo: ${brief.goal}`);
    if (brief.budget) briefParts.push(`Presupuesto: ${brief.budget}`);
    if (brief.timeline) briefParts.push(`Plazo: ${brief.timeline}`);
    if (foundLead.message) briefParts.push(`Mensaje inicial: ${foundLead.message}`);

    const advisorNotes = (foundLead.notes || []).map((n) => n.text);

    crmContext = {
      company: targetCompany,
      service: targetService,
      statusLabel: foundLead.status,
      briefSummary: briefParts.join(' | '),
      advisorNotes,
      followUpNote: foundLead.followUpNote,
    };
  }

  try {
    const draft = await generateAgentEmailDraft({
      leadName: targetName,
      leadEmail: targetEmail,
      company: targetCompany,
      service: targetService,
      incomingSubject,
      incomingSnippet,
      crmContext,
      instruction,
    });

    return NextResponse.json({
      ok: true,
      subject: draft.subject,
      body: draft.body,
      modelUsed: draft.modelUsed,
      durationMs: draft.durationMs,
    });
  } catch (err: any) {
    console.error('[email-draft] Error generating AI draft:', err);
    return NextResponse.json(
      { error: 'Error al generar borrador con IA: ' + (err?.message || 'Error') },
      { status: 500 }
    );
  }
}
