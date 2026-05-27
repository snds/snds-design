/* Base-aware internal links. Astro doesn't prefix author-written hrefs with
   the configured `base`, so route through url() for anything site-internal.
   Adapts automatically if base changes (e.g. subpath → custom-domain root). */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string): string =>
  path.startsWith('/') ? `${BASE}${path}` : path;

export const home = `${BASE}/`;
