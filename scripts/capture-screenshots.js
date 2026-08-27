const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const DOCS_SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const ROOT_SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

[DOCS_SCREENSHOTS_DIR, ROOT_SCREENSHOTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log(`[Puppeteer] Starting distinct screenshot capture targeting: ${APP_URL}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  async function saveScreenshot(filename) {
    const docsPath = path.join(DOCS_SCREENSHOTS_DIR, filename);
    const rootPath = path.join(ROOT_SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: docsPath, fullPage: false });
    await page.screenshot({ path: rootPath, fullPage: false });
    console.log(`✔ [Captured]: ${filename}`);
  }

  // =========================================================================
  // Specification 1: Desktop Main Product UI
  // Viewport: 1920x1080. Navigate to homepage.
  // Filename: docs/screenshots/01_desktop_main_landing.png
  // =========================================================================
  console.log('\n--- Step 1: Capturing Desktop Main Landing Page (1920x1080) ---');
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await saveScreenshot('01_desktop_main_landing.png');

  // =========================================================================
  // Specification 2: Mobile Responsive UI
  // Emulate mobile device (iPhone 13 Pro: 390x844).
  // Filename: docs/screenshots/02_mobile_responsive_design.png
  // =========================================================================
  console.log('\n--- Step 2: Capturing Mobile Responsive UI (iPhone 13 Pro: 390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle0' });
  await sleep(1200);

  // Trigger mobile menu toggle if present
  try {
    const menuBtn = await page.$('button[aria-label*="navigation"], button:has(svg.lucide-menu)');
    if (menuBtn) {
      await menuBtn.click();
      await sleep(600);
    }
  } catch (e) {
    // Menu toggle optional
  }
  await saveScreenshot('02_mobile_responsive_design.png');

  // Reset to Desktop Viewport for remaining modal & dashboard steps
  await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false, deviceScaleFactor: 2 });

  // =========================================================================
  // Specification 3: Wallet Interaction State
  // Desktop viewport. Click "Connect Wallet". Wait for modal.
  // Filename: docs/screenshots/03_wallet_connection_modal.png
  // =========================================================================
  console.log('\n--- Step 3: Capturing Wallet Connection Modal State ---');
  await page.goto(`${APP_URL}`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Find and click "Connect Wallet" button
  const connectWalletClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find((b) => b.textContent && b.textContent.includes('Connect Wallet'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (connectWalletClicked) {
    await sleep(800);
    await saveScreenshot('03_wallet_connection_modal.png');
  } else {
    console.warn('Could not find Connect Wallet button directly, taking current state');
    await saveScreenshot('03_wallet_connection_modal.png');
  }

  // =========================================================================
  // Specification 4: User Feedback Collection UI
  // Desktop viewport. Reload page. Click "Feedback" button. Wait for FeedbackModal.
  // Filename: docs/screenshots/04_user_feedback_modal.png
  // =========================================================================
  console.log('\n--- Step 4: Capturing User Feedback Collection Modal ---');
  await page.goto(`${APP_URL}/pos`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Find and click Feedback button in Navbar
  const feedbackClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(
      (b) => b.textContent && (b.textContent.includes('Feedback') || b.title?.includes('Feedback'))
    );
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (feedbackClicked) {
    await sleep(800);
    await saveScreenshot('04_user_feedback_modal.png');
  } else {
    await saveScreenshot('04_user_feedback_modal.png');
  }

  // =========================================================================
  // Specification 5: Analytics/Monitoring Setup
  // Navigate to /dashboard to display live merchant analytics & event logs.
  // Filename: docs/screenshots/05_analytics_setup.png
  // =========================================================================
  console.log('\n--- Step 5: Capturing Analytics & Monitoring Setup ---');
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await saveScreenshot('05_analytics_setup.png');

  await browser.close();
  console.log('\n🎉 [Success] All 5 distinct screenshots captured and saved to docs/screenshots/');
}

capture().catch((err) => {
  console.error('[Error during capture]:', err);
  process.exit(1);
});
