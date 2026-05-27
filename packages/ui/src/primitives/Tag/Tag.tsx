import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import * as s from './Tag.css';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export function Tag({ className, children, ...props }: TagProps) {
  return (
    <span className={cx(s.tag, className)} {...props}>
      {children}
    </span>
  );
}
