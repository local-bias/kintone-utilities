import { SortableContext } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { Atom, useAtomValue } from 'jotai';

type Props<T extends { id: string }> = {
  state: Atom<T[]>;
};

export const JotaiSortableContext = <T extends { id: string }>({
  children,
  state,
}: PropsWithChildren<Props<T>>) => {
  const items = useAtomValue(state);
  return <SortableContext items={items}>{children}</SortableContext>;
};
