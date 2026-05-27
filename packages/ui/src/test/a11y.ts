import { axe } from 'vitest-axe';

/**
 * Run axe on a rendered primitive for the component-test layer.
 *
 * `color-contrast` is disabled here on purpose: jsdom has no layout engine, so
 * it cannot compute real colors (and axe throws probing the canvas). Contrast
 * is verified at the page layer instead — Playwright + @axe-core on the built
 * site, where computed styles (incl. color-mix) actually exist. See
 * tests/a11y.spec.ts.
 *
 * This layer catches structure, roles, names, and ARIA correctness.
 */
export const checkA11y = (node: Element | Document) =>
  axe(node, { rules: { 'color-contrast': { enabled: false } } });
