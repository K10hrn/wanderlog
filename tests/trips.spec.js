import { test, expect } from '@playwright/test';
import { login, goToTab, openTripDropdown } from './helpers.js';

test.describe('Trip Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Test 1: Trip dropdown lists trips and has New trip option ────────────────
  // Opens the dropdown, confirms it's visible with at least one item, verifies
  // sorted dates are present, checks for the "+ New trip" entry, then closes
  // the dropdown by pressing Escape.
  test('trip dropdown: lists trips and includes New trip option', async ({ page }) => {
    await openTripDropdown(page);
    const dropdown = page.locator('#tripDropdown');
    await expect(dropdown).toBeVisible();

    // Must have at least one existing trip
    await expect(page.locator('.trip-dropdown-item').first()).toBeVisible();

    // Trips with dates should show dates (confirms sorted display)
    const dates   = await page.locator('.trip-dropdown-dates').allTextContents();
    const cleaned = dates.filter(d => d.trim() && d !== '—');
    expect(cleaned.length).toBeGreaterThan(0);

    // "+ New trip" option must be present
    await expect(page.locator('.trip-dropdown-item', { hasText: 'New trip' })).toBeVisible();

    // Close without navigating
    await page.keyboard.press('Escape');
  });

  // ── Test 2: Create a new trip ────────────────────────────────────────────────
  // Opens New trip modal, verifies modal text and 6 colour swatches, fills in
  // destination + dates, saves, and confirms the nav shows the new trip name
  // and the Overview panel is active.
  test('create a new trip', async ({ page }) => {
    const dest = `E2E Test Trip ${Date.now()}`;

    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();

    // Modal content checks
    await expect(page.locator('#modal.open')).toBeVisible();
    await expect(page.locator('#modal')).toContainText('Plan a New Trip');

    // Exactly 6 colour swatches in the creation form
    const swatches = page.locator('#newTripColorSwatches .trip-color-swatch');
    await expect(swatches.first()).toBeVisible();
    await expect(swatches).toHaveCount(6);

    // Fill in destination and dates, then save
    await page.fill('#newDest', dest);
    await page.fill('#newFrom', '2027-01-10');
    await page.fill('#newTo',   '2027-01-20');
    await page.locator('#tripModalSaveBtn').click();
    await page.waitForTimeout(500);

    // Nav should show the new trip name
    await expect(page.locator('#currentTripName')).toContainText(dest);

    // Overview panel should be active after trip creation
    await expect(page.locator('#panel-overview.active')).toBeVisible();
  });

  // ── Test 3: Switch trips, colour picker, and cancel modal ───────────────────
  // Switches to a different trip and checks the nav name updates, opens the
  // colour picker popup and confirms it has 6 swatches, then opens the New
  // trip modal and cancels to verify it closes cleanly.
  test('trip interactions: switch, colour picker, cancel', async ({ page }) => {
    // ── Switch to another trip ────────────────────────────────────────────────
    await openTripDropdown(page);
    const otherItems = page.locator('.trip-dropdown-item:not(.active)');
    const count      = await otherItems.count();
    if (count > 0) {
      const destLocator = otherItems.first().locator('.trip-dropdown-dest');
      const firstName = await destLocator.textContent();
      // Click the destination text specifically — avoids accidentally hitting
      // the colour dot which opens the colour picker instead of switching trips
      await destLocator.click();
      await expect(page.locator('#currentTripName')).toContainText(firstName.trim(), { timeout: 8_000 });
    }

    // ── Colour picker popup ───────────────────────────────────────────────────
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item .trip-color-dot').first().click();
    await expect(page.locator('#tripColorPopup')).toBeVisible();
    const popupSwatches = await page.locator('#tripColorPopup .trip-dropdown-swatch').count();
    expect(popupSwatches).toBe(6);

    // Close the popup before proceeding
    await page.keyboard.press('Escape');

    // ── Cancel new trip modal ─────────────────────────────────────────────────
    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await expect(page.locator('#modal.open')).toBeVisible();
    await page.locator('#modal .btn-ghost').click();
    await expect(page.locator('#modal.open')).toBeHidden();
  });

  // ── Test 4: New trip shows smart packing suggestions ────────────────────────
  // Creates a brand-new trip (fresh packing state) then navigates to Packing
  // and verifies the Smart Suggestions banner is present.
  test('new trip shows smart packing suggestions', async ({ page }) => {
    const dest = `E2E Packing Trip ${Date.now()}`;

    await openTripDropdown(page);
    await page.locator('.trip-dropdown-item', { hasText: 'New trip' }).click();
    await page.fill('#newDest', dest);
    await page.fill('#newFrom', '2027-03-01');
    await page.fill('#newTo',   '2027-03-07');
    await page.locator('#tripModalSaveBtn').click();
    await page.waitForTimeout(500);

    // Navigate to packing and expect the suggestions banner
    await goToTab(page, 'Packing');
    await page.waitForTimeout(300);
    await expect(page.locator('#pkWeatherSummary')).toContainText('Smart Suggestions');
  });

});
