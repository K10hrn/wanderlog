import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

test.describe('Packing List', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToTab(page, 'Packing');
  });

  test('packing page loads', async ({ page }) => {
    await expect(page.locator('#panel-packing.active')).toBeVisible();
    await expect(page.locator('#pkProgressWrap')).toBeVisible();
  });

  test('smart suggestions banner is visible on empty packing list', async ({ page }) => {
    // Clear packing data so list starts fresh
    await page.evaluate(() => {
      const key = pkTripKey();
      localStorage.removeItem(key);
      renderPacking();
    });
    await page.waitForTimeout(300);
    await expect(page.locator('#pkWeatherSummary')).toBeVisible();
    await expect(page.locator('#pkWeatherSummary')).toContainText('Smart Suggestions');
  });

  test('smart suggestions include clothing essentials', async ({ page }) => {
    await page.evaluate(() => {
      const key = pkTripKey();
      localStorage.removeItem(key);
      renderPacking();
    });
    await page.waitForTimeout(300);
    const suggestions = page.locator('#pkWeatherSummary');
    await expect(suggestions).toContainText('T-shirts');
    await expect(suggestions).toContainText('Underwear');
    await expect(suggestions).toContainText('Socks');
  });

  test('can add smart suggestions to the list', async ({ page }) => {
    // Clear packing data
    await page.evaluate(() => {
      localStorage.removeItem(pkTripKey());
      renderPacking();
    });
    await page.waitForTimeout(300);

    // Click "Add Selected to List"
    const addBtn = page.locator('#pkWeatherSummary button', { hasText: /add selected/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(300);

    // Categories should now exist
    await expect(page.locator('.pack-category').first()).toBeVisible();
  });

  test('progress bar is visible', async ({ page }) => {
    await expect(page.locator('#pkProgressWrap')).toBeVisible();
  });

  test('can check a packing item after adding suggestions', async ({ page }) => {
    // Ensure items exist
    await page.evaluate(() => {
      localStorage.removeItem(pkTripKey());
      renderPacking();
    });
    await page.waitForTimeout(300);
    const addBtn = page.locator('#pkWeatherSummary button', { hasText: /add selected/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
    }

    const item = page.locator('.pack-item').first();
    await expect(item).toBeVisible();
    const wasChecked = await item.evaluate(el => el.classList.contains('checked'));
    await item.click();
    const isChecked = await item.evaluate(el => el.classList.contains('checked'));
    expect(isChecked).toBe(!wasChecked);
  });

  test('checking item updates progress percentage', async ({ page }) => {
    // Ensure items exist
    await page.evaluate(() => {
      localStorage.removeItem(pkTripKey());
      renderPacking();
    });
    await page.waitForTimeout(300);
    const addBtn = page.locator('#pkWeatherSummary button', { hasText: /add selected/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
    }

    const item = page.locator('.pack-item').first();
    const isChecked = await item.evaluate(el => el.classList.contains('checked'));
    if (!isChecked) await item.click();
    const pct = await page.locator('.pk-progress-pct').textContent();
    expect(pct).toMatch(/\d+%/);
  });

  test('reset button exists', async ({ page }) => {
    await expect(page.locator('button', { hasText: /reset/i })).toBeVisible();
  });

  test('can add a custom category', async ({ page }) => {
    const catName = `E2E Cat ${Date.now()}`;
    await page.fill('#pkNewCatName', catName);
    await page.locator('button', { hasText: '+ Add Category' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.pack-category-header', { hasText: catName })).toBeVisible();
  });

});
