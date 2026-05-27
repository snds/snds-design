import { Root } from '@radix-ui/react-separator';
import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '../../utils/cx';
import * as s from './Separator.css';

export type SeparatorProps = ComponentPropsWithoutRef<typeof Root>;

export function Separator({ className, ...props }: SeparatorProps) {
  return <Root className={cx(s.root, className)} {...props} />;
}
