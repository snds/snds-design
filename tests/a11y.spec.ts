import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// One representative URL per route template; the five case studies share
// work/[slug], so scanning one covers the template.
// NOTE: /specimen is a dev-only type reference ("production will self-host the
// chosen set"), not a shipped route, so it's intentionally excluded from the
// deploy-gating scan.
const routes = [
  { path: '', name: 'home' },
  { path: 'work/', name: 'work-index' },
  { path: 'work/data-management/', name: 'case-study' },
];

const themes = ['dark', 'light'] as const;

// WCAG 2.1 A + AA — the conformance target declared in CI (matches the
// standard most legal/EAA/Section-508 obligations reference).
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

for (const route of routes) {
  for (const theme of themes) {
    test(`${route.name} [${theme}] has no WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'networkidle' });
      // data-theme drives the whole token palette; setting it directly is
      // deterministic (no dependence on the toggle button or localStorage).
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);

      const { violations } = await new AxeBuilder({ page })
        .withTags(TAGS)
        // WebGL field is decorative and unmeasurable by axe; exclude it.
        .exclude('canvas')
        .analyze();

      // Readable failure output: rule, impact, and per-node selector +
      // (for contrast) axe's measured fg/bg/ratio so CI logs are actionable.
      const summary = violations
        .map((v) => {
          const nodes = v.nodes
            .map((n) => {
              const d = n.any?.[0]?.data as
                | { fgColor?: string; bgColor?: string; contrastRatio?: number; expectedContrastRatio?: string }
                | undefined;
              const ratio = d?.contrastRatio
                ? ` [${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}:1, need ${d.expectedContrastRatio}]`
                : '';
              return `      - ${n.target.join(' ')}${ratio}`;
            })
            .join('\n');
          return `  • [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
        })
        .join('\n');
      expect(violations, `\n${violations.length} violation(s):\n${summary}`).toEqual([]);
    });
  }
}
