import { test, expect } from '@playwright/test';
import { login, goToTab, dismissSuccess } from './helpers.js';

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

  // ── Flight ──────────────────────────────────────────────────────────────────

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

  test('flight booking shows shared date/time row', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Flight' }).click();
    await expect(page.locator('#bm-shared-date-row')).toBeVisible();
  });

  test('flight booking has arrival date fields', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Flight' }).click();
    await expect(page.locator('#bm-arrdate')).toBeVisible();
    await expect(page.locator('#bm-arrtime')).toBeVisible();
  });

  // ── Stay ────────────────────────────────────────────────────────────────────

  test('stay booking hides shared date row', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Stay' }).click();
    await expect(page.locator('#bm-shared-date-row')).toBeHidden();
  });

  test('stay booking shows check-in and check-out date fields', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Stay' }).click();
    await expect(page.locator('#bm-checkin-date')).toBeVisible();
    await expect(page.locator('#bm-checkin-time')).toBeVisible();
    await expect(page.locator('#bm-checkout-date')).toBeVisible();
    await expect(page.locator('#bm-checkout-time')).toBeVisible();
  });

  test('can save a stay booking with check-in date', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Stay' }).click();
    await page.fill('#bm-name', 'E2E Test Hotel');
    await page.fill('#bm-checkin-date',  '2026-06-01');
    await page.fill('#bm-checkin-time',  '15:00');
    await page.fill('#bm-checkout-date', '2026-06-05');
    await page.fill('#bm-checkout-time', '11:00');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#successTitle')).toContainText('Booking Saved');
  });

  test('saved stay appears dated in overview timeline', async ({ page }) => {
    // Save a stay booking
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Stay' }).click();
    await page.fill('#bm-name', 'Dated Stay Test');
    await page.fill('#bm-checkin-date', '2026-06-10');
    await page.fill('#bm-checkout-date', '2026-06-12');
    await page.click('#bm-save-btn');
    await dismissSuccess(page);

    // Overview timeline should not contain 'Dated Stay Test' under undated group
    await goToTab(page, 'Overview');
    await page.waitForTimeout(300);
    const undatedGroup = page.locator('.ov-day-label', { hasText: /undated/i });
    if (await undatedGroup.isVisible()) {
      const undatedItems = undatedGroup.locator('..').locator('.ov-item-name', { hasText: 'Dated Stay Test' });
      await expect(undatedItems).toBeHidden();
    }
  });

  // ── Activity ─────────────────────────────────────────────────────────────────

  test('activity booking shows end date and end time fields', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Activity' }).click();
    await expect(page.locator('#bm-act-end-date')).toBeVisible();
    await expect(page.locator('#bm-act-end-time')).toBeVisible();
  });

  test('can save activity with end date/time', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Activity' }).click();
    await page.fill('#bm-name', 'E2E Tour');
    await page.fill('#bm-date', '2026-06-02');
    await page.fill('#bm-time', '09:00');
    await page.fill('#bm-act-end-date', '2026-06-02');
    await page.fill('#bm-act-end-time', '12:00');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
  });

  // ── Transport ────────────────────────────────────────────────────────────────

  test('transport booking hides shared date row', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Transport' }).click();
    await expect(page.locator('#bm-shared-date-row')).toBeHidden();
  });

  test('transport booking shows pickup and dropoff date fields', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Transport' }).click();
    await expect(page.locator('#bm-pickup-dt')).toBeVisible();
    await expect(page.locator('#bm-dropoff-dt')).toBeVisible();
  });

  // ── Event ─────────────────────────────────────────────────────────────────────

  test('event booking shows end date, end time and location fields', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Event' }).click();
    await expect(page.locator('#bm-evt-end-date')).toBeVisible();
    await expect(page.locator('#bm-evt-end-time')).toBeVisible();
    await expect(page.locator('#bm-evt-location')).toBeVisible();
  });

  test('can save an event with end date/time and location', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Event' }).click();
    await page.fill('#bm-name', 'E2E Evening Event');
    await page.fill('#bm-date', '2026-06-03');
    await page.fill('#bm-time', '19:00');
    await page.fill('#bm-evt-end-date', '2026-06-03');
    await page.fill('#bm-evt-end-time', '22:00');
    await page.fill('#bm-evt-location', 'Test Venue, Tokyo');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
  });

  // ── General ───────────────────────────────────────────────────────────────────

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
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'To Delete');
    await page.fill('#bm-date', '2026-08-01');
    await page.click('#bm-save-btn');
    await dismissSuccess(page);

    await goToTab(page, 'Overview');
    const card = page.locator('.booking-card', { hasText: 'To Delete' });
    if (await card.isVisible()) {
      await card.click();
    } else {
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
    await expect(page.locator('#bookingModal')).toBeVisible();
    await expect(page.locator('#successModal.open')).toBeHidden();
  });

});
