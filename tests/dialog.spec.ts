import { test, expect } from '@playwright/test';

// Case-study dialog dismissal + keyboard paging.
test.describe('case-study dialog', () => {
  test('backdrop click dismisses; header click does not', async ({ page }) => {
    await page.goto('work/');
    await page.locator('.work__item a, .work__link').first().click();
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    await expect(page.locator('.cs')).toBeVisible();

    // header help button is outside the panel but must NOT dismiss
    await page.locator('#help-open').click();
    await page.locator('[data-kbd-close]').click(); // close the help overlay it opened
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    await expect(page.locator('.cs')).toBeVisible();

    // backdrop (left margin, outside panel + header) dismisses
    await page.mouse.click(12, 400);
    await expect(page).toHaveURL(/\/work\/$/);
  });

  test('ArrowRight pages to the next project; Escape closes', async ({ page }) => {
    await page.goto('work/data-management/');
    await expect(page.locator('.cs')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/work\/[^/]+\/?$/);
    await expect(page).not.toHaveURL(/data-management/);

    await page.goto('work/');
    await page.locator('.work__item a, .work__link').first().click();
    await expect(page.locator('.cs')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/work\/$/);
  });
});
