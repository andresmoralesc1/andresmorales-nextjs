import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ProspectAudit, ProspectPitch, AiAutomationProposal, LighthouseMetrics } from './prospect-store';
import { CALENDAR_URL, ANDRES_PHONE } from './ai-agent';

const execFileAsync = promisify(execFile);
const CHROME_PATH =
  process.env.CHROME_PATH ||
  '/home/telchar/chrome-headless-shell/linux-156.0.8078.47/chrome-headless-shell-linux64/chrome-headless-shell';

export interface RawSiteMetrics {
  url: string;
  statusCode: number;
  ttfbMs: number;
  totalTimeMs: number;
  htmlLength: number;
  platform: string;
  hasWhatsApp: boolean;
  hasAnalytics: boolean;
  hasMetaPixel: boolean;
  hasMobileViewport: boolean;
  hasOgImage: boolean;
  title: string;
  description: string;
  // UX Signals
  hasSearch: boolean;
  hasCartOrCheckout: boolean;
  hasTrustBadges: boolean;
  // UI Signals
  hasFavicon: boolean;
  hasCustomTypography: boolean;
  hasModernImages: boolean;
  hasAggressivePopups: boolean;
  h1Count: number;
  // Extracted Contact Data
  extractedPhone?: string;
  extractedEmail?: string;
  extractedInstagram?: string;
}

/**
 * Decodes Cloudflare email-protection hex strings
 */
export function decodeCloudflareEmail(encoded: string): string {
  try {
    let email = '';
    const r = parseInt(encoded.substring(0, 2), 16);
    for (let n = 2; n < encoded.length; n += 2) {
      const charCode = parseInt(encoded.substring(n, 2), 16) ^ r;
      email += String.fromCharCode(charCode);
    }
    return email;
  } catch {
    return '';
  }
}

const JUNK_EMAIL_DOMAINS = [
  'sentry',
  'example',
  'domain.com',
  'yourdomain',
  'email.com',
  'wixpress.com',
  'shopify.com',
  'myshopify.com',
  'schema.org',
  'gravatar.com',
  'wordpress.org',
  'facebook.com',
  'tiendanube.com',
  'vtex.com',
  'vteximg.com',
  'google.com',
  'cloudflare.com',
  'w3.org',
  'doubleclick.net',
  'yimg.com',
  'akamai.net',
  'bootstrapcdn.com',
];

const JUNK_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.css',
  '.js',
  '.woff',
  '.woff2',
];

export function extractEmailsFromHtml(html: string, targetDomain: string): string[] {
  const found = new Set<string>();

  // 1. JSON-LD structured data (schema.org)
  const ldMatches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const m of ldMatches) {
    try {
      const data = JSON.parse(m[1]);
      if (typeof data.email === 'string') found.add(data.email.toLowerCase().trim());
      if (typeof data.contactPoint?.email === 'string')
        found.add(data.contactPoint.email.toLowerCase().trim());
      if (Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
          if (typeof item?.email === 'string') found.add(item.email.toLowerCase().trim());
          if (typeof item?.contactPoint?.email === 'string')
            found.add(item.contactPoint.email.toLowerCase().trim());
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Cloudflare protected emails
  const cfMatches = html.matchAll(/(?:data-cfemail=["']|email-protection#)([a-f0-9]{10,})/gi);
  for (const m of cfMatches) {
    const decoded = decodeCloudflareEmail(m[1]);
    if (decoded && decoded.includes('@') && decoded.includes('.')) {
      found.add(decoded.toLowerCase().trim());
    }
  }

  // 3. Normalization of HTML entities & anti-scraping patterns
  const normalizedHtml = html
    .replace(/&#64;/gi, '@')
    .replace(/&#46;/gi, '.')
    .replace(/\[\s*at\s*\]|\(\s*at\s*\)/gi, '@')
    .replace(/\[\s*dot\s*\]|\(\s*dot\s*\)/gi, '.');

  // 4. Mailto extraction
  const mailtoMatches = normalizedHtml.matchAll(
    /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  );
  for (const m of mailtoMatches) {
    found.add(m[1].toLowerCase().trim());
  }

  // 5. Plaintext regex extraction
  const regexMatches = normalizedHtml.matchAll(
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g
  );
  for (const m of regexMatches) {
    found.add(m[1].toLowerCase().trim());
  }

  const cleanDomain = targetDomain
    .replace(/^(?:https?:\/\/)?(?:www\.)?/, '')
    .split('/')[0]
    .toLowerCase();

  const valid = Array.from(found).filter((email) => {
    if (JUNK_EXTENSIONS.some((ext) => email.endsWith(ext))) return false;
    if (JUNK_EMAIL_DOMAINS.some((junk) => email.includes(junk))) return false;
    if (email.length < 6 || email.length > 70) return false;
    return true;
  });

  // Sort by priority:
  // 1. Matches store domain (e.g. @tanyamoss.com)
  // 2. Business prefixes (ecommerce@, info@, contacto@, ventas@, hola@)
  // 3. General emails
  valid.sort((a, b) => {
    const aDomain = a.split('@')[1] || '';
    const bDomain = b.split('@')[1] || '';
    const aMatchesDomain = cleanDomain && aDomain.includes(cleanDomain);
    const bMatchesDomain = cleanDomain && bDomain.includes(cleanDomain);

    if (aMatchesDomain && !bMatchesDomain) return -1;
    if (!aMatchesDomain && bMatchesDomain) return 1;

    const bizPrefixes = [
      'ecommerce',
      'contacto',
      'info',
      'ventas',
      'hola',
      'atencionalcliente',
      'soporte',
      'contact',
      'admin',
    ];
    const aPrefix = a.split('@')[0];
    const bPrefix = b.split('@')[0];
    const aHasBiz = bizPrefixes.some((p) => aPrefix.includes(p));
    const bHasBiz = bizPrefixes.some((p) => bPrefix.includes(p));

    if (aHasBiz && !bHasBiz) return -1;
    if (!aHasBiz && bHasBiz) return 1;

    return 0;
  });

  return valid;
}

async function fetchSubpage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

export async function deepScrapeEmail(
  baseUrl: string,
  homeHtml: string
): Promise<string | undefined> {
  // First, check homepage
  const homeEmails = extractEmailsFromHtml(homeHtml, baseUrl);
  if (homeEmails.length > 0) {
    return homeEmails[0];
  }

  // Find candidate contact and legal links in homepage
  const candidates: string[] = [];
  try {
    const baseObj = new URL(baseUrl);

    const linkMatches = homeHtml.matchAll(/href=["']([^"']+)["']/gi);
    for (const m of linkMatches) {
      const rawHref = m[1].trim();
      if (
        !rawHref.startsWith('javascript:') &&
        !rawHref.startsWith('mailto:') &&
        !rawHref.startsWith('tel:') &&
        /(contacto|contact|aviso|privacidad|terminos|politica|nosotros|about|pqrs|faq|atencion)/i.test(
          rawHref
        )
      ) {
        try {
          const absUrl = new URL(rawHref, baseUrl);
          if (absUrl.hostname === baseObj.hostname && !candidates.includes(absUrl.href)) {
            candidates.push(absUrl.href);
          }
        } catch {
          // invalid URL
        }
      }
    }

    // Common fallbacks if no explicit links found
    const fallbackPaths = [
      '/pages/aviso-de-privacidad',
      '/pages/terminos-y-condiciones',
      '/pages/contacto',
      '/contacto',
      '/contact',
      '/pages/contact-us',
      '/politicas-de-privacidad',
    ];
    for (const p of fallbackPaths) {
      const fallbackUrl = `${baseObj.origin}${p}`;
      if (!candidates.includes(fallbackUrl)) {
        candidates.push(fallbackUrl);
      }
    }

    // Crawl top 3 candidates concurrently
    const targets = candidates.slice(0, 3);
    const results = await Promise.all(targets.map((url) => fetchSubpage(url)));

    for (const subHtml of results) {
      if (!subHtml) continue;
      const subEmails = extractEmailsFromHtml(subHtml, baseUrl);
      if (subEmails.length > 0) {
        return subEmails[0];
      }
    }
  } catch {
    // URL parsing error
  }

  return undefined;
}

export async function inspectWebsite(rawUrl: string): Promise<RawSiteMetrics> {
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const startTime = Date.now();
  let ttfbMs = 0;
  let totalTimeMs = 0;
  let statusCode = 0;
  let html = '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      },
    });

    ttfbMs = Date.now() - startTime;
    statusCode = res.status;
    html = await res.text();
    totalTimeMs = Date.now() - startTime;
    clearTimeout(timeoutId);
  } catch (err: any) {
    totalTimeMs = Date.now() - startTime;
    return {
      url: targetUrl,
      statusCode: statusCode || 500,
      ttfbMs: ttfbMs || totalTimeMs,
      totalTimeMs,
      htmlLength: 0,
      platform: 'Desconocida',
      hasWhatsApp: false,
      hasAnalytics: false,
      hasMetaPixel: false,
      hasMobileViewport: false,
      hasOgImage: false,
      title: '',
      description: '',
      hasSearch: false,
      hasCartOrCheckout: false,
      hasTrustBadges: false,
      hasFavicon: false,
      hasCustomTypography: false,
      hasModernImages: false,
      hasAggressivePopups: false,
      h1Count: 0,
    };
  }

  const lowerHtml = html.toLowerCase();

  // Platform Detection
  let platform = 'Custom / A Medida';
  if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('myshopify.com') || lowerHtml.includes('shopify.theme')) {
    platform = 'Shopify';
  } else if (lowerHtml.includes('wp-content') || lowerHtml.includes('woocommerce')) {
    platform = 'WooCommerce';
  } else if (lowerHtml.includes('vteximg.com.br') || lowerHtml.includes('vtex.com')) {
    platform = 'VTEX';
  } else if (lowerHtml.includes('tiendanube.com') || lowerHtml.includes('nuvemshop')) {
    platform = 'Tiendanube';
  } else if (lowerHtml.includes('magento') || lowerHtml.includes('mage/cookies')) {
    platform = 'Magento';
  } else if (lowerHtml.includes('prestashop')) {
    platform = 'PrestaShop';
  }

  // Floating WhatsApp detection
  const hasWhatsApp =
    lowerHtml.includes('wa.me/') ||
    lowerHtml.includes('api.whatsapp.com') ||
    lowerHtml.includes('web.whatsapp.com') ||
    lowerHtml.includes('joinchat') ||
    lowerHtml.includes('whatsapp-button');

  // Tracking & Analytics
  const hasAnalytics =
    lowerHtml.includes('gtag(') ||
    lowerHtml.includes('google-analytics.com') ||
    lowerHtml.includes('googletagmanager.com') ||
    lowerHtml.includes('analytics');

  const hasMetaPixel =
    lowerHtml.includes('connect.facebook.net') ||
    lowerHtml.includes('fbevents.js') ||
    lowerHtml.includes('fbq(');

  const hasMobileViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
  const hasOgImage = lowerHtml.includes('property="og:image"') || lowerHtml.includes("property='og:image'");

  // Title extraction
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Phone extraction (International: Colombia, Mexico, Spain, USA, Latam)
  let extractedPhone: string | undefined;
  const waMatch = html.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)(\+?\d{8,15})/i);
  if (waMatch) {
    extractedPhone = waMatch[1].replace(/\D/g, '');
  } else {
    // Colombian format
    const colMatch = html.match(/(?:\+57\s*|57)?(3\d{2}[\s.-]?\d{3}[\s.-]?\d{4})/);
    if (colMatch) {
      extractedPhone = `57${colMatch[1].replace(/\D/g, '')}`;
    } else {
      // General international phone match (+XX ...)
      const intlMatch = html.match(/\+(\d{1,3})[\s.-]?(\d{2,4})[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})/);
      if (intlMatch) {
        extractedPhone = intlMatch[0].replace(/\D/g, '');
      }
    }
  }

  // Email extraction via Deep Multi-Layer Engine (JSON-LD + Cloudflare + Subpages)
  const extractedEmail = await deepScrapeEmail(targetUrl, html);

  // Instagram extraction
  let extractedInstagram: string | undefined;
  const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (igMatch && igMatch[1] && !['p', 'explore', 'reel', 'stories'].includes(igMatch[1])) {
    extractedInstagram = igMatch[1].replace(/\/$/, '');
  }

  // UX Signals
  const hasSearch =
    /<input[^>]*(type=["']search["']|name=["'](q|s|search)["']|placeholder=["'][^"']*(buscar|search)[^"']*)/i.test(html) ||
    /class=["'][^"']*(search-bar|site-search|search-input|header-search)[^"']*/i.test(html);

  const hasCartOrCheckout =
    /(add-to-cart|btn-cart|btn-buy|comprar-ahora|anadir-al-carrito|checkout-btn|cart-icon|mini-cart|view-cart|shopping-cart)/i.test(
      lowerHtml
    ) ||
    lowerHtml.includes('add to cart') ||
    lowerHtml.includes('añadir al carrito') ||
    lowerHtml.includes('agregar al carrito');

  const hasTrustBadges = /(wompi|epayco|payu|mercadopago|stripe|pse|visa|mastercard|pago seguro|compra protegida|ssl|devolucion)/i.test(
    lowerHtml
  );

  // UI Signals
  const hasFavicon = /<link[^>]*rel=["'](icon|shortcut icon|apple-touch-icon)["']/i.test(html);
  const hasCustomTypography =
    lowerHtml.includes('fonts.googleapis.com') ||
    lowerHtml.includes('use.typekit.net') ||
    lowerHtml.includes('@font-face') ||
    lowerHtml.includes('fonts.gstatic.com');

  const hasModernImages =
    lowerHtml.includes('.webp') ||
    lowerHtml.includes('.avif') ||
    lowerHtml.includes('loading="lazy"') ||
    lowerHtml.includes("loading='lazy'");

  const hasAggressivePopups = /(klaviyo|privy|omnisend|wheelio|spin-a-sale|modal-newsletter|popup-newsletter|newsletter-popup)/i.test(
    lowerHtml
  );

  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;

  return {
    url: targetUrl,
    statusCode,
    ttfbMs,
    totalTimeMs,
    htmlLength: html.length,
    platform,
    hasWhatsApp,
    hasAnalytics,
    hasMetaPixel,
    hasMobileViewport,
    hasOgImage,
    title,
    description,
    hasSearch,
    hasCartOrCheckout,
    hasTrustBadges,
    hasFavicon,
    hasCustomTypography,
    hasModernImages,
    hasAggressivePopups,
    h1Count,
    extractedPhone,
    extractedEmail,
    extractedInstagram,
  };
}

export interface DetailedScores {
  techScore: number;
  uxScore: number;
  uiScore: number;
  score: number;
}

export function calculateDetailedScores(m: RawSiteMetrics): DetailedScores {
  // 1. Tech & Performance Score (0-100)
  let tech = 100;
  if (m.totalTimeMs > 4000) tech -= 35;
  else if (m.totalTimeMs > 2500) tech -= 22;
  else if (m.totalTimeMs > 1200) tech -= 10;

  if (m.ttfbMs > 1500) tech -= 25;
  else if (m.ttfbMs > 800) tech -= 15;
  else if (m.ttfbMs > 400) tech -= 5;

  if (!m.hasMobileViewport) tech -= 30;
  if (!m.hasAnalytics) tech -= 10;
  if (!m.hasMetaPixel) tech -= 10;

  const techScore = Math.max(15, Math.min(98, tech));

  // 2. UX & Conversion Friction Score (0-100)
  let ux = 100;
  if (!m.hasMobileViewport) ux -= 35;
  if (!m.hasWhatsApp) ux -= 20; // Falta de canal directo para ventas en caliente
  if (!m.hasCartOrCheckout) ux -= 20; // Dificultad para iniciar la compra
  if (!m.hasSearch) ux -= 10; // Catálogo sin buscador rápido
  if (!m.hasTrustBadges) ux -= 15; // Falta de confianza/sellos de pasarelas
  if (!m.extractedPhone && !m.extractedEmail) ux -= 10; // Negocio difícil de contactar

  const uxScore = Math.max(20, Math.min(98, ux));

  // 3. UI & Visual Hierarchy Score (0-100)
  let ui = 100;
  if (!m.hasFavicon) ui -= 15; // Apariencia amateur en pestañas
  if (!m.hasCustomTypography) ui -= 15; // Fuentes genéricas sin identidad de marca
  if (!m.hasModernImages) ui -= 15; // Imágenes pesadas legacy sin lazy-loading
  if (m.hasAggressivePopups) ui -= 15; // Popups intrusivos en móviles que dañan la experiencia
  if (m.h1Count === 0 || m.h1Count > 3) ui -= 10; // Jerarquía visual y semántica deficiente
  if (!m.hasOgImage) ui -= 10; // Mala previsualización al compartir en WhatsApp / redes

  const uiScore = Math.max(20, Math.min(98, ui));

  // Global weighted score: 35% Tech, 35% UX, 30% UI
  const score = Math.round(techScore * 0.35 + uxScore * 0.35 + uiScore * 0.3);

  return {
    techScore,
    uxScore,
    uiScore,
    score,
  };
}

export function calculateAuditScore(m: RawSiteMetrics): number {
  return calculateDetailedScores(m).score;
}

/**
 * Fetches high-res mobile viewport screenshot and saves it locally to public/screenshots/
 */
export async function fetchSiteScreenshot(targetUrl: string, slug?: string): Promise<string> {
  const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
  const fileBase = slug || crypto.createHash('md5').update(cleanUrl).digest('hex').slice(0, 16);
  const outDir = path.join(process.cwd(), 'public', 'screenshots');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pngPath = path.join(outDir, `${fileBase}.png`);
  const jpgPath = path.join(outDir, `${fileBase}.jpg`);

  if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 2000) {
    return `/screenshots/${fileBase}.png`;
  }
  if (fs.existsSync(jpgPath) && fs.statSync(jpgPath).size > 2000) {
    return `/screenshots/${fileBase}.jpg`;
  }

  // 1. Try Thum.io directly
  try {
    const thumUrl = `https://image.thum.io/get/width/390/crop/844/noanimate/${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(thumUrl, { signal: AbortSignal.timeout(12000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 2000) {
        fs.writeFileSync(pngPath, buffer);
        return `/screenshots/${fileBase}.png`;
      }
    }
  } catch (err) {
    console.warn('[screenshot] Thum.io fetch failed, trying microlink:', err);
  }

  // 2. Try Microlink direct embed
  try {
    const microUrl = `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.isMobile=true&viewport.width=390&viewport.height=844`;
    const res = await fetch(microUrl, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 2000) {
        fs.writeFileSync(pngPath, buffer);
        return `/screenshots/${fileBase}.png`;
      }
    }
  } catch (err) {
    console.warn('[screenshot] Microlink fetch failed:', err);
  }

  return `/api/screenshot?url=${encodeURIComponent(cleanUrl)}`;
}

/**
 * Runs Google Lighthouse Mobile Audit (prioritizing Google Cloud PageSpeed API, falling back to local headless Chrome on VPS).
 */
export async function runGoogleLighthouseAudit(
  targetUrl: string,
  slug?: string
): Promise<{ lighthouse: LighthouseMetrics; screenshotUrl?: string } | null> {
  const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
  const fileBase = slug || crypto.createHash('md5').update(cleanUrl).digest('hex').slice(0, 16);
  const outDir = path.join(process.cwd(), 'public', 'screenshots');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Prioritize Google Cloud PageSpeed Insights API (if configured)
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        cleanUrl
      )}&strategy=mobile&key=${apiKey}`;
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(35000) });
      if (res.ok) {
        const data = await res.json();
        const lh = data?.lighthouseResult;
        if (lh?.categories?.performance) {
          const perfScore = Math.round((lh.categories.performance.score || 0) * 100);
          const audits = lh.audits || {};
          let screenshotUrl: string | undefined;

          const base64Screenshot = audits['final-screenshot']?.details?.data;
          if (base64Screenshot) {
            try {
              const base64Clean = base64Screenshot.replace(/^data:image\/\w+;base64,/, '');
              const jpgPath = path.join(outDir, `${fileBase}.jpg`);
              const pngPath = path.join(outDir, `${fileBase}.png`);
              fs.writeFileSync(jpgPath, base64Clean, 'base64');
              fs.writeFileSync(pngPath, base64Clean, 'base64');
              screenshotUrl = `/screenshots/${fileBase}.png`;
            } catch (err) {
              console.warn('[lighthouse] Error writing screenshot from PageSpeed API:', err);
            }
          }

          return {
            lighthouse: {
              performanceScore: perfScore,
              fcp: audits['first-contentful-paint']?.displayValue,
              fcpMs: audits['first-contentful-paint']?.numericValue,
              lcp: audits['largest-contentful-paint']?.displayValue,
              lcpMs: audits['largest-contentful-paint']?.numericValue,
              tbt: audits['total-blocking-time']?.displayValue,
              tbtMs: audits['total-blocking-time']?.numericValue,
              cls: audits['cumulative-layout-shift']?.displayValue,
              clsVal: audits['cumulative-layout-shift']?.numericValue,
              speedIndex: audits['speed-index']?.displayValue,
              speedIndexMs: audits['speed-index']?.numericValue,
              testedAt: new Date().toISOString(),
              engine: 'pagespeed-api',
            },
            screenshotUrl,
          };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn(
          '[lighthouse] PageSpeed Insights API call rejected by Google Cloud:',
          errJson?.error?.message || res.status
        );
      }
    } catch (err) {
      console.warn('[lighthouse] PageSpeed Insights API call failed, falling back to local Lighthouse:', err);
    }
  }

  // 2. Fallback: Local Google Lighthouse Engine with headless Chrome
  if (fs.existsSync(/*turbopackIgnore: true*/ CHROME_PATH)) {
    const tmpJson = path.join('/tmp', `lh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.json`);
    try {
      await execFileAsync(
        'npx',
        [
          'lighthouse',
          cleanUrl,
          '--output=json',
          `--output-path=${tmpJson}`,
          '--only-categories=performance',
          '--form-factor=mobile',
          '--screenEmulation.mobile=true',
          '--screenEmulation.width=390',
          '--screenEmulation.height=844',
          '--screenEmulation.deviceScaleFactor=3',
          '--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage',
          '--max-wait-for-load=25000',
        ],
        {
          env: {
            ...process.env,
            CHROME_PATH,
          },
          timeout: 50000,
        }
      );

      if (fs.existsSync(tmpJson)) {
        const content = fs.readFileSync(tmpJson, 'utf-8');
        const lh = JSON.parse(content);
        const audits = lh.audits || {};
        const perfScore = Math.round((lh.categories?.performance?.score || 0) * 100);
        let screenshotUrl: string | undefined;

        const base64Screenshot = audits['final-screenshot']?.details?.data;
        if (base64Screenshot) {
          try {
            const base64Clean = base64Screenshot.replace(/^data:image\/\w+;base64,/, '');
            const jpgPath = path.join(outDir, `${fileBase}.jpg`);
            const pngPath = path.join(outDir, `${fileBase}.png`);
            fs.writeFileSync(jpgPath, base64Clean, 'base64');
            fs.writeFileSync(pngPath, base64Clean, 'base64');
            screenshotUrl = `/screenshots/${fileBase}.png`;
          } catch (err) {
            console.warn('[lighthouse] Error writing screenshot from local Lighthouse:', err);
          }
        }

        return {
          lighthouse: {
            performanceScore: perfScore,
            fcp: audits['first-contentful-paint']?.displayValue,
            fcpMs: audits['first-contentful-paint']?.numericValue,
            lcp: audits['largest-contentful-paint']?.displayValue,
            lcpMs: audits['largest-contentful-paint']?.numericValue,
            tbt: audits['total-blocking-time']?.displayValue,
            tbtMs: audits['total-blocking-time']?.numericValue,
            cls: audits['cumulative-layout-shift']?.displayValue,
            clsVal: audits['cumulative-layout-shift']?.numericValue,
            speedIndex: audits['speed-index']?.displayValue,
            speedIndexMs: audits['speed-index']?.numericValue,
            testedAt: new Date().toISOString(),
            engine: 'lighthouse',
          },
          screenshotUrl,
        };
      }
    } catch (err) {
      console.warn('[lighthouse] Local Lighthouse execution failed:', err);
    } finally {
      if (fs.existsSync(tmpJson)) {
        try {
          fs.unlinkSync(tmpJson);
        } catch {}
      }
    }
  }

  return null;
}

/**
 * Detects target market language (es, en, pt) from country name
 */
export function detectLanguageFromCountry(country?: string): 'es' | 'en' | 'pt' {
  if (!country) return 'es';
  const c = country.trim().toLowerCase();

  if (c.includes('brasil') || c.includes('brazil') || c.includes('portugal')) {
    return 'pt';
  }

  if (
    c.includes('estados unidos') ||
    c.includes('united states') ||
    c.includes('usa') ||
    c.includes('u.s.') ||
    c.includes('canad') ||
    c.includes('reino unido') ||
    c.includes('united kingdom') ||
    c.includes('uk') ||
    c.includes('australia') ||
    c.includes('nueva zelanda') ||
    c.includes('new zealand') ||
    c.includes('irlanda') ||
    c.includes('ireland') ||
    c.includes('singapur') ||
    c.includes('singapore')
  ) {
    return 'en';
  }

  return 'es';
}

/**
 * Generates an intelligent, domain-tailored AI Business Automation Proposal
 * for the audited prospect in their native language (ES, EN, PT).
 */
export function generateDefaultAiAutomationProposal(params: {
  businessName: string;
  category: string;
  platform: string;
  hasWhatsApp?: boolean;
  lang?: 'es' | 'en' | 'pt';
}): AiAutomationProposal {
  const cat = (params.category || '').toLowerCase();
  const lang = params.lang || 'es';

  const isFashion =
    cat.includes('moda') ||
    cat.includes('ropa') ||
    cat.includes('lino') ||
    cat.includes('calzado') ||
    cat.includes('zapato') ||
    cat.includes('prendas') ||
    cat.includes('vestir');

  const isJewelry =
    cat.includes('joya') ||
    cat.includes('reloj') ||
    cat.includes('accesorio') ||
    cat.includes('oro') ||
    cat.includes('plata');

  const isHealth =
    cat.includes('salud') ||
    cat.includes('clinica') ||
    cat.includes('médic') ||
    cat.includes('medic') ||
    cat.includes('dental') ||
    cat.includes('odontolog') ||
    cat.includes('estetica') ||
    cat.includes('estética');

  // ── ENGLISH PROPOSALS ──
  if (lang === 'en') {
    if (isHealth) {
      return {
        headline: `Operations & Patient Scheduling AI Automation Plan for ${params.businessName}`,
        summary: `Automated ecosystem for clinics and healthcare providers, designed to eliminate manual spreadsheet booking, qualify patient inquiries 24/7 on WhatsApp/Web, and eradicate appointment no-shows.`,
        operationalSavingsEstimate:
          'Projected savings: ~25 weekly staff hours on reception and 40% reduction in missed or cancelled appointments.',
        modules: [
          {
            title: '24/7 AI Triage & Appointment Booking Agent',
            description: `Handles patient inquiries around the clock, checks specialist availability in real-time, answers pricing and treatment FAQs, and books appointments directly.`,
            impact: 'Instant 24/7 patient intake without burdening front-desk staff',
            techStack: 'Claude / GPT-4o + WhatsApp Business API + n8n',
          },
          {
            title: 'Replacing Spreadsheet Schedules with Centralized Database',
            description: `Two-way automated sync between doctor calendars, patient records, and deposit verifications without loose Excel sheets.`,
            impact: 'Zero schedule collisions and unified administrative visibility',
            techStack: 'n8n + PostgreSQL / Airtable + Google Calendar',
          },
          {
            title: 'Automated Smart Reminders & No-Show Prevention',
            description: `Sends interactive confirmation buttons 24h and 2h prior to consultations. If cancelled, the AI instantly offers the slot to waitlist patients.`,
            impact: 'Cuts clinic no-shows from 35% down to under 8%',
            techStack: 'n8n + WhatsApp / SMS + Webhooks',
          },
        ],
      };
    }

    return {
      headline: `Process Automation, Projects & Excel Replacement Plan for ${params.businessName}`,
      summary: `Automated workflow architecture with n8n and AI agents engineered to centralize client data, eliminate spreadsheet chaos, and generate formal PDF proposals automatically.`,
      operationalSavingsEstimate:
        'Projected savings: ~20 to 30 weekly hours on manual administrative tasks and lead response in <60 seconds.',
      modules: [
        {
          title: 'Migrating Excel Chaos to Centralized Database & CRM',
          description: `Centralizing leads, quotes, and project deliverables scattered across spreadsheets into a unified, secure database. Inbound inquiries are logged automatically without manual typing.`,
          impact: 'Zero lost records, consistent data accessible in one place',
          techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
        },
        {
          title: 'Automated Quote & PDF Proposal Generation',
          description: `Eliminate hours calculating estimates in Excel. An automated n8n workflow processes client requirements, calculates pricing, generates a formal branded PDF quote, and delivers it via WhatsApp or email instantly.`,
          impact: 'Proposals delivered in minutes (10× faster) with higher closing rates',
          techStack: 'n8n + Dynamic PDF Generator + WhatsApp / Email',
        },
        {
          title: '24/7 AI Agent for Lead Qualification & Calendar Booking',
          description: `An intelligent WhatsApp & web assistant answering leads around the clock, qualifying project scope, answering FAQs, and booking meetings directly on your team's Google Calendar.`,
          impact: 'Automated screening and qualified appointments with zero manual effort',
          techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
        },
        {
          title: 'Project Operations Monitoring & Smart Alerts',
          description: `Automated tracking of milestones, deliverables, and receivables. Leadership receives instant Telegram/WhatsApp alerts when tasks are delayed or completed, without spreadsheet micromanagement.`,
          impact: 'Total operational control without managing manual spreadsheets',
          techStack: 'n8n + Telegram / WhatsApp Bot + State Triggers',
        },
      ],
    };
  }

  // ── PORTUGUESE PROPOSALS ──
  if (lang === 'pt') {
    return {
      headline: `Plano de Automação de Processos, Projetos e Substituição de Planilhas para ${params.businessName}`,
      summary: `Arquitetura de processos com n8n e agentes de IA para centralizar clientes, eliminar o caos das planilhas de Excel e automatizar orçamentos em PDF sem aumentar a folha de pagamento.`,
      operationalSavingsEstimate:
        'Economia estimada: ~20 a 30 horas semanais em tarefas manuais e atendimento a novos clientes em <60 segundos.',
      modules: [
        {
          title: 'Migração de Planilhas para Banco de Dados & CRM Automatizado',
          description: `Centralização de clientes, orçamentos e status de projetos dispersos em planilhas de Excel em um sistema seguro e unificado. Novos contatos via WhatsApp ou web são registrados em tempo real sem digitação manual.`,
          impact: 'Zero dados perdidos e informação centralizada em um só lugar',
          techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
        },
        {
          title: 'Geração Automatizada de Orçamentos e Propostas em PDF',
          description: `Elimine horas gastas calculando preços manualmente em planilhas. O fluxo n8n processa o pedido, gera o PDF formal com a marca da empresa e envia via WhatsApp ou e-mail na hora.`,
          impact: 'Orçamentos entregues em minutos (10× mais rápido) com maior conversão',
          techStack: 'n8n + Gerador Dinâmico de PDF + WhatsApp / E-mail',
        },
        {
          title: 'Agente de IA para Qualificação de Clientes e Agendamento 24/7',
          description: `Assistente inteligente no WhatsApp que atende potenciais clientes 24h por dia, tira dúvidas sobre os serviços, valida o perfil do cliente e agenda reuniões diretamente no Google Calendar.`,
          impact: 'Filtro automático de clientes e reuniões agendadas sem atrito',
          techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
        },
        {
          title: 'Monitoramento Operacional de Projetos & Alertas Inteligentes',
          description: `Acompanhamento automático de prazos e etapas de entrega. A diretoria recebe notificações no WhatsApp ou Telegram quando um marco é concluído ou atrasado, sem depender de planilhas manuais.`,
          impact: 'Controle operacional completo sem microgestão de planilhas',
          techStack: 'n8n + Bot WhatsApp / Telegram + Gatilhos de Status',
        },
      ],
    };
  }

  // ── SPANISH PROPOSALS (DEFAULT) ──

  if (isHealth) {
    return {
      headline: `Plan de Automatización Operativa & Gestión de Pacientes para ${params.businessName}`,
      summary: `Ecosistema de automatización para centros de salud y clínicas, enfocado en eliminar agendas manuales en Excel, agendar citas 24/7 por WhatsApp y confirmar automáticamente para erradicar el ausentismo.`,
      operationalSavingsEstimate:
        'Ahorro proyectado: ~25 horas semanales en recepción y reducción del 40% en citas canceladas o inasistencias.',
      modules: [
        {
          title: 'Agente de IA para Agendamiento & Triaje en WhatsApp (24/7)',
          description: `Atiende pacientes a cualquier hora, consulta disponibilidad de especialistas en tiempo real, responde dudas frecuentes sobre tratamientos y agenda la cita de inmediato.`,
          impact: 'Atención instantánea 24/7 sin saturar al personal de recepción',
          techStack: 'Claude / GPT-4o + WhatsApp Business API + n8n',
        },
        {
          title: 'Reemplazo de Agendas en Excel por Base de Datos Centralizada',
          description: `Sincronización bidireccional entre la agenda de doctores, recordatorios automáticos al paciente y control de pagos sin depender de planillas de cálculo sueltas.`,
          impact: 'Cero cruces de horarios y control administrativo unificado',
          techStack: 'n8n + PostgreSQL / Airtable + Google Calendar',
        },
        {
          title: 'Confirmación Inteligente de Citas & Anti-Inasistencia',
          description: `Dispara mensajes con botones interactivos 24h y 2h antes de la consulta. Si el paciente cancela, la IA ofrece inmediatamente el cupo a la lista de espera.`,
          impact: 'Reducción del ausentismo del 35% al 8%',
          techStack: 'n8n + WhatsApp + Webhooks',
        },
      ],
    };
  }

  if (isFashion) {
    return {
      headline: `Plan de Automatización Operativa & Agentes de IA para ${params.businessName}`,
      summary: `Estrategia de automatización integral para moda y calzado, enfocada en resolver dudas de tallas/calce en caliente por WhatsApp, organizar pedidos fuera de Excel y recuperar compras abandonadas.`,
      operationalSavingsEstimate:
        'Ahorro proyectado: ~25 horas semanales en atención repetitiva y hasta un +24% en ventas nocturnas y de fin de semana.',
      modules: [
        {
          title: 'Agente de IA Asesor de Tallas & Estilo en WhatsApp (24/7)',
          description: `Entrenado con el catálogo de ${params.businessName}. Orienta a clientes indecisos sobre hormas, calce, tipo de tela y ocasiones de uso, entregando un enlace de checkout pre-llenado para cerrar compras de inmediato.`,
          impact: '+24% ventas fuera de horario y -40% devoluciones por talla errada',
          techStack: 'Claude / GPT-4o Mini + Evolution API (WhatsApp) + n8n',
        },
        {
          title: 'Reemplazo de Control en Excel por Base de Datos de Pedidos',
          description: `Sincronización en tiempo real de ventas, pagos y stock entre canales digitales y físicos sin necesidad de registrar datos manualmente en hojas de cálculo.`,
          impact: 'Inventario sincronizado y despacho de pedidos 3× más rápido',
          techStack: 'n8n + Base de Datos Centralizada + Webhooks',
        },
        {
          title: 'Recuperador Conversacional de Carritos & Pedidos Incompletos',
          description: `Detecta pedidos caídos en ${params.platform || 'la tienda'} y dispara un mensaje natural y empático por WhatsApp a los 30 minutos, resolviendo objeciones de costo de envío o pasarela de pago.`,
          impact: 'Recuperación de 18% a 28% de pedidos abandonados',
          techStack: 'Webhooks de Checkout + n8n + IA Conversacional',
        },
        {
          title: 'Sincronización Logística & Rastreo de Envíos en Tiempo Real',
          description: `Respuestas instantáneas y automáticas cuando el cliente pregunta "¿dónde está mi pedido?". Consulta directa con la transportadora y envío de guía con foto del paquete sin intervención manual.`,
          impact: 'Reducción del 75% en tickets de soporte post-venta',
          techStack: 'API Transportadoras (Coordinadora / Envía / Servientrega) + n8n',
        },
      ],
    };
  }

  if (isJewelry) {
    return {
      headline: `Arquitectura de Agentes con IA & Automatización Exclusiva para ${params.businessName}`,
      summary: `Ecosistema de automatización para joyería y artículos de alta gama, enfocado en asesoría de regalos de alto valor, agendamiento de citas privadas y seguimiento VIP de cotizaciones.`,
      operationalSavingsEstimate:
        'Ahorro proyectado: ~20 horas semanales en seguimiento de prospectos y +30% de citas VIP agendadas.',
      modules: [
        {
          title: 'Concierge Virtual de Lujo & Regalos en WhatsApp (24/7)',
          description: `Identifica ocasión (compromiso, aniversario, cumpleaños) y rango de presupuesto para sugerir piezas ideales con fotos y videos en alta resolución, guiando al cliente con un trato de alta joyería.`,
          impact: 'Atención personalizada inmediata a clientes de alto ticket',
          techStack: 'Claude 3.5 Sonnet / GPT-4o + Evolution API + n8n',
        },
        {
          title: 'Agendador Autónomo de Citas en Boutique / Google Meet',
          description: `Permite a clientes reservar sesiones privadas de asesoría presencial o virtual sincronizándose directamente con el calendario de la boutique y enviando recordatorios automáticos anti-inasistencia.`,
          impact: 'Aumento del 35% en conversión de cotizaciones de alto valor',
          techStack: 'Google Calendar API + n8n + WhatsApp',
        },
        {
          title: 'Seguimiento Inteligente de Cotizaciones & Fichas Técnicas',
          description: `Monitorea prospectos que consultaron por piezas especiales y reactiva la conversación de forma personalizada con propuestas de valor y facilidades de pago seguras.`,
          impact: 'Recuperación de hasta 3 de cada 10 cotizaciones pausadas',
          techStack: 'CRM Automation + n8n + Webhooks',
        },
      ],
    };
  }

  // DEFAULT / GENERAL BUSINESS, SERVICES, B2B, CONTRACTORS & COMPANIES:
  // FOCUSED ON ORGANIZING PROJECTS, ELIMINATING MESSY EXCEL SPREADSHEETS AND AUTOMATING WITH AI & n8n!
  return {
    headline: `Plan de Automatización Operativa, Proyectos & Reemplazo de Excels para ${params.businessName}`,
    summary: `Arquitectura de procesos automatizados con n8n y agentes de IA diseñada para centralizar clientes y proyectos, eliminar el desorden de hojas de cálculo de Excel y automatizar cotizaciones y seguimiento sin sumar nómina.`,
    operationalSavingsEstimate:
      'Ahorro proyectado: ~20 a 30 horas semanales en tareas administrativas manuales y atención a clientes potenciales en <60 segundos.',
    modules: [
      {
        title: 'Migración del Caos de Excel a Base de Datos & CRM Automatizado',
        description: `Centralización de clientes, cotizaciones y estados de proyectos dispersos en múltiples archivos de Excel en un sistema unificado y seguro. Cada nuevo contacto por web, WhatsApp o correo se clasifica y actualiza en tiempo real sin digitación manual.`,
        impact: 'Cero datos perdidos, información consistente y accesible en un solo lugar',
        techStack: 'n8n + PostgreSQL / Airtable + Webhooks',
      },
      {
        title: 'Generación Automatizada de Cotizaciones & Propuestas en PDF',
        description: `Elimina las horas invertidas en calcular presupuestos manualmente en Excel. Un flujo en n8n procesa los requerimientos del cliente, calcula los valores, genera el documento PDF formal con la marca de ${params.businessName} y lo envía por WhatsApp o email al instante.`,
        impact: 'Cotizaciones entregadas en minutos (10× más rápido) con mayor tasa de cierre',
        techStack: 'n8n + Generador Dinámico de PDF + WhatsApp / Correo',
      },
      {
        title: 'Agente de IA para Calificación de Prospectos & Agendamiento (24/7)',
        description: `Asistente inteligente en WhatsApp que atiende clientes potenciales las 24 horas, recopila el alcance del proyecto o servicio solicitado, valida si cumple con el perfil ideal del negocio y agenda directamente en el calendario del equipo.`,
        impact: 'Filtro automático de prospectos y reuniones calificadas sin fricción',
        techStack: 'Claude / GPT-4o + WhatsApp Business API + Google Calendar',
      },
      {
        title: 'Control Operativo de Proyectos & Alertas Inteligentes',
        description: `Monitoreo del avance de tareas, fechas de entrega y cuentas por cobrar. La gerencia y el equipo reciben notificaciones automáticas por Telegram o WhatsApp cuando una tarea se atrasa o un hito se cumple, sin tener que revisar hojas de cálculo.`,
        impact: 'Supervisión total de la operación sin microgestión en hojas de cálculo',
        techStack: 'n8n + Bot de Telegram / WhatsApp + Triggers de Estado',
      },
    ],
  };
}

/**
 * Runs Gemini Flash to synthesize technical, UX and UI findings into consultative pitch messages
 */
export async function generateConsultativePitch({
  businessName,
  country = 'Colombia',
  city,
  category,
  metrics,
  scores,
  auditSlug,
}: {
  businessName: string;
  country?: string;
  city: string;
  category: string;
  metrics: RawSiteMetrics;
  scores: DetailedScores;
  auditSlug?: string;
}): Promise<{
  auditHighlights: string[];
  uxFindings: string[];
  uiFindings: string[];
  suggestedImprovement: string;
  pitch: ProspectPitch;
}> {
  const loadSec = (metrics.totalTimeMs / 1000).toFixed(1);
  const ttfbSec = (metrics.ttfbMs / 1000).toFixed(2);
  const auditUrl = auditSlug
    ? `https://andresmorales.com.co/audit/${auditSlug}`
    : 'https://andresmorales.com.co';

  const targetLang = detectLanguageFromCountry(country);
  const langInstruction =
    targetLang === 'en'
      ? 'CRITICAL REQUIREMENT: The prospect business is located in an English-speaking country. You MUST write ALL output strings (auditHighlights, uxFindings, uiFindings, suggestedImprovement, whatsappMessage, whatsappUxUi, voiceScript, emailSubject, emailBody) in fluent, natural AMERICAN ENGLISH.'
      : targetLang === 'pt'
      ? 'CRITICAL REQUIREMENT: The prospect business is located in Brazil/Portugal. You MUST write ALL output strings (auditHighlights, uxFindings, uiFindings, suggestedImprovement, whatsappMessage, whatsappUxUi, voiceScript, emailSubject, emailBody) in fluent, natural BRAZILIAN PORTUGUESE.'
      : 'CRITICAL REQUIREMENT: Write ALL output strings in fluent, natural LATIN AMERICAN SPANISH.';

  const prompt = `Eres el asistente de prospección técnica, diseño UX/UI y consultoría de procesos de Andrés Morales (Senior Full Stack & AI Automation Engineer, https://andresmorales.com.co).
Tu objetivo es analizar los datos técnicos, de UX (experiencia) y de UI de una empresa y generar:

${langInstruction}

1. "auditHighlights": Arreglo de 3 hallazgos técnicos y de velocidad breves y comprensibles (ej: tiempo de carga, TTFB, tracking).
2. "uxFindings": Arreglo de 2 hallazgos concretos de UX/Conversión móvil (ej: ausencia de WhatsApp flotante para atención en caliente, falta de buscador interno, pasarelas de pago o fricción en el formulario/checkout).
3. "uiFindings": Arreglo de 2 hallazgos concretos de UI/Diseño Visual (ej: tipografía genérica sin jerarquía, falta de favicon o imágenes optimizadas WebP, popups intrusivos en pantallas pequeñas).
4. "suggestedImprovement": Recomendación estratégica de alto impacto para elevar la conversión.
5. "whatsappMessage": Mensaje corto de WhatsApp (máximo 3 a 4 líneas) de Andrés Morales para el tomador de decisiones.
   - Línea 1: Saludo cordial personalizado + mención directa de su web (${metrics.url}) y observación sobre velocidad móvil o captura de prospectos.
   - Línea 2: Explica que preparó un dictamen confidencial con capturas y una propuesta para automatizar consultas, cotizaciones y proyectos sin depender de Excels manuales.
   - Línea 3: Enlace directo al reporte interactivo privado: ${auditUrl}
   - Línea 4: Cierre suave y sin presión (ej: "Me cuentan si les hace sentido revisarlo").
   - CERO PRECIOS, cero enlaces a calendarios fríos.
6. "whatsappUxUi": Mensaje alternativo de WhatsApp enfocado en experiencia móvil y automatización de atención.
   - Línea 1: Observación sobre la experiencia de navegación en celular y facilidad de contacto.
   - Línea 2: Mención de la auditoría con capturas de pantalla y el plan de automatización con IA.
   - Línea 3: Enlace directo: ${auditUrl}
   - CERO PRECIOS.
7. "voiceScript": Guion para nota de voz de 20 segundos que Andrés grabará con su propia voz en WhatsApp.
   - Máximo 3 oraciones sencillas y habladas, tono humano, profesional y cero robótico.
8. "emailSubject": Asunto de correo persuasivo y profesional (máx 8 palabras).
9. "emailBody": Correo de consultoría estratégica de alto valor redactado por Andrés Morales (Senior Full Stack & AI Automation Engineer) invitando a revisar su reporte privado interactivo en ${auditUrl}.
   - Destaca los cuellos de botella detectados (velocidad ${loadSec}s, estado de pasarelas, fricción móvil).
   - Explica el impacto en ventas y ofrece una sesión de diagnóstico de 20 min en ${CALENDAR_URL} si desean implementarlo.
   - Tono consultivo y empático, CERO PRECIOS numéricos, firma profesional de Andrés Morales.
   - Automatización de Procesos Internos: Explica cómo automatizar cotizaciones y gestión de clientes sin Excels.
   - Cierre consultivo sin precios.

DATOS DEL NEGOCIO:
• Nombre: ${businessName}
• País: ${country}
• Ciudad: ${city}
• Categoría: ${category}
• URL: ${metrics.url}
• Plataforma: ${metrics.platform}
• Velocidad total: ${loadSec}s (TTFB: ${ttfbSec}s)
• Botón flotante WhatsApp: ${metrics.hasWhatsApp ? 'Sí tiene' : 'NO TIENE (Fuga de clientes con dudas)'}
• Meta Pixel (Ads): ${metrics.hasMetaPixel ? 'Sí tiene' : 'No detectado (Pérdida de data)'}
• Buscador interno: ${metrics.hasSearch ? 'Sí' : 'No evidente'}
• Carrito / Checkout rápido: ${metrics.hasCartOrCheckout ? 'Sí' : 'Difícil de ubicar en home'}
• Sellos de pago / Confianza: ${metrics.hasTrustBadges ? 'Sí' : 'No detectados'}
• Tipografía de marca personalizada: ${metrics.hasCustomTypography ? 'Sí' : 'Tipografía de sistema genérica'}
• Formatos de imagen modernos (WebP/Lazy): ${metrics.hasModernImages ? 'Sí' : 'Formatos pesados legacy'}
• Popups intrusivos en móvil: ${metrics.hasAggressivePopups ? 'Detectados (posible fricción de navegación)' : 'No'}
• Puntaje Global: ${scores.score}/100 (Técnico: ${scores.techScore}, UX: ${scores.uxScore}, UI: ${scores.uiScore})

RESPONDE ESTRICTAMENTE con un objeto JSON válido con los campos:
{
  "auditHighlights": ["punto 1", "punto 2", "punto 3"],
  "uxFindings": ["ux 1", "ux 2"],
  "uiFindings": ["ui 1", "ui 2"],
  "suggestedImprovement": "texto sugerencia",
  "whatsappMessage": "texto para whatsapp técnico",
  "whatsappUxUi": "texto para whatsapp ux/ui",
  "voiceScript": "guion de 20s para nota de voz",
  "emailSubject": "asunto de correo",
  "emailBody": "cuerpo de correo"
}`;

  try {
    const { stdout } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--disable-slash-commands', '--model', 'gemini-3.8-flash-low', '-p', prompt],
      {
        timeout: 45000,
        cwd: '/tmp',
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    const match = stdout.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.auditHighlights && parsed.whatsappMessage) {
        return {
          auditHighlights: parsed.auditHighlights,
          uxFindings: Array.isArray(parsed.uxFindings) && parsed.uxFindings.length > 0
            ? parsed.uxFindings
            : [
                metrics.hasWhatsApp ? 'Canal directo de WhatsApp activo' : 'Falta botón de WhatsApp directo para cierre en caliente',
                metrics.hasCartOrCheckout ? 'Flujo de compra visible' : 'Proceso de inicio de compra poco claro en primer scroll',
              ],
          uiFindings: Array.isArray(parsed.uiFindings) && parsed.uiFindings.length > 0
            ? parsed.uiFindings
            : [
                metrics.hasCustomTypography ? 'Identidad tipográfica consistente' : 'Tipografía web estándar que no proyecta marca de lujo',
                metrics.hasModernImages ? 'Imágenes optimizadas para carga' : 'Oportunidad de modernizar assets visuales a formato WebP',
              ],
          suggestedImprovement: parsed.suggestedImprovement || 'Optimización integral de rendimiento, rediseño de checkout móvil y aumento de conversión.',
          pitch: {
            whatsapp: parsed.whatsappMessage.trim(),
            whatsappUxUi: parsed.whatsappUxUi?.trim() || parsed.whatsappMessage.trim(),
            voiceScript: parsed.voiceScript?.trim(),
            emailSubject: parsed.emailSubject?.trim() || `Diagnóstico de conversión y UX | ${businessName}`,
            emailBody: parsed.emailBody?.trim() || parsed.whatsappMessage.trim(),
          },
        };
      }
    }
  } catch (err) {
    console.error('[prospect-auditor] Error calling agy for pitch:', err);
  }

  // Multilingual deterministic fallbacks
  const googlePageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(metrics.url)}`;
  let waTech = '';
  let waUxUi = '';
  let voiceScript = '';
  let emailSubject = '';
  let emailBody = '';

  if (targetLang === 'en') {
    waTech = `Hi team at ${businessName} 👋 Andrés Morales here (Senior Full Stack & AI Process Automation Consultant).\n\nI was reviewing ${metrics.url} and noticed a couple of key friction points in mobile speed and lead capture.\n\nI put together a private confidential audit with an AI automation proposal:\n👉 ${auditUrl}\n\nYou can also verify the official Google Cloud speed metrics live here:\n👉 ${googlePageSpeedUrl}\n\nLet me know if it makes sense to review together.`;
    waUxUi = `Hi team at ${businessName} 👋 Andrés Morales here. I was analyzing the mobile UX and lead capture on ${metrics.url}.\n\nI prepared a private report and an AI roadmap to automate client qualification and instant PDF quote generation:\n👉 ${auditUrl}\n\nDirect Google PageSpeed test:\n👉 ${googlePageSpeedUrl}\n\nHappy to share more insights if you'd like to check it out.`;
    voiceScript = `Hi team at ${businessName}, Andrés Morales here. I took a quick look at ${metrics.url} and put together a private diagnostic on your mobile speed and an AI roadmap to automate client quotes without relying on messy spreadsheets. I'm dropping the private link and the official Google PageSpeed test here in case you and the team want to check it out.`;
    emailSubject = `Technical Diagnostic & Process Automation | ${businessName}`;
    emailBody = `Hi ${businessName} team,\n\nMy name is Andrés Morales, Senior Full Stack & AI Automation Engineer. I took a look at ${metrics.url} and prepared a private audit report with real screenshots:\n👉 Private Audit & AI Roadmap: ${auditUrl}\n👉 Official Google PageSpeed Test: ${googlePageSpeedUrl}\n\nBeyond front-end mobile speed, the highest ROI for your business lies in replacing spreadsheet friction with automated workflows (24/7 lead qualification, automated PDF quoting, and syncing orders/projects).\n\nFeel free to pick a convenient 20-min slot on my calendar if you'd like to discuss: ${CALENDAR_URL}\n\nBest regards,\nAndrés Morales\nhttps://andresmorales.com.co`;
  } else if (targetLang === 'pt') {
    waTech = `Olá equipe da ${businessName} 👋 Aqui é o Andrés Morales (consultor de arquitetura web e automação com IA).\n\nEstive analisando o site ${metrics.url} e notei pontos importantes na velocidade mobile e na gestão de orçamentos e projetos.\n\nPreparei um parecer técnico confidencial com proposta de automação:\n👉 ${auditUrl}\n\nTambém podem conferir o teste oficial do Google PageSpeed aqui:\n👉 ${googlePageSpeedUrl}\n\nFico à disposição se fizer sentido revisarmos juntos.`;
    waUxUi = `Olá equipe da ${businessName} 👋 Andrés Morales aqui. Estive avaliando a experiência de navegação mobile em ${metrics.url}.\n\nPreparei um relatório privado e um plano com IA para atendimento no WhatsApp e geração de orçamentos em PDF:\n👉 ${auditUrl}\n\nComprovação oficial no Google:\n👉 ${googlePageSpeedUrl}\n\nQualquer dúvida estou por aqui!`;
    voiceScript = `Olá pessoal da ${businessName}, aqui é o Andrés Morales. Dei uma olhada rápida no site de vocês e montei um diagnóstico confidencial sobre a performance mobile e como automatizar a entrega de orçamentos para eliminar o retrabalho em planilhas. Deixei o link privado e o teste do Google aqui para vocês darem uma olhada.`;
    emailSubject = `Diagnóstico técnico & automação de processos | ${businessName}`;
    emailBody = `Olá equipe da ${businessName},\n\nSou o Andrés Morales, consultor em automação de processos empresariais com IA. Preparei um relatório confidencial analisando a performance do ${metrics.url}:\n👉 Parecer e Proposta de Automação: ${auditUrl}\n👉 Teste Oficial Google PageSpeed: ${googlePageSpeedUrl}\n\nAlém da velocidade web, o maior ganho de eficiência está em automatizar a qualificação de clientes no WhatsApp e a geração de orçamentos em PDF sem planilhas soltas de Excel.\n\nFico à disposição para uma conversa de 20 minutos: ${CALENDAR_URL}\n\nAtenciosamente,\nAndrés Morales\nhttps://andresmorales.com.co`;
  } else {
    waTech = `Hola equipo de ${businessName} 👋 Andrés Morales por aquí (consultor de arquitectura web y automatización de procesos).\n\nEstuve revisando ${metrics.url} y noté un par de puntos clave en la velocidad móvil y en cómo gestionan las cotizaciones y consultas.\n\nLes preparé un dictamen técnico privado con propuesta para automatizar cotizaciones y proyectos sin depender de Excels manuales:\n👉 ${auditUrl}\n\nTambién pueden corroborar la medición oficial de Google en vivo aquí:\n👉 ${googlePageSpeedUrl}\n\nMe cuentan si les hace sentido revisarlo.`;
    waUxUi = `Hola equipo de ${businessName} 👋 Andrés Morales por aquí. Estuve analizando la experiencia móvil de ${metrics.url}.\n\nLes preparé un informe privado con capturas y un plan para automatizar la atención en WhatsApp y la generación de cotizaciones en PDF sin tareas manuales:\n👉 ${auditUrl}\n\nComprobación oficial en Google Cloud:\n👉 ${googlePageSpeedUrl}\n\nQuedo a su disposición si desean comentarlo.`;
    voiceScript = `Hola equipo de ${businessName}, les habla Andrés Morales. Estuve revisando su sitio web y les preparé un dictamen técnico confidencial sobre la velocidad móvil y una propuesta para automatizar cotizaciones y proyectos sin depender de Excels manuales. Les comparto el enlace privado y el test de Google PageSpeed por aquí por si quieren revisarlo con el equipo.`;
    emailSubject = `Diagnóstico e-commerce & automatización de procesos | ${businessName}`;
    emailBody = `Hola equipo de ${businessName},\n\nEspero que se encuentren muy bien. Mi nombre es Andrés Morales, Senior Full Stack & AI Automation Engineer especializado en arquitectura web y automatización de operaciones empresariales en ${country}.\n\nEstuve analizando su sitio ${metrics.url} y preparé un dictamen técnico confidencial con propuesta de automatización:\n👉 Dictamen privado: ${auditUrl}\n👉 Comprobación oficial en Google PageSpeed: ${googlePageSpeedUrl}\n\nEl mayor salto de rentabilidad para empresas como la suya está en conectar y automatizar sus operaciones internas (agentes de atención 24/7 en WhatsApp, generación instantánea de cotizaciones en PDF y eliminación de hojas de Excel desorganizadas).\n\nSi desean comentarlo en una sesión de 20 minutos sin costo, pueden elegir el espacio en mi calendario: ${CALENDAR_URL}\n\nSaludos cordiales,\nAndrés Morales\nandresmorales.com.co | WhatsApp: ${ANDRES_PHONE}`;
  }

  const highlights = [
    targetLang === 'en'
      ? `Server response time: ${loadSec}s (ideal mobile target is < 1.5s)`
      : targetLang === 'pt'
      ? `Tempo de resposta do servidor: ${loadSec}s (o ideal para mobile é < 1.5s)`
      : `Tiempo de respuesta del servidor: ${loadSec}s (lo ideal en comercio móvil es < 1.5s)`,
    metrics.hasWhatsApp
      ? `Canal de WhatsApp activo`
      : `Sin canal directo de WhatsApp para captura en caliente`,
    metrics.hasMetaPixel
      ? `Pixel de anuncios instalado`
      : `Pixel no detectado: posible fuga de atribución publicitaria`,
  ];

  const uxFnd = [
    metrics.hasWhatsApp
      ? `Canal de atención por WhatsApp disponible para resolver dudas antes de pagar`
      : `Sin botón flotante de WhatsApp: compradores con dudas abandonan la tienda sin comprar`,
    metrics.hasTrustBadges
      ? `Sellos y pasarelas de pago visibles que generan confianza`
      : `Falta de sellos visibles de pago seguro (PSE, tarjetas) en la navegación principal`,
  ];

  const uiFnd = [
    metrics.hasCustomTypography
      ? `Jerarquía tipográfica moderna adaptada al catálogo`
      : `Tipografía genérica: oportunidad de modernizar la interfaz para una percepción más premium`,
    metrics.hasModernImages
      ? `Assets visuales optimizados con formatos de compresión web`
      : `Carga de imágenes pesadas: afecta la nitidez y fluidez del scroll en celulares`,
  ];

  const suggestedImprovement =
    targetLang === 'en'
      ? 'Comprehensive performance optimization, mobile checkout redesign, and automated lead capture.'
      : targetLang === 'pt'
      ? 'Otimização de performance mobile, automação de orçamentos e agendamento inteligente.'
      : 'Optimización integral de rendimiento móvil, reemplazo de Excels y automatización de cotizaciones.';

  return {
    auditHighlights: highlights,
    uxFindings: uxFnd,
    uiFindings: uiFnd,
    suggestedImprovement,
    pitch: {
      whatsapp: waTech,
      whatsappUxUi: waUxUi,
      voiceScript,
      emailSubject,
      emailBody,
    },
  };
}

/**
 * Audits a prospect end-to-end: performs HTTP inspection + AI pitch synthesis
 */
export async function auditProspectWebsite(
  businessName: string,
  website: string,
  country = 'Colombia',
  city = 'Principal',
  category = 'Comercio Electrónico',
  auditSlug?: string,
  forcedLang?: 'es' | 'en' | 'pt'
): Promise<{
  audit: ProspectAudit;
  pitch: ProspectPitch;
  lang: 'es' | 'en' | 'pt';
  screenshotUrl?: string;
  extractedPhone?: string;
  extractedEmail?: string;
  extractedInstagram?: string;
}> {
  // Run network inspection and Google Lighthouse in parallel / fallback
  const [metrics, lhRes] = await Promise.all([
    inspectWebsite(website),
    runGoogleLighthouseAudit(website, auditSlug).catch((err) => {
      console.warn('[audit] Lighthouse run caught error:', err);
      return null;
    }),
  ]);

  const scores = calculateDetailedScores(metrics);
  const targetLang = forcedLang || detectLanguageFromCountry(country);

  // If real Google Lighthouse was executed, blend its official score
  let finalScore = scores.score;
  let finalTechScore = scores.techScore;
  let finalLoadTimeMs = metrics.totalTimeMs;

  if (lhRes?.lighthouse) {
    finalTechScore = lhRes.lighthouse.performanceScore;
    finalScore = Math.round(scores.uxScore * 0.35 + scores.uiScore * 0.25 + finalTechScore * 0.4);
    if (lhRes.lighthouse.lcpMs && lhRes.lighthouse.lcpMs > 0) {
      finalLoadTimeMs = Math.round(lhRes.lighthouse.lcpMs);
    }
  }

  const { auditHighlights, uxFnd: uxFndRes, uiFnd: uiFndRes, uxFindings, uiFindings, suggestedImprovement, pitch } =
    await generateConsultativePitch({
      businessName,
      country,
      city,
      category,
      metrics: {
        ...metrics,
        totalTimeMs: finalLoadTimeMs,
      },
      scores: {
        ...scores,
        score: finalScore,
        techScore: finalTechScore,
      },
      auditSlug,
    }) as any;

  // Add Google Lighthouse specific highlights if available
  const enrichedHighlights = [...(auditHighlights || [])];
  if (lhRes?.lighthouse) {
    if (lhRes.lighthouse.lcp) {
      enrichedHighlights.unshift(
        targetLang === 'en'
          ? `Google Lighthouse LCP (Largest Contentful Paint): ${lhRes.lighthouse.lcp} (Google threshold is <2.5s)`
          : `LCP Google Lighthouse: ${lhRes.lighthouse.lcp} (umbral recomendado por Google: <2.5s)`
      );
    }
    if (lhRes.lighthouse.tbt) {
      enrichedHighlights.push(
        targetLang === 'en'
          ? `Total Blocking Time (TBT): ${lhRes.lighthouse.tbt} main-thread freeze`
          : `Bloqueo de Hilo Principal (TBT): ${lhRes.lighthouse.tbt} de retardo antes de permitir interacción`
      );
    }
  }

  const aiAutomationProposal = generateDefaultAiAutomationProposal({
    businessName,
    category,
    platform: metrics.platform,
    hasWhatsApp: metrics.hasWhatsApp,
    lang: targetLang,
  });

  const audit: ProspectAudit = {
    loadTimeMs: finalLoadTimeMs,
    ttfbMs: metrics.ttfbMs,
    platform: metrics.platform,
    hasWhatsAppFloating: metrics.hasWhatsApp,
    hasAnalytics: metrics.hasAnalytics,
    hasMetaPixel: metrics.hasMetaPixel,
    hasMobileViewport: metrics.hasMobileViewport,
    score: finalScore,
    techScore: finalTechScore,
    uxScore: scores.uxScore,
    uiScore: scores.uiScore,
    lighthouse: lhRes?.lighthouse,
    uxFindings: uxFindings || uxFndRes || [],
    uiFindings: uiFindings || uiFndRes || [],
    uxUiSignals: {
      hasSearch: metrics.hasSearch,
      hasCartOrCheckout: metrics.hasCartOrCheckout,
      hasTrustBadges: metrics.hasTrustBadges,
      hasFavicon: metrics.hasFavicon,
      hasCustomTypography: metrics.hasCustomTypography,
      hasModernImages: metrics.hasModernImages,
      hasAggressivePopups: metrics.hasAggressivePopups,
      h1Count: metrics.h1Count,
    },
    auditHighlights: enrichedHighlights,
    suggestedImprovement,
    aiAutomationProposal,
    auditedAt: new Date().toISOString(),
  };

  return {
    audit,
    pitch,
    lang: targetLang,
    screenshotUrl: lhRes?.screenshotUrl,
    extractedPhone: metrics.extractedPhone,
    extractedEmail: metrics.extractedEmail,
    extractedInstagram: metrics.extractedInstagram,
  };
}
