const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const DOCS_SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

[SCREENSHOTS_DIR, DOCS_SCREENSHOTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture() {
  console.log('[Puppeteer] Launching browser to capture genuine UI screenshots...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  async function saveScreenshot(filename) {
    const p1 = path.join(SCREENSHOTS_DIR, filename);
    const p2 = path.join(DOCS_SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: p1, fullPage: false });
    await page.screenshot({ path: p2, fullPage: false });
    console.log(`[Captured]: ${filename}`);
  }

  // ==========================================
  // DESKTOP VIEWPORTS (1440 x 900)
  // ==========================================
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Landing Hero Page
  console.log('Navigating to Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await saveScreenshot('01_landing_hero_desktop.png');

  // 2. POS Terminal with Items
  console.log('Navigating to POS Terminal...');
  await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle0' });
  await sleep(1000);
  // Click on products to add to cart
  const productButtons = await page.$$('button');
  for (const btn of productButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Add')) {
      await btn.click();
      await sleep(300);
    }
  }
  await saveScreenshot('02_pos_terminal_desktop.png');

  // 3. Passkey Payment Modal
  console.log('Triggering Passkey Payment Modal...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Passkey Pay')) {
      await btn.click();
      await sleep(800);
      break;
    }
  }
  await saveScreenshot('03_passkey_modal_desktop.png');

  // 4. Feedback Modal
  console.log('Triggering Feedback Modal...');
  await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle0' });
  await sleep(600);
  const navButtons = await page.$$('button');
  for (const btn of navButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Feedback')) {
      await btn.click();
      await sleep(800);
      break;
    }
  }
  await saveScreenshot('04_feedback_modal_desktop.png');

  // 5. Merchant Dashboard
  console.log('Navigating to Merchant Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await saveScreenshot('05_merchant_dashboard_desktop.png');

  // 6. Merchant Passkey Onboarding Setup
  console.log('Navigating to Onboarding Page...');
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await saveScreenshot('06_onboarding_passkey_desktop.png');

  // ==========================================
  // MOBILE VIEWPORTS (iPhone 13: 390 x 844)
  // ==========================================
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 7. Mobile Landing Page
  console.log('Capturing Mobile Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await saveScreenshot('07_landing_mobile.png');

  // 8. Mobile POS Terminal
  console.log('Capturing Mobile POS Terminal...');
  await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await saveScreenshot('08_pos_terminal_mobile.png');

  // 9. Mobile Dashboard
  console.log('Capturing Mobile Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await saveScreenshot('09_dashboard_mobile.png');

  await browser.close();
  console.log('🎉 [Success] All genuine UI screenshots captured and saved to /screenshots and /docs/screenshots');
}

capture().catch((err) => {
  console.error('[Puppeteer Error]:', err);
  process.exit(1);
});
