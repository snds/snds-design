import { test, expect } from '@playwright/test';

// Global help/settings overlay, settings switches, and home section nav.
test.describe('site controls', () => {
  test('help overlay: ? opens, Esc closes, header button + close button work', async ({ page }) => {
    await page.goto('');
    const help = page.locator('#help-dialog');
    await expect(help).toHaveJSProperty('open', false);

    await page.keyboard.press('?');
    await expect(help).toHaveJSProperty('open', true);
    await page.keyboard.press('Escape');
    await expect(help).toHaveJSProperty('open', false);

    await page.locator('#help-open').click();
    await expect(help).toHaveJSProperty('open', true);
    await page.locator('[data-kbd-close]').click();
    await expect(help).toHaveJSProperty('open', false);
  });

  test('T toggles theme; theme switch reflects + drives it', async ({ page }) => {
    await page.goto('');
    const themeOf = () => page.evaluate(() => document.documentElement.dataset.theme);

    const before = await themeOf();
    await page.keyboard.press('t');
    expect(await themeOf()).not.toBe(before);

    await page.locator('#help-open').click();
    const sw = page.locator('#set-theme');
    // switch mirrors current theme (on === light)
    await expect(sw).toHaveAttribute('aria-checked', String((await themeOf()) === 'light'));
    const t1 = await themeOf();
    await sw.click();
    expect(await themeOf()).not.toBe(t1);
    await expect(sw).toHaveAttribute('aria-checked', String((await themeOf()) === 'light'));
  });

  test('reduce-motion switch flips data-motion and freezes scroll easing', async ({ page }) => {
    await page.goto('');
    const motionOf = () => page.evaluate(() => document.documentElement.dataset.motion);
    expect(await motionOf()).toBe('full'); // headless has no OS reduce preference

    await page.locator('#help-open').click();
    const sw = page.locator('#set-motion');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await sw.click();
    expect(await motionOf()).toBe('reduce');
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    // lenis smoothing is torn down under reduced motion
    expect(await page.evaluate(() => (window as any).__lenis === undefined)).toBe(true);
  });

  test('home: ArrowDown advances a section, Home returns to top', async ({ page }) => {
    await page.goto('');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1200); // allow Lenis momentum to settle
    const { y, vh } = await page.evaluate(() => ({ y: window.scrollY, vh: window.innerHeight }));
    expect(y).toBeGreaterThan(vh * 0.4);

    await page.keyboard.press('Home');
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(40);
  });
});
