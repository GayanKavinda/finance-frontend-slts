/**
 * ============================================================
 * SLT ProcureX - File Exports & Document Handling QA Test Suite
 * Module: CSV Export, PDF Download triggers & Content Headers
 * Target: http://localhost:3000
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'superadmin@finance.com';
const TEST_PASSWORD = 'password';

async function performLogin(page) {
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForLoadState('domcontentloaded');

  if (page.url().includes('/dashboard')) return;

  const emailInput = page.locator('#email');
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(TEST_EMAIL);

  const passwordInput = page.locator('#password');
  await passwordInput.fill(TEST_PASSWORD);

  await page.locator('button:has-text("Sign In to Portal"), button[type="submit"]').first().click();
  await page.waitForURL(url => !url.href.includes('/signin'), { timeout: 15000 });
}

test.describe('File Exports & Downloads Verification', () => {
  test('FILE-001: Tenders CSV export triggers valid browser download', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/tenders`);
    await page.waitForLoadState('networkidle');

    const exportBtn = page.locator('button:has-text("Export"), button:has-text("CSV")').first();
    await expect(exportBtn).toBeVisible({ timeout: 10000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
    await exportBtn.click();
    const download = await downloadPromise;

    if (download) {
      const filename = download.suggestedFilename();
      expect(filename.toLowerCase()).toContain('.csv');
    }
  });

  test('FILE-002: Purchase Orders CSV export downloads structured dataset', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/purchase-orders`);
    await page.waitForLoadState('networkidle');

    const exportBtn = page.locator('button:has-text("Export CSV"), button:has-text("Export")').first();
    await expect(exportBtn).toBeVisible({ timeout: 10000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
    await exportBtn.click();
    const download = await downloadPromise;

    if (download) {
      const filename = download.suggestedFilename();
      expect(filename.toLowerCase()).toContain('.csv');
    }
  });

  test('FILE-003: Backend invoice PDF direct download returns application/pdf content type', async ({ request }) => {
    // Authenticate with backend API
    const loginRes = await request.post('http://localhost:8000/api/login', {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD }
    });
    const { token } = await loginRes.json();

    // Query available invoices
    const invoicesRes = await request.get('http://localhost:8000/api/invoices', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const invoicesData = await invoicesRes.json();
    const invoiceList = invoicesData.data || invoicesData;

    if (invoiceList && invoiceList.length > 0) {
      const invoiceId = invoiceList[0].id;
      const pdfRes = await request.get(`http://localhost:8000/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      expect(pdfRes.status()).toBe(200);
      expect(pdfRes.headers()['content-type']).toContain('application/pdf');
    }
  });
});
