/**
 * ============================================================
 * SLT ProcureX - Settings Profile Media & Email-Change Suite
 * Module: avatar crop modal, OTP email change, panel robustness
 * Target: http://localhost:3000
 * Seeded User: admin@finance.com / password
 *
 * Regression coverage for the ImageCropModal TypeError
 * ("Cannot read properties of undefined (reading 'split')") that
 * occurred when imageData lacked type/size.
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@finance.com';
const TEST_PASSWORD = 'password';

// Minimal valid 10x10 PNG used purely as a crop source
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJUlEQVR42mNkYPjPQAxgHFUGIIooY/D7vynrAf/UCsRIBBgAlEcUAVQTVXf7AAAAAElFTkSuQmCC',
  'base64'
);

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

async function openAccountTab(page) {
  await page.goto(`${BASE_URL}/settings?tab=account`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await expect(page.getByText('Profile Photo').first()).toBeVisible();
}

test.describe('Settings — profile photo & email change', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('SET-001: Crop modal opens from a real file without a runtime TypeError', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await openAccountTab(page);

    await page
      .locator('#settings-avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES });
    await page.waitForTimeout(1200);

    // The dialog renders — previously this crashed on imageData.type.split()
    await expect(page.getByRole('heading', { name: 'Adjust Profile Picture' })).toBeVisible();
    await expect(page.getByText('File Details')).toBeVisible();

    expect(errors, `runtime errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('SET-002: Crop modal shows real file details (name, size, type)', async ({ page }) => {
    await openAccountTab(page);

    await page
      .locator('#settings-avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES });
    await page.waitForTimeout(1200);

    await expect(page.locator('[title="avatar.png"]')).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)?\s*KB/).first()).toBeVisible();
    // Type comes from the real MIME type (rendered uppercase via CSS)
    await expect(page.getByText(/png/i).first()).toBeVisible();
  });

  test('SET-003: Crop → Save Picture enables upload and posts to the API', async ({ page }) => {
    const uploads = [];
    page.on('response', (r) => {
      if (r.url().includes('/upload-avatar')) uploads.push(r.status());
    });

    await openAccountTab(page);

    await page
      .locator('#settings-avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES });
    await page.waitForTimeout(1200);

    await page.locator('button:has-text("Save Picture")').click();
    await page.waitForTimeout(1600);

    const uploadBtn = page.locator('button:has-text("Upload")');
    await expect(uploadBtn).toBeEnabled();

    await uploadBtn.click();
    await page.waitForTimeout(3000);

    expect(uploads.length, `upload responses: ${uploads.join(',')}`).toBeGreaterThan(0);
    expect(uploads[0]).toBe(200);
    await expect(page.getByText(/updated/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('SET-004: Email change requires the current password before sending a code', async ({ page }) => {
    await openAccountTab(page);

    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill('new.address@slt.lk');

    // No password supplied → the Send code action must not proceed
    await page.locator('button:has-text("Send code")').first().click();
    await page.waitForTimeout(1200);
    await expect(page.getByText(/required/i).first()).toBeVisible();

    // The OTP confirmation row must not have appeared
    await expect(page.locator('button:has-text("Confirm change")')).toHaveCount(0);
  });

  test('SET-005: Verification code accepts digits only and caps at 6 characters', async ({ page }) => {
    await openAccountTab(page);

    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill('new.address@slt.lk');
    await page.locator('input[type="password"]').first().fill('password');
    await page.locator('button:has-text("Send code")').first().click();
    await page.waitForTimeout(1500);

    const confirmBtn = page.locator('button:has-text("Confirm change")');
    await expect(confirmBtn).toBeVisible();

    // The OTP input strips non-digits and enforces maxLength 6
    const otpInput = page.locator('input[maxlength="6"]').first();
    await otpInput.fill('abc12345xyz');
    const value = await otpInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(6);
    expect(value).not.toMatch(/[a-z]/i);
  });

  test('SET-006: Crop modal can be cancelled without disturbing settings', async ({ page }) => {
    await openAccountTab(page);
    const nameInput = page.locator('input[placeholder="Your name"]').first();
    const nameBefore = await nameInput.inputValue();

    await page
      .locator('#settings-avatar-input')
      .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_BYTES });
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Adjust Profile Picture' })).toHaveCount(0);
    // Settings panel still intact
    await expect(page.getByText('Personal Information')).toBeVisible();
    await expect(nameInput).toHaveValue(nameBefore);
  });
});
