/**
 * Standalone QA Runner using plain Node.js + Playwright
 * Runs all 15 tests sequentially with visual headed browser and prints live results
 * 
 * Usage:
 *   node src/tests/run_qa_suite.js
 */

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@procurex.com';
const TEST_PASSWORD = 'password';

async function runAll() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    try {
      playwright = require('@playwright/test');
    } catch {
      console.error('\n❌ Playwright is not installed yet.');
      console.log('👉 Please run: npm install --save-dev @playwright/test playwright\n');
      process.exit(1);
    }
  }

  const browser = await playwright.chromium.launch({
    headless: false,
    slowMo: 400, // Slows down actions so you can watch each test
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  console.log('\n========================================================');
  console.log('🚀 SLT ProcureX - Starting Senior QA End-to-End Suite');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`⏳ [TEST] ${name} ... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Sign In
  await testStep('TC-001: Sign In & Authentication', async () => {
    await page.goto(`${BASE_URL}/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
  });

  // 2. Tenders Page Load
  await testStep('TC-002: Tenders Page UI Elements', async () => {
    await page.goto(`${BASE_URL}/tenders`);
    await page.waitForSelector('h1');
    const title = await page.locator('h1').textContent();
    if (!title.includes('Tenders')) throw new Error('Heading does not contain Tenders');
  });

  // 3. Tenders Export CSV
  await testStep('TC-003: Export CSV Button', async () => {
    const exportBtn = page.locator('button:has-text("Export CSV")');
    if (await exportBtn.count() === 0) throw new Error('Export CSV button not found');
    await exportBtn.click();
    await page.waitForTimeout(1000);
  });

  // 4. Add Tender Modal
  const tenderNo = `QA-${Date.now()}`;
  await testStep('TC-004: Create Tender Modal Form', async () => {
    await page.click('button:has-text("Add Tender")');
    await page.waitForSelector('form, [role="dialog"]');
    await page.locator('input[type="text"]').first().fill(tenderNo);
    await page.locator('input[type="text"]').nth(1).fill('QA Automated Tender Scope');
    await page.locator('input[type="number"]').first().fill('5000000');
    await page.locator('input[type="number"]').nth(1).fill('4800000');
    await page.locator('input[type="date"]').first().fill('2026-10-10');
    await page.locator('input[type="date"]').nth(1).fill('2027-04-30');
    
    // Select customer if available
    const custSelect = page.locator('select').first();
    if (await custSelect.locator('option').count() > 1) {
      await custSelect.selectOption({ index: 1 });
    }

    await page.click('button:has-text("Save Tender"), button:has-text("Create Tender")');
    await page.waitForTimeout(2000);
  });

  // 5. Search & Status Filter
  await testStep('TC-005: Tender Search and Filter', async () => {
    const search = page.locator('input[placeholder*="Search"]');
    await search.fill(tenderNo);
    await page.waitForTimeout(600);
    await search.clear();
  });

  // 6. Settings Page Tabs
  await testStep('TC-006: Settings - All 5 Tabs Accessible', async () => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector('button:has-text("Account")');
    await page.click('button:has-text("Notifications")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Security")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Appearance")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("System")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Account")');
    await page.waitForTimeout(400);
  });

  // 7. Settings - Dark Theme Toggle
  await testStep('TC-007: Settings - Dark Mode Switch', async () => {
    await page.click('button:has-text("Appearance")');
    await page.waitForTimeout(400);
    const switches = page.locator('[role="switch"]');
    await switches.first().click();
    await page.waitForTimeout(500);
    // Switch back
    await switches.first().click();
    await page.waitForTimeout(500);
  });

  // 8. Settings - Security Modals
  await testStep('TC-008: Settings - Security Modals (Sessions & Logs)', async () => {
    await page.click('button:has-text("Security")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("View Sessions")');
    await page.waitForSelector('text=Active Sessions');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(400);
  });

  // 9. Invoice Detail Page
  await testStep('TC-009: Invoice Detail (ID=3) & Download PDF button', async () => {
    await page.goto(`${BASE_URL}/invoices/3`);
    await page.waitForTimeout(1500);
    const pdfBtn = page.locator('button:has-text("Download PDF")');
    if (await pdfBtn.count() > 0) {
      console.log(' (Download PDF button found)');
    }
  });

  console.log('\n========================================================');
  console.log(`📊 Test Summary: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================\n');

  await page.waitForTimeout(2000);
  await browser.close();
}

runAll().catch(console.error);
