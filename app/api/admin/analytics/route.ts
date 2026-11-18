import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/admin-auth-server';

// In-memory token cache
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const UMAMI_INTERNAL_URL = 'http://127.0.0.1:3018';
const UMAMI_USER = 'admin';
const UMAMI_PASS = 'Lamismadesiempre123!';

const DEFAULT_SITES = [
  {
    id: '9865d96c-00dc-4cd5-b7e8-a2d85ca7b932',
    name: 'Andrés Morales (Portafolio & Lab)',
    domain: 'andresmorales.com.co',
    shareId: 'andresmorales',
  },
  {
    id: '5c873d7b-161e-437f-9532-25b0913f85f2',
    name: 'AM Art (Bocetos de Piel)',
    domain: 'amart.andresmorales.com.co',
    shareId: 'amart',
  },
];

async function getUmamiToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch(`${UMAMI_INTERNAL_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
  });

  if (!res.ok) {
    throw new Error(`Umami login failed with status ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiresAt = now + 12 * 60 * 60 * 1000; // 12 hours
  return cachedToken!;
}

export async function GET(req: NextRequest) {
  // Gate check
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') || DEFAULT_SITES[0].id;
  const range = searchParams.get('range') || '30d';

  const now = Date.now();
  let startAt = now - 30 * 24 * 3600 * 1000;
  let unit = 'day';

  if (range === '24h') {
    startAt = now - 24 * 3600 * 1000;
    unit = 'hour';
  } else if (range === '7d') {
    startAt = now - 7 * 24 * 3600 * 1000;
    unit = 'day';
  } else if (range === '30d') {
    startAt = now - 30 * 24 * 3600 * 1000;
    unit = 'day';
  } else if (range === '90d') {
    startAt = now - 90 * 24 * 3600 * 1000;
    unit = 'day';
  }

  try {
    const token = await getUmamiToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    // Parallel queries to local Umami container
    const [
      statsRes,
      activeRes,
      pageviewsRes,
      pathsRes,
      countriesRes,
      devicesRes,
      browsersRes,
      osRes,
      referrersRes,
    ] = await Promise.all([
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/stats?startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/active`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/pageviews?startAt=${startAt}&endAt=${now}&unit=${unit}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=path&startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=country&startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=device&startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=browser&startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=os&startAt=${startAt}&endAt=${now}`, { headers }),
      fetch(`${UMAMI_INTERNAL_URL}/api/websites/${siteId}/metrics?type=referrer&startAt=${startAt}&endAt=${now}`, { headers }),
    ]);

    const stats = statsRes.ok ? await statsRes.json() : null;
    const active = activeRes.ok ? await activeRes.json() : { visitors: 0 };
    const pageviews = pageviewsRes.ok ? await pageviewsRes.json() : { pageviews: [], sessions: [] };
    const paths = pathsRes.ok ? await pathsRes.json() : [];
    const countries = countriesRes.ok ? await countriesRes.json() : [];
    const devices = devicesRes.ok ? await devicesRes.json() : [];
    const browsers = browsersRes.ok ? await browsersRes.json() : [];
    const os = osRes.ok ? await osRes.json() : [];
    const referrers = referrersRes.ok ? await referrersRes.json() : [];

    return NextResponse.json({
      success: true,
      sites: DEFAULT_SITES,
      selectedSiteId: siteId,
      range,
      stats,
      active: active?.visitors ?? 0,
      pageviewsSeries: pageviews?.pageviews ?? [],
      sessionsSeries: pageviews?.sessions ?? [],
      paths: Array.isArray(paths) ? paths : [],
      countries: Array.isArray(countries) ? countries : [],
      devices: Array.isArray(devices) ? devices : [],
      browsers: Array.isArray(browsers) ? browsers : [],
      os: Array.isArray(os) ? os : [],
      referrers: Array.isArray(referrers) ? referrers : [],
    });
  } catch (err: any) {
    console.error('[analytics-api] Error fetching Umami metrics:', err);
    return NextResponse.json(
      { success: false, error: 'Error al conectar con Umami Analytics' },
      { status: 500 }
    );
  }
}
