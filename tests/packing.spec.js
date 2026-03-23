import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

test.describe('Packing List', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToTab(page, 'Packing');
  });

  // ── Test 1: Page basics ──────────────────────────────────────────────────────
  // Verifies the packing panel is active, the progress bar is shown, and the
  // reset button is present. These are trivially related checks and need no
  // user data set-up, so they belong in one test.
  test('packing page basics', async ({ page }) => {
    await expect(page.locator('#panel-packing.active')).toBeVisible();
    await expect(page.locator('#pkProgressWrap')).toBeVisible();
    await expect(page.locator('button', { hasText: /reset/i })).toBeVisible();
  });

  // ── Test 2: Smart suggestions end-to-end ────────────────────────────────────
  // Clears packing data so the suggestions banner appears, confirms the
  // essentials are listed, clicks "Add Selected", verifies items were added,
  // checks one item off, and confirms the progress percentage updates.
  test('smart suggestions flow', async ({ page }) => {
    // Clear stored packing data to force the suggestions banner to appear
    await page.evaluate(() => {
      const key = pkTripKey();
      localStorage.removeItem(key);
      renderPacking();
    });
    await page.waitForTimeout(300);

    // Suggestions banner must be visible with essential clothing items
    const banner = page.locator('#pkWeatherSummary');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Smart Suggestions');
    await expect(banner).toContainText('T-shirts');
    await expect(banner).toContainText('Underwear');
    await expect(banner).toContainText('Socks');

    // Add suggested items to the list
    const addBtn = banner.locator('button', { hasText: /add selected/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(300);

    // At least one packing category should now exist
    await expect(page.locator('.pack-category').first()).toBeVisible();

    // Check the first item
    const item = page.locator('.pack-item').first();
    await expect(item).toBeVisible();
    const wasChecked = await item.evaluate(el => el.classList.contains('checked'));
    await item.click();
    const isChecked = await item.evaluate(el => el.classList.contains('checked'));
    expect(isChecked).toBe(!wasChecked);

    // Progress percentage must now show a numeric value
    const pct = await page.locator('.pk-progress-pct').textContent();
    expect(pct).toMatch(/\d+%/);
  });

  // ── Test 3: Custom category ──────────────────────────────────────────────────
  // Fills in a unique category name, clicks "+ Add Category", and verifies the
  // new category header appears in the list.
  test('custom category', async ({ page }) => {
    const catName = `E2E Cat ${Date.now()}`;
    await page.fill('#pkNewCatName', catName);
    await page.locator('button', { hasText: '+ Add Category' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.pack-category-header', { hasText: catName })).toBeVisible();
  });

});
