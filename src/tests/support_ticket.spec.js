/**
 * ============================================================
 * SLT ProcureX - Help Center & Support Ticket E2E Test Suite
 * Module: FAQ search, Resources, ticket submission, My Tickets
 * Target: http://localhost:3000
 * Seeded User: admin@finance.com / password
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@finance.com';
const TEST_PASSWORD = 'password';

async function login(page) {
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.locator('#email, input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(TEST_EMAIL);
  await page.locator('#password, input[type="password"]').first().fill(TEST_PASSWORD);

  await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
  await page.waitForURL((url) => !url.href.includes('/signin'), { timeout: 20000 });
}

test.describe('Help Center & Support Tickets', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('HELP-001: Help Center renders FAQs, contacts and resources', async ({ page }) => {
    await page.goto(`${BASE_URL}/help`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Help Center")')).toBeVisible();
    // Quick contact cards with real support details
    await expect(page.getByText('finance-support@sltdigital.lk').first()).toBeVisible();
    // FAQ accordion — expand an article and confirm the answer renders
    const faqButton = page.locator('button:has-text("What does the dashboard show?")').first();
    await faqButton.click();
    await expect(page.getByText(/executive summary/i).first()).toBeVisible();
  });

  test('HELP-002: FAQ search filters articles and empty state shows', async ({ page }) => {
    await page.goto(`${BASE_URL}/help`);
    await page.waitForLoadState('networkidle');

    const search = page.locator('input[placeholder*="Search help articles"]');
    await search.fill('tax invoice');
    await page.waitForTimeout(400);
    await expect(page.locator('button:has-text("tax invoice")').first()).toBeVisible();

    await search.fill('zzzz-no-such-article-zzzz');
    await page.waitForTimeout(400);
    await expect(page.getByText('No articles found')).toBeVisible();
  });

  test('HELP-003: Documentation library links every document', async ({ page }) => {
    await page.goto(`${BASE_URL}/help/docs`);
    await page.waitForLoadState('networkidle');

    for (const href of ['/help/guides', '/help/docs/api', '/help/docs/testing', '/help/docs/setup']) {
      await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
    }
    // Walkthrough opens from the featured card
    await page.locator('main a[href="/help/guides"]').first().click();
    await page.waitForURL(/.*help\/guides/, { timeout: 15000 });
    await expect(page.locator('h1:has-text("System Walkthrough Guide")')).toBeVisible();
  });

  test('HELP-004: Submitting a support ticket assigns a TKT number and lists it', async ({ page }) => {
    await page.goto(`${BASE_URL}/help`);
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Submit Support Ticket")').first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Category + priority selects (values stay English for the API)
    await dialog.locator('[role="combobox"]').first().click();
    await page.locator('[role="option"]:has-text("Purchase Orders")').click();
    await dialog.locator('[role="combobox"]').nth(1).click();
    await page.locator('[role="option"]:has-text("High")').click();

    const uniqueSubject = `E2E support ticket ${Date.now()}`;
    await dialog.locator('input').first().fill(uniqueSubject);
    await dialog.locator('textarea').first().fill('Automated Playwright verification of the Help Center ticket flow.');

    await dialog.locator('button:has-text("Submit Ticket")').click();

    // Success toast carries the assigned ticket number
    await expect(page.getByText(/TKT-\d{4}-\d{4}/).first()).toBeVisible({ timeout: 10000 });

    // Ticket appears in My Support Tickets with an Open status
    await page.waitForTimeout(1200);
    await expect(page.getByText(uniqueSubject)).toBeVisible();
    await expect(page.getByText('Open').first()).toBeVisible();
  });

  test('HELP-005: Validation blocks an empty ticket submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/help`);
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Submit Support Ticket")').first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Submit Ticket")').click();
    await expect(page.getByText('Subject and description are required')).toBeVisible({ timeout: 8000 });
  });
});
