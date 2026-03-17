/**
 * Shared helpers for Wanderlog E2E tests
 */

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'test@wanderlog.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

/**
 * Log in via the auth overlay form.
 * Waits for the overlay to disappear before resolving.
 */
async function login(page) {
  await page.goto('/');
  const overlay = page.locator('#lockOverlay');

  // If already logged in, overlay won't be visible
  if (await overlay.isHidden()) return;

  await page.fill('#authEmail',    TEST_EMAIL);
  await page.fill('#authPassword', TEST_PASSWORD);
  await page.click('#authBtn');
  await overlay.waitFor({ state: 'hidden', timeout: 15_000 });
}

/**
 * Sign out via the lock button in the nav.
 */
async function logout(page) {
  await page.click('#lockBtn');
  await page.locator('#lockOverlay').waitFor({ state: 'visible', timeout: 8_000 });
}

/**
 * Click a nav tab by its visible label text.
 */
async function goToTab(page, label) {
  await page.locator('.nav-btn', { hasText: label }).first().click();
}

/**
 * Dismiss the success modal if it's open.
 */
async function dismissSuccess(page) {
  const modal = page.locator('#successModal.open');
  if (await modal.isVisible()) {
    await modal.locator('button').click();
  }
}

export { login, logout, goToTab, dismissSuccess, TEST_EMAIL, TEST_PASSWORD };
