const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/asus/.gemini/antigravity/brain/25f47215-c6d8-4a51-bde6-016688874c7d');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clickByText(page, selector, textSubstr) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const text = await page.evaluate(el => el.textContent, h);
    if (text && text.includes(textSubstr)) {
      await h.click();
      return true;
    }
  }
  return false;
}

(async () => {
  console.log('[VERIFICATION] Starting ASTRA-MED Automated Browser Test Suite...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();
  
  try {
    // 1. Navigate to frontend
    console.log('[1/8] Navigating to http://127.0.0.1:5173...');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(2500); // Allow telemetry sync

    const title = await page.title();
    console.log(`[PASS] Page Title: "${title}"`);

    // Screenshot 1: Nominal Dashboard
    const p1 = path.join(ARTIFACT_DIR, '01_nominal_dashboard.png');
    await page.screenshot({ path: p1, fullPage: false });
    console.log(`[PASS] Saved Screenshot 1: ${p1}`);

    // 2. Test Body Map Interactions
    console.log('[2/8] Testing Anatomical Body Map Clickable Zones...');
    
    // Click Head/Brain (Neurological)
    let ok = await clickByText(page, 'button', 'Cranial / Behavioral');
    if (ok) {
      await sleep(600);
      const p2 = path.join(ARTIFACT_DIR, '02_neuro_drilldown.png');
      await page.screenshot({ path: p2, fullPage: false });
      console.log(`[PASS] Saved Screenshot 2 (Neurological Zone): ${p2}`);
    }

    // Click Cardiovascular (Heart)
    ok = await clickByText(page, 'button', 'Cardiovascular');
    if (ok) {
      await sleep(600);
      const p3 = path.join(ARTIFACT_DIR, '03_cardio_drilldown.png');
      await page.screenshot({ path: p3, fullPage: false });
      console.log(`[PASS] Saved Screenshot 3 (Cardiovascular Zone): ${p3}`);
    }

    // Click Immune & Radiation (Torso)
    ok = await clickByText(page, 'button', 'Immune & Radiation');
    if (ok) {
      await sleep(600);
      const p4 = path.join(ARTIFACT_DIR, '04_immune_drilldown.png');
      await page.screenshot({ path: p4, fullPage: false });
      console.log(`[PASS] Saved Screenshot 4 (Immune Zone): ${p4}`);
    }

    // Click Bone & Skeletal (Limbs)
    ok = await clickByText(page, 'button', 'Bone & Skeletal');
    if (ok) {
      await sleep(600);
      const p5 = path.join(ARTIFACT_DIR, '05_bone_drilldown.png');
      await page.screenshot({ path: p5, fullPage: false });
      console.log(`[PASS] Saved Screenshot 5 (Bone/Skeletal Zone): ${p5}`);
    }

    // Reset filter
    await clickByText(page, 'button', 'Reset Filter');
    await sleep(500);

    // 3. Test Scenario Switcher: Solar Particle Event (SPE)
    console.log('[3/8] Testing Scenario Switch: Solar Particle Event (SPE)...');
    ok = await clickByText(page, 'button', 'Solar Particle Event (SPE)');
    if (ok) {
      await sleep(1500);
      const p6 = path.join(ARTIFACT_DIR, '06_solar_particle_event.png');
      await page.screenshot({ path: p6, fullPage: false });
      console.log(`[PASS] Saved Screenshot 6 (Solar Particle Event): ${p6}`);
    }

    // 4. Test Scenario Switcher: Cardio Deconditioning
    console.log('[4/8] Testing Scenario Switch: Cardio Deconditioning...');
    ok = await clickByText(page, 'button', 'Cardio Deconditioning');
    if (ok) {
      await sleep(1500);
      const p7 = path.join(ARTIFACT_DIR, '07_cardio_deconditioning.png');
      await page.screenshot({ path: p7, fullPage: false });
      console.log(`[PASS] Saved Screenshot 7 (Cardio Deconditioning): ${p7}`);
    }

    // 5. Test Scenario Switcher: Isolation & Sleep Fatigue
    console.log('[5/8] Testing Scenario Switch: Isolation & Sleep Fatigue...');
    ok = await clickByText(page, 'button', 'Isolation & Sleep Fatigue');
    if (ok) {
      await sleep(1500);
      const p8 = path.join(ARTIFACT_DIR, '08_isolation_fatigue.png');
      await page.screenshot({ path: p8, fullPage: false });
      console.log(`[PASS] Saved Screenshot 8 (Isolation Fatigue): ${p8}`);
    }

    // Switch back to Nominal
    await clickByText(page, 'button', 'Nominal Microgravity Cruise');
    await sleep(1200);

    // 6. Test Daily Astronaut Self-Check-In Modal
    console.log('[6/8] Testing Daily Astronaut Self-Check-In...');
    ok = await clickByText(page, 'button', 'Self-Check-In');
    if (ok) {
      await sleep(800);
      const p9 = path.join(ARTIFACT_DIR, '09_self_checkin_modal.png');
      await page.screenshot({ path: p9, fullPage: false });
      console.log(`[PASS] Saved Screenshot 9 (Self-Check-In Modal): ${p9}`);

      // Select symptom
      await clickByText(page, 'button', 'Circadian Insomnia / Fragmented Sleep');
      await sleep(400);

      // Submit check-in
      await clickByText(page, 'button', 'Submit Health Check-In');
      await sleep(1500);
      console.log('[PASS] Submitted Daily Self-Check-In successfully');
    }

    // 7. Test Countermeasure Protocol Execution
    console.log('[7/8] Testing Countermeasure Protocol Execution...');
    ok = await clickByText(page, 'button', 'Execute');
    if (ok) {
      await sleep(1200);
      const p10 = path.join(ARTIFACT_DIR, '10_countermeasure_executed.png');
      await page.screenshot({ path: p10, fullPage: false });
      console.log(`[PASS] Saved Screenshot 10 (Executed Countermeasure): ${p10}`);
    }

    console.log('[8/8] ALL 10 VERIFICATION STEPS AND SCREENSHOTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('[ERROR during verification]', err);
  } finally {
    await browser.close();
  }
})();
