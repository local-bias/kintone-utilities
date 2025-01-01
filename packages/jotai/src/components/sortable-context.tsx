import { SortableContext } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { Atom, useAtomValue } from 'jotai';

type Props<T extends { id: string }> = {
  atom: Atom<T[]>;
};

export const JotaiSortableContext = <T extends { id: string }>({
  children,
  atom,
}: PropsWithChildren<Props<T>>) => {
  const items = useAtomValue(atom);
  return <SortableContext items={items}>{children}</SortableContext>;
};
