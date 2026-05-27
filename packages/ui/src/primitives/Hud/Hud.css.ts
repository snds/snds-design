import { style } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

export const hud = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.micro,
  letterSpacing: vars.letterSpacing.hud,
  textTransform: 'uppercase',
  color: vars.color.fgSubtle,
});
