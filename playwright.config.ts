import { defineConfig, devices } from '@playwright/test';

// Page-level a11y. Playwright ships a current Chromium (color-mix(), :has(),
// container queries all supported), so axe scans the page as it actually
// renders — unlike the ancient bundled browsers in pa11y/puppeteer.
//
// baseURL carries the GitHub Pages subpath, so specs use relative routes
// WITHOUT a leading slash (e.g. 'work/'), which resolve under /snds-design/.
const BASE = 'http://localhost:4321/snds-design/';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Each page runs the WebGL field; cap parallelism + retry so GPU contention
  // (slow page loads / view-transition timeouts) doesn't flake the deploy gate.
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serves the built dist (run `npm run build` first; `npm run a11y` does both).
  webServer: {
    command: 'npm run preview',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
