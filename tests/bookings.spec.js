import { test, expect } from '@playwright/test';
import { login, dismissSuccess } from './helpers.js';

test.describe('Bookings', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Add Booking button opens modal', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await expect(page.locator('#bookingModal')).toBeVisible();
    await expect(page.locator('#bm-title')).toContainText('Add Booking');
  });

  test('booking modal has all type tabs', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    for (const label of ['Flight', 'Stay', 'Activity', 'Transport', 'Event']) {
      await expect(page.locator('.bm-type-tab', { hasText: label })).toBeVisible();
    }
  });

  test('can save a flight booking and see success modal', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'E2E Test Flight');
    await page.fill('#bm-date', '2026-06-01');
    await page.fill('#bm-time', '10:00');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#successTitle')).toContainText('Booking Saved');
    await expect(page.locator('#successSub')).toContainText('E2E Test Flight');
  });

  test('success modal shows booking details', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'Detail Test');
    await page.fill('#bm-date', '2026-07-15');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#successDetail')).toContainText('Jul');
  });

  test('success modal dismisses on Done click', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'Dismiss Test');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await page.locator('#successModal button').click();
    await expect(page.locator('#successModal.open')).toBeHidden();
  });

  test('edit modal shows Delete button', async ({ page }) => {
    // Create a booking first
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'To Delete');
    await page.fill('#bm-date', '2026-08-01');
    await page.click('#bm-save-btn');
    await dismissSuccess(page);

    // Reload overview — booking card should appear
    await page.locator('.nav-btn', { hasText: 'Overview' }).first().click();
    const card = page.locator('.booking-card', { hasText: 'To Delete' });
    if (await card.isVisible()) {
      await card.click();
    } else {
      // Fallback: open via JS
      await page.evaluate(() => {
        const b = bmGetAll().find(x => x.data?.name === 'To Delete');
        if (b) openAddEventModal(b.id);
      });
    }
    await expect(page.locator('#bm-delete-btn')).toBeVisible();
    await expect(page.locator('#bm-delete-btn')).toContainText('Delete');
  });

  test('delete button is hidden when adding new booking', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await expect(page.locator('#bm-delete-btn')).toBeHidden();
  });

  test('cancel closes booking modal', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('#bookingModal .btn-ghost').click();
    await expect(page.locator('#bookingModal')).toBeHidden();
  });

  test('save requires a name/title', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.click('#bm-save-btn');
    // Modal should stay open (no name provided)
    await expect(page.locator('#bookingModal')).toBeVisible();
    await expect(page.locator('#successModal.open')).toBeHidden();
  });

});
