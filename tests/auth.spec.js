import { test, expect } from '@playwright/test';
import { login, logout, TEST_EMAIL, TEST_PASSWORD } from './helpers.js';

test.describe('Authentication', () => {

  test('shows login screen on first load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#lockOverlay')).toBeVisible();
    await expect(page.locator('.lock-card')).toContainText('Wanderlog');
    await expect(page.locator('#authEmail')).toBeVisible();
    await expect(page.locator('#authPassword')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('#authEmail',    'wrong@email.com');
    await page.fill('#authPassword', 'wrongpassword');
    await page.click('#authBtn');
    await expect(page.locator('#authError')).not.toBeEmpty({ timeout: 10_000 });
  });

  test('logs in successfully with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page.locator('#lockOverlay')).toBeHidden();
    await expect(page.locator('#currentTripName')).toBeVisible();
  });

  test('shows signed-in email in the auth panel', async ({ page }) => {
    await login(page);
    await expect(page.locator('#authUserBar')).toContainText(TEST_EMAIL);
  });

  test('can sign out via lock button', async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page.locator('#lockOverlay')).toBeVisible();
  });

  test('auth overlay covers full screen — no app content visible', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('#lockOverlay');
    await expect(overlay).toBeVisible();
    const box = await overlay.boundingBox();
    const viewport = page.viewportSize();
    expect(box.width).toBeCloseTo(viewport.width, -1);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height * 0.95);
  });

});
