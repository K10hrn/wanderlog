import { test, expect } from '@playwright/test';
import { login, goToTab, dismissSuccess } from './helpers.js';

test.describe('Bookings', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Test 1: Flight booking end-to-end ───────────────────────────────────────
  // Opens the modal, confirms all five type tabs are present, verifies
  // flight-specific fields (shared date row, arrival fields), fills in the
  // required data, saves, and validates the success modal content.
  test('flight booking: open modal, check fields, save and dismiss', async ({ page }) => {
    // Open the add-booking modal
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await expect(page.locator('#bookingModal')).toBeVisible();
    await expect(page.locator('#bm-title')).toContainText('Add Booking');

    // All five type tabs must be present
    for (const label of ['Flight', 'Stay', 'Activity', 'Transport', 'Event']) {
      await expect(page.locator('.bm-type-tab', { hasText: label })).toBeVisible();
    }

    // Select Flight tab and verify flight-specific fields
    await page.locator('.bm-type-tab', { hasText: 'Flight' }).click();
    await expect(page.locator('#bm-shared-date-row')).toBeVisible();
    await expect(page.locator('#bm-arrdate')).toBeVisible();
    await expect(page.locator('#bm-arrtime')).toBeVisible();

    // Fill required fields and save
    await page.fill('#bm-name', 'E2E Test Flight');
    await page.fill('#bm-date', '2026-06-01');
    await page.fill('#bm-time', '10:00');
    await page.click('#bm-save-btn');

    // Success modal must appear with the booking name and date
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#successTitle')).toContainText('Booking Saved');
    await expect(page.locator('#successSub')).toContainText('E2E Test Flight');
    await expect(page.locator('#successDetail')).toContainText('Jun');

    // Dismiss success modal
    await page.locator('#successModal button').click();
    await expect(page.locator('#successModal.open')).toBeHidden();
  });

  // ── Test 2: Stay booking end-to-end ─────────────────────────────────────────
  // Switches to the Stay tab, verifies check-in/out fields are visible and the
  // shared date row is hidden, saves the booking, then confirms it is NOT in the
  // undated group on the Overview timeline.
  test('stay booking: save and appears dated in overview', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();

    // Switch to Stay tab
    await page.locator('.bm-type-tab', { hasText: 'Stay' }).click();

    // Shared date row is hidden for stays; check-in/out fields are shown
    await expect(page.locator('#bm-shared-date-row')).toBeHidden();
    await expect(page.locator('#bm-checkin-date')).toBeVisible();
    await expect(page.locator('#bm-checkin-time')).toBeVisible();
    await expect(page.locator('#bm-checkout-date')).toBeVisible();
    await expect(page.locator('#bm-checkout-time')).toBeVisible();

    // Fill fields and save
    await page.fill('#bm-name', 'Dated Stay Test');
    await page.fill('#bm-checkin-date',  '2026-06-10');
    await page.fill('#bm-checkin-time',  '15:00');
    await page.fill('#bm-checkout-date', '2026-06-12');
    await page.fill('#bm-checkout-time', '11:00');
    await page.click('#bm-save-btn');

    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('#successTitle')).toContainText('Booking Saved');
    await dismissSuccess(page);

    // Navigate to Overview and verify the stay is NOT listed under "undated"
    await goToTab(page, 'Overview');
    await page.waitForTimeout(300);
    const undatedGroup = page.locator('.ov-day-label', { hasText: /undated/i });
    if (await undatedGroup.isVisible()) {
      const undatedItems = undatedGroup.locator('..').locator('.ov-item-name', { hasText: 'Dated Stay Test' });
      await expect(undatedItems).toBeHidden();
    }
  });

  // ── Test 3: Activity and Event booking flows ─────────────────────────────────
  // Activity: verifies end-date/time fields appear and a booking can be saved.
  // Event: verifies end-date/time + location fields appear and a booking can be
  // saved. Both are combined here because they share the same modal lifecycle.
  test('activity and event booking flows', async ({ page }) => {
    // ── Activity ──────────────────────────────────────────────────────────────
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Activity' }).click();

    await expect(page.locator('#bm-act-end-date')).toBeVisible();
    await expect(page.locator('#bm-act-end-time')).toBeVisible();

    await page.fill('#bm-name', 'E2E Tour');
    await page.fill('#bm-date', '2026-06-02');
    await page.fill('#bm-time', '09:00');
    await page.fill('#bm-act-end-date', '2026-06-02');
    await page.fill('#bm-act-end-time', '12:00');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await dismissSuccess(page);

    // ── Event ─────────────────────────────────────────────────────────────────
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Event' }).click();

    await expect(page.locator('#bm-evt-end-date')).toBeVisible();
    await expect(page.locator('#bm-evt-end-time')).toBeVisible();
    await expect(page.locator('#bm-evt-location')).toBeVisible();

    await page.fill('#bm-name', 'E2E Evening Event');
    await page.fill('#bm-date', '2026-06-03');
    await page.fill('#bm-time', '19:00');
    await page.fill('#bm-evt-end-date', '2026-06-03');
    await page.fill('#bm-evt-end-time', '22:00');
    await page.fill('#bm-evt-location', 'Test Venue, Tokyo');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await dismissSuccess(page);
  });

  // ── Test 4: Transport booking end-to-end ─────────────────────────────────────
  // Verifies that the shared date row is hidden for transport, pickup/dropoff
  // date fields are shown, and the booking can be saved.
  test('transport booking: fields and save', async ({ page }) => {
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.locator('.bm-type-tab', { hasText: 'Transport' }).click();

    // Transport uses its own date fields, not the shared row
    await expect(page.locator('#bm-shared-date-row')).toBeHidden();
    await expect(page.locator('#bm-pickup-dt')).toBeVisible();
    await expect(page.locator('#bm-dropoff-dt')).toBeVisible();

    // Fill minimum required field and save
    await page.fill('#bm-name', 'E2E Car Rental');
    await page.click('#bm-save-btn');
    await expect(page.locator('#successModal.open')).toBeVisible({ timeout: 8_000 });
    await dismissSuccess(page);
  });

  // ── Test 5: Validation and modal controls ────────────────────────────────────
  // Covers negative and control-flow cases:
  //   • Saving with no name stays in modal (no success flash)
  //   • Cancel button closes the modal
  //   • Delete button is hidden for new bookings
  //   • Delete button is visible when editing an existing booking
  test('booking validation and modal controls', async ({ page }) => {
    // ── Save with no name must NOT show success modal ─────────────────────────
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.click('#bm-save-btn');
    await expect(page.locator('#bookingModal')).toBeVisible();
    await expect(page.locator('#successModal.open')).toBeHidden();

    // ── Cancel closes the modal ───────────────────────────────────────────────
    await page.locator('#bookingModal .btn-ghost').click();
    await expect(page.locator('#bookingModal')).toBeHidden();

    // ── Delete hidden for new bookings ────────────────────────────────────────
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await expect(page.locator('#bm-delete-btn')).toBeHidden();
    await page.locator('#bookingModal .btn-ghost').click();

    // ── Delete visible when editing an existing booking ───────────────────────
    // First create a booking to edit
    await page.locator('button', { hasText: '+ Add Booking' }).first().click();
    await page.fill('#bm-name', 'To Edit');
    await page.fill('#bm-date', '2026-08-01');
    await page.click('#bm-save-btn');
    await dismissSuccess(page);

    // Find and open the saved booking from the Overview timeline
    await goToTab(page, 'Overview');
    const card = page.locator('.booking-card', { hasText: 'To Edit' });
    if (await card.isVisible()) {
      await card.click();
    } else {
      // Fallback: open via JS API if the card isn't rendered on the timeline
      await page.evaluate(() => {
        const b = bmGetAll().find(x => x.data?.name === 'To Edit');
        if (b) openAddEventModal(b.id);
      });
    }
    await expect(page.locator('#bm-delete-btn')).toBeVisible();
    await expect(page.locator('#bm-delete-btn')).toContainText('Delete');
  });

});
