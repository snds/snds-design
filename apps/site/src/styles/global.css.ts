import { globalStyle, keyframes } from '@vanilla-extract/css';
import { vars } from '@snds/ui/tokens';
import './fonts.css';

/* Node info-box reveal — a left-to-right mask wipe (ease-out entrance). */
const nodeTagReveal = keyframes({
  '0%': { clipPath: 'inset(0 100% 0 0)', opacity: 0, transform: 'translateY(4px)' },
  '60%': { opacity: 1 },
  '100%': { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'translateY(0)' },
});
globalStyle('.snds-node-tag', {
  animation: `${nodeTagReveal} 480ms cubic-bezier(0.16, 1, 0.3, 1) both`,
  willChange: 'clip-path, opacity, transform',
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
  lineHeight: vars.lineHeight.normal,
  fontSynthesis: 'none',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
});

globalStyle('h1, h2, h3, h4', {
  fontFamily: vars.font.display,
  fontWeight: vars.weight.semibold,
  lineHeight: vars.lineHeight.tight,
  letterSpacing: vars.letterSpacing.tight,
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
