/**
 * Shared helpers for Wanderlog E2E tests
 */

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'test@wanderlog.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

/**
 * Log in via the auth overlay form.
 * Retries up to 3 times with backoff to handle Supabase rate-limiting
 * when many tests run in quick succession.
 */
async function login(page) {
  await page.goto('/');
  const overlay = page.locator('#lockOverlay');

  // If already logged in, overlay won't be visible
  if (await overlay.isHidden()) return;

  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.fill('#authEmail',    TEST_EMAIL);
    await page.fill('#authPassword', TEST_PASSWORD);
    await page.click('#authBtn');
    try {
      await overlay.waitFor({ state: 'hidden', timeout: 20_000 });
      return; // success
    } catch (e) {
      if (attempt === 3) throw e;
      // Back off before retrying — Supabase rate-limits rapid auth calls
      await page.waitForTimeout(4_000 * attempt);
      // Re-navigate so the form is clean for the next attempt
      await page.goto('/');
      await overlay.waitFor({ state: 'visible', timeout: 5_000 });
    }
  }
}

/**
 * Sign out via the lock button in the nav.
 */
async function logout(page) {
  await page.click('#navSignOutBtn');
  await page.locator('#lockOverlay').waitFor({ state: 'visible', timeout: 8_000 });
}

/**
 * Click a nav tab by its visible label text.
 * On desktop the #navLinks bar is used; on mobile (≤760px) the
 * hamburger + #mobileNav is used instead.
 */
async function goToTab(page, label) {
  const navLinks = page.locator('#navLinks');
  const isDesktop = await navLinks.isVisible();

  if (isDesktop) {
    await page.locator('#navLinks .nav-link', { hasText: label }).first().click();
  } else {
    // Open hamburger menu if not already open
    const mobileNav = page.locator('#mobileNav');
    const isOpen = await mobileNav.evaluate(el => el.classList.contains('open'));
    if (!isOpen) {
      await page.locator('#hamburger').click();
      await mobileNav.waitFor({ state: 'visible', timeout: 3_000 });
    }
    await page.locator('#mobileNav .nav-link', { hasText: label }).first().click();
  }
  await page.waitForTimeout(300);
}

/**
 * Open the trip selector dropdown and wait for it to be visible.
 */
async function openTripDropdown(page) {
  await page.click('#tripSelector');
  await page.locator('#tripDropdown').waitFor({ state: 'visible', timeout: 10_000 });
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

export { login, logout, goToTab, openTripDropdown, dismissSuccess, TEST_EMAIL, TEST_PASSWORD };
