const path = require('path');
const fs = require('fs');

async function postTweetWithPlaywright(tweetText, cookieString = null) {
  const { chromium } = require('/home/telchar/gato-colectivo/node_modules/playwright');
  const sessionDir = path.join(__dirname, 'x-session');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const cookieFile = path.join(sessionDir, 'cookies.json');

  console.log('🤖 [X Playwright Bot] Iniciando Chromium headless...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  // Inject cookies if saved or passed
  if (cookieString) {
    const cookies = cookieString.split(';').map(c => {
      const parts = c.trim().split('=');
      return {
        name: parts[0],
        value: parts.slice(1).join('='),
        domain: '.x.com',
        path: '/',
      };
    }).filter(c => c.name && c.value);

    await context.addCookies(cookies);
    fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
  } else if (fs.existsSync(cookieFile)) {
    const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  try {
    console.log('🌐 Navegando a x.com/compose/post...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Check if logged in
    const isLoginPage = page.url().includes('login') || page.url().includes('i/flow/login');
    if (isLoginPage) {
      console.warn('⚠️ Se requiere autenticación de sesión en X (cookies no válidas o ausentes).');
      await page.screenshot({ path: path.join(sessionDir, 'login-required.png') });
      await browser.close();
      return { success: false, reason: 'login_required' };
    }

    console.log('✍️ Localizando área de redacción de tweet...');
    const editor = await page.$('div[role="textbox"][data-testid="tweetTextarea_0"]');
    if (!editor) {
      console.warn('⚠️ No se encontró el editor de tweet.');
      await page.screenshot({ path: path.join(sessionDir, 'editor-not-found.png') });
      await browser.close();
      return { success: false, reason: 'editor_not_found' };
    }

    await editor.click();
    await page.waitForTimeout(500);
    await page.keyboard.type(tweetText, { delay: 30 });
    await page.waitForTimeout(1000);

    const postBtn = await page.$('button[data-testid="tweetButton"]');
    if (postBtn) {
      console.log('🚀 Clickeando botón "Post"...');
      await postBtn.click();
      await page.waitForTimeout(4000);
      console.log('✅ Tweet publicado con éxito vía Playwright Headless.');
      await browser.close();
      return { success: true };
    } else {
      console.warn('⚠️ No se encontró el botón de publicar.');
      await browser.close();
      return { success: false, reason: 'button_not_found' };
    }
  } catch (err) {
    console.error('❌ Error en Playwright X Bot:', err.message);
    await browser.close();
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  const text = process.argv[2] || '🚀 Test tweet from autonomous engine';
  postTweetWithPlaywright(text).then(res => console.log('Resultado:', res));
}

module.exports = { postTweetWithPlaywright };
