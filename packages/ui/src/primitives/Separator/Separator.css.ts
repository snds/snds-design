import { style } from '@vanilla-extract/css';
import { vars } from '../../tokens/theme.css';

export const root = style({
  background: vars.color.borderSubtle,
  border: 'none',
  flexShrink: 0,
  selectors: {
    '&[data-orientation="horizontal"]': { height: '1px', width: '100%' },
    '&[data-orientation="vertical"]': { width: '1px', alignSelf: 'stretch' },
  },
});
