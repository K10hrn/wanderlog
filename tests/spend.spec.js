import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

test.describe('Spend Tracker', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToTab(page, 'Spend');
  });

  test('spend page loads with summary cards', async ({ page }) => {
    await expect(page.locator('#panel-budget')).toBeVisible();
    await expect(page.locator('.spd-summary-card').first()).toBeVisible();
  });

  test('expense table is visible', async ({ page }) => {
    await expect(page.locator('#spdTbody')).toBeVisible();
  });

  test('can add an expense row', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: /add expense/i });
    const beforeRows = await page.locator('#spdTbody tr[data-id]').count();
    await addBtn.click();
    const afterRows = await page.locator('#spdTbody tr[data-id]').count();
    expect(afterRows).toBeGreaterThan(beforeRows);
  });

  test('budget progress bar is visible', async ({ page }) => {
    await expect(page.locator('.spd-progress-wrap')).toBeVisible();
  });

});
