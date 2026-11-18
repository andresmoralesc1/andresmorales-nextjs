import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getProspectBySlug } from '@/lib/prospect-store';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, props: Props) {
  const { slug } = await props.params;
  const prospect = getProspectBySlug(slug);

  // Map known slugs or prospect.pdfUrl
  let pdfRelativePath = prospect?.pdfUrl;
  if (!pdfRelativePath && (slug.includes('bosi') || slug === 'bosi-cali-zko6')) {
    pdfRelativePath = '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf';
  }

  if (!pdfRelativePath) {
    // Check fallback in /tmp or /public/audits
    if (slug.includes('bosi') && fs.existsSync('/tmp/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf')) {
      const buffer = fs.readFileSync('/tmp/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf"',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.json({ error: 'PDF no disponible para esta auditoría' }, { status: 404 });
  }

  // Resolve absolute path in public
  const cleanPath = pdfRelativePath.startsWith('/') ? pdfRelativePath.slice(1) : pdfRelativePath;
  const fullPath = path.join(process.cwd(), 'public', cleanPath);

  if (!fs.existsSync(fullPath)) {
    // Try fallback /tmp
    if (fs.existsSync('/tmp/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf')) {
      const buffer = fs.readFileSync('/tmp/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf"',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    return NextResponse.json({ error: 'Archivo PDF no encontrado' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const safeName = prospect?.name
    ? `Ultra_Auditoria_UX_UI_${prospect.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_AndresMorales.pdf`
    : 'Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
