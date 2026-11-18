import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';
import path from 'node:path';
import fs from 'node:fs';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const RATE_LIMIT_MAX = 30; // 30 uploads per hour per IP
const RATE_LIMIT_ROUTE = 'brief-upload';

const ALLOWED_EXTENSIONS = new Set([
  // Images
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.bmp',
  // Vector & Design
  '.ai', '.eps', '.pdf', '.psd', '.fig', '.sketch', '.xd',
  // Documents & Archives
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.rtf', '.odt', '.ppt', '.pptx',
  '.zip', '.rar', '.7z'
]);

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas subidas de archivos. Por favor espera unos minutos.' },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Form data inválido' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `El archivo supera el límite de 15 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB)` },
      { status: 400 }
    );
  }

  const originalName = file.name || 'archivo';
  const ext = path.extname(originalName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `Extensión de archivo "${ext}" no permitida. Formatos válidos: imágenes, vectores (.AI, .EPS, .SVG, .PDF) y documentos.` },
      { status: 400 }
    );
  }

  // Sanitize base name
  const rawBase = path.basename(originalName, ext);
  const cleanBase = rawBase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'archivo';

  const datePrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'briefs', datePrefix);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const randomHash = Math.random().toString(36).substring(2, 9);
  const finalFilename = `${cleanBase}-${Date.now().toString(36)}-${randomHash}${ext}`;
  const diskPath = path.join(targetDir, finalFilename);
  const publicUrl = `/uploads/briefs/${datePrefix}/${finalFilename}`;

  try {
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(diskPath, Buffer.from(bytes));
    bumpRateLimit(RATE_LIMIT_ROUTE, ip);

    return NextResponse.json({
      ok: true,
      file: {
        name: originalName,
        url: publicUrl,
        size: file.size,
        type: file.type || ext.replace('.', ''),
      },
    });
  } catch (err) {
    console.error('[brief-upload] Failed to write file:', err);
    return NextResponse.json({ error: 'Error interno al guardar el archivo' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const url = typeof body?.url === 'string' ? body.url : '';

    if (!url.startsWith('/uploads/briefs/')) {
      return NextResponse.json({ error: 'Ruta no válida' }, { status: 400 });
    }

    // Prevent directory traversal
    const safeRel = path.normalize(url.replace('/uploads/briefs/', '')).replace(/^(\.\.[\/\\])+/, '');
    const diskPath = path.join(process.cwd(), 'public', 'uploads', 'briefs', safeRel);

    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'No se pudo eliminar el archivo' }, { status: 500 });
  }
}
