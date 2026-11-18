import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl.trim())) {
    return new NextResponse('URL inválida o ausente', { status: 400 });
  }

  const cleanUrl = targetUrl.trim();
  const hash = crypto.createHash('md5').update(cleanUrl).digest('hex').slice(0, 16);
  const cacheDir = path.join(process.cwd(), 'public', 'screenshots');

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cachePng = path.join(cacheDir, `${hash}.png`);
  const cacheJpg = path.join(cacheDir, `${hash}.jpg`);

  // 1. Serve cached file if exists
  if (fs.existsSync(cachePng) && fs.statSync(cachePng).size > 1500) {
    const fileBuffer = fs.readFileSync(cachePng);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  }

  if (fs.existsSync(cacheJpg) && fs.statSync(cacheJpg).size > 1500) {
    const fileBuffer = fs.readFileSync(cacheJpg);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  }

  // 2. Fetch live mobile screenshot via Thum.io
  try {
    const thumUrl = `https://image.thum.io/get/width/390/crop/844/noanimate/${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(thumUrl, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 2000) {
        fs.writeFileSync(cachePng, buffer);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
          },
        });
      }
    }
  } catch (err) {
    console.warn('[screenshot-api] Thum.io fetch failed, trying microlink:', err);
  }

  // 3. Fallback to Microlink direct embed
  try {
    const microUrl = `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.isMobile=true&viewport.width=390&viewport.height=844`;
    const res = await fetch(microUrl, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 2000) {
        fs.writeFileSync(cachePng, buffer);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
          },
        });
      }
    }
  } catch (err) {
    console.warn('[screenshot-api] Microlink fetch failed:', err);
  }

  // 4. Fallback redirect
  return NextResponse.redirect(
    `https://image.thum.io/get/width/390/crop/844/noanimate/${encodeURIComponent(cleanUrl)}`
  );
}
