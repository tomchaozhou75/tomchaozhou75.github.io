const { test, expect } = require('@playwright/test');
const { preparePage, stabilizeVisuals } = require('./helpers');

test('publications Abs toggle opens and closes', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('/publications/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const absButton = page.getByRole('button', { name: 'Abs' }).first();
  await expect(absButton).toBeVisible();

  const panel = page.locator('.publications .abstract.hidden').first();
  await absButton.click();
  await expect(panel).toHaveClass(/open/);

  await absButton.click();
  await expect(panel).not.toHaveClass(/open/);
});

test('publication popover works without bootstrap compat runtime', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('/publications/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const popoverTrigger = page.locator('[data-toggle="popover"]').first();
  test.skip((await popoverTrigger.count()) === 0, 'no popover trigger found in fixture data');

  await popoverTrigger.hover();
  await expect(page.locator('.af-popover')).toBeVisible();
});

test('mobile navbar can expand/collapse', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only navigation behavior');

  await preparePage(page, 'light');
  await page.goto('/', { waitUntil: 'networkidle' });

  const toggle = page.locator('.navbar-toggler').first();
  await expect(toggle).toBeVisible();

  const nav = page.locator('.navbar-collapse').first();
  await toggle.click();
  await expect(nav).toHaveClass(/show/);

  await toggle.click();
  await expect(nav).not.toHaveClass(/show/);
});
