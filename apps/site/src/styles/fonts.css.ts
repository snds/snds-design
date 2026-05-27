import { globalFontFace, globalStyle } from '@vanilla-extract/css';

/* ============================================================
   Berkeley Mono — licensed (U.S. Graphics Co.), VARIABLE.
   Self-hosted from apps/site/public/fonts/berkeley-mono/.
   One file carries the full weight axis, so display (700) and body
   (400) draw from the same source. Italics included.
   ============================================================ */

const FAMILY = 'Berkeley Mono';
// base-aware so the @font-face url resolves under the Pages subpath
const DIR = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/fonts/berkeley-mono`;

globalFontFace(FAMILY, {
  src: `url("${DIR}/BerkeleyMonoVariable-Regular.woff2") format("woff2")`,
  fontWeight: '100 900',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace(FAMILY, {
  src: `url("${DIR}/BerkeleyMonoVariable-Italic.woff2") format("woff2")`,
  fontWeight: '100 900',
  fontStyle: 'italic',
  fontDisplay: 'swap',
});

/* TEST: Tungsten Compressed (Hoefler) — licensed, for UI headers only.
   All-caps semibold; technical + a touch humanist (Picard S3 LCARS). */
globalFontFace('Tungsten Compressed', {
  src: `url("${import.meta.env.BASE_URL.replace(/\/$/, '')}/fonts/tungsten/TungstenCompressed-Semibold.woff2") format("woff2")`,
  fontWeight: '600',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

/* Mono-led system: display, body, and HUD all ride Berkeley Mono.
   The token layer reads these via var(--snds-font-*-stack, fallback),
   so swapping in a body sans later is a one-line change here. */
const MONO_STACK =
  '"Berkeley Mono", ui-monospace, "SFMono-Regular", Menlo, "JetBrains Mono", monospace';

globalStyle(':root', {
  vars: {
    '--snds-font-display-stack': MONO_STACK,
    '--snds-font-sans-stack': MONO_STACK,
    '--snds-font-mono-stack': MONO_STACK,
    // headers test font (falls back to the mono display if it fails to load)
    '--snds-font-heading': `"Tungsten Compressed", ${MONO_STACK}`,
  },
});
