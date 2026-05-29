/* ============================================================
   SNDS Design System — core tokens (vanilla-extract)
   Palette: @radix-ui/colors v3
   Direction: monochrome (cool neutral) + cyan primary + red signal,
   with a reserved set of bright colors for data differentiation.
   Default theme: dark (on :root). Light via [data-theme="light"].

   Radix scales are polarity-flipping: step 1 = app background and
   step 12 = highest-contrast text in BOTH themes. So the semantic
   layer is mapped ONCE and light mode works automatically when the
   palette vars flip.
   ============================================================ */
import { createGlobalTheme, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';
import {
  slate, slateDark,
  cyan, cyanDark,
  red, redDark,
  amber, amberDark,
  grass, grassDark,
  violet, violetDark,
  blue, blueDark,
} from '@radix-ui/colors';

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

// Remap a Radix scale object ({ slate1: '#..', ... }) → { 1: '#..', ... }
const toSteps = (scale: Record<string, string>, name: string) =>
  Object.fromEntries(STEPS.map((s) => [s, scale[`${name}${s}`]])) as Record<number, string>;

// Null-leaf contract shape for a 12-step scale.
const scaleShape = () =>
  Object.fromEntries(STEPS.map((s) => [s, null])) as Record<number, null>;

/* ---------- Raw palette (exposed as --snds-* CSS vars) ----------
   Useful for data viz / R3F / canvas where you read CSS variables. */
export const palette = createGlobalThemeContract(
  {
    neutral: scaleShape(),
    primary: scaleShape(),
    signal: scaleShape(),
    data: {
      amber: scaleShape(),
      grass: scaleShape(),
      violet: scaleShape(),
      blue: scaleShape(),
    },
  },
  (_value, path) => `snds-${path.join('-')}`,
);

createGlobalTheme(':root', palette, {
  neutral: toSteps(slateDark, 'slate'),
  primary: toSteps(cyanDark, 'cyan'),
  signal: toSteps(redDark, 'red'),
  data: {
    amber: toSteps(amberDark, 'amber'),
    grass: toSteps(grassDark, 'grass'),
    violet: toSteps(violetDark, 'violet'),
    blue: toSteps(blueDark, 'blue'),
  },
});

createGlobalTheme('[data-theme="light"]', palette, {
  neutral: toSteps(slate, 'slate'),
  primary: toSteps(cyan, 'cyan'),
  signal: toSteps(red, 'red'),
  data: {
    amber: toSteps(amber, 'amber'),
    grass: toSteps(grass, 'grass'),
    violet: toSteps(violet, 'violet'),
    blue: toSteps(blue, 'blue'),
  },
});

/* ---------- Semantic tokens (the layer components consume) ----------
   Mapped once; flips automatically with the palette. */
export const vars = createGlobalThemeContract(
  {
    color: {
      bg: null,
      bgSubtle: null,
      bgSurface: null,
      bgElevated: null,
      bgHover: null,
      bgActive: null,
      bgSelected: null,

      fg: null,
      fgMuted: null,
      fgSubtle: null,
      fgDisabled: null,
      fgOnAccent: null,

      border: null,
      borderSubtle: null,
      borderStrong: null,
      borderFocus: null,

      primary: null,
      primaryHover: null,
      primarySubtle: null,
      primaryFg: null,
      primaryBorder: null,

      signal: null,
      signalHover: null,
      signalSubtle: null,
      signalFg: null,
    },
    font: {
      display: null,
      sans: null,
      mono: null,
    },
    fontSize: {
      micro: null,
      caption: null,
      body: null,
      lead: null,
      h4: null,
      h3: null,
      h2: null,
      h1: null,
      display: null,
    },
    lineHeight: {
      tight: null,
      snug: null,
      normal: null,
    },
    letterSpacing: {
      tightest: null,
      tight: null,
      normal: null,
      wide: null,
      hud: null,
    },
    weight: {
      extralight: null,
      light: null,
      regular: null,
      medium: null,
      semibold: null,
      bold: null,
    },
    space: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      8: null,
      10: null,
      12: null,
      16: null,
      20: null,
      24: null,
      32: null,
    },
    radius: {
      none: null,
      sm: null,
      md: null,
      lg: null,
      full: null,
    },
    grid: {
      gutter: null,
      margin: null,
      maxWidth: null,
    },
    duration: {
      fast: null,
      base: null,
      slow: null,
    },
    ease: {
      standard: null,
      out: null,
      inOut: null,
    },
    z: {
      base: null,
      raised: null,
      sticky: null,
      overlay: null,
      modal: null,
      toast: null,
    },
  },
  (_value, path) => `snds-${path.join('-')}`,
);

// Semantic color mapping — single source, polarity handled by palette flip.
createGlobalTheme(':root', vars.color, {
  bg: palette.neutral[1],
  bgSubtle: palette.neutral[2],
  bgSurface: palette.neutral[3],
  bgElevated: palette.neutral[4],
  bgHover: palette.neutral[4],
  bgActive: palette.neutral[5],
  bgSelected: palette.primary[4],

  fg: palette.neutral[12],
  fgMuted: palette.neutral[11],
  fgSubtle: palette.neutral[10],
  fgDisabled: palette.neutral[8],
  fgOnAccent: '#ffffff',

  // Neutral translucent borders (dark theme = white) so they INHERIT colour
  // from glows/field behind them rather than reading as opaque grey. Light
  // theme flips to black below.
  border: 'color-mix(in srgb, #fff 24%, transparent)',
  borderSubtle: 'color-mix(in srgb, #fff 12%, transparent)',
  borderStrong: 'color-mix(in srgb, #fff 36%, transparent)',
  borderFocus: palette.primary[8],

  primary: palette.primary[9],
  primaryHover: palette.primary[10],
  primarySubtle: palette.primary[3],
  primaryFg: palette.primary[11],
  primaryBorder: palette.primary[7],

  signal: palette.signal[9],
  signalHover: palette.signal[10],
  signalSubtle: palette.signal[3],
  signalFg: palette.signal[11],
});

// Light theme flips the translucent borders to black so they still read and
// can inherit colour from glows on a light surface.
globalStyle('[data-theme="light"]', {
  vars: {
    '--snds-color-border': 'color-mix(in srgb, #000 24%, transparent)',
    '--snds-color-borderSubtle': 'color-mix(in srgb, #000 12%, transparent)',
    '--snds-color-borderStrong': 'color-mix(in srgb, #000 36%, transparent)',
  },
});

// Static (non-theme) tokens. Font stacks are placeholders until the
// type specimen pick — they fall back to robust system stacks.
createGlobalTheme(':root', {
  font: vars.font,
  fontSize: vars.fontSize,
  lineHeight: vars.lineHeight,
  letterSpacing: vars.letterSpacing,
  weight: vars.weight,
  space: vars.space,
  radius: vars.radius,
  grid: vars.grid,
  duration: vars.duration,
  ease: vars.ease,
  z: vars.z,
}, {
  font: {
    display: 'var(--snds-font-display-stack, "Space Grotesk", system-ui, sans-serif)',
    sans: 'var(--snds-font-sans-stack, system-ui, -apple-system, sans-serif)',
    mono: 'var(--snds-font-mono-stack, ui-monospace, "JetBrains Mono", monospace)',
  },
  fontSize: {
    micro: '0.6875rem',   // 11
    caption: '0.75rem',   // 12
    body: '0.9375rem',    // 15
    lead: '1.125rem',     // 18
    h4: '1.25rem',        // 20
    h3: '1.5rem',         // 24
    h2: '2rem',           // 32
    h1: '3rem',           // 48
    display: 'clamp(3.5rem, 8vw, 7rem)',
  },
  lineHeight: {
    tight: '1.05',
    snug: '1.25',
    normal: '1.55',
  },
  letterSpacing: {
    tightest: '-0.04em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
    hud: '0.18em',
  },
  weight: {
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
    full: '9999px',
  },
  grid: {
    gutter: '24px',
    margin: 'clamp(16px, 4vw, 64px)',
    maxWidth: '1440px',
  },
  duration: {
    fast: '120ms',
    base: '240ms',
    slow: '480ms',
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
  z: {
    base: '0',
    raised: '10',
    sticky: '100',
    overlay: '1000',
    modal: '1100',
    toast: '1200',
  },
});
