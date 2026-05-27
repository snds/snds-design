import { style } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

export const link = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  color: vars.color.fg,
  textDecoration: 'none',
  borderBottom: `1px solid ${vars.color.border}`,
  paddingBottom: '1px',
  transitionProperty: 'color, border-color',
  transitionDuration: vars.duration.fast,
  transitionTimingFunction: vars.ease.standard,
  selectors: {
    '&:hover': { color: vars.color.primaryFg, borderColor: vars.color.primaryBorder },
  },
});

export const mono = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.caption,
  letterSpacing: vars.letterSpacing.wide,
  textTransform: 'uppercase',
});
