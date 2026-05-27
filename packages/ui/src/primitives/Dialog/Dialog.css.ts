import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

const fade = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
const pop = keyframes({
  from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.97)' },
  to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(2px)',
  zIndex: 1000,
  animation: `${fade} ${vars.duration.base} ${vars.ease.out}`,
});

export const content = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(92vw, 560px)',
  maxHeight: '85vh',
  overflow: 'auto',
  background: vars.color.bgElevated,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space[6],
  zIndex: 1100,
  animation: `${pop} ${vars.duration.base} ${vars.ease.out}`,
});

export const title = style({
  fontFamily: vars.font.display,
  fontSize: vars.fontSize.h4,
  letterSpacing: vars.letterSpacing.tight,
  marginBottom: vars.space[2],
});

export const description = style({
  color: vars.color.fgMuted,
  fontSize: vars.fontSize.body,
  lineHeight: vars.lineHeight.normal,
});
