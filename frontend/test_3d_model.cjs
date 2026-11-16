const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/asus/.gemini/antigravity/brain/b6713fbc-b085-4884-8c51-0f2094356c56';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('[TEST] Launching Chrome to verify 3D Holographic Model...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050', '--enable-webgl', '--ignore-gpu-blocklist'],
    defaultViewport: { width: 1600, height: 1050 }
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('[BROWSER ERROR]', msg.text());
    } else {
      console.log('[BROWSER LOG]', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('[PAGE ERROR]', err.toString());
  });

  try {
    const targetUrl = 'http://localhost:5174';
    console.log(`[TEST] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 20000 });
    
    // Wait 3.5s for 3D model, textures, and initial animation cycle
    await sleep(3500);

    // Check if canvas exists
    const canvasExists = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return !!c && c.width > 0 && c.height > 0;
    });
    console.log('[TEST] WebGL Canvas rendered:', canvasExists);

    // Screenshot 1: Full Mission Console with 3D Hologram
    const shot1 = path.join(ARTIFACT_DIR, '01_3d_hologram_dashboard.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`[PASS] Saved Screenshot 1: ${shot1}`);

    // Click on Cardiovascular Badge to verify drilldown and 3D beacon reticle
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && txt.includes('Cardiovascular')) {
        await b.click();
        console.log('[TEST] Clicked Cardiovascular button');
        break;
      }
    }
    await sleep(1500);

    // Screenshot 2: Cardiovascular Reticle & Telemetry Focus
    const shot2 = path.join(ARTIFACT_DIR, '02_cardiovascular_3d_focus.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`[PASS] Saved Screenshot 2: ${shot2}`);

    // Click on Cranial Badge
    for (const b of buttons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt && txt.includes('Cranial')) {
        await b.click();
        console.log('[TEST] Clicked Cranial button');
        break;
      }
    }
    await sleep(1500);

    // Screenshot 3: Cranial Reticle & Telemetry Focus
    const shot3 = path.join(ARTIFACT_DIR, '03_cranial_3d_focus.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`[PASS] Saved Screenshot 3: ${shot3}`);

    console.log('[TEST COMPLETED] Total console errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('Errors encountered:', consoleErrors);
    }
  } catch (err) {
    console.error('[TEST FATAL ERROR]', err);
  } finally {
    await browser.close();
  }
})();
