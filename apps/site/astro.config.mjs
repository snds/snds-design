import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// Static output — portable to GitHub Pages, Infomaniak, Bunny, any static host.
// When deploying to a custom domain root, `base` stays '/'. For a project
// subpath (e.g. user.github.io/repo), set base: '/repo/'.
export default defineConfig({
  // GitHub Pages project site. When you move to your own domain (root),
  // change `base` to '/' and `site` to 'https://snds.design'. Internal links
  // use import.meta.env.BASE_URL, so they adapt automatically.
  site: 'https://snds.github.io',
  base: '/snds-design/',
  output: 'static',
  integrations: [react(), mdx()],
  vite: {
    plugins: [vanillaExtractPlugin()],
    ssr: {
      // Ensure the workspace design-system (ships .css.ts) is processed by Vite.
      noExternal: ['@snds/ui'],
    },
  },
});
