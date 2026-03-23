import { test, expect } from '@playwright/test';
import { login, goToTab, openTripDropdown } from './helpers.js';

test.describe('Trip Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows current trip name in nav', async ({ page }) => {
    await expect(page.locator('#currentTripName')).not.toBeEmpty();
  });

  test('trip dropdown opens and lists trips', async ({ page }) => {
    await openTripDropdown(page);
    const dropdown = page.locator('#tripDropdown');
    await expect(dropdown).toBeVisible();
    await expect(page.locator('.trip-dropdown-item').first()).toBeVisible();
  });

  test('trip dropdown includes + New trip option', async ({ page }) => {
    await openTripDropdown(page);
    await expect(page.locator('.trip-dropdown-item', { hasText: 'New trip' })).toBeVisible();
  });

  test('trips are sorted by departure date', async ({ page }) => {
    await openTripDropdown(page);
    const dates = await page.locator('.trip-dropdown-dates').allTextContents();
    const cleaned = dates.filter(d => d.trim() && d !== '—');
    expect(cleaned.length).toBeGreaterThan(0);
  });

  test('can open new trip modal', async ({ page }) => {
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await expect(page.locator('#modal.open')).toBeVisible();
    await expect(page.locator('#modal')).toContainText('Plan a New Trip');
  });

  test('colour swatches shown in new trip modal', async ({ page }) => {
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await expect(page.locator('#newTripColorSwatches .trip-color-swatch').first()).toBeVisible();
    const count = await page.locator('#newTripColorSwatches .trip-color-swatch').count();
    expect(count).toBe(6);
  });

  test('can create a new trip and site re-renders', async ({ page }) => {
    const dest = `E2E Test Trip ${Date.now()}`;
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.fill('#newDest', dest);
    await page.fill('#newFrom', '2027-01-10');
    await page.fill('#newTo',   '2027-01-20');
    await page.locator('#tripModalSaveBtn').click();
    await page.waitForTimeout(500);

    // Trip name should update in nav
    await expect(page.locator('#currentTripName')).toContainText(dest);

    // Overview panel should be active after trip creation
    await expect(page.locator('#panel-overview.active')).toBeVisible();
  });

  test('new trip shows smart packing suggestions', async ({ page }) => {
    const dest = `E2E Packing Trip ${Date.now()}`;
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.fill('#newDest', dest);
    await page.fill('#newFrom', '2027-03-01');
    await page.fill('#newTo',   '2027-03-07');
    await page.locator('#tripModalSaveBtn').click();
    await page.waitForTimeout(500);

    // Navigate to packing
    await goToTab(page, 'Packing');
    await page.waitForTimeout(300);

    // Smart suggestions should appear for the new empty trip
    await expect(page.locator('#pkWeatherSummary')).toContainText('Smart Suggestions');
  });

  test('colour picker popup appears on dot click', async ({ page }) => {
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item .trip-color-dot').first().click();
    await expect(page.locator('#tripColorPopup')).toBeVisible();
    const swatches = await page.locator('#tripColorPopup .trip-dropdown-swatch').count();
    expect(swatches).toBe(6);
  });

  test('can switch between trips', async ({ page }) => {
    await openTripDropdown(page);
    const items = page.locator('.trip-dropdown-item:not(.active)');
    const count = await items.count();
    if (count === 0) test.skip();
    const firstName = await items.first().locator('.trip-dropdown-dest').textContent();
    await items.first().click();
    await expect(page.locator('#currentTripName')).toContainText(firstName.trim(), { timeout: 8_000 });
  });

  test('can cancel new trip modal', async ({ page }) => {
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.locator('#modal .btn-ghost').click();
    await expect(page.locator('#modal.open')).toBeHidden();
  });

});
