import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import * as s from './Hud.css';

export interface HudProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
}

/** Monospace, wide-tracked uppercase label — the HUD/telemetry voice. */
export function Hud({ as: Comp = 'span', className, children, ...props }: HudProps) {
  return (
    <Comp className={cx(s.hud, className)} {...props}>
      {children}
    </Comp>
  );
}
