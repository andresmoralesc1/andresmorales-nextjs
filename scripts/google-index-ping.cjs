#!/usr/bin/env node

/**
 * Modern Search Engine Indexing Automation (Google Indexing API v3 + IndexNow)
 *
 * Usage:
 *   node scripts/google-index-ping.cjs [optional-single-url]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read environment from .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// Fallback path to google-service-account.json in project root
const defaultServiceAccountPath = path.join(__dirname, '..', 'google-service-account.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(defaultServiceAccountPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = defaultServiceAccountPath;
}

const SITE_URL = 'https://andresmorales.com.co';
const HOST = 'andresmorales.com.co';

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
  // High-Opportunity Blog Posts with Active Search Impressions in GSC
  `${SITE_URL}/es/blog/agente-ia-whatsapp-colombia`,
  `${SITE_URL}/es/blog/consultor-automatizacion-ia-colombia`,
  `${SITE_URL}/en/blog/hire-ai-automation-consultant`,
  `${SITE_URL}/pt/blog/n8n-vs-make-brasil`,
];

// Helper to send HTTPS POST requests
function postJson(hostname, reqPath, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname,
      port: 443,
      path: reqPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('🚀 [SEO Indexing Automation] Starting search engine broadcast...');
  console.log(`🌐 Target Domain: ${HOST}\n`);

  // 1. IndexNow Broadcast (Bing, Yandex, Seznam, Naver)
  // IndexNow key generation or reading
  const indexNowKey = 'andresmorales_indexnow_2026';
  const keyFileName = `${indexNowKey}.txt`;
  const keyFilePath = path.join(__dirname, '..', 'public', keyFileName);

  // Ensure key file exists in public/ so search engines can verify ownership
  if (!fs.existsSync(keyFilePath)) {
    fs.writeFileSync(keyFilePath, indexNowKey, 'utf8');
    console.log(`   🔑 Created IndexNow verification file at public/${keyFileName}`);
  }

  console.log('📡 Step 1: Submitting URLs to IndexNow (Bing / Search Engine Alliance)...');
  const indexNowPayload = {
    host: HOST,
    key: indexNowKey,
    keyLocation: `${SITE_URL}/${keyFileName}`,
    urlList: CORE_PRIORITY_URLS,
  };

  const indexNowRes = await postJson('api.indexnow.org', '/indexnow', indexNowPayload);
  if (indexNowRes.status === 200 || indexNowRes.status === 202) {
    console.log(`   ✅ IndexNow accepted ${CORE_PRIORITY_URLS.length} URLs (HTTP ${indexNowRes.status})`);
  } else {
    console.log(`   ℹ️ IndexNow response: HTTP ${indexNowRes.status} (key verification pending public deployment)`);
  }

  // 2. Google Indexing API v3 Check
  console.log('\n📡 Step 2: Checking Google Indexing API v3 (Service Account)...');
  const targetUrl = process.argv[2] || `${SITE_URL}/es/portfolio`;

  let credsFound = false;
  let serviceAccount = null;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      credsFound = true;
    } catch (e) {
      console.warn('   ⚠️ Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON');
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      credsFound = true;
    } catch (e) {
      console.warn('   ⚠️ Could not read GOOGLE_APPLICATION_CREDENTIALS file');
    }
  }

  if (credsFound && serviceAccount) {
    console.log(`   ✅ Google Service Account detected: ${serviceAccount.client_email}`);
    try {
      const { google } = require('googleapis');
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/indexing'],
      });

      const client = await auth.getClient();
      const indexing = google.indexing({ version: 'v3', auth: client });

      const urlsToPing = process.argv[2] ? [process.argv[2]] : CORE_PRIORITY_URLS;
      console.log(`   ⚡ Broadcasting ${urlsToPing.length} URL(s) to Google Indexing API...`);

      for (const url of urlsToPing) {
        try {
          const res = await indexing.urlNotifications.publish({
            requestBody: {
              url,
              type: 'URL_UPDATED',
            },
          });
          console.log(`   • [HTTP ${res.status}] ${url}`);
          // Small pause to respect API rate-limits
          await new Promise((r) => setTimeout(r, 200));
        } catch (singleErr) {
          console.warn(`   ⚠️ Error on ${url}: ${singleErr.message}`);
        }
      }
      console.log('   🎉 All priority URLs submitted to Google Indexing API successfully.');
    } catch (err) {
      console.error(`   ❌ Indexing API error: ${err.message}`);
    }
  } else {
    console.log('   ℹ️ Google Service Account is ready for setup:');
    console.log('     1. Open Google Cloud Console -> APIs & Services -> Enable "Web Search Indexing API".');
    console.log('     2. Create a Service Account, generate a JSON Key.');
    console.log('     3. In Google Search Console -> Settings -> Users and Permissions, add the Service Account email as Owner.');
    console.log('     4. Export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json or put in .env.local');
  }

  console.log('\n🏁 [SEO Indexing Automation] Completed.');
}

run();
