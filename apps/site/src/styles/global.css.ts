import { globalStyle } from '@vanilla-extract/css';
import { vars } from '@snds/ui/tokens';
import './fonts.css';

/* Node info-box — a reversible left-to-right mask wipe. Reveals on
   [data-active=true], plays the inverse (wipes back out) when it leaves.
   65% black + backdrop blur so it reads over bright particles. */
globalStyle('.snds-node-tag', {
  background: 'color-mix(in srgb, var(--snds-color-bg) 72%, transparent)',
  // @ts-expect-error vendor-prefixed
  WebkitBackdropFilter: 'blur(8px)',
  backdropFilter: 'blur(8px)',
  clipPath: 'inset(0 100% 0 0)',
  opacity: 0,
  transform: 'translateY(4px)',
  transition:
    'clip-path 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'clip-path, opacity, transform',
});
globalStyle('.snds-node-tag[data-active="true"]', {
  clipPath: 'inset(0 0 0 0)',
  opacity: 1,
  transform: 'translateY(0)',
});

/* Reset */
globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html', {
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%',
  // Lenis owns smoothing — native smooth scroll would fight it.
  scrollBehavior: 'auto',
  // @ts-expect-error custom property
  colorScheme: 'dark',
});

/* Lenis smooth-scroll (momentum) — recommended classes */
globalStyle('html.lenis, html.lenis body', { height: 'auto' });
globalStyle('.lenis.lenis-smooth', { scrollBehavior: 'auto !important' as 'auto' });
globalStyle('.lenis.lenis-smooth [data-lenis-prevent]', { overscrollBehavior: 'contain' });
globalStyle('.lenis.lenis-stopped', { overflow: 'hidden' });
globalStyle('.lenis.lenis-smooth iframe', { pointerEvents: 'none' });

globalStyle('body', {
  background: vars.color.bg,
  color: vars.color.fg,
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.body,
  fontWeight: vars.weight.extralight,
  lineHeight: vars.lineHeight.normal,
  fontSynthesis: 'none',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
});

/* Default headings ride Berkeley Mono — neutral, regular weight. Tungsten is
   reserved for two display moments (hero/story titles, project-dialog title)
   and is opted into per-element, not globally. Nothing heavier than semibold. */
globalStyle('h1, h2, h3, h4', {
  fontFamily: vars.font.display,
  fontWeight: vars.weight.regular,
  lineHeight: vars.lineHeight.tight,
  letterSpacing: vars.letterSpacing.tight,
  textWrap: 'balance',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('::selection', {
  background: vars.color.primary,
  color: vars.color.fgOnAccent,
});

globalStyle(':focus-visible', {
  outline: `2px solid ${vars.color.borderFocus}`,
  outlineOffset: '2px',
});

/* Reduced motion. data-motion='reduce' (set by the toggle or the OS preference
   via the boot script) near-zeroes transitions/animations. data-motion='full'
   is an explicit opt back in. The @media fallback covers no-JS visitors whose
   OS prefers reduced motion (where the attribute isn't set). */
const REDUCE = {
  animationDuration: '0.001ms !important',
  animationIterationCount: '1 !important',
  transitionDuration: '0.001ms !important',
  scrollBehavior: 'auto !important' as 'auto',
};
globalStyle(
  "html[data-motion='reduce'] *, html[data-motion='reduce'] *::before, html[data-motion='reduce'] *::after",
  REDUCE,
);
globalStyle(
  "html:not([data-motion='full']) *, html:not([data-motion='full']) *::before, html:not([data-motion='full']) *::after",
  {
    // honour the OS preference unless the user explicitly chose full motion
    '@media': {
      '(prefers-reduced-motion: reduce)': REDUCE,
    },
  },
);

globalStyle('img, svg, canvas', {
  display: 'block',
  maxWidth: '100%',
});

/* Skip link — visible on focus */
globalStyle('.skip-link', {
  position: 'fixed',
  top: '8px',
  left: '8px',
  zIndex: 200,
  transform: 'translateY(-150%)',
  padding: '8px 12px',
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.caption,
  textTransform: 'uppercase',
  letterSpacing: vars.letterSpacing.wide,
  color: vars.color.fgOnAccent,
  background: vars.color.primary,
  borderRadius: vars.radius.sm,
  transition: 'transform 160ms',
});
globalStyle('.skip-link:focus-visible', { transform: 'translateY(0)' });

/* ---- "living glass" surface system (experimental) ----
   The project's node in the field is a point light. Frosted surfaces catch it
   LOCALLY: a radial glow positioned where the node projects on screen, with
   falloff, so a node near a corner lights only that corner. The field
   publishes the node's panel-relative position (--glow-x/--glow-y), colour
   (--glow-color) and visibility (--glow-on); strengths are tokenized here.
   Typography stays on the near-opaque body so contrast is preserved. */
globalStyle(':root', {
  vars: {
    '--snds-glass-blur': '14px',
    '--snds-glass-saturate': '1.4',
    '--snds-glass-opacity': '82%', // body opacity; remainder is field bleed (glass stays see-through)
    '--snds-glow-intensity': '42%', // centre strength; multiplied by --glow-strength (distance)
    '--snds-glow-size': '68%', // radial reach → how far the light diffuses
    '--snds-glow-border': '70%', // border tint strength at the node
    '--snds-glow-border-size': '48%', // border-tint falloff reach
  },
});

/* ---- persistent field layers (in Layout, survive view transitions) ---- */
// overflow:hidden clips the 3D-projected <Html> field labels that can land
// past the viewport edge — without it they extend the document width and leave
// a horizontal-scroll gap (e.g. beside the footer on mobile).
globalStyle('.field', { position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' });

/* mute overlay — transparent on home, dark + blurred on detail/work pages.
   Animates on data-field change for the page transition. */
globalStyle('.field-mute', {
  position: 'fixed',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
  opacity: 0,
  background: 'rgba(6, 8, 12, 0)',
  // @ts-expect-error vendor-prefixed
  WebkitBackdropFilter: 'blur(0px)',
  backdropFilter: 'blur(0px)',
  transition: 'opacity 520ms ease, background 520ms ease, backdrop-filter 520ms ease, -webkit-backdrop-filter 520ms ease',
});
globalStyle('html[data-field="dialog"] .field-mute', {
  // light dim so the field keeps reading as live/simulating behind the dialog;
  // theme-aware so it dims correctly in light mode too
  opacity: 1,
  background: 'color-mix(in srgb, var(--snds-color-bg) 45%, transparent)',
  // @ts-expect-error vendor-prefixed
  WebkitBackdropFilter: 'blur(4px)',
  backdropFilter: 'blur(4px)',
});

globalStyle('.grain', {
  position: 'fixed',
  inset: 0,
  zIndex: 3,
  pointerEvents: 'none',
  opacity: 0.05,
  mixBlendMode: 'overlay',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
});

/* page content sits above the field + mute overlay */
globalStyle('main, footer', { position: 'relative', zIndex: 2 });

/* Home is an interactive canvas — disable text selection so click-and-hold
   to orbit never selects copy. Dialog/work pages stay fully selectable. */
globalStyle('html[data-field="home"] body', {
  userSelect: 'none',
  // @ts-expect-error vendor-prefixed
  WebkitUserSelect: 'none',
});

/* Honor reduced-motion globally */
globalStyle('*', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto !important',
    },
  },
});
