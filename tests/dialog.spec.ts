import { test, expect } from '@playwright/test';

// Case-study dialog dismissal + keyboard paging. Case studies are reached from
// the home page (the /work index was removed).
test.describe('case-study dialog', () => {
  test('backdrop click dismisses; header click does not', async ({ page }) => {
    await page.goto('');
    await page.locator('.caselink').first().click();
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    await expect(page.locator('.cs')).toBeVisible();

    // header help button is outside the panel but must NOT dismiss
    await page.locator('#help-open').click();
    await page.locator('[data-kbd-close]').click(); // close the help overlay it opened
    await expect(page.locator('.cs')).toBeVisible();

    // backdrop (left margin, outside panel + header) dismisses → back home
    await page.mouse.click(12, 400);
    await expect(page).toHaveURL(/\/snds-design\/$/);
  });

  test('ArrowRight pages to the next project; Escape closes', async ({ page }) => {
    await page.goto('work/data-management/');
    await expect(page.locator('.cs')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/data-management/);

    await page.goto('');
    await page.locator('.caselink').first().click();
    await expect(page.locator('.cs')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/snds-design\/$/);
  });

  test('paging is lateral — one close returns home, not through each case', async ({ page }) => {
    await page.goto('');
    await page.locator('.caselink').first().click();
    await page.waitForURL(/\/work\/[^/]+\/?$/);
    // page forward a couple of times (each replaces history, never pushes)
    await page.locator('.cs__pagerLink--next').click();
    await page.waitForTimeout(500);
    await page.locator('.cs__pagerLink--next').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    // a single close lands back on home
    await page.locator('.cs__close').click();
    await expect(page).toHaveURL(/\/snds-design\/$/);
  });
});
