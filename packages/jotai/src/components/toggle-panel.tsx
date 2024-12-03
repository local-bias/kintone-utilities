import { Slot } from '@radix-ui/react-slot';
import { PrimitiveAtom, useAtomValue } from 'jotai';
import React, { HTMLAttributes, forwardRef } from 'react';

export interface JotaiTogglePanelProps extends HTMLAttributes<HTMLDivElement> {
  atom: PrimitiveAtom<boolean>;
  asChild?: boolean;
}

export const JotaiTogglePanel = forwardRef<HTMLDivElement, JotaiTogglePanelProps>(
  ({ atom, asChild, ...divProps }, ref) => {
    const isOpen = useAtomValue(atom);
    if (!isOpen) {
      return null;
    }
    const Component = asChild ? Slot : 'div';
    return <Component ref={ref} {...divProps} />;
  }
);
JotaiTogglePanel.displayName = 'JotaiTogglePanelComponent';
