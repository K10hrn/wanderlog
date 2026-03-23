import { test, expect } from '@playwright/test';
import { login, goToTab } from './helpers.js';

// All eight app tabs and the panel ID each one renders.
const TABS = [
  { label: 'Overview',   panelId: 'panel-overview'   },
  { label: 'Itinerary',  panelId: 'panel-itinerary'  },
  { label: 'Calendar',   panelId: 'panel-calendar'   },
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

  // ── Test 1: All tabs navigate correctly ─────────────────────────────────────
  // Clicks every tab in sequence and asserts its panel becomes visible.
  // Kept as a single test with a loop rather than 9 separate tests.
  test('all tabs navigate and render their panel', async ({ page }) => {
    for (const { label, panelId } of TABS) {
      await goToTab(page, label);
      await expect(page.locator(`#${panelId}`)).toBeVisible({ timeout: 10_000 });
    }
  });

  // ── Test 2: Overview page content ───────────────────────────────────────────
  // Navigates to Overview and validates all four stat cards plus the general
  // overview-stat section. Also confirms the active tab is highlighted.
  test('overview page content', async ({ page }) => {
    await goToTab(page, 'Overview');
    await page.waitForTimeout(300);

    // Active panel must be visible
    await expect(page.locator('#panel-overview.active')).toBeVisible();

    // General stats section
    await expect(page.locator('.overview-stat').first()).toBeVisible();

    // Exactly 4 booking-stat cards with the correct labels
    const cards = page.locator('.booking-stat-card');
    await expect(cards).toHaveCount(4);
    const labels = await page.locator('.bsc-label').allTextContents();
    expect(labels).toContain('Flights');
    expect(labels).toContain('Stays');
    expect(labels).toContain('Activities');
    expect(labels).toContain('Transport');
    expect(labels).not.toContain('Events');

    // Active tab in the nav bar must be highlighted as "Overview"
    const activeBtn = page.locator('.nav-link.active');
    await expect(activeBtn.first()).toContainText('Overview');
  });

  // ── Test 3: Dark mode toggle and no JS errors ────────────────────────────────
  // Toggles dark mode on and off, then walks through every tab collecting any
  // JS errors. Combines the two previously separate tests because they share
  // the "loop all tabs" pattern and a single page context avoids re-login cost.
  test('dark mode toggle and no JS errors', async ({ page }) => {
    // Collect JS errors throughout this test
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Toggle dark mode on
    await page.locator('#themeBtn').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Toggle dark mode back off
    await page.locator('#themeBtn').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');

    // Walk every tab checking for JS errors
    for (const { label } of TABS) {
      await goToTab(page, label);
      await page.waitForTimeout(300);
    }

    expect(errors).toHaveLength(0);
  });

});
