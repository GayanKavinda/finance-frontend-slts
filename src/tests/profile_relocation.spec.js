/**
 * ============================================================
 * SLT ProcureX - Profile & Settings Relocation E2E Test Suite
 * Module: Read-only profile page, profile modification in Settings
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

test.describe('Profile relocation & Settings ownership', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('PROFILE-001: Profile page is read-only — no editable inputs or save actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    // No editable form fields anywhere on the page
    const editable = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input:not([type="file"]), textarea, select')).filter(
        (el) => !el.disabled
      ).length
    );
    expect(editable).toBe(0);

    // No mutation buttons (save / upload / confirm change)
    const mutating = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).filter((b) =>
        /save changes|update profile|confirm change|^upload$/i.test((b.textContent || '').trim())
      ).length
    );
    expect(mutating).toBe(0);

    // Details are rendered
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByText('Personal Information').first()).toBeVisible();
  });

  test('PROFILE-002: "Edit in Settings" deep-links to the Settings account tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    await page.locator('a[href="/settings?tab=account"]').first().click();
    await page.waitForURL(/.*settings\?tab=account/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // The full profile modification panel is present
    await expect(page.getByText('Profile Photo').first()).toBeVisible();
    await expect(page.getByText('Personal Information').first()).toBeVisible();
    await expect(page.getByText('Change Email Address').first()).toBeVisible();
    await expect(page.getByText('Change Password').first()).toBeVisible();
  });

  test('PROFILE-003: Profile security tab links to Settings security', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Security")').first().click();
    await page.waitForTimeout(700);
    await expect(page.getByText('Two-factor authentication').first()).toBeVisible();
    await expect(page.getByText('Active sessions').first()).toBeVisible();

    await page.locator('a[href="/settings?tab=security"]').first().click();
    await page.waitForURL(/.*settings\?tab=security/, { timeout: 15000 });
    await expect(page.getByText('Two-Factor Authentication (2FA)').first()).toBeVisible();
  });

  test('PROFILE-004: Activity log stays on the profile page', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Activity")').first().click();
    await page.waitForTimeout(900);
    // Activity tab renders (table or empty state) with no edit affordances
    const frames = await page.evaluate(
      () => document.querySelectorAll('table, [class*="empty"], [class*="rounded-xl"]').length
    );
    expect(frames).toBeGreaterThan(0);
    const editable = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input:not([type="file"]), textarea, select')).filter(
        (el) => !el.disabled
      ).length
    );
    expect(editable).toBe(0);
  });
});
