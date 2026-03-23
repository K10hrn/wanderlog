import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

const TABS = [
  { label: 'Overview',   panelId: 'panel-overview'   },
  { label: 'Itinerary',  panelId: 'panel-itinerary'  },
  { label: 'Calendar',   panelId: 'panel-calendar'   },
  { label: 'Distances',  panelId: 'panel-distances'  },
  { label: 'Spend',      panelId: 'panel-budget'     },
  { label: 'Weather',    panelId: 'panel-weather'    },
  { label: 'Packing',    panelId: 'panel-packing'    },
  { label: 'Emergency',  panelId: 'panel-emergency'  },
  { label: 'Print',      panelId: 'panel-print'      },
];

test.describe('Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const { label, panelId } of TABS) {
    test(`"${label}" tab renders its panel`, async ({ page }) => {
      await goToTab(page, label);
      await expect(page.locator(`#${panelId}`)).toBeVisible({ timeout: 10_000 });
    });
  }

  test('active tab is highlighted', async ({ page }) => {
    await goToTab(page, 'Itinerary');
    // On desktop the active class is in #navLinks; on mobile it's in #mobileNav
    const activeBtn = page.locator('.nav-link.active');
    await expect(activeBtn.first()).toContainText('Itinerary');
  });

  test('overview shows trip stats section', async ({ page }) => {
    await goToTab(page, 'Overview');
    await expect(page.locator('#panel-overview.active')).toBeVisible();
    await expect(page.locator('.overview-stat').first()).toBeVisible();
  });

  test('overview shows exactly 4 stat cards (Flights, Stays, Activities, Transport)', async ({ page }) => {
    await goToTab(page, 'Overview');
    await page.waitForTimeout(300);
    const cards = page.locator('.booking-stat-card');
    await expect(cards).toHaveCount(4);
    const labels = await page.locator('.bsc-label').allTextContents();
    expect(labels).toContain('Flights');
    expect(labels).toContain('Stays');
    expect(labels).toContain('Activities');
    expect(labels).toContain('Transport');
    // Events should NOT appear as a separate card
    expect(labels).not.toContain('Events');
  });

  test('emergency page has Print / Save PDF button', async ({ page }) => {
    await goToTab(page, 'Emergency');
    await expect(page.locator('#panel-emergency button', { hasText: /print/i })).toBeVisible();
  });

  test('emergency tip banner has adequate spacing from first section', async ({ page }) => {
    await goToTab(page, 'Emergency');
    await page.waitForTimeout(300);
    const reminder = page.locator('.em-reminder');
    await expect(reminder).toBeVisible();
    const marginBottom = await reminder.evaluate(el =>
      parseInt(getComputedStyle(el).marginBottom)
    );
    expect(marginBottom).toBeGreaterThanOrEqual(16);
  });

  test('dark mode toggle works', async ({ page }) => {
    const html = page.locator('html');
    await page.locator('#themeBtn').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.locator('#themeBtn').click();
    await expect(html).not.toHaveAttribute('data-theme', 'dark');
  });

  test('no JS errors on any tab', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const { label } of TABS) {
      await goToTab(page, label);
      await page.waitForTimeout(300);
    }
    expect(errors).toHaveLength(0);
  });

});
