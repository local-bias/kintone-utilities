import { Slot } from '@radix-ui/react-slot';
import React, { ForwardedRef, HTMLAttributes, forwardRef } from 'react';
import { Atom, useAtomValue } from 'jotai';

export interface JotaiTogglePanelProps<T> extends HTMLAttributes<HTMLDivElement> {
  atom: Atom<T>;
  asChild?: boolean;
  shouldShow?: (value: T) => boolean;
}

function JotaiTogglePanelInner<T>(
  {
    atom,
    asChild,
    shouldShow = (value: T) => Boolean(value),
    ...divProps
  }: JotaiTogglePanelProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const value = useAtomValue(atom);
  if (!shouldShow(value)) {
    return null;
  }
  const Component = asChild ? Slot : 'div';
  return <Component ref={ref} {...divProps} />;
}

export const JotaiTogglePanel = forwardRef(JotaiTogglePanelInner) as <T>(
  props: JotaiTogglePanelProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof JotaiTogglePanelInner>;
