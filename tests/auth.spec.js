import { test, expect } from '@playwright/test';
import { login, logout, TEST_EMAIL, TEST_PASSWORD } from './helpers.js';

test.describe('Authentication', () => {

  // ── Test 1: Pre-auth state ───────────────────────────────────────────────────
  // Verifies the lock overlay covers the full viewport and no app content leaks
  // through before the user has authenticated.
  test('shows login screen before auth', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('#lockOverlay');
    await expect(overlay).toBeVisible();

    // Lock card must mention the app name
    await expect(page.locator('.lock-card')).toContainText('Wanderlog');

    // Email + password inputs must be present
    await expect(page.locator('#authEmail')).toBeVisible();
    await expect(page.locator('#authPassword')).toBeVisible();

    // Overlay must cover the full viewport (no app content visible behind it)
    const box      = await overlay.boundingBox();
    const viewport = page.viewportSize();
    expect(box.width).toBeCloseTo(viewport.width, -1);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height * 0.95);
  });

  // ── Test 2: Bad credentials ──────────────────────────────────────────────────
  // Submitting wrong credentials must surface an inline error message without
  // dismissing the overlay.
  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('#authEmail',    'wrong@email.com');
    await page.fill('#authPassword', 'wrongpassword');
    await page.click('#authBtn');
    // Error element must become non-empty within the Supabase round-trip window
    await expect(page.locator('#authError')).not.toBeEmpty({ timeout: 10_000 });
    // Overlay must still be visible — user is NOT logged in
    await expect(page.locator('#lockOverlay')).toBeVisible();
  });

  // ── Test 3: Full login → verify identity → logout ───────────────────────────
  // Happy-path E2E: user logs in, sees their email in the UI, then signs out
  // and is returned to the lock screen.
  test('full login and logout flow', async ({ page }) => {
    // Login via the shared helper (handles Supabase rate-limit retries)
    await login(page);

    // Overlay must have disappeared
    await expect(page.locator('#lockOverlay')).toBeHidden();

    // Trip name in nav confirms the app loaded successfully
    await expect(page.locator('#currentTripName')).toBeVisible();

    // Signed-in email should appear in the auth user bar
    await expect(page.locator('#authUserBar')).toContainText(TEST_EMAIL);

    // Sign out via the lock button
    await logout(page);

    // Lock overlay must return
    await expect(page.locator('#lockOverlay')).toBeVisible();
  });

});
