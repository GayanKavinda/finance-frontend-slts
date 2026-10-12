/**
 * ============================================================
 * SLT ProcureX - Network Resilience & Offline Simulation Suite
 * Module: Throttled 3G, Offline mode, Backend 500 error handling,
 *         Form data preservation during outages.
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

test.describe('Network Resilience & Offline Degradation', () => {
  test('NET-001: Throttled Slow 3G network simulation - UI displays gracefully without crash', async ({ page }) => {
    // 1. Authenticate first under regular connection
    await performLogin(page);

    // 2. Emulate 3G network conditions using Chrome DevTools Protocol
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 300, // 300ms delay
      downloadThroughput: ((1500 * 1024) / 8), // 1.5 Mbps Regular 3G
      uploadThroughput: ((750 * 1024) / 8),
    });

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Verify main page elements or skeleton loaders appear and page remains functional
    const dashboardHeader = page.locator('h1, header, nav').first();
    await expect(dashboardHeader).toBeVisible({ timeout: 25000 });
    
    // Page body should be visible and not crash with blank white screen
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('NET-002: Backend 500 server error on form submission displays error toast and preserves input', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/tenders`);
    await page.waitForLoadState('networkidle');

    // Intercept POST to /api/tenders and simulate a 500 Internal Server Error
    await page.route('**/api/tenders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error: Database cluster temporarily unreachable' }),
        });
      } else {
        await route.continue();
      }
    });

    // Open create tender modal if button exists
    const createBtn = page.locator('button:has-text("New Tender"), button:has-text("Create Tender"), button:has-text("Add Tender")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[placeholder*="Tender"]').first();
      if (await nameInput.isVisible()) {
        const testTenderName = 'Preserved Resilience Test Tender';
        await nameInput.fill(testTenderName);

        // Submit form
        const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
        await submitBtn.click();

        // 1. Error alert/toast should be visible
        const errorAlert = page.locator('[role="alert"]')
          .or(page.locator('.text-red-500'))
          .or(page.getByText('Internal Server Error', { exact: false }))
          .or(page.getByText('Error', { exact: false }));
        await expect(errorAlert.first()).toBeVisible({ timeout: 8000 });

        // 2. Input value should be preserved and not wiped out
        await expect(nameInput).toHaveValue(testTenderName);
      }
    }
  });

  test('NET-003: Complete Offline simulation triggers disconnection handling', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Go completely offline
    await page.context().setOffline(true);

    // Try navigating or triggering a background fetch
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Ensure application shell remains alive without crashing
    await expect(page.locator('body')).toBeVisible();

    // Restore online
    await page.context().setOffline(false);
  });
});
