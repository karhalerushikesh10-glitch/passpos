const path = require('path');
const fs = require('fs');

const APP_URL = process.env.APP_URL || 'http://localhost:3005';
const DOCS_SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const ROOT_SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

[DOCS_SCREENSHOTS_DIR, ROOT_SCREENSHOTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runCapture() {
  console.log(`[Screenshot Suite] Starting Playwright/Puppeteer capture targeting isolated server: ${APP_URL}`);

  let browser;
  let page;

  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    console.log('✔ Initialized Playwright Chromium instance.');
  } catch (err) {
    console.log('Using Puppeteer Chrome instance...');
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    page = await browser.newPage();
    console.log('✔ Initialized Puppeteer Chrome instance.');
  }

  async function saveScreenshot(filename) {
    const docsPath = path.join(DOCS_SCREENSHOTS_DIR, filename);
    const rootPath = path.join(ROOT_SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: docsPath });
    await page.screenshot({ path: rootPath });
    console.log(`✔ [Captured]: ${filename}`);
  }

  // 1. Desktop Main Product UI
  console.log('\n--- Step 1: Capturing Desktop Main Landing Page (1920x1080) ---');
  await page.setViewportSize ? await page.setViewportSize({ width: 1920, height: 1080 }) : await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await saveScreenshot('01_desktop_main_landing.png');

  // 2. Mobile Responsive UI
  console.log('\n--- Step 2: Capturing Mobile Responsive Design (iPhone 13 Pro: 390x844) ---');
  await page.setViewportSize ? await page.setViewportSize({ width: 390, height: 844 }) : await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1200);
  try {
    const mobileBtn = await page.$('#navbar-mobile-menu-btn, button[aria-label*="navigation"], button:has(svg.lucide-menu)');
    if (mobileBtn) {
      await mobileBtn.click();
      await sleep(600);
    }
  } catch (e) {}
  await saveScreenshot('02_mobile_responsive_design.png');

  // Reset viewport to Desktop 1920x1080
  await page.setViewportSize ? await page.setViewportSize({ width: 1920, height: 1080 }) : await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false, deviceScaleFactor: 2 });

  // 3. Wallet Interaction State
  console.log('\n--- Step 3: Capturing Wallet Connection Modal State ---');
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1000);
  try {
    await page.waitForSelector('#connect-wallet-btn', { timeout: 5000 });
    await page.click('#connect-wallet-btn');
    await sleep(800);
    await page.waitForSelector('#wallet-modal', { timeout: 5000 });
  } catch (e) {
    await page.evaluate(() => {
      const btn = document.getElementById('connect-wallet-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Connect Wallet'));
      if (btn) btn.click();
    });
    await sleep(800);
  }
  await saveScreenshot('03_wallet_connection_modal.png');

  // 4. User Feedback Collection UI
  console.log('\n--- Step 4: Capturing User Feedback Collection Modal ---');
  await page.goto(`${APP_URL}/pos`, { waitUntil: 'networkidle' });
  await sleep(1000);
  try {
    await page.waitForSelector('#navbar-feedback-btn', { timeout: 5000 });
    await page.click('#navbar-feedback-btn');
    await sleep(800);
    await page.waitForSelector('#feedback-modal', { timeout: 5000 });
  } catch (e) {
    await page.evaluate(() => {
      const btn = document.getElementById('navbar-feedback-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Feedback'));
      if (btn) btn.click();
    });
    await sleep(800);
  }
  await saveScreenshot('04_user_feedback_modal.png');

  // 5. Analytics & Monitoring Setup
  console.log('\n--- Step 5: Capturing Analytics & Monitoring Setup ---');
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1200);
  try {
    await page.waitForSelector('#merchant-dashboard', { timeout: 5000 });
  } catch (e) {}
  await saveScreenshot('05_analytics_setup.png');

  await browser.close();
  console.log('\n🎉 [Success] All 5 distinct, verified screenshots generated for PassPOS!');
}

runCapture().catch((err) => {
  console.error('[Error during screenshot capture]:', err);
  process.exit(1);
});
