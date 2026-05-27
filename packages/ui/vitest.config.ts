import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// Component-level a11y + unit tests for the design system primitives.
// jsdom gives us a DOM for @testing-library + axe-core (structure, roles,
// names). Color-contrast is verified at the page layer (pa11y-ci on the
// built site) where real computed styles exist — jsdom can't compute them.
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
