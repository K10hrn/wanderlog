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
    const activeBtn = page.locator('.nav-btn.active');
    await expect(activeBtn).toContainText('Itinerary');
  });

  test('overview shows trip stats cards', async ({ page }) => {
    await goToTab(page, 'Overview');
    await expect(page.locator('.panel-active #panel-overview')).toBeVisible();
    // Stats section
    await expect(page.locator('.glance-card').first()).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    const html = page.locator('html');
    await page.locator('#themeToggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.locator('#themeToggle').click();
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
