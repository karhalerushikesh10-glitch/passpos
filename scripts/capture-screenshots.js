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
  console.log(`[Screenshot Suite] Capturing clean screenshots from: ${APP_URL}`);

  let browser;
  let page;

  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    console.log('✔ Playwright initialized.');
  } catch (err) {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    page = await browser.newPage();
    console.log('✔ Puppeteer initialized.');
  }

  async function saveScreenshot(filename) {
    const docsPath = path.join(DOCS_SCREENSHOTS_DIR, filename);
    const rootPath = path.join(ROOT_SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: docsPath });
    await page.screenshot({ path: rootPath });
    console.log(`✔ Saved: ${filename}`);
  }

  // 1. Desktop Landing Page (1920x1080)
  await page.setViewportSize ? await page.setViewportSize({ width: 1920, height: 1080 }) : await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1500);
  await saveScreenshot('01_desktop_main_landing.png');

  // 2. Desktop POS Terminal
  await page.goto(`${APP_URL}/pos`, { waitUntil: 'networkidle' });
  await sleep(1200);
  // Add an item to cart
  try {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("+"), button.bg-blue-600');
    if (addBtn) {
      await addBtn.click();
      await sleep(300);
    }
  } catch (e) {}
  await saveScreenshot('02_desktop_pos_terminal.png');

  // 3. Wallet Connection Modal State
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1000);
  try {
    const walletBtn = await page.$('#connect-wallet-btn, button:has-text("Connect Wallet")');
    if (walletBtn) {
      await walletBtn.click();
      await sleep(800);
    }
  } catch (e) {}
  await saveScreenshot('03_wallet_connection_modal.png');

  // 4. User Feedback Modal
  await page.goto(`${APP_URL}/pos`, { waitUntil: 'networkidle' });
  await sleep(1000);
  try {
    const feedbackBtn = await page.$('#navbar-feedback-btn, button:has-text("Feedback")');
    if (feedbackBtn) {
      await feedbackBtn.click();
      await sleep(800);
    }
  } catch (e) {}
  await saveScreenshot('04_user_feedback_modal.png');

  // 5. Merchant Dashboard & Analytics
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1200);
  await saveScreenshot('05_analytics_setup.png');

  // 6. Mobile Responsive Design (iPhone 13 Pro: 390x844)
  await page.setViewportSize ? await page.setViewportSize({ width: 390, height: 844 }) : await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle' });
  await sleep(1200);
  try {
    const mobileBtn = await page.$('#navbar-mobile-menu-btn, button[aria-label*="navigation"]');
    if (mobileBtn) {
      await mobileBtn.click();
      await sleep(600);
    }
  } catch (e) {}
  await saveScreenshot('06_mobile_responsive_design.png');

  await browser.close();
  console.log('🎉 All screenshot files generated successfully!');
}

runCapture().catch((err) => {
  console.error(err);
  process.exit(1);
});
