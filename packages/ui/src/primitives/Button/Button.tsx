import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import * as s from './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof s.variant;
  size?: keyof typeof s.size;
  /** Render as the child element (e.g. an <a>) instead of a <button>. */
  asChild?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'solid',
  size = 'md',
  asChild = false,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cx(s.base, s.variant[variant], s.size[size], className)} {...props} />;
}
