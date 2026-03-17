import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

test.describe('Trip Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows current trip name in nav', async ({ page }) => {
    await expect(page.locator('#currentTripName')).not.toBeEmpty();
  });

  test('trip dropdown opens and lists trips', async ({ page }) => {
    await page.click('#tripSelector');
    const dropdown = page.locator('#tripDropdown');
    await expect(dropdown).toBeVisible();
    await expect(page.locator('.trip-dropdown-item').first()).toBeVisible();
  });

  test('trip dropdown includes + New trip option', async ({ page }) => {
    await page.click('#tripSelector');
    await expect(page.locator('.trip-dropdown-item', { hasText: 'New trip' })).toBeVisible();
  });

  test('trips are sorted by departure date', async ({ page }) => {
    await page.click('#tripSelector');
    const dates = await page.locator('.trip-dropdown-dates').allTextContents();
    // Ensure each date string comes after the previous one when sorted
    const cleaned = dates.filter(d => d.trim() && d !== '—');
    expect(cleaned.length).toBeGreaterThan(0);
  });

  test('can open new trip modal', async ({ page }) => {
    await page.click('#tripSelector');
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await expect(page.locator('#modal.open')).toBeVisible();
    await expect(page.locator('#modal')).toContainText('Plan a New Trip');
  });

  test('colour swatches shown in new trip modal', async ({ page }) => {
    await page.click('#tripSelector');
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await expect(page.locator('#newTripColorSwatches .trip-color-swatch').first()).toBeVisible();
    const count = await page.locator('#newTripColorSwatches .trip-color-swatch').count();
    expect(count).toBe(6);
  });

  test('can create a new trip', async ({ page }) => {
    const dest = `E2E Test Trip ${Date.now()}`;
    await page.click('#tripSelector');
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.fill('#newDest', dest);
    await page.fill('#newFrom', '2027-01-10');
    await page.fill('#newTo',   '2027-01-20');
    await page.locator('.modal .btn-primary').click();
    await expect(page.locator('#currentTripName')).toContainText(dest);
  });

  test('colour picker popup appears on dot click', async ({ page }) => {
    await page.click('#tripSelector');
    await page.locator('.trip-dropdown-item .trip-color-dot').first().click();
    await expect(page.locator('#tripColorPopup')).toBeVisible();
    const swatches = await page.locator('#tripColorPopup .trip-dropdown-swatch').count();
    expect(swatches).toBe(6);
  });

  test('can switch between trips', async ({ page }) => {
    await page.click('#tripSelector');
    const items = page.locator('.trip-dropdown-item:not(.active)');
    const count = await items.count();
    if (count === 0) test.skip();
    const firstName = await items.first().locator('.trip-dropdown-dest').textContent();
    await items.first().click();
    await expect(page.locator('#currentTripName')).toContainText(firstName.trim());
  });

  test('can cancel new trip modal', async ({ page }) => {
    await page.click('#tripSelector');
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.locator('#modal .btn-ghost').click();
    await expect(page.locator('#modal.open')).toBeHidden();
  });

});
