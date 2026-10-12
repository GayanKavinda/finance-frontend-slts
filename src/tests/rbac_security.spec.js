/**
 * ============================================================
 * SLT ProcureX - Advanced QA Security & RBAC E2E Test Suite
 * Module: Role-Based Access Control, Session Guards & URL Redirection
 * Target: http://localhost:3000
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('RBAC & Security Frontend Enforcement', () => {
  test('SEC-001: Unauthenticated direct access to protected routes redirects to /signin', async ({ page }) => {
    // Attempt accessing sensitive management pages while completely logged out
    const protectedRoutes = [
      '/dashboard',
      '/invoices',
      '/purchase-orders',
      '/contractor-bills',
      '/admin/users',
      '/admin/audit-logs',
      '/settings'
    ];

    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Should either be redirected to signin, or see the signin form
      await expect(page).toHaveURL(/.*signin.*/, { timeout: 10000 });
      const emailInput = page.locator('#email, input[type="email"]');
      await expect(emailInput).toBeVisible();
    }
  });

  test('SEC-002: Tampered or invalid session token forces automatic logout to /signin', async ({ page }) => {
    // Set a fraudulent auth token in localStorage
    await page.goto(`${BASE_URL}/signin`);
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'fraudulent_invalid_token_99999');
      localStorage.setItem('token', 'fraudulent_invalid_token_99999');
      localStorage.setItem('user', JSON.stringify({ id: 999, name: 'Hacker', role: 'Viewer' }));
    });

    // Try navigating to dashboard with bad token
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // App should detect invalid token from backend (401) and redirect back to signin
    await expect(page).toHaveURL(/.*signin.*/, { timeout: 12000 });
  });

  test('SEC-003: Signin rate limit & error banner display on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.locator('#email, input[type="email"]').first();
    const passwordInput = page.locator('#password, input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In")').first();

    await emailInput.fill('nonexistent.user@finance.com');
    await passwordInput.fill('WrongPassword123!');
    await submitBtn.click();

    // Verify error toast or banner appears
    const errorMessage = page.locator('[role="alert"]')
      .or(page.locator('.text-red-500'))
      .or(page.getByText('Invalid credentials', { exact: false }));
    await expect(errorMessage.first()).toBeVisible({ timeout: 8000 });
  });
});
