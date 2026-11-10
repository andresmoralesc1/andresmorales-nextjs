import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { sendTelegramNotification } from '@/lib/telegram';

const SITE_URL = 'https://andresmorales.com.co';

const CORE_PRIORITY_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/es/`,
  `${SITE_URL}/pt/`,
  `${SITE_URL}/portfolio`,
  `${SITE_URL}/es/portfolio`,
  `${SITE_URL}/pt/portfolio`,
  `${SITE_URL}/services/ai-automation`,
  `${SITE_URL}/es/services/ai-automation`,
  `${SITE_URL}/pt/services/ai-automation`,
  `${SITE_URL}/work/impresos-americana`,
  `${SITE_URL}/work/embryoglass`,
  `${SITE_URL}/work/que-nivel-maribel`,
  `${SITE_URL}/work/liz-candelo`,
  `${SITE_URL}/work/barriotech`,
  `${SITE_URL}/work/kambelleh`,
  `${SITE_URL}/work/temptum`,
  `${SITE_URL}/work/superllantas`,
];

export async function POST(req: NextRequest) {
  return handlePing(req);
}

export async function GET(req: NextRequest) {
  return handlePing(req);
}

async function handlePing(req: NextRequest) {
  // Secret token check
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') || req.headers.get('x-webhook-secret');
  const expectedSecret = process.env.SEO_PING_SECRET || 'andresmorales_github_seo_2026';

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'google-service-account.json');

  if (!fs.existsSync(keyPath)) {
    return NextResponse.json(
      { error: 'Service account credentials not found on server' },
      { status: 500 }
    );
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    // @ts-expect-error google auth client typing
    const indexing = google.indexing({ version: 'v3', auth: client });

    const results: Array<{ url: string; status: number }> = [];

    for (const targetUrl of CORE_PRIORITY_URLS) {
      try {
        const res = await indexing.urlNotifications.publish({
          requestBody: {
            url: targetUrl,
            type: 'URL_UPDATED',
          },
        });
        results.push({ url: targetUrl, status: res.status });
        await new Promise((r) => setTimeout(r, 150));
      } catch (err: unknown) {
        results.push({
          url: targetUrl,
          status: (err as { status?: number })?.status || 500,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 200).length;

    // Send Telegram alert
    await sendTelegramNotification(
      `🚀 *Google Indexing Automático (GitHub Sync)*\n\n` +
      `Se detectó actualización de código en GitHub.\n` +
      `• *URLs enviadas:* ${results.length}\n` +
      `• *Googlebot HTTP 200:* ${successCount}/${results.length}\n` +
      `• *Fecha:* ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      submitted: results.length,
      successCount,
      results,
    });
  } catch (error: unknown) {
    console.error('[SEO Ping Webhook Error]:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
