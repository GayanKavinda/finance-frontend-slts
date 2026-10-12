/**
 * ============================================================
 * SLT ProcureX - Accessibility (WCAG 2.1 AA) Test Suite
 * Senior QA Engineer: Semantic structure, keyboard operability,
 * focus management, labelling, live regions, colour contrast
 * Target: http://localhost:3000
 * Seeded User: superadmin@finance.com / password
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'superadmin@finance.com';
const TEST_PASSWORD = 'password';

// Reusable login helper (same credentials/flow as qa_full_suite.spec.js).
// Verifies the session was actually established and retries once so a
// transient backend hiccup does not cascade into confusing downstream failures.
async function login(page) {
  const currentUrl = page.url();
  const onAuthPage = currentUrl.includes('/signin') || currentUrl.includes('/signup');

  if (!onAuthPage && currentUrl.startsWith(BASE_URL)) {
    const hasSignInHeading = await page.locator('text=Sign in to your account, h1:has-text("Financial Intelligence")').isVisible().catch(() => false);
    const hasNav = await page.locator('header, nav, aside').first().isVisible().catch(() => false);
    if (hasNav && !hasSignInHeading) {
      return;
    }
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/dashboard')) {
      return;
    }

    const emailInput = page.locator('#email');
    await emailInput.waitFor({ state: 'visible', timeout: 20000 });
    await emailInput.fill(TEST_EMAIL);

    const passwordInput = page.locator('#password');
    await passwordInput.fill(TEST_PASSWORD);

    await page.locator('button:has-text("Sign In to Portal"), button[type="submit"]').first().click();

    // A successful login always navigates away from /signin to the app shell
    const authenticated = await page
      .waitForURL((url) => !url.href.includes('/signin'), { timeout: 12000 })
      .then(() => true)
      .catch(() => false);

    if (authenticated) {
      await page.waitForTimeout(1000);
      return;
    }

    if (attempt === 1) {
      console.log('ℹ️  Login attempt 1 did not establish a session - retrying once');
      await page.waitForTimeout(2000);
      continue;
    }

    throw new Error(
      'Login failed: the app stayed on /signin after submitting valid credentials (backend not accepting login)',
    );
  }
}

// Navigates to a protected route and tolerates one transient session-check
// bounce to /signin (dev backend hiccup) by re-verifying the session cookie.
async function openRouteAuthenticated(page, path) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto(`${BASE_URL}${path}`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes(path)) {
      return;
    }
    if (attempt === 1) {
      console.log(`ℹ️  Session check transiently failed on ${path} - settling before retry`);
      await page.waitForTimeout(3000);
    }
  }
}

async function dismissWelcomePopup(page) {
  // The popup appears on a ~400ms timer after the session resolves, so wait for
  // it briefly instead of checking once (a later appearance would otherwise
  // inject its h2 into any heading audit that runs first)
  const continueBtn = page.getByRole('button', { name: 'Continue' });
  try {
    await continueBtn.first().waitFor({ state: 'visible', timeout: 3000 });
    await continueBtn.first().click();
    await page.waitForTimeout(600);
  } catch {
    // Popup not shown this session - nothing to dismiss
  }
}

async function describeActiveElement(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      type: el.getAttribute('type') || '',
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      inDialog: !!el.closest('[role="dialog"]'),
    };
  });
}

test.describe('SLT ProcureX - Accessibility Suite', () => {
  // ─────────────────────────────────────────────────────────────
  // DOCUMENT SEMANTICS & LABELLING
  // ─────────────────────────────────────────────────────────────

  test('AX-001: Document declares its primary language', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('en');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    console.log(`✅ AX-001 PASS: lang="en" declared, document titled "${title}"`);
  });

  test('AX-002: Sign-in form controls have programmatic labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('label[for="email"]')).toHaveText(/Work Email/);
    await expect(page.locator('label[for="password"]')).toHaveText(/^Password$/);
    await expect(page.locator('label[for="remember-device"]')).toHaveText(/Maintain secure session/);

    await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    await expect(page.locator('#remember-device')).toHaveAttribute('type', 'checkbox');
    console.log('✅ AX-002 PASS: Every sign-in control is programmatically labelled');
  });

  test('AX-003: Sign-in page exposes the expected landmark regions', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    console.log('✅ AX-003 PASS: header / nav / main / footer landmarks present');
  });

  test('AX-004: All content images expose alt attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('networkidle');

    const audit = await page.evaluate(() => {
      const images = Array.from(document.images);
      return {
        total: images.length,
        missingAlt: images.filter((img) => img.getAttribute('alt') === null).length,
        emptyAlt: images.filter((img) => img.getAttribute('alt') === '').length,
      };
    });

    expect(audit.total).toBeGreaterThan(0);
    expect(audit.missingAlt).toBe(0);
    expect(audit.emptyAlt).toBe(0);
    await expect(page.locator('img[alt="SLT Digital Logo"]').first()).toBeAttached();
    console.log(`✅ AX-004 PASS: ${audit.total} images audited, all carry meaningful alt text`);
  });

  test('AX-005: Sign-in form follows a logical keyboard tab order', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('#email').focus();
    expect((await describeActiveElement(page))?.id).toBe('email');

    await page.keyboard.press('Tab');
    expect((await describeActiveElement(page))?.text).toBe('Forgot Password?');

    await page.keyboard.press('Tab');
    expect((await describeActiveElement(page))?.id).toBe('password');

    await page.keyboard.press('Tab');
    expect((await describeActiveElement(page))?.id).toBe('remember-device');

    await page.keyboard.press('Tab');
    expect((await describeActiveElement(page))?.text).toContain('Sign In to Portal');
    console.log('✅ AX-005 PASS: Tab order: email -> forgot link -> password -> remember -> submit');
  });

  test('AX-006: Focused text inputs render a visible focus indicator', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('#email').focus();
    const indicator = await page.evaluate(() => {
      const el = document.activeElement;
      const style = window.getComputedStyle(el);
      return { boxShadow: style.boxShadow, outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle };
    });

    const hasRing = indicator.boxShadow && indicator.boxShadow !== 'none';
    const hasOutline = indicator.outlineStyle !== 'none' && indicator.outlineWidth !== '0px';
    expect(hasRing || hasOutline).toBe(true);
    console.log(`✅ AX-006 PASS: Focus indicator rendered (box-shadow: ${indicator.boxShadow !== 'none'})`);
  });

  test('AX-007: Sign-in interactive controls all have accessible names', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('networkidle');

    const unnamed = await page.locator('button, a').evaluateAll((els) =>
      els
        .map((el, i) => {
          const imgAlt = el.querySelector('img[alt]:not([alt=""])')?.getAttribute('alt') || '';
          const name = (
            el.getAttribute('title') ||
            el.getAttribute('aria-label') ||
            imgAlt ||
            el.textContent ||
            ''
          ).trim();
          return { i, name, tag: el.tagName.toLowerCase() };
        })
        .filter((entry) => !entry.name),
    );

    expect(unnamed).toEqual([]);
    console.log('✅ AX-007 PASS: Every button and link on the sign-in page is nameable');
  });

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATED APP SHELL
  // ─────────────────────────────────────────────────────────────

  test('AX-008: Dashboard exposes landmarks and a single top-level heading', async ({ page }) => {
    await login(page);
    await openRouteAuthenticated(page, '/dashboard');
    // Wait for the dashboard to finish loading its KPI data (skeleton has no h1)
    await expect(page.locator('h1')).toHaveText('Dashboard', { timeout: 20000 });

    // The session welcome popup renders an h2 ahead of the page heading - it
    // must be dismissed before the heading outline is audited
    await dismissWelcomePopup(page);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toHaveCount(0, { timeout: 5000 });

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Heading outline must start at h1 and never skip a level
    const outline = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((els) =>
        els.map((el) => ({ level: Number(el.tagName.charAt(1)), text: (el.textContent || '').trim().slice(0, 40) })),
      );

    expect(outline.length).toBeGreaterThan(0);
    expect(outline[0].level).toBe(1);
    expect(outline.filter((heading) => heading.level === 1)).toHaveLength(1);
    for (let i = 1; i < outline.length; i++) {
      expect(outline[i].level - outline[i - 1].level).toBeLessThanOrEqual(1);
    }
    console.log(`✅ AX-008 PASS: Landmarks present, heading outline starts at single h1 (${outline.length} headings)`);
  });

  test('AX-009: Sidebar navigation links are discernible to assistive tech', async ({ page }) => {
    await login(page);
    await openRouteAuthenticated(page, '/dashboard');
    await dismissWelcomePopup(page);

    const links = page.locator('nav a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const unnamed = await links.evaluateAll((els) =>
      els
        .map((el, i) => {
          const imgAlt = el.querySelector('img[alt]:not([alt=""])')?.getAttribute('alt') || '';
          const name = (
            el.getAttribute('title') ||
            el.getAttribute('aria-label') ||
            imgAlt ||
            el.textContent ||
            ''
          ).trim();
          return { i, name };
        })
        .filter((entry) => !entry.name),
    );

    expect(unnamed).toEqual([]);
    console.log(`✅ AX-009 PASS: All ${count} navigation links expose accessible names`);
  });

  test('AX-010: Data table exposes row/column semantics and header cells', async ({ page }) => {
    await login(page);
    await openRouteAuthenticated(page, '/tenders');

    const headers = page.locator('table thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(7);

    const emptyHeaders = await headers.evaluateAll((els) =>
      els.map((el) => (el.textContent || '').trim()).filter((text) => !text),
    );
    expect(emptyHeaders).toEqual([]);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount > 0) {
      // Action icon buttons carry title attributes for accessible names
      await expect(page.locator('button[title="Edit"]').first()).toBeVisible();
      await expect(page.locator('button[title="Delete"]').first()).toBeVisible();

      const unnamedTableButtons = await page.locator('table button').evaluateAll((els) =>
        els
          .map((el, i) => ({ i, name: (el.getAttribute('title') || el.textContent || '').trim() }))
          .filter((entry) => !entry.name),
      );
      expect(unnamedTableButtons).toEqual([]);
      console.log(`✅ AX-010 PASS: ${headerCount} labelled header cells; all row action buttons nameable (${rowCount} rows)`);
    } else {
      console.log('ℹ️  AX-010: Register empty - header semantics verified, action buttons not rendered');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // DIALOG & FOCUS MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  test('AX-011: Modal dialog exposes dialog semantics, focus containment and Escape close', async ({ page }) => {
    await login(page);
    await openRouteAuthenticated(page, '/tenders');

    await page.click('button:has-text("Add Tender")');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Radix wires the dialog to its heading via aria-labelledby
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(dialog.locator(`[id="${labelledBy}"]`)).toHaveText('New Tender');

    // The close control exposes an accessible name (sr-only text)
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();

    // Focus is moved into the dialog on open and stays trapped inside it
    let focus = await describeActiveElement(page);
    expect(focus?.inDialog).toBe(true);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      focus = await describeActiveElement(page);
      expect(focus?.inDialog).toBe(true);
    }

    // Escape dismisses the dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 8000 });
    console.log('✅ AX-011 PASS: Dialog is labelled, focus-trapped, and keyboard dismissible');
  });

  // ─────────────────────────────────────────────────────────────
  // LIVE REGIONS & CONTRAST
  // ─────────────────────────────────────────────────────────────

  test('AX-012: Error announcements are exposed through an ARIA live region', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('#email').fill(TEST_EMAIL);
    await page.locator('#password').fill('wrong-password-for-a11y-check');
    await page.locator('button[type="submit"]').click();

    const toast = page.getByText(/Invalid email or password|Login failed/).first();
    await expect(toast).toBeVisible({ timeout: 15000 });

    const liveRegionMatch = await page.evaluate(() => {
      const messages = ['Invalid email or password', 'Login failed'];
      const nodes = Array.from(
        document.querySelectorAll('[aria-live], [role="alert"], [role="status"]'),
      );
      return nodes.filter((node) =>
        messages.some((message) => (node.textContent || '').includes(message)),
      ).length;
    });

    expect(liveRegionMatch).toBeGreaterThan(0);
    console.log('✅ AX-012 PASS: Error toast announced via ARIA live region');
  });

  test('AX-013: Dashboard text meets WCAG AA contrast ratios', async ({ page }) => {
    await login(page);
    await openRouteAuthenticated(page, '/dashboard');

    // Wait for the dashboard content to settle before sampling colours
    await expect(page.locator('h1')).toHaveText('Dashboard', { timeout: 20000 });
    await dismissWelcomePopup(page);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toHaveCount(0, { timeout: 5000 });

    const results = await page.evaluate(() => {
      const toRgb = (color) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillStyle = color;
        const normalized = ctx.fillStyle;
        if (normalized.startsWith('#')) {
          return {
            r: parseInt(normalized.slice(1, 3), 16),
            g: parseInt(normalized.slice(3, 5), 16),
            b: parseInt(normalized.slice(5, 7), 16),
          };
        }
        const parts = normalized.match(/[\d.]+/g).map(Number);
        return { r: parts[0], g: parts[1], b: parts[2] };
      };

      const luminance = ({ r, g, b }) => {
        const channel = (value) => {
          const v = value / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };

      const contrast = (fg, bg) => {
        const l1 = luminance(toRgb(fg));
        const l2 = luminance(toRgb(bg));
        const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (light + 0.05) / (dark + 0.05);
      };

      const effectiveBackground = (element) => {
        let node = element;
        while (node) {
          const bg = window.getComputedStyle(node).backgroundColor;
          if (bg && bg !== 'transparent' && !bg.startsWith('rgba(0, 0, 0, 0)')) {
            return bg;
          }
          node = node.parentElement;
        }
        return window.getComputedStyle(document.body).backgroundColor || '#ffffff';
      };

      const measure = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
          selector,
          ratio: contrast(style.color, effectiveBackground(el)),
          fontSize: parseFloat(style.fontSize),
          sample: (el.textContent || '').trim().slice(0, 40),
        };
      };

      // Primary text pairs: heading, subtitle on the page background,
      // and muted label text on a raised card surface
      return [
        measure('main h1'),
        measure('main h1 + p'),
        measure('main [data-slot="card"] p.text-muted-foreground'),
      ].filter(Boolean);
    });

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      console.log(
        `  → "${result.sample}" (${result.fontSize}px) contrast ${result.ratio.toFixed(2)}:1`,
      );
      // WCAG 2.1 AA: 4.5:1 for normal-size text
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    }
    console.log('✅ AX-013 PASS: Measured text pairs meet WCAG AA contrast');
  });
});
