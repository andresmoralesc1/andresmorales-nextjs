import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const VALID_SECRET = process.env.DEVLOG_WEBHOOK_SECRET || 'andresmorales_devlog_2026';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const action = searchParams.get('action'); // 'publish' or 'discard'
  const postToLinkedin = searchParams.get('linkedin') === 'true';

  if (secret !== VALID_SECRET) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#1e1810;color:#fff;">
        <h2 style="color:#ff4444;">⛔ Acceso Denegado</h2>
        <p>Token de autorización inválido.</p>
      </body></html>`,
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (action === 'discard') {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#1e1810;color:#fff;">
        <h2 style="color:#ffaa00;">🗑️ DevLog Descartado</h2>
        <p>El borrador fue cancelado y no se publicará en el blog ni en LinkedIn.</p>
        <p><a href="/" style="color:#f96e03;">← Volver al sitio</a></p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (action === 'publish') {
    // Launch background publication script
    const scriptPath = path.join(process.cwd(), 'scripts', 'devlog-generator.cjs');
    const args = ['--publish'];
    if (postToLinkedin) args.push('--post-linkedin');

    const proc = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, HOME: '/home/telchar' },
    });
    proc.unref();

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Despliegue Iniciado — Andrés Morales DevLog</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #12100e; color: #f8f5f4; text-align: center; padding: 40px 20px; }
          .card { max-width: 480px; margin: 40px auto; background: #1e1810; border: 1px solid #332a22; border-radius: 16px; padding: 32px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .badge { display: inline-block; padding: 6px 12px; background: rgba(249,110,3,0.15); color: #f96e03; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
          h1 { font-size: 24px; margin: 0 0 12px; color: #fff; }
          p { color: #a8a29e; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .btn { display: inline-block; padding: 12px 24px; background: #f96e03; color: #1e1810; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px; }
          .status-pulse { display: inline-block; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
          @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge"><span class="status-pulse"></span>Proceso Activo</div>
          <h1>🚀 Publicación en Marcha</h1>
          <p>El servidor está compilando Next.js en producción, actualizando el blog, notificando a Googlebot y procesando el post para LinkedIn.</p>
          <p>Te llegará la confirmación final a Telegram en unos 30 segundos.</p>
          <a href="/" class="btn">← Ir al Portafolio</a>
        </div>
      </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  // Handle direct API trigger
  return GET(req);
}
