import { style } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

export const tag = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
  height: '22px',
  paddingInline: vars.space[2],
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.micro,
  letterSpacing: vars.letterSpacing.wide,
  textTransform: 'uppercase',
  color: vars.color.fgMuted,
  background: vars.color.bgSubtle,
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.sm,
  whiteSpace: 'nowrap',
});
