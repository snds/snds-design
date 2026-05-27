import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

export const base = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space[2],
  fontFamily: vars.font.mono,
  fontWeight: vars.weight.medium,
  letterSpacing: vars.letterSpacing.wide,
  textTransform: 'uppercase',
  lineHeight: '1',
  whiteSpace: 'nowrap',
  borderRadius: vars.radius.sm,
  border: '1px solid transparent',
  cursor: 'pointer',
  userSelect: 'none',
  transitionProperty: 'background, border-color, color, box-shadow, transform',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.ease.standard,
  selectors: {
    '&:disabled': { opacity: 0.45, pointerEvents: 'none' },
    '&:active:not(:disabled)': { transform: 'translateY(1px)' },
  },
});

export const variant = styleVariants({
  solid: {
    background: vars.color.primary,
    color: vars.color.fgOnAccent,
    borderColor: vars.color.primary,
    selectors: {
      '&:hover:not(:disabled)': { background: vars.color.primaryHover, borderColor: vars.color.primaryHover },
    },
  },
  outline: {
    background: 'transparent',
    color: vars.color.fg,
    borderColor: vars.color.border,
    selectors: {
      '&:hover:not(:disabled)': { borderColor: vars.color.borderStrong, background: vars.color.bgHover },
    },
  },
  ghost: {
    background: 'transparent',
    color: vars.color.fgMuted,
    selectors: {
      '&:hover:not(:disabled)': { color: vars.color.fg, background: vars.color.bgHover },
    },
  },
  signal: {
    background: 'transparent',
    color: vars.color.signalFg,
    borderColor: vars.color.signal,
    selectors: {
      '&:hover:not(:disabled)': { background: vars.color.signalSubtle, borderColor: vars.color.signalHover },
    },
  },
});

export const size = styleVariants({
  sm: { height: '28px', paddingInline: vars.space[3], fontSize: vars.fontSize.micro },
  md: { height: '36px', paddingInline: vars.space[4], fontSize: vars.fontSize.caption },
  lg: { height: '44px', paddingInline: vars.space[5], fontSize: vars.fontSize.body },
});
