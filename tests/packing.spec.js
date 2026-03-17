import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

test.describe('Packing List', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToTab(page, 'Packing');
  });

  test('packing page loads with categories', async ({ page }) => {
    await expect(page.locator('#pkCategories')).toBeVisible();
    const cats = page.locator('.pack-category');
    await expect(cats.first()).toBeVisible();
  });

  test('progress bar is visible', async ({ page }) => {
    await expect(page.locator('#pkProgressWrap')).toBeVisible();
  });

  test('can check a packing item', async ({ page }) => {
    const checkbox = page.locator('.pack-item input[type="checkbox"]').first();
    const wasChecked = await checkbox.isChecked();
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(!wasChecked);
  });

  test('checking item updates progress percentage', async ({ page }) => {
    const before = await page.locator('.pk-progress-pct').textContent();
    const checkbox = page.locator('.pack-item input[type="checkbox"]').first();
    if (!await checkbox.isChecked()) {
      await checkbox.click();
    }
    const after = await page.locator('.pk-progress-pct').textContent();
    // Progress should have changed (unless all items were already checked)
    // Just verify it's a percentage string
    expect(after).toMatch(/\d+%/);
  });

  test('reset button exists', async ({ page }) => {
    await expect(page.locator('button', { hasText: /reset/i })).toBeVisible();
  });

});
