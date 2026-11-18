const { chromium } = require('/home/telchar/gato-colectivo/node_modules/playwright');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1.5,
  });
  const page = await desktopCtx.newPage();
  console.log('Navigating to desktop portfolio...');
  await page.goto('https://andresmorales.com.co/es/portfolio', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Scroll to #proyectos
  const proyectosSection = await page.$('#proyectos');
  if (proyectosSection) {
    await proyectosSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/telchar/andresmorales-nextjs/public/screenshots/portfolio-desktop-3d.png' });
    console.log('Captured desktop 3D portfolio screenshot.');
  }

  // 2. Mobile
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();
  console.log('Navigating to mobile portfolio...');
  await mobilePage.goto('https://andresmorales.com.co/es/portfolio', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  const mobileProyectos = await mobilePage.$('#proyectos');
  if (mobileProyectos) {
    await mobileProyectos.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(1500);
    await mobilePage.screenshot({ path: '/home/telchar/andresmorales-nextjs/public/screenshots/portfolio-mobile-3d.png' });
    console.log('Captured mobile 3D portfolio screenshot.');
  }

  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
