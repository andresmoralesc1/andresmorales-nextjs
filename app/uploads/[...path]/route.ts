import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.ai': 'application/postscript',
  '.eps': 'application/postscript',
  '.psd': 'image/vnd.adobe.photoshop',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const baseDir = path.join(process.cwd(), 'public', 'uploads');
  const targetPath = path.resolve(baseDir, ...pathSegments);

  // Guard against directory traversal
  if (!targetPath.startsWith(baseDir)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(targetPath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  const fileStream = fs.readFileSync(targetPath);

  return new NextResponse(fileStream, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
