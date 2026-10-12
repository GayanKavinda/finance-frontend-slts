/**
 * ============================================================
 * SLT ProcureX - Visual Regression & Screenshot Baseline Suite
 * Module: Dashboard KPIs, Sidebars, Forms & Theme Snapshots
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

test.describe('Visual Regression & Snapshot Baselines', () => {
  test('VIS-001: Signin portal layout and branding visual integrity', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('networkidle');

    // Verify main card / container visual appearance
    const card = page.locator('form, .card, main').first();
    await expect(card).toBeVisible();

    // Capture visual snapshot of the signin box (allow small diff tolerance for font antialiasing across environments)
    await expect(page).toHaveScreenshot('signin-page-layout.png', {
      maxDiffPixelRatio: 0.15,
      animations: 'disabled',
    });
  });

  test('VIS-002: Main Dashboard header and executive KPI card layout snapshot', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Snapshot the top KPI / metrics section or header area
    const topBar = page.locator('header, nav, h1').first();
    await expect(topBar).toHaveScreenshot('dashboard-header-kpi.png', {
      maxDiffPixelRatio: 0.15,
      animations: 'disabled',
    });
  });

  test('VIS-003: Navigation sidebar visual structure snapshot', async ({ page }) => {
    await performLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar).toBeVisible();

    await expect(sidebar).toHaveScreenshot('navigation-sidebar.png', {
      maxDiffPixelRatio: 0.15,
      animations: 'disabled',
    });
  });
});
