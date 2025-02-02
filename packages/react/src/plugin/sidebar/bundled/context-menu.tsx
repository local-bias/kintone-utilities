import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import styled from '@emotion/styled';
import clsx from 'clsx';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const StyledContextMenuSubTrigger = styled(ContextMenuPrimitive.SubTrigger)`
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  border-radius: 4px;
  outline: none;

  &:focus {
    background-color: hsl(220 14.3% 95.9%);
    color: hsl(220.9 39.3% 11%);
  }

  &[data-state='open'] {
    background-color: hsl(220 14.3% 95.9%);
    color: hsl(220.9 39.3% 11%);
  }

  &.inset {
    padding-left: 32px;
  }

  > svg {
    margin-left: auto;
    height: 16px;
    width: 16px;
  }
`;

const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <StyledContextMenuSubTrigger ref={ref} className={clsx(inset && 'inset', className)} {...props}>
    {children}
    <ChevronRight />
  </StyledContextMenuSubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = styled(ContextMenuPrimitive.SubContent)`
  z-index: 50;
  min-width: 128px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid hsl(220 13% 91%);
  background-color: hsl(0 0% 100%);
  padding: 4px;
  color: hsl(224 71.4% 4.1%);
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);

  &[data-state='open'] {
    animation: show 150ms;
  }

  &[data-state='closed'] {
    animation: hide 150ms;
  }

  @keyframes show {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes hide {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`;

const StyledContextMenuContent = styled(ContextMenuPrimitive.Content)`
  z-index: 50;
  min-width: 128px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid hsl(220 13% 91%);
  background-color: hsl(0 0% 100%);
  padding: 4px;
  color: hsl(224 71.4% 4.1%);
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  animation: show 150ms;

  &[data-state='closed'] {
    animation: hide 150ms;
  }

  @keyframes show {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes hide {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`;

const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <StyledContextMenuContent ref={ref} className={className} {...props} />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const StyledContextMenuItem = styled(ContextMenuPrimitive.Item)`
  position: relative;
  display: flex;
  cursor: default;
  user-select: none;
  align-items: center;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  outline: none;

  &:focus {
    background-color: hsl(220 14.3% 95.9%);
    color: hsl(220.9 39.3% 11%);
  }

  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }

  &.inset {
    padding-left: 32px;
  }
`;

const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <StyledContextMenuItem ref={ref} className={clsx(inset && 'inset', className)} {...props} />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={clsx(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
      <ContextMenuPrimitive.ItemIndicator>
        <Check className='h-4 w-4' />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={clsx(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className='h-2 w-2 fill-current' />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = styled(ContextMenuPrimitive.Label)`
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: hsl(224 71.4% 4.1%);
`;

const ContextMenuSeparator = styled(ContextMenuPrimitive.Separator)`
  margin: 4px -4px;
  height: 1px;
  background-color: hsl(220 13% 91%);
`;

const ContextMenuShortcut = styled.span`
  margin-left: auto;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: hsl(220 8.9% 46.1%);
`;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
