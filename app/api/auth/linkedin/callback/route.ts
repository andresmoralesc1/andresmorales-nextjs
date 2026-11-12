import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.json({ ok: false, error, errorDescription }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ ok: false, message: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID || '78rl7rqubjx78b';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
  const redirectUri = 'https://andresmorales.com.co/api/auth/linkedin/callback';

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json({ ok: false, error: tokenData }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Get user info to resolve urn:li:person:...
    let personUrn = '';
    let personName = 'Andres Morales';

    try {
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.sub) {
          personUrn = `urn:li:person:${userData.sub}`;
          personName = userData.name || personName;
        }
      }
    } catch (e) {}

    // Fallback to me endpoint if userinfo was not available
    if (!personUrn) {
      try {
        const meRes = await fetch('https://api.linkedin.com/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.id) {
            personUrn = `urn:li:person:${meData.id}`;
          }
        }
      } catch (e) {}
    }

    // Persist to .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (/LINKEDIN_ACCESS_TOKEN=/.test(envContent)) {
      envContent = envContent.replace(/LINKEDIN_ACCESS_TOKEN=.*/, `LINKEDIN_ACCESS_TOKEN="${accessToken}"`);
    } else {
      envContent += `\nLINKEDIN_ACCESS_TOKEN="${accessToken}"`;
    }

    if (personUrn) {
      if (/LINKEDIN_PERSON_URN=/.test(envContent)) {
        envContent = envContent.replace(/LINKEDIN_PERSON_URN=.*/, `LINKEDIN_PERSON_URN="${personUrn}"`);
      } else {
        envContent += `\nLINKEDIN_PERSON_URN="${personUrn}"`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>LinkedIn Conectado con Éxito</title>
  <style>
    body { background: #0a0a0f; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 500px; text-align: center; }
    .badge { background: #10b981; color: #000; font-weight: 700; padding: 6px 12px; border-radius: 999px; display: inline-block; margin-bottom: 16px; }
    h1 { font-size: 24px; margin: 0 0 12px; color: #fff; }
    p { color: #a1a1aa; line-height: 1.5; font-size: 14px; margin: 0 0 20px; }
    code { background: #18181b; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #38bdf8; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">CONEXIÓN EXITOSA</div>
    <h1>LinkedIn Conectado al DevLog</h1>
    <p>La autenticación se completó correctamente para <strong>${personName}</strong>.</p>
    <p>El token de acceso y tu URN personal (<code>${personUrn || 'urn:li:person'}</code>) han sido guardados automáticamente en tu servidor.</p>
    <p>Ya puedes cerrar esta ventana y regresar al chat.</p>
  </div>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
