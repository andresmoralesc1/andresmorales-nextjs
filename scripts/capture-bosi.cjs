const { chromium } = require('/home/telchar/gato-colectivo/node_modules/playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const outDir = '/home/telchar/andresmorales-nextjs/public/screenshots/bosi';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  
  // 1. Mobile context (iPhone 14)
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  });
  
  const page = await mobileCtx.newPage();
  console.log('1. Navigating to bosi.com.co mobile home...');
  try {
    await page.goto('https://www.bosi.com.co', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);
    
    // Check for modal close
    try {
      const closeBtn = await page.$('.vtex-modal-layout-0-x-closeButton, button[aria-label="Close"], .modal-close');
      if (closeBtn) {
        console.log('Closing modal...');
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {}

    await page.screenshot({ path: path.join(outDir, '01-home-mobile-hero.png') });
    console.log('Saved 01-home-mobile-hero.png');

    await page.evaluate(() => window.scrollBy(0, 550));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '02-home-mobile-mid.png') });
    console.log('Saved 02-home-mobile-mid.png');
  } catch (err) {
    console.error('Home mobile error:', err.message);
  }

  // 2. Category / PLP
  console.log('2. Navigating to PLP (Hombre calzado)...');
  try {
    await page.goto('https://www.bosi.com.co/hombre/calzado', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(outDir, '03-plp-mobile-grid.png') });
    console.log('Saved 03-plp-mobile-grid.png');

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '04-plp-mobile-scroll.png') });
    console.log('Saved 04-plp-mobile-scroll.png');
  } catch (err) {
    console.error('PLP error:', err.message);
  }

  // 3. PDP (Product Detail Page)
  console.log('3. Navigating to PDP...');
  try {
    // find a product link or direct URL
    const links = await page.$$eval('a[href*="/p"]', els => els.map(e => e.href));
    const pdpUrl = links.length > 0 ? links[0] : 'https://www.bosi.com.co/calzado-hombre';
    console.log('Visiting PDP URL:', pdpUrl);
    await page.goto(pdpUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(outDir, '05-pdp-mobile-top.png') });
    console.log('Saved 05-pdp-mobile-top.png');

    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '06-pdp-mobile-sizes-cta.png') });
    console.log('Saved 06-pdp-mobile-sizes-cta.png');

    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '07-pdp-mobile-no-sticky.png') });
    console.log('Saved 07-pdp-mobile-no-sticky.png');
  } catch (err) {
    console.error('PDP error:', err.message);
  }

  // 4. Desktop Context
  console.log('4. Navigating to Desktop home...');
  try {
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto('https://www.bosi.com.co', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await desktopPage.waitForTimeout(4000);
    await desktopPage.screenshot({ path: path.join(outDir, '08-desktop-home.png') });
    console.log('Saved 08-desktop-home.png');
  } catch (err) {
    console.error('Desktop error:', err.message);
  }

  await browser.close();
  console.log('All screenshots completed!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
