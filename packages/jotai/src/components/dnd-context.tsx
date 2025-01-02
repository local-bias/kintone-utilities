import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import { WritableAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import React, { PropsWithChildren, useCallback } from 'react';

type Props<T extends { id: string }> = {
  atom: WritableAtom<T[], [T[]], void>;
};

export const JotaiDndContext = <T extends { id: string }>({
  children,
  atom,
}: PropsWithChildren<Props<T>>) => {
  const onDragEnd = useAtomCallback(
    useCallback(
      async (get, set, event: DragEndEvent) => {
        const { active, over } = event;
        if (over == null || active.id === over.id) {
          return;
        }
        const items = await get(atom);
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        set(atom, arrayMove(items, oldIndex, newIndex));
      },
      [atom]
    )
  );

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
};
