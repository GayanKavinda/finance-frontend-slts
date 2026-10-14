/**
 * ============================================================
 * SLT ProcureX - Account Danger Zone E2E Test Suite
 * Module: self-service account deactivation & permanent deletion
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

test.describe('Account danger zone (Settings → Security)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/settings?tab=security`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('DANGER-001: Danger Zone renders both self-service actions', async ({ page }) => {
    await expect(page.getByText('Danger Zone').first()).toBeVisible();
    await expect(page.getByText('Deactivate Account').first()).toBeVisible();
    await expect(page.getByText('Delete Account Permanently').first()).toBeVisible();
    await expect(page.locator('button:has-text("Deactivate")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Delete forever")').first()).toBeVisible();
  });

  test('DANGER-002: Deactivate opens a confirmation that explains the 30-day restore', async ({ page }) => {
    await page.locator('button:has-text("Deactivate")').first().click();
    await page.waitForTimeout(500);

    const dialog = page.locator('h3:has-text("Deactivate Account?")');
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/request a restore within 30 days/i)).toBeVisible();

    // Cancel leaves the account untouched
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(500);
    await expect(dialog).toHaveCount(0);
    // Still authenticated, panel intact
    await expect(page.getByText('Two-Factor Authentication (2FA)')).toBeVisible();
  });

  test('DANGER-003: Permanent deletion warns it cannot be undone', async ({ page }) => {
    await page.locator('button:has-text("Delete forever")').first().click();
    await page.waitForTimeout(500);

    const dialog = page.locator('h3:has-text("Delete Account Permanently?")');
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/permanently deleted/i)).toBeVisible();
    await expect(page.getByText('This cannot be undone')).toBeVisible();

    // Cancel aborts — no destructive request is sent
    let deleted = false;
    page.on('request', (r) => {
      if (r.url().includes('/permanent-delete-account')) deleted = true;
    });
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(600);
    await expect(dialog).toHaveCount(0);
    expect(deleted).toBe(false);
  });

  test('DANGER-005: Permanent deletion requires typing DELETE (type-to-confirm)', async ({ page }) => {
    await page.locator('button:has-text("Delete forever")').first().click();
    await page.waitForTimeout(600);

    const confirmBtn = page.locator('button:has-text("Delete forever")').last();

    // Step 1 of 2 — the dialog intentionally does not enable the action.
    await expect(confirmBtn).toBeDisabled();

    // Case-sensitive: partial and wrong-case input stays locked.
    const input = page.locator('input[placeholder="DELETE"]');
    await expect(input).toBeVisible();

    await input.fill('DEL');
    await expect(confirmBtn).toBeDisabled();

    await input.fill('delete');
    await expect(confirmBtn).toBeDisabled();
    await expect(page.getByText(/exactly match/i)).toBeVisible();

    // Step 2 of 2 — an exact match unlocks the destructive action.
    await input.fill('DELETE');
    await expect(confirmBtn).toBeEnabled();

    // Cancelling resets the gate — reopening starts at step 1 again.
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Delete forever")').first().click();
    await page.waitForTimeout(600);
    await expect(page.locator('button:has-text("Delete forever")').last()).toBeDisabled();
  });

  test('DANGER-006: Reversible deactivation is not gated by type-to-confirm', async ({ page }) => {
    await page.locator('button:has-text("Deactivate")').first().click();
    await page.waitForTimeout(500);

    // Deactivation recovers within 30 days, so it needs no extra friction.
    await expect(page.locator('h3:has-text("Deactivate Account?")')).toBeVisible();
    await expect(page.locator('input[placeholder="DELETE"]')).toHaveCount(0);
    await expect(page.locator('button:has-text("Deactivate")').last()).toBeEnabled();
  });

  test('DANGER-004: Confirmations are reachable from the security tab deep link', async ({ page }) => {
    // Deep link lands directly on the security tab (used by the profile page)
    await page.goto(`${BASE_URL}/settings?tab=security`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    await expect(page.getByText('Danger Zone').first()).toBeVisible();
  });
});
