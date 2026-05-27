import * as RDialog from '@radix-ui/react-dialog';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import * as s from './Dialog.css';

export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;
export const DialogClose = RDialog.Close;
export const DialogTitle = (props: ComponentPropsWithoutRef<typeof RDialog.Title>) => (
  <RDialog.Title {...props} className={cx(s.title, props.className)} />
);
export const DialogDescription = (props: ComponentPropsWithoutRef<typeof RDialog.Description>) => (
  <RDialog.Description {...props} className={cx(s.description, props.className)} />
);

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof RDialog.Content> {
  children?: ReactNode;
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className={s.overlay} />
      <RDialog.Content className={cx(s.content, className)} {...props}>
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  );
}
