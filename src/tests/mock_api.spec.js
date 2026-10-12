/**
 * ============================================================
 * SLT ProcureX - Mocked API Response Test Suite
 * Senior QA Engineer: Contract-driven UI verification with
 * intercepted /api traffic (happy path, 5xx, 401, 422,
 * latency, aborted connections, malformed payloads)
 * Target: http://localhost:3000 (all API calls mocked)
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const MOCK_USER = {
  id: 1,
  name: 'Mock Super Admin',
  email: 'superadmin@finance.com',
  permissions: [
    'manage-customers',
    'manage-tenders',
    'manage-jobs',
    'manage-pos',
    'manage-contractors',
    'submit-contractor-bill',
    'view-invoice',
    'manage-roles',
    'manage-users',
    'manage-system',
  ],
};

const MOCK_CUSTOMERS = {
  data: [
    { id: 7, name: 'Dialog Axiata PLC' },
    { id: 8, name: 'Sri Lanka Telecom' },
  ],
  meta: { total: 2, last_page: 1, current_page: 1 },
};

function mockTenders() {
  return [
    {
      id: 101,
      tender_number: 'MOCK-TND-001',
      name: 'Mock Optical Transmission Network',
      customer_id: 7,
      customer: { id: 7, name: 'Dialog Axiata PLC' },
      budget: 12000000,
      awarded_amount: 11500000,
      status: 'Awarded',
      jobs_count: 3,
      start_date: '2026-01-10',
      end_date: '2026-12-31',
      description: 'Mock scope for API contract verification',
    },
    {
      id: 102,
      tender_number: 'MOCK-TND-002',
      name: 'Mock Data Center Fit-out',
      customer_id: null,
      customer: null,
      budget: 8000000,
      awarded_amount: null,
      status: 'Open',
      jobs_count: 0,
      start_date: null,
      end_date: null,
      description: null,
    },
  ];
}

function fulfillJson(route, status, body, delay = 0) {
  const payload = { status, contentType: 'application/json', body: JSON.stringify(body) };
  if (delay > 0) {
    setTimeout(() => route.fulfill(payload).catch(() => {}), delay);
    return Promise.resolve();
  }
  return route.fulfill(payload);
}

/**
 * Installs a single dispatcher for every /api call so each test can
 * declaratively override individual endpoints (body, function, or fault).
 * Test-supplied routes take precedence over the built-in auth defaults.
 */
async function mockApi(page, { routes = {}, user = MOCK_USER } = {}) {
  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }));

  const defaults = {
    '/api/user': (route) =>
      user
        ? fulfillJson(route, 200, user)
        : fulfillJson(route, 401, { message: 'Unauthenticated.' }),
    '/api/login': (route) => fulfillJson(route, 200, user),
    '/api/logout': (route) => fulfillJson(route, 200, { message: 'Logged out.' }),
    '/api/register': (route) => fulfillJson(route, 201, user),
  };
  const handlers = { ...defaults, ...routes };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/\/+$/, '');
    const method = request.method();

    const handler = handlers[`${method} ${path}`] ?? handlers[path];
    if (typeof handler === 'function') return handler(route);
    if (handler !== undefined) return fulfillJson(route, 200, handler);

    return fulfillJson(route, 200, { data: [], meta: { total: 0, last_page: 1, current_page: 1 } });
  });
}

async function openApp(page, path) {
  // The mocked /api/user response makes the app treat this context as
  // authenticated, so protected routes render directly without a login POST.
  await page.goto(`${BASE_URL}${path}`);
  await expect(page.locator('nav').first()).toBeVisible({ timeout: 20000 });
}

test.describe('SLT ProcureX - Mocked API Suite', () => {
  test('MA-001: Tenders register renders the mocked API payload end-to-end', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': { data: mockTenders(), meta: { total: 2, last_page: 1, current_page: 1 } },
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=MOCK-TND-001')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=MOCK-TND-002')).toBeVisible();
    await expect(page.locator('text=Mock Optical Transmission Network')).toBeVisible();
    await expect(page.locator('text=Dialog Axiata PLC').first()).toBeVisible();
    await expect(page.locator('text=2 tenders')).toBeVisible();

    // Awarded amount is formatted with locale separators
    await expect(page.locator('td', { hasText: '11,500,000' }).first()).toBeVisible();
    console.log('✅ MA-001 PASS: Mocked tenders payload rendered with formatting and totals');
  });

  test('MA-002: Mocked 500 on tenders keeps the register in a safe empty state', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) => fulfillJson(route, 500, { message: 'Internal Server Error' }),
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No tenders found matching query')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Tenders');
    await expect(page.locator('button:has-text("Add Tender")')).toBeEnabled();
    console.log('✅ MA-002 PASS: 5xx response degrades gracefully to empty state');
  });

  test('MA-003: Mocked 401 on session check redirects visitors to sign-in', async ({ page }) => {
    await mockApi(page, { user: null });

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/signin/, { timeout: 15000 });
    await expect(page.locator('#email')).toBeVisible();
    console.log('✅ MA-003 PASS: 401 session check forces re-authentication');
  });

  test('MA-004: Mocked latency exposes the loading skeleton before data arrives', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) =>
          fulfillJson(route, 200, { data: mockTenders(), meta: { total: 2, last_page: 1 } }, 2500),
      },
    });

    await openApp(page, '/tenders');

    // Skeleton rows are rendered while the request is in flight
    await expect(page.locator('tbody tr.animate-pulse').first()).toBeVisible({ timeout: 8000 });

    // Once the delayed response resolves, real rows replace the skeleton
    await expect(page.locator('text=MOCK-TND-001')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('tbody tr.animate-pulse')).toHaveCount(0, { timeout: 10000 });
    console.log('✅ MA-004 PASS: Loading skeleton shown during latency, replaced by mock data');
  });

  test('MA-005: Mocked empty dataset renders the empty state', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': { data: [], meta: { total: 0, last_page: 1, current_page: 1 } },
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No tenders found matching query')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=0 tenders')).toBeVisible();
    console.log('✅ MA-005 PASS: Empty mocked dataset renders empty state with zero total');
  });

  test('MA-006: Mocked 422 on tender creation keeps the modal open with the server message', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': { data: [], meta: { total: 0, last_page: 1 } },
        'POST /api/tenders': (route) =>
          fulfillJson(route, 422, { message: 'The tender number has already been taken.' }),
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Tender")');
    // Scoped to the app's Radix dialog (the Next.js dev overlay also uses role=dialog)
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });

    await page.locator('input[placeholder*="TND-"]').fill('MOCK-TND-DUPLICATE');
    await page.locator('input[placeholder*="Highway"]').fill('Mock Duplicate Scope');
    await page.locator('button:has-text("Save Tender")').click();

    await page.waitForTimeout(2000);

    // Failed submission must not close the drawer nor navigate away
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/tenders/);
    console.log('✅ MA-006 PASS: 422 validation response keeps form open and unsaved');
  });

  test('MA-007: Mocked network failure (aborted request) does not break the register', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) => route.abort('failed'),
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No tenders found matching query')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Tenders');
    console.log('✅ MA-007 PASS: Aborted API call handled without page crash');
  });

  test('MA-008: Mocked malformed JSON payload does not crash the register', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) =>
          route.fulfill({ status: 200, contentType: 'application/json', body: '{invalid-json' }),
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No tenders found matching query')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("Add Tender")')).toBeEnabled();
    console.log('✅ MA-008 PASS: Malformed JSON response contained without runtime crash');
  });

  test('MA-009: Mocked 201 on tender creation closes the drawer and lists the new record', async ({ page }) => {
    const tenders = mockTenders();

    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) =>
          fulfillJson(route, 200, { data: tenders, meta: { total: tenders.length, last_page: 1, current_page: 1 } }),
        'POST /api/tenders': (route) => {
          tenders.push({
            id: 999,
            tender_number: 'MOCK-TND-NEW',
            name: 'Mock Created Scope',
            customer_id: 7,
            customer: { id: 7, name: 'Dialog Axiata PLC' },
            budget: 1500000,
            awarded_amount: null,
            status: 'Open',
            jobs_count: 0,
          });
          return fulfillJson(route, 201, { id: 999, tender_number: 'MOCK-TND-NEW' });
        },
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=MOCK-TND-NEW')).toHaveCount(0);

    await page.click('button:has-text("Add Tender")');
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });

    await page.locator('input[placeholder*="TND-"]').fill('MOCK-TND-NEW');
    await page.locator('input[placeholder*="Highway"]').fill('Mock Created Scope');
    await page.locator('button:has-text("Save Tender")').click();

    // Successful save closes the drawer and reloads the register
    await expect(dialog).toBeHidden({ timeout: 10000 });
    await expect(page.locator('text=MOCK-TND-NEW')).toBeVisible({ timeout: 15000 });
    console.log('✅ MA-009 PASS: 201 create response closes modal and refreshes register');
  });

  test('MA-010: Mocked delete removes the record through the confirmation dialog', async ({ page }) => {
    const tenders = mockTenders();

    await mockApi(page, {
      routes: {
        'GET /api/customers': MOCK_CUSTOMERS,
        'GET /api/tenders': (route) =>
          fulfillJson(route, 200, { data: tenders, meta: { total: tenders.length, last_page: 1, current_page: 1 } }),
        'DELETE /api/tenders/101': (route) => {
          tenders.shift();
          return fulfillJson(route, 200, { message: 'Tender deleted' });
        },
      },
    });

    await openApp(page, '/tenders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=MOCK-TND-001')).toBeVisible();

    await page.locator('button[title="Delete"]').first().click();
    await expect(page.locator('text=Delete Tender?')).toBeVisible({ timeout: 8000 });
    await page.locator('button:has-text("Delete")').last().click();

    await expect(page.locator('text=MOCK-TND-001')).toHaveCount(0, { timeout: 15000 });
    await expect(page.locator('text=MOCK-TND-002')).toBeVisible();
    console.log('✅ MA-010 PASS: Confirmed delete removes the record from the mocked register');
  });

  test('MA-011: Dashboard KPIs render from mocked executive summary endpoints', async ({ page }) => {
    await mockApi(page, {
      routes: {
        'GET /api/invoice-summary': { pending: 2, approved: 4 },
        'GET /api/executive-summary': {
          total_tender_value: 12500000,
          total_po_value: 8200000,
          gross_amount: 4100000,
          banked_amount: 2600000,
          pending_amount: 1500000,
        },
        'GET /api/invoices': {
          data: [
            {
              id: 1,
              invoice_number: 'MOCK-INV-001',
              customer: { id: 7, name: 'Dialog Axiata PLC' },
              gross_amount: 4100000,
              status: 'Approved',
            },
          ],
          meta: { total: 1, last_page: 1, current_page: 1 },
        },
        'GET /api/invoices/monthly-trend': [
          { month: 'Jan', total_amount: 1000000, paid_amount: 800000, pending_amount: 200000 },
          { month: 'Feb', total_amount: 1500000, paid_amount: 1200000, pending_amount: 300000 },
          { month: 'Mar', total_amount: 1600000, paid_amount: 1100000, pending_amount: 500000 },
        ],
        'GET /api/invoices/status-breakdown': [
          { status: 'Approved', count: 4 },
          { status: 'Draft', count: 2 },
        ],
        'GET /api/invoices/approval-velocity': [
          { day: 'Mon', hours: 12 },
          { day: 'Tue', hours: 15 },
          { day: 'Wed', hours: 9 },
        ],
        'GET /api/invoices/performance-metrics': [
          { metric: 'Collection', current: 88, target: 90 },
          { metric: 'Approval', current: 76, target: 80 },
        ],
      },
    });

    await openApp(page, '/dashboard');
    await page.waitForLoadState('networkidle');

    // Dismiss the session welcome popup if present
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    if ((await continueBtn.count()) > 0 && (await continueBtn.first().isVisible().catch(() => false))) {
      await continueBtn.first().click();
      await page.waitForTimeout(400);
    }

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Total Tender Portfolio')).toBeVisible();
    await expect(page.getByText('MOCK-INV-001')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Dialog Axiata PLC').first()).toBeVisible();

    // Count-up animation settles on the mocked executive values
    await expect(page.getByText('LKR 12,500,000.00')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('LKR 8,200,000.00')).toBeVisible();
    console.log('✅ MA-011 PASS: Dashboard KPI cards and ledger rendered from mocked endpoints');
  });

  test('MA-012: Login POST contract establishes a mocked session and lands on dashboard', async ({ page }) => {
    let authenticated = false;

    await mockApi(page, {
      routes: {
        // Session check rejects until the login contract succeeds
        '/api/user': (route) =>
          authenticated
            ? fulfillJson(route, 200, MOCK_USER)
            : fulfillJson(route, 401, { message: 'Unauthenticated.' }),
        'POST /api/login': (route) => {
          authenticated = true;
          return fulfillJson(route, 200, MOCK_USER);
        },
      },
    });

    await page.goto(`${BASE_URL}/signin`);
    await page.waitForLoadState('domcontentloaded');

    // The sign-in form only renders while the session check is rejected
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });

    await page.locator('#email').fill(MOCK_USER.email);
    await page.locator('#password').fill('mock-password');
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/dashboard/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 });
    console.log('✅ MA-012 PASS: Login POST contract establishes the mocked session');
  });
});
