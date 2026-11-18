import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { auditProspectWebsite, fetchSiteScreenshot } from '@/lib/prospect-auditor';
import { getProspectData, updateProspect, generateAuditSlug } from '@/lib/prospect-store';

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
    const auditSlug = prospect.auditSlug || generateAuditSlug(prospect.name);

    const [auditRes, fallbackScreenshotUrl] = await Promise.all([
      auditProspectWebsite(
        prospect.name,
        prospect.website,
        prospect.country || 'Colombia',
        prospect.city,
        prospect.category,
        auditSlug
      ),
      fetchSiteScreenshot(prospect.website, auditSlug),
    ]);

    const effectiveScreenshot = auditRes.screenshotUrl || fallbackScreenshotUrl;

    const updates: any = {
      audit: auditRes.audit,
      pitch: auditRes.pitch,
      auditSlug,
      status: 'audited',
    };

    if (effectiveScreenshot) {
      updates.screenshotUrl = effectiveScreenshot;
    }

    if (auditRes.extractedPhone && !prospect.phone) {
      updates.phone = auditRes.extractedPhone;
    }
    if (auditRes.extractedEmail && (!prospect.email || prospect.email.includes('example'))) {
      updates.email = auditRes.extractedEmail;
    }
    if (auditRes.extractedInstagram && !prospect.instagram) {
      updates.instagram = auditRes.extractedInstagram;
    }

    const updated = updateProspect(id, updates);

    return NextResponse.json({
      ok: true,
      prospect: updated,
    });
  } catch (err: any) {
    console.error('[prospecting/audit] Audit error:', err);
    return NextResponse.json(
      { error: 'Error al auditar el sitio web: ' + (err?.message || 'Error') },
      { status: 500 }
    );
  }
}
