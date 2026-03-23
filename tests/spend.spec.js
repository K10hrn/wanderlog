import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

test.describe('Spend Tracker', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToTab(page, 'Spend');
  });

  // ── Test 1: Spend page loads with all elements ───────────────────────────────
  // Navigating to Spend must render the panel, summary cards, expense table,
  // and budget progress bar in a single pass — all are visible on load and
  // require no interaction to trigger.
  test('spend page loads with all elements', async ({ page }) => {
    await expect(page.locator('#panel-budget')).toBeVisible();
    await expect(page.locator('.spd-summary-card').first()).toBeVisible();
    await expect(page.locator('#spdTbody')).toBeVisible();
    await expect(page.locator('.spd-progress-wrap')).toBeVisible();
  });

  // ── Test 2: Can add an expense ───────────────────────────────────────────────
  // Clicks "Add Expense" and verifies a new row is appended to the table.
  test('can add an expense', async ({ page }) => {
    const addBtn    = page.locator('button', { hasText: /add expense/i });
    const beforeRows = await page.locator('#spdTbody tr[data-id]').count();
    await addBtn.click();
    const afterRows  = await page.locator('#spdTbody tr[data-id]').count();
    expect(afterRows).toBeGreaterThan(beforeRows);
  });

});
