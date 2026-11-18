import { chromium } from '/home/telchar/kambelleh-pms/frontend/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve(process.cwd(), 'public/screenshots/mobile-audit');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/telchar/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
  });

  // iPhone 14 / 15 viewport (390 x 844)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  // Set consent in localStorage before navigation
  await page.addInitScript(() => {
    localStorage.setItem('andresmorales-consent', JSON.stringify({
      essential: true,
      analytics: true,
      decidedAt: Date.now()
    }));
  });

  console.log('Navigating to http://127.0.0.1:3006/es/portfolio...');
  await page.goto('http://127.0.0.1:3006/es/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Hero Viewport
  console.log('Capturing Hero...');
  await page.screenshot({
    path: path.join(outDir, '01-hero-bento.png'),
    fullPage: false,
  });

  // 2. 3D Gallery Section
  console.log('Capturing 3D Gallery...');
  const proyectosEl = await page.$('#proyectos');
  if (proyectosEl) {
    await proyectosEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, '02-3d-showcase.png'),
      fullPage: false,
    });

    // 3. Switch to Grid View
    console.log('Switching to Grid View...');
    const gridBtn = await page.locator('button:has-text("Cuadrícula")').first();
    if (gridBtn) {
      await gridBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(outDir, '03-grid-cards.png'),
        fullPage: false,
      });
    }
  }

  // 4. Automations Section
  console.log('Capturing Automations...');
  const autoEl = await page.$('#automatizaciones');
  if (autoEl) {
    await autoEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, '04-automations.png'),
      fullPage: false,
    });
  }

  // 5. ROI Simulator
  console.log('Capturing ROI Simulator...');
  const roiEl = await page.locator('text=Simulador de ROI y Ahorro').first();
  if (roiEl) {
    await roiEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, '05-roi-calculator.png'),
      fullPage: false,
    });
  }

  // 6. Floating Dock on Scroll
  console.log('Capturing Floating Dock...');
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(outDir, '06-floating-dock.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('Screenshots saved to:', outDir);
}

run().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
