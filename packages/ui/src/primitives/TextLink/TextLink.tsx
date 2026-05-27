import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import * as s from './TextLink.css';

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Monospace, uppercase HUD styling. */
  mono?: boolean;
  children?: ReactNode;
}

export function TextLink({ mono = false, className, children, ...props }: TextLinkProps) {
  return (
    <a className={cx(s.link, mono && s.mono, className)} {...props}>
      {children}
    </a>
  );
}
