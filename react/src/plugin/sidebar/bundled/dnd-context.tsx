import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove } from '@dnd-kit/sortable';
import React, { PropsWithChildren } from 'react';
import { SidebarProps } from '.';

type Props = Pick<SidebarProps, 'conditions' | 'setConditions'>;

const SidebarDndContext = (props: PropsWithChildren<Props>) => {
  const { conditions, setConditions, children } = props;

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) {
      return;
    }
    const oldIndex = conditions.findIndex((item) => item.id === active.id);
    const newIndex = conditions.findIndex((item) => item.id === over.id);
    setConditions((prev) => arrayMove(prev, oldIndex, newIndex));
  };

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

export default SidebarDndContext;
