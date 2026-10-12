/**
 * ============================================================
 * SLT ProcureX - Responsive, Viewports & Device QA Test Suite
 * Module: Mobile (390x844), Tablet (768x1024), Desktop (1920x1080)
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

test.describe('Responsive & Cross-Device Layout Tests', () => {
  test('RESP-001: Mobile Viewport (iPhone 13 - 390x844) renders without horizontal body overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await performLogin(page);

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Assert that the page does not produce horizontal scrollbar on body
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Assert mobile header or hamburger menu is available
    const mobileHeaderOrNav = page.locator('header, nav, button:has(svg)').first();
    await expect(mobileHeaderOrNav).toBeVisible();
  });

  test('RESP-002: Tablet Viewport (iPad - 768x1024) scales metrics and data tables', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await performLogin(page);

    await page.goto(`${BASE_URL}/tenders`);
    await page.waitForLoadState('networkidle');

    // Header and table controls should fit properly
    await expect(page.locator('h1')).toBeVisible();
    const searchBar = page.locator('input[placeholder*="Search"]').first();
    await expect(searchBar).toBeVisible();
  });

  test('RESP-003: Desktop Viewport (1920x1080) renders expanded multi-column dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await performLogin(page);

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Assert executive metrics grid is visible
    await expect(page.locator('text=Total Tender Portfolio')).toBeVisible();
    
    // Sidebar should be expanded by default on wide screens
    const sidebar = page.locator('aside, nav').first();
    await expect(sidebar).toBeVisible();
  });
});
